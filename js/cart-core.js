// Shared cart engine, image loader, and "fly to cart" animation.
// Defines window.Buyit = { Cart, loadImage, flyToCart }, which section.js
// and cart.js both require. Must be loaded AFTER header.js (so the
// header's .cart button already exists) and BEFORE section.js / cart.js.
(function () {
  var KEY = "buyit-cart";
  var listeners = [];
  var items = read();

  // ---- fly-to-cart animation settings ----
  var FLY_HOLD_MS = 500;                          // pause before the image starts moving, in ms
  var FLY_DURATION_MS = 2200;                       // how long the move to the cart takes, in ms
  var FLY_EASING = "cubic-bezier(.25,.1,.25,1)";   // ease-in-out curve for a smooth start/finish
  var FLY_END_SCALE = .15;                         // size the image shrinks to as it nears the cart
  var FLY_END_OPACITY = .4;                        // opacity the image fades to as it nears the cart
  var FLY_CLEANUP_BUFFER_MS = 20;                  // extra time after the animation before removing the element
  var FLY_CLEANUP_MS = FLY_HOLD_MS + FLY_DURATION_MS + FLY_CLEANUP_BUFFER_MS; // total time before cleanup (fallback path only)

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
          { transform: "translate(" + dx + "px, " + dy + "px) scale(" + FLY_END_SCALE + ")", opacity: FLY_END_OPACITY }
        ],
        { duration: FLY_DURATION_MS, delay: FLY_HOLD_MS, easing: FLY_EASING, fill: "forwards" }
      );
      anim.onfinish = function () { fly.remove(); };
    } else {
      // Web Animations API unavailable: fall back to a CSS transition.
      var holdSec = FLY_HOLD_MS / 1000;
      var durSec = FLY_DURATION_MS / 1000;
      fly.style.transition = "transform " + durSec + "s " + FLY_EASING + " " + holdSec + "s, opacity " + durSec + "s " + holdSec + "s";
      requestAnimationFrame(function () {
        fly.style.transform = "translate(" + dx + "px, " + dy + "px) scale(" + FLY_END_SCALE + ")";
        fly.style.opacity = FLY_END_OPACITY;
      });
      setTimeout(function () { fly.remove(); }, FLY_CLEANUP_MS);
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