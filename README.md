# Notebook Sticks

A playable stick-figure sketchbook you can ship from GitHub.

Walk the pages. Collect stamps. Spend ink. Throw paper airplanes. Open a second browser tab and the *other tab's* doodle shows up — you should only ever see one of yourself in the tab you are playing.

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
| Page buttons | Turn the notebook |
| Place list | Walk to a scribble |
| Chat box | Talk (+1 ink) |
| `!hello` | Shout the page |
| `/mark hi` | Pin a note |
| `/member PLUS` | Unlock Plus (Club) |
| `/member PATRON` | Unlock Patron (Club + Margin) |
| F | Paper airplane |
| Wave / Sit / Dance | Poses |
| Look | Change owned ink / hats |
| Member | Buy a tier with ink |
| Shop / Club / desk | Spend ink |

Visit a named scribble once for a **stamp** and +3 ink (Club / Margin stamps give +8). Wallet saves under your name in this browser.

Pages: Cover, Graph, Comic, Pocket, Gallery, Back, Shop. **Club** needs Plus. **Margin** needs Patron.

## Memberships

No payment backend — ink or a chat code.

| Tier | How | Unlocks |
| --- | --- | --- |
| free | default | Public pages, +2 ink / min |
| plus | 80 ink or `/member PLUS` | Club, ribbon hat, pin, +4 ink / min |
| patron | 200 ink or `/member PATRON` | Club + Margin, star hat, gold ink, +8 ink / min |

## Why this repo exists

The original game talks over WebSockets and needs `npm start`. This repo is the shippable website:

- static files at the repo root
- GitHub Actions deploys GitHub Pages on every push to `main`
- second tab multiplayer via `BroadcastChannel` (same browser / same origin)
- NPCs so a lone page still feels inhabited

True internet-wide multiplayer still lives on the Node original. This build is the one you can send as a link.

## Deploy

Push to `main`. The workflow in `.github/workflows/pages.yml` publishes the site.

First deploy: in the repo **Settings → Pages**, set Source to **GitHub Actions** if GitHub asks. After that the URL is:

`https://<user>.github.io/notebook-sticks-web/`
