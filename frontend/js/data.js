/* ===========================================================
   FALLBACK маалыматтар
   Бэкенд (placeholder сервер) иштебей турса, сайт ушул
   локалдык маалыматтар менен иштей берет. Бул GitHub Pages
   сыяктуу статикалык хостингде да баары көрүнүшү үчүн керек.
   =========================================================== */
window.DATKA_FALLBACK = {
  services: [
    { id: 1, emoji: "✂️", title: "Чач алуу (аялдар)", desc: "Узундукка жараша чач алуу жана жасалга.", price: "от 500 сом", duration: "40–60 мүн" },
    { id: 2, emoji: "💈", title: "Чач алуу (эркектер)", desc: "Заманбап эркек причёскалары, борода жасалгасы.", price: "от 300 сом", duration: "30 мүн" },
    { id: 3, emoji: "🎨", title: "Чач боёо", desc: "Бир түс, балаяж, омбре, тонировка.", price: "от 1500 сом", duration: "1.5–3 саат" },
    { id: 4, emoji: "💅", title: "Маникюр", desc: "Классикалык, аппараттык маникюр жана гель-лак.", price: "от 600 сом", duration: "60–90 мүн" },
    { id: 5, emoji: "🦶", title: "Педикюр", desc: "Бут күтүмү жана каптоо.", price: "от 800 сом", duration: "60–90 мүн" },
    { id: 6, emoji: "💄", title: "Макияж", desc: "Күндүзгү, кечки жана той макияжы.", price: "от 1200 сом", duration: "40–60 мүн" },
    { id: 7, emoji: "✨", title: "Косметология", desc: "Бет тазалоо, маска, уход процедуралары.", price: "от 1000 сом", duration: "60 мүн" },
    { id: 8, emoji: "👁️", title: "Кашлар жана керпиктер", desc: "Кашты түзөө, боёо, керпик узартуу.", price: "от 700 сом", duration: "40–120 мүн" },
    { id: 9, emoji: "💆", title: "SPA жана массаж", desc: "Эс алуу жана баш массажы.", price: "от 900 сом", duration: "30–60 мүн" }
  ],
  masters: [
    { id: 1, name: "Айпери", role: "Топ-стилист", exp: "8 жыл тажрыйба", photo: "assets/photos/m1.jpg", color: "linear-gradient(135deg,#6d2a4d,#2a1726)" },
    { id: 2, name: "Нургуль", role: "Колорист", exp: "6 жыл тажрыйба", photo: "assets/photos/m2.jpg", color: "linear-gradient(135deg,#c9a35b,#6d2a4d)" },
    { id: 3, name: "Аземгүл", role: "Маникюр устасы", exp: "5 жыл тажрыйба", photo: "assets/photos/m3.jpg", color: "linear-gradient(135deg,#b07a52,#6d2a4d)" },
    { id: 4, name: "Бегимай", role: "Визажист", exp: "7 жыл тажрыйба", photo: "assets/photos/m4.jpg", color: "linear-gradient(135deg,#3d2238,#b07a52)" }
  ],
  gallery: [
    { id: 1, caption: "Чач жасалгасы", src: "assets/photos/g-hair.jpg", color: "linear-gradient(135deg,#6d2a4d,#2a1726)" },
    { id: 2, caption: "Маникюр", src: "assets/photos/g-manicure.jpg", color: "linear-gradient(135deg,#b07a52,#6d2a4d)" },
    { id: 3, caption: "Макияж", src: "assets/photos/g-makeup.jpg", color: "linear-gradient(135deg,#c9a35b,#6d2a4d)" },
    { id: 4, caption: "Косметология", src: "assets/photos/g-cosmetology.jpg", color: "linear-gradient(135deg,#3d2238,#b07a52)" },
    { id: 5, caption: "Кашлар жана керпиктер", src: "assets/photos/g-brows.jpg", color: "linear-gradient(135deg,#6d2a4d,#c9a35b)" },
    { id: 6, caption: "Салон ичи", src: "assets/photos/g-interior.jpg", color: "linear-gradient(135deg,#2a1726,#b07a52)" }
  ],
  reviews: [
    { id: 1, text: "Эң мыкты салон! Шеберлер абдан кесипкөй, атмосфера жагымдуу. Дайыма ушул жерге келем.", author: "Гүлзат А.", meta: "Чач боёо", stars: 5 },
    { id: 2, text: "Маникюрга ыраазымын, тазалык эң жогорку деңгээлде. Онлайн жазылуу абдан ыңгайлуу болду.", author: "Айназик К.", meta: "Маникюр", stars: 5 },
    { id: 3, text: "Тойго макияж жасатканым, баары суктанышты. Чоң рахмат «Датка» командасына!", author: "Жылдыз М.", meta: "Той макияжы", stars: 5 }
  ]
};
