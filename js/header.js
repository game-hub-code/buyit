// Shared header, rendered on every page into #site-header.
(function () {
  var cfg = window.BUYIT;
  var host = document.getElementById("site-header");
  if (!host) return;
  host.className = "site-header";
  host.innerHTML =
    '<a class="logo" href="index.html" aria-label="' + cfg.name + ' home">' +
      '<span class="logo-b">buy</span><span class="logo-i">it</span></a>' +
    '<div class="delivery"><div class="delivery-text">' + cfg.deliveryText + '</div></div>' +
    '<label class="search"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
      '<input type="search" id="search-input" placeholder="Search &quot;chocolate&quot;" aria-label="Search products">' +
      '<div class="search-pop" id="search-pop" hidden></div></label>' +
    '<button class="icon-btn" id="theme-toggle" type="button" aria-label="Toggle dark theme"></button>' +
    '<a class="login" href="#">Login</a>' +
    '<button class="cart" type="button"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.6 12.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20.5 8H6"/></svg><span>My Cart</span></button>';

  var btn = document.getElementById("theme-toggle");
  var sun = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var moon = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  function paint() { btn.innerHTML = document.documentElement.getAttribute("data-theme") === "dark" ? sun : moon; }
  btn.addEventListener("click", function () {
    setBuyitTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
    paint();
  });
  paint();

  // Live search suggestions.
  var input = document.getElementById("search-input");
  var pop = document.getElementById("search-pop");
  var data = window.SEARCH_INDEX || [];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }

  function highlight(name, q) {
    var i = name.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return esc(name);
    return esc(name.slice(0, i)) + "<mark>" + esc(name.slice(i, i + q.length)) + "</mark>" + esc(name.slice(i + q.length));
  }

  function render(query) {
    var q = query.trim();
    if (!q) { pop.hidden = true; pop.innerHTML = ""; return; }

    var matches = data.filter(function (item) {
      return item.n.toLowerCase().indexOf(q.toLowerCase()) !== -1;
    }).slice(0, 8);

    if (!matches.length) {
      pop.innerHTML = '<div class="sp-empty">No products found for &quot;' + esc(q) + '&quot;</div>';
      pop.hidden = false;
      return;
    }

    pop.innerHTML = matches.map(function (item) {
      var mrp = item.m && item.m > item.p ? '<s>\u20B9' + item.m + '</s>' : "";
      return (
        '<a class="sp-item" href="' + esc(item.h) + '">' +
          '<div class="sp-img"><img src="' + esc(item.i) + '.avif" alt="" loading="lazy"></div>' +
          '<div class="sp-main">' +
            '<div class="sp-name">' + highlight(item.n, q) + '</div>' +
            '<div class="sp-sub">' + esc(item.u) + ' \u2022 ' + esc(item.c) + '</div>' +
          '</div>' +
          '<div class="sp-price">\u20B9' + item.p + mrp + '</div>' +
        '</a>'
      );
    }).join("");
    pop.hidden = false;
  }

  input.addEventListener("input", function () { render(input.value); });
  input.addEventListener("focus", function () { if (input.value.trim()) render(input.value); });

  document.addEventListener("click", function (e) {
    if (!host.contains(e.target)) pop.hidden = true;
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { pop.hidden = true; input.blur(); }
  });
})();