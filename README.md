# Notebook Sticks

A playable stick-figure sketchbook you can ship from GitHub.

Walk the pages. Collect stamps. Spend ink. Sit at a table and play tic-tac-toe. Add friends. Your doodle saves in this browser (optional PIN). Open a second tab to play against yourself — you should only ever see one of yourself in the tab you are playing.

The HUD is small on purpose: **Map**, **Draw**, **Me**, **Talk**, **More**. Everything else (Bazaar, Friends, Jobs, Member) lives under More. Pages are packed with extra landmarks, scenery, and NPCs so they are not empty ruled paper.

**Play it live:** [whirledclassic.github.io/sticks](https://whirledclassic.github.io/sticks/) · [Pages build](https://whirledclassic.github.io/notebook-sticks-web/)

This is the static, GitHub Pages edition of the original [notebook-sticks](https://github.com/whirledclassic/notebook-sticks) idea. No Node server.

## Play without installing anything

1. Open a live URL above, or
2. Clone this repo and open `index.html` in a browser, or
3. From the repo folder:

```bash
python3 -m http.server 8080
```

Then visit http://localhost:8080

## Controls

| Input | Action |
| --- | --- |
| WASD / arrows | Walk |
| Click the page | Walk there |
| Map | Pages, landmarks, who is here |
| Draw | Studio closet + pad |
| Chat box | Talk (+1 ink) |
| `!hello` | Shout the page |
| `/mark hi` | Pin a note |
| F | Paper airplane |
| Wave / Sit / Dance | Poses |
| Talk / E | Interact |
| P / Me | Your profile card |
| `/studio` `/plaza` `/where` | Jump pages |

Town pages: Studio, Bazaar, Park, Cafe, Dock, Library, Arcade, Plaza, Attic, Beach, Rooftop, Museum.

## Deploy

Push to `main`. The workflow in `.github/workflows/pages.yml` publishes the site.

`https://whirledclassic.github.io/notebook-sticks-web/`
