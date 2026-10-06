# Website

Rig's website is static HTML, CSS, and a small copy-button script in `website/`.
It combines Convrt and Loft's restrained layout with Rig's charcoal terminal
background, blue accents, and green ready indicator. There is no
application framework or runtime service. The same build renders the user docs
from `docs/`, so documentation has one source of truth.

## Preview

Inside Flox, after `just setup`:

```sh
just preview
```

Open the printed localhost URL. Check desktop and narrow mobile layouts, copy
installation commands, documentation navigation, and the footer links.

## Deploy to Vercel

Import `smeltery/rig` into Vercel with the repository root as the project root.
The checked-in `vercel.json` specifies:

- Install: `bun install --frozen-lockfile`.
- Build: `bun run website`.
- Output: `dist/`.

No account keys or custom domain are needed in the source tree. Vercel assigns
a preview/production domain; attach a custom domain later in its project
settings. Set `SITE_URL` to your public origin after assigning a domain. When
unset, the build uses Vercel's production or preview URL for canonical and
Open Graph metadata. Local previews omit canonical metadata.

CI builds and uploads a website artifact on every change. Deployment is managed
by Vercel once the repository is connected; CI does not publish to GitHub Pages.

## Brand assets

`website/assets/mark.svg` is Rig's symbol: three structural beams forming an
open hexagonal frame. Its single blue silhouette works without a background
tile, from favicon to wordmark size. The social-card generator embeds this
same SVG so the mark stays consistent across assets.

`og.svg` is the editable social-card
source; `og.png` is the 1200 × 630 image used by the README and social metadata.
Run `bun scripts/brand-assets.ts` to regenerate the PNG and provider marks.
Keep both sources and generated assets committed. The generator uses the
locked Simple Icons package for Anthropic, Gemini, OpenRouter, and GitHub. The
OpenAI mark is shared with Smeltery's Trellis brand assets; these marks identify
supported technologies and do not imply endorsement.

The footer links to the source, docs, releases, support, license, and sibling
projects. Rig has no website analytics or tracking scripts.
