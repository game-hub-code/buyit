// Shared site script: cart store, image loader, fly-to-cart animation, and the header.
// Exposes window.Buyit = { Cart, loadImage, flyToCart }.
(function () {
  var cfg = window.BUYIT;
  var KEY = "buyit-cart";
  var items = {};
  var listeners = [];

  function load() { try { items = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { items = {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} }
  function emit() { listeners.forEach(function (fn) { fn(); }); }
  load();

  var Cart = {
    items: function () { return items; },
    qty: function (id) { return items[id] ? items[id].qty : 0; },
    add: function (p) {
      if (items[p.id]) items[p.id].qty++;
      else items[p.id] = { id: p.id, name: p.name, unit: p.unit, price: p.price, mrp: p.mrp || null, img: p.img || "", qty: 1 };
      save(); emit();
    },
    inc: function (id) { if (items[id]) { items[id].qty++; save(); emit(); } },
    dec: function (id) {
      if (!items[id]) return;
      items[id].qty--;
      if (items[id].qty <= 0) delete items[id];
      save(); emit();
    },
    remove: function (id) { delete items[id]; save(); emit(); },
    clear: function () { items = {}; save(); emit(); },
    count: function () { var n = 0; for (var k in items) n += items[k].qty; return n; },
    total: function () { var t = 0; for (var k in items) t += items[k].price * items[k].qty; return t; },
    on: function (fn) { listeners.push(fn); }
  };
  // keep other open tabs in sync
  window.addEventListener("storage", function (e) { if (e.key === KEY) { load(); emit(); } });

  // Loads <base>.<ext> into box, trying each extension in turn. Placeholder stays if none exist.
  function loadImage(box, base, alt, onLoad) {
    var exts = ["avif", "png", "jpg", "jpeg", "webp", "svg"], i = 0;
    (function next() {
      if (i >= exts.length) { box.classList.remove("is-loading"); return; }
      var img = new Image();
      img.alt = alt || "";
      img.decoding = "async";
      img.onload = function () { box.textContent = ""; box.appendChild(img); box.classList.remove("is-loading"); if (onLoad) onLoad(img); };
      img.onerror = next;
      img.src = base + "." + exts[i++];
    })();
  }

  function bump() {
    var btn = document.getElementById("cart-btn");
    if (btn && btn.animate) btn.animate([{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }], { duration: 320, easing: "ease-out" });
  }

  // Copies srcEl (a product image box) and flies it into the cart button.
  function flyToCart(srcEl) {
    var btn = document.getElementById("cart-btn");
    if (!btn || !srcEl || !srcEl.getBoundingClientRect) return;
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) { bump(); return; }
    var a = srcEl.getBoundingClientRect(), b = btn.getBoundingClientRect();
    var size = Math.min(a.width, 110);
    var ghost = document.createElement("div");
    ghost.className = "fly";
    ghost.style.left = (a.left + a.width / 2 - size / 2) + "px";
    ghost.style.top = (a.top + a.height / 2 - size / 2) + "px";
    ghost.style.width = size + "px";
    ghost.style.height = size + "px";
    var img = srcEl.querySelector("img");
    if (img) ghost.appendChild(img.cloneNode()); else ghost.classList.add("fly-dot");
    document.body.appendChild(ghost);
    var dx = (b.left + b.width / 2) - (a.left + a.width / 2);
    var dy = (b.top + b.height / 2) - (a.top + a.height / 2);
    if (!ghost.animate) { ghost.remove(); bump(); return; }
    var anim = ghost.animate(
      [{ transform: "translate(0,0) scale(1)", opacity: 1 },
       { transform: "translate(" + dx + "px," + dy + "px) scale(.12)", opacity: .5 }],
      { duration: 700, easing: "cubic-bezier(.55,.05,.75,.4)" });
    anim.onfinish = function () { ghost.remove(); bump(); };
  }

  window.Buyit = { Cart: Cart, loadImage: loadImage, flyToCart: flyToCart };

  // ---- header ----
  var host = document.getElementById("site-header");
  if (!host) return;
  host.className = "site-header";
  host.innerHTML =
    '<a class="logo" href="index.html" aria-label="' + cfg.name + ' home">' +
      '<span class="logo-b">buy</span><span class="logo-i">it</span></a>' +
    '<div class="delivery"><div class="delivery-text">' + cfg.deliveryText + '</div></div>' +
    '<label class="search"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
      '<input type="search" placeholder="Search &quot;chocolate&quot;" aria-label="Search products" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="search-list" aria-autocomplete="list">' +
      '<div class="search-pop" id="search-list" role="listbox" hidden></div></label>' +
    '<button class="icon-btn" id="theme-toggle" type="button" aria-label="Toggle dark theme"></button>' +
    '<a class="login" href="#">Login</a>' +
    '<button class="cart" id="cart-btn" type="button"></button>';

  var cartIcon = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.6 12.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20.5 8H6"/></svg>';
  function paintCart() {
    var btn = document.getElementById("cart-btn"), n = Cart.count();
    if (n > 0) {
      var t = Cart.total().toLocaleString("en-IN");
      btn.classList.add("has-items");
      btn.setAttribute("aria-label", "Cart: " + n + (n === 1 ? " item, " : " items, ") + "\u20b9" + t);
      btn.innerHTML = cartIcon + '<span class="cart-lines"><span>' + n + (n === 1 ? " item" : " items") + '</span><span>\u20b9' + t + '</span></span>';
    } else {
      btn.classList.remove("has-items");
      btn.setAttribute("aria-label", "My Cart");
      btn.innerHTML = cartIcon + '<span class="cart-label">My Cart</span>';
    }
  }
  Cart.on(paintCart);
  paintCart();
  document.getElementById("cart-btn").addEventListener("click", function () {
    if (!/\/cart\.html$/.test(location.pathname)) location.href = "cart.html";
  });

  var tbtn = document.getElementById("theme-toggle");
  var sun = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var moon = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  function paintTheme() { tbtn.innerHTML = document.documentElement.getAttribute("data-theme") === "dark" ? sun : moon; }
  tbtn.addEventListener("click", function () {
    setBuyitTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
    paintTheme();
  });
  paintTheme();
  // ---- live search suggestions ----
  // Uses window.SEARCH_INDEX (js/search-data.js) and window.CATEGORIES (js/categories.js, loaded on the home page).
  var wrap = host.querySelector(".search");
  var box = wrap.querySelector("input");
  var pop = wrap.querySelector(".search-pop");
  var results = [], active = -1;
  var MAX_PRODUCTS = 8;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function norm(s) { return String(s).toLowerCase().replace(/[^a-z0-9\u0900-\u097f\s]/g, " ").replace(/\s+/g, " ").trim(); }
  function rupee(n) { return "\u20b9" + n.toLocaleString("en-IN"); }

  // Wraps each typed word in <mark>. Matches on the RAW text and escapes each piece afterwards,
  // so entities like &amp; are never matched or split.
  function highlight(text, words) {
    var lower = text.toLowerCase(), hit = [];
    for (var i = 0; i < text.length; i++) hit.push(false);
    words.forEach(function (w) {
      if (!w) return;
      var from = 0, at;
      while ((at = lower.indexOf(w, from)) !== -1) {
        for (var k = at; k < at + w.length; k++) hit[k] = true;
        from = at + w.length;
      }
    });
    var out = "", i2 = 0;
    while (i2 < text.length) {
      var j = i2;
      while (j < text.length && hit[j] === hit[i2]) j++;
      var piece = esc(text.slice(i2, j));
      out += hit[i2] ? "<mark>" + piece + "</mark>" : piece;
      i2 = j;
    }
    return out;
  }

  // Every typed word must appear in `hay`; returns null if not, otherwise a score (lower = better).
  function score(hay, words, q) {
    var s = 0;
    if (hay.indexOf(q) === 0) s -= 50;        // name starts with exactly what was typed
    else if (hay.indexOf(q) > -1) s -= 20;    // typed phrase appears intact
    var parts = hay.split(" ");
    for (var i = 0; i < words.length; i++) {
      var w = words[i], at = hay.indexOf(w);
      if (at === -1) return null;
      var wordStart = parts.some(function (p) { return p.indexOf(w) === 0; });
      s += wordStart ? 0 : 15;                // prefer matches at the start of a word
      s += at * 0.1;                          // earlier in the name is better
    }
    return s + hay.length * 0.05;             // slight bias toward shorter names
  }

  function search(raw) {
    var q = norm(raw);
    if (!q) return null;
    var words = q.split(" ");
    var cats = [], prods = [];

    (window.CATEGORIES || []).forEach(function (c) {
      var sc = score(norm(c.name), words, q);
      if (sc !== null) cats.push({ s: sc, name: c.name, href: c.href, slug: c.slug });
    });
    cats.sort(function (a, b) { return a.s - b.s; });

    (window.SEARCH_INDEX || []).forEach(function (r, idx) {
      var sc = score(norm(r.n), words, q);
      // "dairy" should still list dairy items, but rank them below real name matches
      if (sc === null) { var sc2 = score(norm(r.n + " " + r.c), words, q); if (sc2 !== null) sc = sc2 + 40; }
      if (sc !== null) prods.push({ s: sc, row: r, idx: idx });
    });
    prods.sort(function (a, b) { return a.s - b.s || a.idx - b.idx; });

    return { words: words, cats: cats.slice(0, 2), prods: prods.slice(0, MAX_PRODUCTS), totalProds: prods.length };
  }

  function thumb(base) { return '<span class="sp-img is-loading" data-base="' + esc(base) + '"></span>'; }

  function show(on) {
    pop.hidden = !on;
    box.setAttribute("aria-expanded", on ? "true" : "false");
    if (!on) box.removeAttribute("aria-activedescendant");
  }

  function paint(raw) {
    var r = search(raw);
    results = []; active = -1;
    if (!r) { show(false); return; }
    if (!r.cats.length && !r.prods.length) {
      pop.innerHTML = '<div class="sp-empty">No matches for \u201c' + esc(raw.trim()) + '\u201d</div>';
      show(true);
      return;
    }
    var html = "";
    r.cats.forEach(function (c) {
      results.push(c.href);
      html += '<a class="sp-item sp-cat" role="option" id="sp-' + (results.length - 1) + '" href="' + esc(c.href) + '">' +
        thumb("images/" + c.slug) +
        '<span class="sp-main"><span class="sp-name">' + highlight(c.name, r.words) + '</span><span class="sp-sub">Category</span></span></a>';
    });
    r.prods.forEach(function (x) {
      var p = x.row, href = p.h;
      results.push(href);
      html += '<a class="sp-item" role="option" id="sp-' + (results.length - 1) + '" href="' + esc(href) + '">' +
        thumb(p.i) +
        '<span class="sp-main"><span class="sp-name">' + highlight(p.n, r.words) + '</span><span class="sp-sub">' + esc(p.u) + ' \u00b7 ' + esc(p.c) + '</span></span>' +
        '<span class="sp-price">' + rupee(p.p) + (p.m && p.m > p.p ? ' <s>' + rupee(p.m) + '</s>' : '') + '</span></a>';
    });
    if (r.totalProds > r.prods.length) html += '<div class="sp-more">+ ' + (r.totalProds - r.prods.length) + ' more \u2014 keep typing to narrow down</div>';
    pop.innerHTML = html;
    show(true);
    pop.querySelectorAll(".sp-img").forEach(function (b) { loadImage(b, b.getAttribute("data-base"), ""); });
  }

  function setActive(i) {
    var els = pop.querySelectorAll(".sp-item");
    if (!els.length) return;
    if (i < 0) i = els.length - 1;
    if (i >= els.length) i = 0;
    els.forEach(function (e) { e.classList.remove("is-active"); });
    els[i].classList.add("is-active");
    els[i].scrollIntoView({ block: "nearest" });
    box.setAttribute("aria-activedescendant", els[i].id);
    active = i;
  }

  box.addEventListener("input", function () { paint(box.value); });
  box.addEventListener("focus", function () { if (box.value.trim()) paint(box.value); });
  box.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); if (pop.hidden) paint(box.value); setActive(active + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
    else if (e.key === "Enter") {
      var target = active >= 0 ? results[active] : results[0];   // highlighted suggestion, else best match
      if (target) { e.preventDefault(); location.href = target; }
    }
    else if (e.key === "Escape") {
      // type=search also clears itself on Escape; keep the text when we're just closing the list.
      if (!pop.hidden) { e.preventDefault(); show(false); } else box.value = "";
    }
  });
  document.addEventListener("click", function (e) { if (!wrap.contains(e.target)) show(false); });
  // The suggestions live inside the <label>, so stop label-click behaviour from eating link clicks.
  pop.addEventListener("click", function (e) { e.stopPropagation(); });
})();
