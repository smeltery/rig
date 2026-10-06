import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, posix } from "node:path";
import { existsSync } from "node:fs";
import { marked } from "marked";

const output = "dist";
const repository = "https://github.com/smeltery/rig/blob/main/";
const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]!,
  );
const environmentURL =
  process.env.SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL;
const origin = environmentURL
  ? new URL(
      environmentURL.includes("://")
        ? environmentURL
        : `https://${environmentURL}`,
    ).origin
  : "";
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp("website/assets", `${output}/assets`, { recursive: true });
for (const name of ["style.css", "site.js"])
  await cp(`website/${name}`, `${output}/${name}`);
await cp("docs/assets", `${output}/docs/assets`, { recursive: true });
await cp("website/styles", `${output}/styles`, { recursive: true });
const shell = (await Bun.file("website/index.html").text()).replace(
  "<!-- footer -->",
  await Bun.file("website/footer.html").text(),
);
function metadata(html: string, path: string) {
  if (!origin) return html;
  const url = escape(`${origin}${path}`);
  return html
    .replace(
      'content="/assets/og.png"',
      `content="${escape(origin)}/assets/og.png"`,
    )
    .replace(
      "</head>",
      `<link rel="canonical" href="${url}"><meta property="og:url" content="${url}"></head>`,
    );
}
await Bun.write(`${output}/index.html`, metadata(shell, "/"));
const navigation = [
  ["README", "Overview"],
  ["install", "Install"],
  ["quick-start", "Quick start"],
  ["guides/workflows", "Workflows"],
  ["guides/troubleshooting", "Troubleshooting"],
  ["reference/config", "Configuration"],
  ["reference/cli", "CLI"],
  ["reference/index", "Reference"],
  ["development", "Development"],
];
function route(path: string) {
  return path === "docs/README.md"
    ? "/docs/"
    : `/${path.replace(/\.md$/, ".html")}`;
}
const pages: string[] = ["/"];
for await (const name of new Bun.Glob("**/*.md").scan("docs")) {
  const file = `docs/${name}`;
  const markdown = await Bun.file(file).text();
  const tokens = marked.lexer(markdown);
  marked.walkTokens(tokens, (token) => {
    if (token.type !== "link" && token.type !== "image") return;
    if (/^(?:[a-z][a-z\d+.-]*:|#|\/)/i.test(token.href)) return;
    const [path, anchor] = token.href.split("#");
    let target = posix.normalize(posix.join(posix.dirname(file), path));
    if (target.endsWith("/"))
      target += existsSync(`${target}README.md`) ? "README.md" : "index.md";
    const suffix = anchor ? `#${anchor}` : "";
    token.href = target.startsWith("docs/")
      ? (target.endsWith(".md") ? route(target) : `/${target}`) + suffix
      : repository + target + suffix;
  });
  const renderer = new marked.Renderer();
  renderer.code = ({ text, lang }) =>
    lang === "mermaid"
      ? `<pre class="mermaid">${escape(text)}</pre>`
      : `<pre><code>${escape(text)}</code></pre>`;
  renderer.heading = ({ tokens: inline, depth, text }) => {
    const id = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s_-]/gu, "")
      .replace(/\s/g, "-");
    return `<h${depth} id="${escape(id)}">${marked.Parser.parseInline(inline)}</h${depth}>`;
  };
  const title =
    tokens.find((token) => token.type === "heading")?.text || "Documentation";
  const nav = navigation
    .map(
      ([path, label]) =>
        `<a href="${route(`docs/${path}.md`)}"${name === `${path}.md` ? ' aria-current="page"' : ""}>${label}</a>`,
    )
    .join("\n");
  const page = shell
    .replace(/<title>.*?<\/title>/, `<title>${escape(title)} — Rig</title>`)
    .replace(
      /<meta (?:name="description"|property="og:(?:title|description)") content="[^"]*">/g,
      "",
    )
    .replace(
      '<a href="#workflow">How it works</a>',
      '<a href="/docs/guides/workflows.html">How it works</a>',
    )
    .replace(
      /<main id="main">[\s\S]*?<\/main>/,
      `<main id="main" class="shell docs-layout"><nav class="docs-nav" aria-label="Documentation">${nav}</nav><article class="prose">${marked.parser(tokens, { renderer })}<p><a href="${repository}${file}">Edit this page on GitHub ↗</a></p></article></main>`,
    )
    .replace(
      "</head>",
      '<script type="module" src="/docs.js"></script></head>',
    );
  const destination =
    name === "README.md"
      ? `${output}/docs/index.html`
      : `${output}/docs/${name.replace(/\.md$/, ".html")}`;
  await mkdir(dirname(destination), { recursive: true });
  await Bun.write(destination, metadata(page, route(file)));
  pages.push(route(file));
}
const bundle = await Bun.build({
  entrypoints: ["website/docs.js"],
  outdir: output,
  target: "browser",
  minify: true,
  splitting: true,
});
if (!bundle.success)
  throw new AggregateError(
    bundle.logs,
    "Failed to bundle documentation diagrams",
  );
if (origin) {
  await Bun.write(
    `${output}/sitemap.xml`,
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map((path) => `<url><loc>${escape(origin + path)}</loc></url>`).join("")}</urlset>`,
  );
}
await Bun.write(
  `${output}/robots.txt`,
  `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${origin}/sitemap.xml\n` : ""}`,
);
// Catch broken navigation and missing assets in the actual output, including templates.
for await (const file of new Bun.Glob("**/*.html").scan(output)) {
  const html = await Bun.file(`${output}/${file}`).text();
  for (const [, path] of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    const local = `${output}${path.endsWith("/") ? `${path}index.html` : path}`;
    if (!existsSync(local))
      throw new Error(`${file}: missing website target ${path}`);
  }
}
console.log(
  `Built landing page and ${pages.length - 1} documentation pages in ${output}/.`,
);
