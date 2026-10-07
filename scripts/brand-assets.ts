import { Resvg } from "@resvg/resvg-js";
import * as icons from "simple-icons";

const assets = "website/assets";
for (const name of ["Anthropic", "Googlegemini", "Openrouter", "Github"]) {
  const icon = icons[`si${name}`];
  if (!icon) throw new Error(`Missing Simple Icons mark: ${name}`);
  await Bun.write(`${assets}/${icon.slug}.svg`, icon.svg);
}
const screenshot = Buffer.from(
  await Bun.file("docs/assets/screenshot.png").arrayBuffer(),
).toString("base64");
for (const icon of [icons.siApple, icons.siLinux]) {
  await Bun.write(
    `${assets}/${icon.slug}.svg`,
    icon.svg.replace("<svg ", '<svg fill="#a0a6af" '),
  );
}
let source = (await Bun.file(`${assets}/og.svg`).text()).replace(
  "../../docs/assets/screenshot.png",
  `data:image/png;base64,${screenshot}`,
);
for (const name of ["mark", "apple", "linux"]) {
  const svg = Buffer.from(
    await Bun.file(`${assets}/${name}.svg`).arrayBuffer(),
  ).toString("base64");
  source = source.replace(
    `href="${name}.svg"`,
    `href="data:image/svg+xml;base64,${svg}"`,
  );
}
const image = new Resvg(source, { font: { loadSystemFonts: true } }).render();
await Bun.write(`${assets}/og.png`, image.asPng());
console.log("Generated provider marks and 1200 × 630 social image.");
