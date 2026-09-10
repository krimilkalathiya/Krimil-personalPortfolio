# Krimil Kalathiya — Portfolio

Animated 3D portfolio. Static site, no build step.

- `index.html` — the page
- `scene3d.js` — three.js scene (48 glass server blocks)
- `support.js` — runtime
- `badges/` — certification badge images

## Deploy (Cloudflare Pages)

1. Push this folder to `main`.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick this repo.
3. Build settings: framework **None**, build command **(empty)**, output directory **/**.
4. Custom domains → add `krimil.com` and `www.krimil.com` (DNS is already on Cloudflare, records are created for you).

**www → krimil.com:** Cloudflare dashboard → your krimil.com zone → Rules → Redirect Rules → Create → template "Redirect from WWW to root". (Workers static assets don't allow absolute URLs in `_redirects`.)

`_headers` sets caching. `.assetsignore` keeps `.git` out of the upload.
