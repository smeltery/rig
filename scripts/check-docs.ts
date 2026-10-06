import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { marked } from "marked";

const files = (
  await Bun.$`git ls-files --cached --others --exclude-standard -- '*.md'`.text()
)
  .trim()
  .split("\n");
const temporary = await Bun.$`mktemp -d`.text();
const directory = temporary.trim();
let diagrams = 0;
let failures = 0;
await Bun.write(
  `${directory}/puppeteer.json`,
  JSON.stringify({ headless: true, args: ["--no-sandbox"] }),
);
try {
  for (const file of files) {
    const content = await Bun.file(file).text();
    const tokens = marked.lexer(content);
    const links: string[] = [];
    const blocks: string[] = [];
    marked.walkTokens(tokens, (token) => {
      if (token.type === "link" || token.type === "image")
        links.push(token.href);
      if (token.type === "code" && token.lang === "mermaid")
        blocks.push(token.text);
    });
    for (const href of links) {
      if (/^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i.test(href)) continue;
      const target = decodeURIComponent(href.split(/[?#]/)[0]);
      if (target && !existsSync(resolve(dirname(file), target))) {
        console.error(`${file}: missing link target ${href}`);
        failures++;
      }
    }
    for (const block of blocks) {
      diagrams++;
      const input = `${directory}/${diagrams}.mmd`;
      await Bun.write(input, block);
      const result =
        await Bun.$`bun run --bun mmdc -p ${directory}/puppeteer.json -i ${input} -o ${input}.svg`
          .quiet()
          .nothrow();
      if (result.exitCode) {
        console.error(
          `${file}: invalid Mermaid diagram\n${result.stderr.toString()}`,
        );
        failures++;
      }
    }
  }
} finally {
  await Bun.$`rm -rf ${directory}`;
}
console.log(
  `Checked ${files.length} Markdown files and rendered ${diagrams} diagrams.`,
);
if (failures) process.exit(1);
