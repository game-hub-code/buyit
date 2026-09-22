// Renders offer cards and the 20 category tiles on index.html.
(function () {
  var offers = document.getElementById("offers");
  offers.innerHTML = window.OFFERS.map(function (o) {
    return '<article class="offer ' + o.cls + '"><div class="offer-art">' + o.art + '</div><h2>' + o.title.replace("\n", "<br>") + '</h2><p>' + o.sub + '</p><button type="button">' + o.cta + '</button></article>';
  }).join("");

  var grid = document.getElementById("categories");
  grid.innerHTML = window.CATEGORIES.map(function (c) {
    return '<a class="cat" href="' + c.href + '"><span class="cat-img is-loading" data-slug="' + c.slug + '"><span class="cat-ph">' + c.name.charAt(0) + '</span></span><span class="cat-name">' + c.name + '</span></a>';
  }).join("");

  // Try each extension in turn; shimmer shows until one loads or all fail.
  var exts = ["avif", "png", "jpg", "jpeg", "webp", "svg"];
  document.querySelectorAll(".cat-img").forEach(function (box) {
    var slug = box.dataset.slug, i = 0;
    (function next() {
      if (i >= exts.length) { box.classList.remove("is-loading"); return; }
      var img = new Image();
      img.alt = "";
      img.decoding = "async";
      img.onload = function () { box.textContent = ""; box.appendChild(img); box.classList.remove("is-loading"); };
      img.onerror = next;
      img.src = "images/" + slug + "." + exts[i++];
    })();
  });
})();