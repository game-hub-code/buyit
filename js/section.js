// Generic section page renderer. Reads window.SECTION = { slug, title, adult?, products: [[name, unit, price, mrp?], ...] }.
// Images: images/<slug>/<slug>-<nn>.(avif|png|jpg|jpeg|webp|svg), nn = position in list (01, 02, ...).
(function () {
  var Cart = window.Buyit.Cart, loadImage = window.Buyit.loadImage, flyToCart = window.Buyit.flyToCart;
  var S = window.SECTION, IMG = "images/" + S.slug + "/";
  var grid = document.getElementById("pc-grid");
  var note = document.getElementById("pc-note");
  var byId = {};

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function rupee(n) { return "\u20b9" + n.toLocaleString("en-IN"); }
  function fileOf(n) { return S.slug + "-" + (n < 10 ? "0" : "") + n; }

  document.title = S.title + " | buyit";
  document.getElementById("pc-title").textContent = S.title;
  note.hidden = !S.adult;

  function renderGrid() {
    grid.innerHTML = S.products.map(function (p, i) {
        var n = i + 1;
        var file = fileOf(n), id = S.slug + ":" + file;
        var prod = { id: id, file: file, name: p[0], unit: p[1], price: p[2], mrp: p[3] || null };
        byId[id] = prod;
        var pct = prod.mrp ? Math.round((prod.mrp - prod.price) / prod.mrp * 100) : 0;
        return '<article class="pcard" data-id="' + esc(id) + '">' +
          (pct >= 5 ? '<span class="pbadge">' + pct + '%<br>OFF</span>' : '') +
          '<div class="pimg is-loading"><span class="pimg-ph">' + esc(prod.name.charAt(0)) + '</span></div>' +
          '<h3 class="pname">' + esc(prod.name) + '</h3>' +
          '<p class="punit">' + esc(prod.unit) + '</p>' +
          '<div class="pfoot"><div class="pprice"><span>' + rupee(prod.price) + '</span>' + (prod.mrp ? '<s class="pmrp">' + rupee(prod.mrp) + '</s>' : '') + '</div><div class="pact"></div></div>' +
          '</article>';
    }).join("");
    grid.querySelectorAll(".pcard").forEach(function (card) {
      var p = byId[card.dataset.id];
      loadImage(card.querySelector(".pimg"), IMG + p.file, p.name);
    });
    sync(false);
  }

  // Updates each card's ADD button / quantity stepper to match the cart.
  function sync(animate) {
    grid.querySelectorAll(".pcard").forEach(function (card) {
      var p = byId[card.dataset.id], q = Cart.qty(p.id), act = card.querySelector(".pact");
      var step = act.querySelector(".pstep");
      if (q === 0) {
        if (!act.querySelector(".padd")) act.innerHTML = '<button type="button" class="padd" aria-label="Add ' + esc(p.name) + ' to cart">ADD</button>';
      } else if (!step) {
        act.innerHTML = '<div class="pstep' + (animate ? ' pop' : '') + '"><button type="button" data-d="-1" aria-label="Remove one ' + esc(p.name) + '">\u2212</button><span class="pqty" aria-live="polite">' + q + '</span><button type="button" data-d="1" aria-label="Add one more ' + esc(p.name) + '">+</button></div>';
      } else {
        var qe = step.querySelector(".pqty");
        if (qe.textContent !== String(q)) {
          qe.textContent = q;
          if (animate) { qe.classList.remove("bump"); void qe.offsetWidth; qe.classList.add("bump"); }
        }
      }
    });
  }

  grid.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    var card = btn.closest(".pcard");
    if (!card) return;
    var p = byId[card.dataset.id];
    if (btn.classList.contains("padd")) {
      var img = card.querySelector(".pimg img");
      Cart.add({ id: p.id, name: p.name, unit: p.unit, price: p.price, mrp: p.mrp, img: img ? img.getAttribute("src") : "" });
      flyToCart(card.querySelector(".pimg"));
    } else if (btn.dataset.d === "1") Cart.inc(p.id);
    else if (btn.dataset.d === "-1") Cart.dec(p.id);
  });

  Cart.on(function () { sync(true); });

  renderGrid();
})();