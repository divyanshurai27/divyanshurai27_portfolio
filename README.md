# Divyanshu Rai — Portfolio

Static portfolio built with React 19, Framer Motion 12 and esbuild.

## Commands

```bash
npm install
npm run dev     # http://localhost:5173 with live reload
npm run build   # static output in dist/
npm run check   # build + sanity checks (missing files, template leftovers)
npm run og      # regenerate the link-preview image (public/og.png) from site.js
```

## Where to edit

| What | File |
| --- | --- |
| Name, headline, bio, contact, skills, education, achievements, colours | `src/config/site.js` |
| Projects (case-study dialog content, links, covers) | `src/data/projects.js` |
| Work experience timeline | `src/data/experience.js` |

- **Project links:** fill `sourceUrl` / `liveUrl` in `projects.js`; until then the dialog links to the GitHub profile.
- **Screenshots:** drop images in `public/assets/projects/` and set `coverImage: "assets/projects/<file>.webp"` to replace the illustrated cover.
- **Portrait / résumé:** put files in `public/assets/` and set `identity.portrait` / `identity.resume`; a résumé download button appears automatically.
- **Domain:** set `websiteUrl` once deployed to emit canonical and Open Graph URL tags. LinkedIn/WhatsApp previews need this to show `og.png`.
- **Link preview:** after changing your name, role or status, run `npm run og` (uses your local Chrome/Edge; set `CHROME_PATH` if it isn't found).
- **Visitor stats:** set `analytics.goatcounter` to your GoatCounter code, or `analytics.vercel: true` after enabling Web Analytics in Vercel. Only production builds include the script.
- **Contact form:** set `contact.formAccessKey` to your Web3Forms key to deliver messages straight to your inbox.
- **Colours:** `appearance` holds the dark theme; `appearance.light` the light one.

## Deploy

Upload the contents of `dist/` to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages). Asset paths are relative, so it also works from a sub-path like `username.github.io/portfolio/`.
