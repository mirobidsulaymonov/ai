/* =====================================================================
   Platformaga tashriflarni hisoblash
   - Har bir sahifaga qo‘shish uchun </body> oldidan shu qatorni qo‘ying:
       <script src="counter.js" defer></script>
   - Shaxsiy ma’lumot yuborilmaydi: faqat "yangi foydalanuvchi / yo‘q" belgisi.
   - Bir brauzer seansida bir marta hisoblanadi (sahifani yangilash sanalmaydi).
   - Sahifada data-visits="unique|total|today" belgili elementlar bo‘lsa, sonlar shu yerga yoziladi.
   ===================================================================== */
(function () {
  var API_URL = "https://script.google.com/macros/s/AKfycby8iPtcZuk_gTUDLFiz6BFT-49huUt6NoUieuGptW837jUIl0rnx4jKq4txwCUoRH7VFQ/exec";
  var VID_KEY = "mdim_visitor_id";
  var SESSION_KEY = "mdim_visit_counted";

  function get(store, key) { try { return window[store].getItem(key); } catch (e) { return null; } }
  function set(store, key, val) { try { window[store].setItem(key, val); } catch (e) {} }

  function fmt(n) {
    n = Number(n) || 0;
    return n.toLocaleString("uz-UZ").replace(/,/g, " ");
  }

  function show(d) {
    if (!d || d.ok === false) return;
    var map = { unique: d.unique, total: d.total, today: d.today };
    var els = document.querySelectorAll("[data-visits]");
    for (var i = 0; i < els.length; i++) {
      var k = els[i].getAttribute("data-visits");
      if (map[k] !== undefined) els[i].textContent = fmt(map[k]);
    }
  }

  function run() {
    // Avtomatlashtirilgan brauzerlar (botlar) hisoblanmaydi
    if (navigator.webdriver) return;

    var isNew = !get("localStorage", VID_KEY);
    var counted = get("sessionStorage", SESSION_KEY) === "1";
    var url = counted
      ? API_URL + "?action=visitStats"
      : API_URL + "?action=hit&new=" + (isNew ? 1 : 0);

    fetch(url, { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!counted && d && d.ok !== false) {
          set("sessionStorage", SESSION_KEY, "1");
          // Belgi faqat hisob muvaffaqiyatli bo‘lgandan keyin qo‘yiladi
          if (isNew) set("localStorage", VID_KEY, Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
        }
        show(d);
      })
      .catch(function () { /* hisoblagich ishlamasa, sahifa odatdagidek ishlayveradi */ });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
