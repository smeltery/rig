import { afterEach, expect, test } from "bun:test";
import { mkdtemp, rm, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const script = resolve("scripts/auto-release.sh");
const directories: string[] = [];
afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((path) => rm(path, { recursive: true, force: true })),
  );
});
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "rig-release-"));
  directories.push(root);
  const cwd = join(root, "work");
  const log = join(root, "dispatch");
  const env = {
    ...process.env,
    PATH: `${root}:${process.env.PATH}`,
    GIT_AUTHOR_NAME: "Test",
    GIT_AUTHOR_EMAIL: "test@example.invalid",
    GIT_COMMITTER_NAME: "Test",
    GIT_COMMITTER_EMAIL: "test@example.invalid",
  };
  async function run(command: string[], allowedFailure = false) {
    const result = Bun.spawnSync(command, { cwd, env });
    if (result.exitCode && !allowedFailure)
      throw new Error(result.stderr.toString());
    return result;
  }
  await Bun.$`git init --bare ${root}/remote.git`.quiet();
  await Bun.$`git init -b main ${cwd}`.quiet();
  await run(["git", "config", "commit.gpgsign", "false"]);
  await run(["git", "config", "tag.gpgsign", "false"]);
  await run(["git", "config", "core.hooksPath", "/dev/null"]);
  await run(["git", "remote", "add", "origin", `${root}/remote.git`]);
  await run([
    "git",
    "-c",
    "core.hooksPath=/dev/null",
    "commit",
    "--allow-empty",
    "-m",
    "initial",
  ]);
  await run([
    "git",
    "-c",
    "core.hooksPath=/dev/null",
    "push",
    "origin",
    "main",
  ]);
  await Bun.write(
    `${root}/gh`,
    `#!/usr/bin/env bash
set -eu
if [[ "$1" == release ]]; then exit 1; fi
printf '%s\\n' "$*" >> '${log}'
`,
  );
  await chmod(`${root}/gh`, 0o755);
  return { run, log, cwd };
}
test("initial release dispatches, and retries dispatch without duplicating a tag", async () => {
  const { run, log } = await fixture();
  await run(["bash", script]);
  expect((await run(["git", "tag"])).stdout.toString().trim()).toBe("v0.1.0");
  await run(["bash", script]);
  expect((await Bun.file(log).text()).trim().split("\n")).toEqual([
    "workflow run release.yml --ref main -f tag=v0.1.0",
    "workflow run release.yml --ref main -f tag=v0.1.0",
  ]);
}, 30000);
test("patch bump ignores prerelease and malformed tags", async () => {
  const { run } = await fixture();
  for (const tag of ["v1.2.9", "v9.0.0-rc.1", "v99.0.0garbage"])
    await run(["git", "tag", tag]);
  await run([
    "git",
    "-c",
    "core.hooksPath=/dev/null",
    "commit",
    "--allow-empty",
    "-m",
    "next",
  ]);
  await run([
    "git",
    "-c",
    "core.hooksPath=/dev/null",
    "push",
    "origin",
    "main",
    "--tags",
  ]);
  await run(["bash", script]);
  expect(
    (await run(["git", "tag", "--points-at", "HEAD"])).stdout.toString().trim(),
  ).toBe("v1.2.10");
}, 30000);
test("a superseded successful CI commit cannot release a newer untested main", async () => {
  const { run, log } = await fixture();
  const tested = (await run(["git", "rev-parse", "HEAD"])).stdout
    .toString()
    .trim();
  await run([
    "git",
    "-c",
    "core.hooksPath=/dev/null",
    "commit",
    "--allow-empty",
    "-m",
    "untested",
  ]);
  await run([
    "git",
    "-c",
    "core.hooksPath=/dev/null",
    "push",
    "origin",
    "main",
  ]);
  await run(["git", "checkout", tested]);
  await run(["bash", script]);
  expect((await run(["git", "tag"])).stdout.toString().trim()).toBe("");
  expect(await Bun.file(log).exists()).toBe(false);
}, 30000);
