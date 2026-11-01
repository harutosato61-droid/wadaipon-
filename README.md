# わだいぽん！ — design reference

This is a design mockup created in a visual design tool, exported as a
standalone page. Treat it as a REFERENCE MOCKUP, not production code:
the markup and inline styles carry the design's precise values — colors,
font sizes, spacing, radii, shadows, layout — which an implementation
should replicate faithfully in its own components and styling system
rather than copy wholesale.

## Contents

- `index.html` — page shell: SEO/OGP tags in `<head>`, the `<x-dc>` markup
  template (the screens) and a tiny bootstrap script.
- `css/style.css` — all styles (layout, dark theme, compact / OBS modes).
- `js/data.js` — topic data (categories and the card types).
- `js/theme.js` — fonts list and theme-colour calculation.
- `js/storage.js` — saving / restoring settings in localStorage.
- `js/app.js` — the app logic (the `Component` class).
- `assets/` — images and favicons. `assets/materials/` holds the downloadable logo materials (original PNGs + web thumbnails) shown on the 素材 page.
- `robots.txt`, `sitemap.xml` — for search engines.
- `support.js`, `vendor/react*.js` — the runtime that renders the component
  in a browser; not part of the design. Keep the `<script>` order in
  `index.html`: `js/*.js` must load before `support.js`.

## Uploaded files

Images, fonts and media uploaded to the design are written once each under
`assets/` — 3 in this export — and the exported files refer to them there.
The favicon files (`favicon-32.png`, `favicon-192.png`, `favicon.ico`,
`apple-touch-icon.png`) were added later and are linked from `<head>`. A
reference a script puts together while the page runs (for example
`"/_blob/" + id`) is not rewritten and does not load from this folder.

## Viewing

Serve the folder (e.g. `python3 -m http.server`) and open `index.html`;
some browsers block the scripts over file://.
