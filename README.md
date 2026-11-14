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

- `js/supa.js` / `js/supa-config.js` — Supabase連携（Googleログイン、お気に入り同期、お題投稿、みんなの投稿、ライブ配信表示）。`supa-config.js` に URL と anon キーを書くと有効になり、空のままなら関連機能は自動で非表示になります。
- `admin.html` — 管理画面（お題の承認・削除）。管理者の Google アカウントでログインした場合だけ使えます。

## お題データの管理（重要）
- お題の唯一のデータソースは `data/topics.json` です（ID・本文・ジャンル・雰囲気・利用シーン・人数・初対面向け等）。
- お題を追加・修正したら、`python3 tools/build.py` を実行してください。`js/topics.js`（ガチャ用）、`/topics/` `/nomikai/` `/haishin/` `/ogiri/` `/online/`、`sitemap.xml`、トップの件数表記が同じデータから再生成されます。
- `js/topics.js` と上記の各ページは自動生成ファイルです。直接編集しないでください。
- URLパラメータ：`/?type=ogiri`（カード種類）、`/?genre=配信向け`（ジャンル）、`/?scene=配信`（利用シーン）、`/?mode=obs`（OBSモード）。組み合わせ可。
