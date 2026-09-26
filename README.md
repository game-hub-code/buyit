# BUYIT

Static, no-framework "quick commerce" grocery site (Blinkit/Zepto-style: home page → 20 category grid → per-category product page → cart → mock checkout). Plain HTML/CSS/JS, one small Node build script for search indexing. No package dependencies (`package.json` has no `dependencies` — the `build` script only uses Node's built-in `fs`/`path`/`vm`).

## Top-level pages

| File | Purpose |
|---|---|
| `index.html` | Home page: offers strip (`#offers`) + 20-tile category grid (`#categories`), both rendered client-side by `dashboard.js` from data in `categories.js`. |
| `cart.html` | Cart page: item list + bill summary + a mock checkout overlay (UPI field, tip field, confirm pane), driven by `cart.js`. |
| `section-template.html` | **Not a real page** — the scaffold you copy to create a new category page. Contains an inline `window.SECTION = {...}` block (slug, title, `adult` flag, `products: [[name, unit, price, mrp?], ...]`) plus instructions in an HTML comment for wiring up images and the cart-id prefix. |
| `atta-rice-dal.html`, `baby-care.html`, `bakery-biscuits.html`, `breakfast-instant-food.html`, `chicken-meat-fish.html`, `cleaning-essentials.html`, `cold-drinks-juices.html`, `dairy-bread-eggs.html`, `fruits-vegetables.html`, `home-office.html`, `masala-oil-more.html`, `organic-healthy-living.html`, `paan-corner.html`, `personal-care.html`, `pet-care.html`, `pharma-wellness.html`, `sauces-spreads.html`, `snacks-munchies.html`, `sweet-tooth.html`, `tea-coffee-milk-drinks.html` | Real category pages — each is `section-template.html` copied and filled in with its own `window.SECTION` product list. `paan-corner.html` is slightly larger (8K vs 4K) — likely has the `adult: true` note block populated/styled inline, or a longer product list; worth a quick diff against another page if you're using it as your template reference. |

## `js/`

| File | Purpose |
|---|---|
| `config.js` | Single site-wide config object, `window.BUYIT = { name, deliveryText }`. Edit this to rebrand text without touching any other file. |
| `theme.js` | Loaded in `<head>` (before paint, to avoid a flash of wrong theme). Reads a saved `buyit-theme` from `localStorage`, falls back to the OS's `prefers-color-scheme`, and sets `data-theme` on `<html>`. Exposes `window.setBuyitTheme(v)` for a theme toggle UI to call. |
| `categories.js` | Two data arrays: `window.CATEGORIES` (the 20 category tiles — `[slug, displayName]` pairs, order = grid order) and `window.OFFERS` (the offer cards shown above the grid). Pure data, no logic. |
| `header.js` | Renders the shared site header (logo, delivery-time text, search input, cart button) into `#site-header` on every page. Reads `window.BUYIT` for text. |
| `dashboard.js` | Home-page-only renderer: turns `window.OFFERS` and `window.CATEGORIES` into the actual `<article>`/`<a>` markup inside `#offers` and `#categories`. |
| `section.js` | Generic category-page renderer. Reads `window.SECTION` (set inline by each category HTML file), builds the product grid into `#pc-grid`, resolves each product's image path as `images/<slug>/<slug>-<nn>.<ext>` (tries `avif/png/jpg/jpeg/webp/svg` in order, falls back to a letter placeholder if none load), and wires each product's Add-to-cart button into the shared `Cart` engine + `flyToCart` animation from `cart-core.js`. |
| `cart-core.js` | The shared engine, exposed as `window.Buyit = { Cart, loadImage, flyToCart }`. Must load **after** `header.js` (needs the header's cart button to already exist in the DOM) and **before** `section.js`/`cart.js` (both depend on it). `Cart` persists to `localStorage` under the key `buyit-cart` and is pub/sub (`listeners` array) so header cart-count and cart-page contents both react to changes. `flyToCart` is a configurable animation (hold delay, duration, easing curve, end scale/opacity — all tunable constants at the top of the file) that flies a clone of the clicked product image toward the cart icon on add. |
| `cart.js` | Cart-page-only renderer: builds the item list + bill summary from `Cart`'s current items, and drives a two-pane checkout overlay (`pane-payment` → `pane-confirm`) with a UPI-ID field and a tip field. This is a **front-end-only mock checkout** — no evidence of any real payment API call in what's here; treat "confirm" as UI-only unless you've wired a backend elsewhere. |
| `search-data.js` | **Generated file — do not hand-edit.** `window.SEARCH_INDEX`, a flat array of every product across every category (`{n: name, u: unit, p: price, m: mrp, c: category, h: page href, i: image path}`), built by `tools/build-search.js` by scanning every category page's inline `SECTION` block. Re-run the build script instead of editing this directly, or your changes will be overwritten on the next build. |

## `tools/build-search.js`

Node CLI script (needs Node 14+, no npm dependencies — uses `fs`, `path`, `vm` from the standard library). Three modes, wired into `package.json` scripts:

```
npm run build   → node tools/build-search.js            (rebuild search-data.js once)
npm run watch   → node tools/build-search.js --watch     (rebuild automatically on file changes)
npm run check   → node tools/build-search.js --check     (exit code 1 if search-data.js is stale — CI/git-hook friendly)
```

It scans every `*.html` containing a `window.SECTION = {...}` block (skipping `section-template.html`), evaluates that block in a sandboxed VM context to pull out the product list safely, resolves category display names via `categories.js` (falling back to `SECTION.title` if a slug isn't in `CATEGORIES`), and writes the combined result to `js/search-data.js`. New category pages are picked up automatically — no config file to update per-page.

## `css/style.css`

Single stylesheet for the entire site (all pages link it directly, no per-page CSS). Covers: theme variables driving light/dark via the `data-theme` attribute `theme.js` sets, header layout, offer cards, category grid, per-product cards on category pages, and the cart page + checkout overlay.

## `images/`

Per-category subfolders (`images/<slug>/<slug>-01.ext`, `-02.ext`, ...) matching product order in that category's `SECTION.products` array, plus one `<slug>.avif` per category for the home-page tile thumbnail. Missing files fall back to a letter placeholder — this is handled by `section.js`'s image loader, not by anything in the HTML.

## Data flow, end to end

1. `theme.js` sets the theme attribute before anything renders.
2. `header.js` injects the header into every page.
3. **Home page**: `categories.js` (data) → `dashboard.js` (renderer) → `#offers`/`#categories`.
4. **Category page**: inline `SECTION` block (data, per-page) → `section.js` (renderer) → `#pc-grid`, using `cart-core.js`'s `Cart`/`loadImage`/`flyToCart`.
5. **Search**: `search-data.js` (pre-built flat index, regenerated by `tools/build-search.js` from every page's `SECTION` block) — implies there's a search-UI consumer somewhere reading `window.SEARCH_INDEX`; I didn't find a dedicated `search.js` in this file listing, so whether search input wiring lives inside `header.js` or is not yet implemented client-side. Worth checking `header.js` in full if search isn't working.
6. **Cart page**: `cart-core.js`'s `Cart` (shared state, `localStorage`-backed) → `cart.js` (renderer + checkout overlay).