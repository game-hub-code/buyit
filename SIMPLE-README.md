# buyit — Plain-English Guide

This is a grocery delivery website (like Blinkit/Zepto) — a home page with categories (Dairy, Snacks, Fruits & Vegetables, etc.), a product page for each category, and a shopping cart with a mock checkout. Here's what everything does, in plain language.

## How to open it

1. Keep every folder (`css`, `js`, `images`, `tools`) and every `.html` file together — don't move anything out on its own.
2. Double-click `index.html` to see the home page.
3. Click any category tile to see its products; click "Add" on a product to put it in your cart; click the cart icon to go to `cart.html`.

## The pages you'll actually see

- **`index.html`** = the home page. Shows the promo banners at top and the grid of 20 category pictures (Dairy, Snacks, Fruits & Vegetables, and so on).
- **`cart.html`** = your shopping cart page. Shows what you've added, the total bill, and a fake checkout screen (it doesn't actually charge real money — see note below).
- **One page per category** (`dairy-bread-eggs.html`, `snacks-munchies.html`, `fruits-vegetables.html`, etc.) = each shows the list of products in that one category, with prices and an "Add" button.
- **`section-template.html`** = not a real page you'd visit — it's a blank form the site's builder uses as a starting point to create a *new* category page. You'd never open this as a shopper.

## The behind-the-scenes files

Think of the site like a restaurant:

- **`js/config.js`** = a sticky note with the site's name and tagline ("Delivery in 10 min"). Change the words here and it updates everywhere on the site automatically.

- **`js/categories.js`** = the master list of what categories exist and what order they appear in on the home page. Also holds the text for the promo banners at the top.

- **`js/header.js`** = builds the top bar you see on every single page (logo, delivery text, search box, cart icon) — so it only had to be built once and every page reuses it.

- **`js/theme.js`** = remembers whether you prefer light mode or dark mode and applies it instantly, so the page never "flashes" the wrong color for a split second when it loads.

- **`js/dashboard.js`** = the worker that actually draws the home page's banners and category tiles onto the screen, using the lists from `categories.js`.

- **`js/section.js`** = the worker that draws a category page's product grid, using whatever product list that page provides.

- **`js/cart-core.js`** = the actual shopping cart "engine" — remembers what's in your cart even if you close the browser and come back later, and plays the little animation of a product flying into the cart icon when you click Add.

- **`js/cart.js`** = draws the cart page itself — your item list, the total price, and the fake checkout screen.

- **`js/search-data.js`** = ⚠️ don't edit this one by hand. It's a big auto-generated list of *every single product on the whole site*, used to power search. It gets rebuilt automatically by a separate tool (see below) — if you edit a product list, you need to re-run that tool afterward or search results will be out of date.

- **`tools/build-search.js`** = the tool that builds the file above. It's a small program (not something a shopper ever sees or runs) that a developer runs after adding or changing products, so the search box stays accurate.

- **`css/style.css`** = the one file controlling how *everything* looks — colors, spacing, fonts, light/dark mode — across the entire site.

- **`images/`** = every product photo and category picture, organized into one folder per category.

- **`package.json`** = a small settings file that lets a developer run the search-rebuilding tool with a short command instead of a long one. Not something you'd ever open as a shopper.

## Two honest things worth knowing

1. **Checkout doesn't charge real money.** From what's in the code, the "Confirm Payment" screen in the cart is just a visual mock — there's no sign of it actually connecting to a real payment company. Treat it as a demo/prototype checkout, not a live store, unless someone has separately connected it to a real payment system.

2. **Search may or may not be fully working.** I found the file that *stores* all searchable products (`search-data.js`), but I could not confirm the actual search box is reading from it — that logic may live inside `header.js` in a part I didn't fully verify. If typing in the search bar doesn't return results, that's the first place to check.

## The one-line summary

`index.html` is the home page you open first. Every other page (`cart.html`, and each category page) reuses the same handful of shared "worker" files in `js/` — so a change to `config.js`, `header.js`, or `style.css` updates the whole site at once instead of needing 23 separate edits.