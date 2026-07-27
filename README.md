# Nikita — London Walks

Static one-page site. No build step: every file is served as-is.

## Files
- `index.html` — the whole page (structure, styles, logic)
- `support.js` — runtime the page needs (must stay next to index.html)
- `route-map.js` — the route map component (Leaflet + CARTO basemap, loaded from CDN)
- `image-slot.js` — image placeholders
- `images/` — the photos used on the page (hero, banner, portrait, map stops)

## Deploy
Any static host works. Examples:

**GitHub Pages** — push this folder to a repo, then Settings → Pages → Deploy from branch → `main` / `root`.

**Netlify / Vercel / Cloudflare Pages** — drag the folder in, or connect the repo. No build command, publish directory = the folder itself.

Locally: `npx serve .` (opening index.html via file:// also works).

## Editing content
- **Availability calendar** — top of the `<script data-dc-script>` block in `index.html`:
  `AVAIL_WEEKDAYS` (0 = Sunday … 6 = Saturday), `AVAIL_TIMES`, `AVAIL_BLOCKED` (dates as `YYYY-MM-DD`), `WA_NUMBER` (WhatsApp number, digits only).
- **Tours and prices** — the `TOURS` array in the same block, and the four cards in the markup.
- **Map routes and stops** — the `ROUTES` array in `route-map.js`. Coordinates are `[latitude, longitude]`.
- **Photos** — replace the files in `images/` keeping the same names, or change the `src="images/…"` attributes in `index.html`. Map-stop photos are named `stop-<route>-<index>.webp` and are listed in `STOP_PHOTOS` at the top of `route-map.js` — add an id there when you add a new file.

## Not connected yet
The booking form shows a confirmation but takes no payment. To collect the 15% deposit, point the submit handler at a payment link (Stripe Payment Link, Tinkoff, Revolut) or a form service (Formspree, Getform).

## Credits
- Map data © OpenStreetMap contributors, tiles © CARTO. Keep the attribution line visible.
