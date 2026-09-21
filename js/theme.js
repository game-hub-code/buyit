// Loaded in <head> to set theme before paint.
(function () {
  var t = null;
  try { t = localStorage.getItem("buyit-theme"); } catch (e) {}
  if (!t) t = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", t);
  window.setBuyitTheme = function (v) {
    document.documentElement.setAttribute("data-theme", v);
    try { localStorage.setItem("buyit-theme", v); } catch (e) {}
  };
})();
