// Shared cart engine, image loader, and "fly to cart" animation.
// Defines window.Buyit = { Cart, loadImage, flyToCart }, which section.js
// and cart.js both require. Must be loaded AFTER header.js (so the
// header's .cart button already exists) and BEFORE section.js / cart.js.
(function () {
  var KEY = "buyit-cart";
  var listeners = [];
  var items = read();

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
  }

  function notify() {
    save();
    listeners.forEach(function (fn) { fn(items); });
  }

  var Cart = {
    items: function () { return items; },
    qty: function (id) { return items[id] ? items[id].qty : 0; },
    add: function (p) {
      if (items[p.id]) {
        items[p.id].qty += 1;
      } else {
        items[p.id] = {
          id: p.id, name: p.name, unit: p.unit || "",
          price: p.price, mrp: p.mrp || null, img: p.img || "", qty: 1
        };
      }
      notify();
    },
    inc: function (id) { if (items[id]) { items[id].qty += 1; notify(); } },
    dec: function (id) {
      if (!items[id]) return;
      items[id].qty -= 1;
      if (items[id].qty <= 0) delete items[id];
      notify();
    },
    remove: function (id) { if (items[id]) { delete items[id]; notify(); } },
    clear: function () { items = {}; notify(); },
    on: function (fn) { listeners.push(fn); }
  };

  // ---- image loader: tries each extension in turn until one loads ----
  var EXTS = ["avif", "png", "jpg", "jpeg", "webp", "svg"];

  function loadImage(el, basePath, altText) {
    var i = 0;
    (function next() {
      if (i >= EXTS.length) { el.classList.remove("is-loading"); return; }
      var img = new Image();
      img.alt = altText || "";
      img.decoding = "async";
      img.onload = function () {
        el.textContent = "";
        el.appendChild(img);
        el.classList.remove("is-loading");
      };
      img.onerror = next;
      img.src = basePath + "." + EXTS[i++];
    })();
  }

  // ---- fly-to-cart animation ----
  function flyToCart(sourceEl) {
    var cartBtn = document.querySelector(".cart");
    if (!sourceEl || !cartBtn) return;

    var srcRect = sourceEl.getBoundingClientRect();
    var dstRect = cartBtn.getBoundingClientRect();
    var srcImg = sourceEl.querySelector("img");

    var fly = document.createElement("div");
    fly.className = "fly" + (srcImg ? "" : " fly-dot");
    fly.style.left = srcRect.left + "px";
    fly.style.top = srcRect.top + "px";
    fly.style.width = srcRect.width + "px";
    fly.style.height = srcRect.height + "px";
    if (srcImg) fly.appendChild(srcImg.cloneNode(true));
    document.body.appendChild(fly);

    var dx = (dstRect.left + dstRect.width / 2) - (srcRect.left + srcRect.width / 2);
    var dy = (dstRect.top + dstRect.height / 2) - (srcRect.top + srcRect.height / 2);

    if (typeof fly.animate === "function") {
      var anim = fly.animate(
        [
          { transform: "translate(0, 0) scale(1)", opacity: 1 },
          { transform: "translate(" + dx + "px, " + dy + "px) scale(.15)", opacity: .4 }
        ],
        { duration: 800, easing: "cubic-bezier(.3,.6,.4,1)" }
      );
      anim.onfinish = function () { fly.remove(); };
    } else {
      // Web Animations API unavailable: fall back to a CSS transition.
      fly.style.transition = "transform .45s cubic-bezier(.3,.6,.4,1), opacity .45s";
      requestAnimationFrame(function () {
        fly.style.transform = "translate(" + dx + "px, " + dy + "px) scale(.15)";
        fly.style.opacity = ".4";
      });
      setTimeout(function () { fly.remove(); }, 470);
    }
  }

  // ---- keep header cart button's "has-items" state in sync ----
  function paintCartButton(currentItems) {
    var btn = document.querySelector(".cart");
    if (!btn) return;
    var n = 0;
    for (var k in currentItems) n += currentItems[k].qty;
    btn.classList.toggle("has-items", n > 0);
  }
  Cart.on(paintCartButton);
  paintCartButton(items);

  window.Buyit = { Cart: Cart, loadImage: loadImage, flyToCart: flyToCart };
})();
