/* Tashriflar hisoblagichi — Axborot madaniyati platformasi
   Bepul Abacus xizmatidan foydalanadi (https://abacus.jasoncameron.dev), kalit yoki ro‘yxatdan o‘tish shart emas.
   Shaxsiy ma’lumot yuborilmaydi: faqat raqamlar oshiriladi.
   Sahifadagi elementlar: data-visits="unique" | "total" | "today" */
(function () {
  var API = 'https://abacus.jasoncameron.dev';
  var NS = 'axborot-madaniyati-mirobid30';           // nomlar maydoni (o‘zgartirmang, aks holda hisob 0 dan boshlanadi)
  var now = new Date();
  var day = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }

  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function put(kind, val) {
    document.querySelectorAll('[data-visits="' + kind + '"]').forEach(function (el) { el.textContent = fmt(val); });
  }
  function call(action, key) {
    return fetch(API + '/' + action + '/' + NS + '/' + key, { cache: 'no-store' })
      .then(function (r) {
        if (r.status === 404) return { value: 0 };   // hisoblagich hali yaratilmagan
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (d) { return Number(d.value) || 0; });
  }
  function count(kind, key, isNew, markNew) {
    var p = call(isNew ? 'hit' : 'get', key);
    p.then(function (v) {
      if (isNew && markNew) markNew();
      put(kind, v);
    }).catch(function () {
      // xizmat vaqtincha javob bermasa — bir marta qayta urinamiz
      setTimeout(function () {
        call(isNew ? 'hit' : 'get', key).then(function (v) { if (isNew && markNew) markNew(); put(kind, v); })
          .catch(function () { put(kind, '—'); });
      }, 2500);
    });
  }

  // 1) Foydalanuvchilar: har bir brauzer faqat bir marta sanaladi
  var firstEver = !ls('am_seen');
  count('unique', 'unique', firstEver, function () { ls('am_seen', '1'); });

  // 2) Jami tashriflar: har bir yangi seans (sahifani yangilash hisoblanmaydi)
  var newSession = !ss('am_session');
  count('total', 'total', newSession, function () { ss('am_session', '1'); });

  // 3) Bugun: har bir brauzer kuniga bir marta
  var newToday = ls('am_day') !== day;
  count('today', 'day-' + day, newToday, function () { ls('am_day', day); });
})();
