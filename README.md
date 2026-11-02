# Sprite Tracker

Track which Fortnite sprites you have found and which you have mastered.
Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Run it

- Open `index.html` in a browser, or
- In VS Code, install the "Live Server" extension, right-click `index.html` and choose "Open with Live Server".

Progress is saved in your browser's `localStorage`. It stays on this browser and this device.

## Features

- **Season switcher**: pick a season in the header. Each season has its own sprites and its own saved progress.
- Every sprite shows its power and lists all of its variants (Base, Gold, Fortune, Cursed, ...), each with its own **Found** and **Mastered** checkbox
- Mastering a variant also marks it as found. Un-finding a variant removes its mastery.
- Filters (applied per variant): All, **Not found yet**, **Not mastered yet**, Mastered
- Search by sprite or variant name, e.g. `gold`, `jonesy` or `gold jonesy`
- Progress bars for found and mastered
- Add your own sprites per season (and remove them again)
- Icons for Chapter 7 Season 4 (hotlinked from fortnite.gg, so you need an internet connection)

## Project structure

```
index.html              Page markup
css/styles.css          All styling
js/
  data/common.js        Rarities, variant list, season registry
  data/seasons/c7s4.js  Chapter 7 Season 4: Override
  data/seasons/c7s5.js  Chapter 7 Season 5: Treasure Hunters
  data/images.js        Icon URLs (hotlinked from fortnite.gg)
  storage.js            localStorage wrapper and schema migrations
  store.js              State and rules (no DOM)
  ui.js                 Rendering (no business rules)
  main.js               Event wiring
```

Scripts are loaded as classic scripts in this order, so the page also works when opened directly from disk.

## Updating a season

Edit the season file, e.g. `js/data/seasons/c7s5.js`. Each sprite needs a unique, stable `id`, a `rarity`, an optional `source` and `power`, and a `variants` list (ids from `VARIANTS` in `common.js`).
Progress is saved per season and per `spriteId:variantId`, so renaming a sprite or variant keeps its progress, but changing an `id` loses it.

Typical updates in Treasure Hunters:

- Gold variants (expected Nov 12): add `"gold"` to the `variants` of the sprites that get one.
- New sprites: add an entry to `sprites`.

## Adding a new season

1. Copy `js/data/seasons/c7s5.js` to a new file, e.g. `c8s1.js`, and change `id`, `name`, `order` (higher = newer) and `sprites`.
2. Add a `<script src="js/data/seasons/c8s1.js"></script>` line in `index.html`, after the other season files.
3. If the season introduces a new variant type, add it to `VARIANTS` in `common.js`.

The newest season (highest `order`) is selected by default. Never change the `id` of an existing season, because saved progress is stored under it.

## Saved data

Saved data has a version number. Progress saved by earlier versions (before seasons existed) is moved into Chapter 7 Season 4 automatically. Data of seasons that no longer exist in the code is kept, not deleted.

## Data notes

Chapter 7 Season 5 (Treasure Hunters) was compiled on 2026-11-02 and will change during the season. Epic has not published rarities, so they are read from spawn tiers and may differ between guides. Lil' Uzi Vert Jr. (expected Nov 7) and Transponder Snail are listed by only some guides.

Chapter 7 Season 4 was compiled on 2026-10-26 (the sprite count was 27 at v42.40).

- Treasure Hunters sprites, powers and variants: https://spritecatch.com/news/treasure-hunters-new-sprites/
- Treasure Hunters sprite list: https://www.thebiglead.com/fortnite-chapter-7-season-5-all-new-sprites/
- Treasure Hunters sprite list: https://esports.gg/guides/fortnite/all-new-sprites-fortnite-treasure-hunters/
- Variants per sprite (Season 4): https://fortnite.gg/sprites
- Sprite list and variants (Season 4): https://accountshark.net/fortnite-sprite-checklist
- Count and ability data (Season 4): https://spritechecklist.org/all-sprites/
- Rarity and how to get (Season 4): https://www.altchar.com/guides/fortnite-all-sprites-and-how-to-get-them-october-2026-aRXW58a1yt9o
- Fortnitemares sprites: https://www.destructoid.com/all-fortnite-fortnitemares-sprites-abilities-and-how-to-get-them/
- One Wish Willow: https://games.gg/fortnite/guides/fortnite-how-to-get-one-wish-willow-sprite/
- Mastery rules: https://quackadex.com/guides/sprite-mastery

## Icons

The icons are Epic Games artwork, loaded directly from `https://fortnite.gg/img/x/sprites/icons/`. Nothing is copied into this project.
They only show with an internet connection, and they stop working if fortnite.gg moves or blocks the files.
An icon that fails to load, or a sprite without an icon entry, shows a placeholder with the sprite's first letter.
A few variants use a different filename than their sprite (for example Tails' Bounty Hunter), which is why `images.js` has a `STEM_OVERRIDES` table.
When a new sprite is added, add its entry to `STEMS` in `images.js`; sprites you add in the app have no icon.

Treasure Hunters: the Fortune variant uses the `_Jeweled` file. The sprite-to-filename matching for this season was done by page order and theme, so a few icons may sit on the wrong sprite. Swap the two entries in `STEMS` if you see that.

## Not included

The rarity of each individual variant is not shown. Only the sprite's own rarity is, because the sources I found do not list a rarity per variant.
