import { resolve, sep } from "node:path";
import "./build-website";

const root = resolve("dist");
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: Number(process.env.PORT || 4173),
  async fetch(request) {
    let path: string;
    try {
      path = decodeURIComponent(new URL(request.url).pathname);
    } catch {
      return new Response("Invalid path", { status: 400 });
    }
    if (path.endsWith("/")) path += "index.html";
    let local = resolve(root, `.${path}`);
    if (!local.startsWith(root + sep))
      return new Response("Forbidden", { status: 403 });
    if (!(await Bun.file(local).exists()) && !path.endsWith(".html"))
      local += ".html";
    const file = Bun.file(local);
    return (await file.exists())
      ? new Response(file)
      : new Response("Not found", { status: 404 });
  },
});
console.log(`Rig preview: ${server.url}`);
