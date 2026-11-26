# 24clarson.github.io

The home page at https://24clarson.github.io: a plain list linking to each project.
Static HTML and CSS only. No JS, build step or dependencies. Black and white and minimal.

## How GitHub Pages serves this account
- This repo (named exactly `24clarson.github.io`) is the user site, served at the root.
- Every other repo with Pages turned on (Settings → Pages → branch `main`, folder `/ (root)`) is served at
  `24clarson.github.io/<repo-name>/`. Pages needs the repo to be public.
- Projects must use relative links (`style.css`, not `/style.css`).

## Adding a project
1. Make the project's repo public and turn on Pages for it.
2. Add one `<li>` to `index.html`: `<a href="<repo-name>/">Name</a>: one-sentence description.`

## Current projects
- `lionfish`: chess bot (formerly this repo's root page)
- `connect4`: Connect 4
- `trading-games`: trading practice games
