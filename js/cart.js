// Renders the cart page (item list + bill summary) and drives the checkout overlay.
(function () {
  var Cart = window.Buyit.Cart, loadImage = window.Buyit.loadImage;

  var layout = document.getElementById("cart-layout");
  var empty = document.getElementById("cart-empty");
  var list = document.getElementById("cart-items-list");
  var countEl = document.getElementById("cart-items-count");
  var rowsEl = document.getElementById("summary-rows");
  var totalEl = document.getElementById("summary-total");
  var proceedBtn = document.getElementById("proceed-btn");

  var overlay = document.getElementById("checkout-overlay");
  var paneP = document.getElementById("pane-payment");
  var paneC = document.getElementById("pane-confirm");
  var upiEl = document.getElementById("f-upi");
  var tipEl = document.getElementById("f-tip");
  var amountVal = document.getElementById("checkout-amount-val");
  var payBtn = document.getElementById("pay-btn");
  var closeBtn = document.getElementById("checkout-close");
  var receiptEl = document.getElementById("receipt");
  var confirmSub = document.getElementById("confirm-sub");
  var printBtn = document.getElementById("print-btn");
  var continueBtn = document.getElementById("continue-btn");

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function rupee(n) { return "\u20b9" + n.toLocaleString("en-IN"); }

  var DELIVERY_FEE = 25, FREE_DELIVERY_OVER = 199, HANDLING_FEE = 6, TIP = 20;

  function bill() {
    var items = Cart.items(), mrpTotal = 0, sellTotal = 0;
    for (var k in items) { var it = items[k]; sellTotal += it.price * it.qty; mrpTotal += (it.mrp || it.price) * it.qty; }
    var savings = mrpTotal - sellTotal;
    var delivery = sellTotal === 0 || sellTotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
    var handling = sellTotal === 0 ? 0 : HANDLING_FEE;
    var toPay = sellTotal + delivery + handling;
    return { mrpTotal: mrpTotal, sellTotal: sellTotal, savings: savings, delivery: delivery, handling: handling, toPay: toPay };
  }

  // ---- item list ----
  function renderItems() {
    var items = Cart.items(), ids = Object.keys(items);
    if (ids.length === 0) {
      layout.hidden = true; empty.hidden = false;
      return;
    }
    layout.hidden = false; empty.hidden = true;

    var n = 0; for (var k in items) n += items[k].qty;
    countEl.textContent = n + (n === 1 ? " item" : " items");

    list.innerHTML = ids.map(function (id) {
      var it = items[id];
      var pct = it.mrp && it.mrp > it.price ? Math.round((it.mrp - it.price) / it.mrp * 100) : 0;
      return '<article class="citem" data-id="' + esc(id) + '">' +
        '<div class="cimg" id="cimg-' + esc(cssId(id)) + '"><span class="pimg-ph">' + esc(it.name.charAt(0)) + '</span></div>' +
        '<div class="cinfo">' +
          '<h3 class="cname">' + esc(it.name) + '</h3>' +
          '<p class="cunit">' + esc(it.unit || "") + '</p>' +
          '<button type="button" class="cremove" data-act="remove">Remove</button>' +
        '</div>' +
        '<div class="cright">' +
          '<div class="pstep"><button type="button" data-act="dec" aria-label="Remove one ' + esc(it.name) + '">\u2212</button>' +
            '<span class="pqty">' + it.qty + '</span>' +
            '<button type="button" data-act="inc" aria-label="Add one more ' + esc(it.name) + '">+</button></div>' +
          '<div class="cprice"><span>' + rupee(it.price * it.qty) + '</span>' + (it.mrp && it.mrp > it.price ? '<s class="pmrp">' + rupee(it.mrp * it.qty) + '</s>' : '') + '</div>' +
        '</div>' +
      '</article>';
    }).join("");

    ids.forEach(function (id) {
      var it = items[id], box = document.getElementById("cimg-" + cssId(id));
      if (it.img) { var img = new Image(); img.alt = it.name; img.src = it.img; img.onload = function () { box.textContent = ""; box.appendChild(img); }; }
    });

    renderSummary();
  }

  function cssId(id) { return id.replace(/[^a-zA-Z0-9_-]/g, "_"); }

  function renderSummary() {
    var b = bill();
    var rows = [
      ["Items total", rupee(b.mrpTotal)],
    ];
    rowsEl.innerHTML = "";
    var html = '<div class="srow"><dt>Items total</dt><dd>' + rupee(b.mrpTotal) + '</dd></div>';
    if (b.savings > 0) html += '<div class="srow srow-save"><dt>Savings</dt><dd>&minus;' + rupee(b.savings) + '</dd></div>';
    html += '<div class="srow"><dt>Delivery charge</dt><dd>' + (b.delivery === 0 ? '<span class="sfree">FREE</span>' : rupee(b.delivery)) + '</dd></div>';
    html += '<div class="srow"><dt>Handling charge</dt><dd>' + rupee(b.handling) + '</dd></div>';
    rowsEl.innerHTML = html;
    totalEl.innerHTML = '<span>To pay</span><strong>' + rupee(b.toPay) + '</strong>';
  }

  list.addEventListener("click", function (e) {
    var btn = e.target.closest("button"); if (!btn) return;
    var card = btn.closest(".citem"); if (!card) return;
    var id = card.dataset.id, act = btn.dataset.act;
    if (act === "inc") Cart.inc(id);
    else if (act === "dec") Cart.dec(id);
    else if (act === "remove") Cart.remove(id);
  });

  Cart.on(renderItems);
  renderItems();

  // ---- checkout overlay: payment step ----
  function total() { return bill().toPay + (tipEl.checked ? TIP : 0); }
  tipEl.addEventListener("change", function () { amountVal.textContent = rupee(total()); });

  function openCheckout() {
    var b = bill();
    if (b.toPay <= 0) return;
    upiEl.value = ""; tipEl.checked = false;
    amountVal.textContent = rupee(b.toPay);
    paneP.hidden = false; paneC.hidden = true;
    payBtn.disabled = false; payBtn.textContent = "Pay";
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeCheckout() {
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  proceedBtn.addEventListener("click", openCheckout);
  closeBtn.addEventListener("click", closeCheckout);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) closeCheckout(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !overlay.hidden) closeCheckout(); });

  function genOrderId() {
    return "BYT" + Date.now().toString(36).toUpperCase().slice(-6) + Math.floor(Math.random() * 90 + 10);
  }

  payBtn.addEventListener("click", function () {
    if (!upiEl.reportValidity()) return;
    payBtn.disabled = true;
    payBtn.textContent = "Processing\u2026";
    var b = bill();
    b.tip = tipEl.checked ? TIP : 0;
    b.toPay += b.tip;
    var items = Cart.items();
    var methodLabel = "UPI \u00b7 " + upiEl.value.trim();
    var orderId = genOrderId();
    var when = new Date();

    setTimeout(function () {
      showConfirmation(orderId, when, items, b, methodLabel);
      Cart.clear();
    }, 900);
  });

  function showConfirmation(orderId, when, items, b, methodLabel) {
    confirmSub.textContent = "Order #" + orderId + " \u00b7 arriving in about 10 minutes";

    var rowsHtml = Object.keys(items).map(function (k) {
      var it = items[k];
      return '<div class="rrow"><span>' + esc(it.name) + ' <em>&times;' + it.qty + '</em></span><span>' + rupee(it.price * it.qty) + '</span></div>';
    }).join("");

    receiptEl.innerHTML =
      '<div class="rhead"><span>Order ID</span><strong>' + orderId + '</strong></div>' +
      '<div class="rhead"><span>Date</span><span>' + esc(when.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })) + '</span></div>' +
      '<div class="rhead"><span>Payment method</span><span>' + esc(methodLabel) + '</span></div>' +
      '<div class="rdiv"></div>' +
      rowsHtml +
      '<div class="rdiv"></div>' +
      '<div class="rrow"><span>Items total</span><span>' + rupee(b.mrpTotal) + '</span></div>' +
      (b.savings > 0 ? '<div class="rrow rrow-save"><span>Savings</span><span>&minus;' + rupee(b.savings) + '</span></div>' : '') +
      '<div class="rrow"><span>Delivery charge</span><span>' + (b.delivery === 0 ? "FREE" : rupee(b.delivery)) + '</span></div>' +
      '<div class="rrow"><span>Handling charge</span><span>' + rupee(b.handling) + '</span></div>' +
      (b.tip ? '<div class="rrow"><span>Tip</span><span>' + rupee(b.tip) + '</span></div>' : '') +
      '<div class="rdiv"></div>' +
      '<div class="rrow rtotal"><span>Total paid</span><span>' + rupee(b.toPay) + '</span></div>';

    paneP.hidden = true; paneC.hidden = false;
  }

  printBtn.addEventListener("click", function () { window.print(); });
  continueBtn.addEventListener("click", function () { window.location.href = "index.html"; });
})();