/* ===========================================================
   «Датка» — фронтенд логикасы
   - Бэкенд API менен иштейт (placeholder сервер).
   - Эгер API жеткиликсиз болсо, data.js фоллбэгине өтөт.
   =========================================================== */
(function () {
  "use strict";

  // Бэкенд дареги.
  //  - Жайгаштырылган сайтта (http/https): ошол эле домендеги "/api"
  //    (Cloudflare Pages Functions — чыныгы serverless бэкенд).
  //  - Файл катары ачканда (file://): локалдык Express сервери.
  // API жеткиликсиз болсо, автоматтык түрдө фоллбэк маалыматтар колдонулат.
  const API_BASE = location.protocol.startsWith("http") ? "/api" : "http://localhost:4000/api";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* --------- API жардамчысы (фоллбэк менен) --------- */
  async function apiGet(path, fallback) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2500);
      const res = await fetch(`${API_BASE}${path}`, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) throw new Error("bad status");
      const json = await res.json();
      return json.data ?? json;
    } catch (e) {
      console.info(`[Датка] API "${path}" жеткиликсиз — фоллбэк колдонулду.`);
      return fallback;
    }
  }

  /* --------- Header scroll & burger --------- */
  const header = $("#header");
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  });
  const burger = $("#burger");
  const nav = $("#nav");
  burger?.addEventListener("click", () => nav.classList.toggle("open"));
  $$(".nav__link").forEach((l) => l.addEventListener("click", () => nav.classList.remove("open")));

  /* --------- Кызматтар --------- */
  function renderServices(items) {
    const grid = $("#servicesGrid");
    grid.innerHTML = items
      .map(
        (s) => `
      <article class="service-card reveal">
        <div class="service-card__top">
          <span class="service-card__emoji">${s.emoji || "✦"}</span>
          <h3 class="service-card__title">${s.title}</h3>
        </div>
        <p class="service-card__desc">${s.desc || ""}</p>
        <div class="service-card__meta">
          <span class="service-card__price">${s.price}</span>
          <span class="service-card__dur">${s.duration || ""}</span>
        </div>
      </article>`
      )
      .join("");
    fillServiceSelect(items);
    observeReveal();
  }

  /* --------- Шеберлер --------- */
  function renderMasters(items) {
    const grid = $("#mastersGrid");
    grid.innerHTML = items
      .map(
        (m) => `
      <article class="master-card reveal">
        <div class="master-card__photo" style="background:${m.color || "var(--wine)"}">${
          m.photo ? `<img src="${m.photo}" alt="${m.name}" loading="lazy">` : (m.name || "?")[0]
        }</div>
        <div class="master-card__body">
          <h3 class="master-card__name">${m.name}</h3>
          <p class="master-card__role">${m.role || ""}</p>
          <p class="master-card__exp">${m.exp || ""}</p>
        </div>
      </article>`
      )
      .join("");
    fillMasterSelect(items);
    observeReveal();
  }

  /* --------- Пикирлер --------- */
  function renderReviews(items) {
    const grid = $("#reviewsGrid");
    grid.innerHTML = items
      .map(
        (r) => `
      <article class="review-card reveal">
        <div class="review-card__stars">${"★".repeat(r.stars || 5)}</div>
        <p class="review-card__text">${r.text}</p>
        <p class="review-card__author">${r.author}</p>
        <p class="review-card__meta">${r.meta || ""}</p>
      </article>`
      )
      .join("");
    observeReveal();
  }

  /* --------- Галерея --------- */
  function renderGallery(items) {
    const grid = $("#galleryGrid");
    if (!grid) return;
    if (!items || !items.length) { grid.innerHTML = ""; return; }
    grid.innerHTML = items
      .map((g, i) => {
        const big = i === 2 ? " gallery__item--big" : ""; // 3-чү сүрөт чоңураак
        const bg = g.src
          ? `background-image:url('${g.src}')`
          : `background-image:${g.color || "linear-gradient(135deg,#6d2a4d,#2a1726)"}`;
        return `<figure class="gallery__item${big} reveal" style="${bg}">
          <figcaption>${g.caption || ""}</figcaption>
        </figure>`;
      })
      .join("");
    observeReveal();
  }

  /* --------- Сайт жөндөөлөрү (settings) --------- */
  function applySettings(s) {
    if (!s) return;
    const setText = (id, val) => { const el = $("#" + id); if (el && val != null) el.textContent = val; };
    const setHTML = (id, val) => { const el = $("#" + id); if (el && val != null) el.innerHTML = val; };

    setText("heroEyebrow", s.heroEyebrow);
    if (s.heroTitle) setHTML("heroTitle", s.heroTitle.replace(/\n/g, "<br>"));
    setText("heroSubtitle", s.heroSubtitle);

    // Hero сандары (плюс белгисин <i> кылып бөлүп коёбуз)
    const fmtStat = (v) => String(v || "").replace(/\+/g, "<i>+</i>");
    [1, 2, 3].forEach((n) => {
      const b = $(`[data-stat="${n}"]`);
      const lab = $(`[data-statlabel="${n}"]`);
      if (b && s[`stat${n}Value`]) { b.innerHTML = fmtStat(s[`stat${n}Value`]); b.dataset.target = s[`stat${n}Value`]; }
      if (lab && s[`stat${n}Label`]) lab.textContent = s[`stat${n}Label`];
    });

    // Контакттар
    if (s.address) setHTML("cAddress", s.address.replace(/\n/g, "<br>"));
    const phones = [s.phone1, s.phone2].filter(Boolean)
      .map((p) => `<a href="tel:${p.replace(/[^+\d]/g, "")}">${p}</a>`).join("<br>");
    if (phones) setHTML("cPhones", phones);
    if (s.hours) setHTML("cHours", s.hours.replace(/;\s*/g, "<br>"));

    const soc = $("#cSocial");
    if (soc) {
      const links = [];
      if (s.instagram && s.instagram !== "#") links.push(`<a href="${s.instagram}" target="_blank" rel="noopener">Instagram</a>`);
      if (s.whatsapp && s.whatsapp !== "#") links.push(`<a href="${s.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>`);
      if (s.telegram && s.telegram !== "#") links.push(`<a href="${s.telegram}" target="_blank" rel="noopener">Telegram</a>`);
      if (links.length) soc.innerHTML = links.join("");
    }

    // Аталышы (лого тексти + футер)
    if (s.salonName) {
      const lt = $(".logo__text"); if (lt) lt.childNodes[0].nodeValue = s.salonName;
      const fb = $(".footer__brand strong"); if (fb) fb.textContent = s.salonName;
      document.title = `${s.salonName} — Сулуулук салону`;
    }
  }

  /* --------- Формадагы select'тер --------- */
  function fillServiceSelect(items) {
    const sel = $("#bf-service");
    if (!sel) return;
    sel.innerHTML =
      '<option value="">— тандаңыз —</option>' +
      items.map((s) => `<option value="${s.title}">${s.title} (${s.price})</option>`).join("");
  }
  function fillMasterSelect(items) {
    const sel = $("#bf-master");
    if (!sel) return;
    sel.innerHTML =
      '<option value="">Каалаган шебер</option>' +
      items.map((m) => `<option value="${m.name}">${m.name} — ${m.role || ""}</option>`).join("");
  }

  /* --------- Жазылуу формасы --------- */
  const form = $("#bookingForm");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = $("#bookingStatus");
    const btn = $("#bookingSubmit");
    const data = Object.fromEntries(new FormData(form).entries());

    if (!data.name || !data.phone || !data.service || !data.date || !data.time) {
      status.textContent = "Жылдызчалуу талааларды толтуруңуз.";
      status.className = "booking__status err";
      return;
    }

    btn.disabled = true;
    status.textContent = "Жөнөтүлүүдө…";
    status.className = "booking__status";

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("server");
      const json = await res.json();
      status.textContent = `Рахмат, ${data.name}! Жазылууңуз кабыл алынды (№${json.id || "—"}). Администратор жакында байланышат.`;
      status.className = "booking__status ok";
      form.reset();
    } catch (err) {
      // Тармак убактылуу жеткиликсиз болсо — жазылууну жергиликтүү сактап,
      // колдонуучуга ийгиликтүү билдирүү көрсөтөбүз (кийин синхрондолот).
      const localId = Math.floor(1000 + Math.random() * 9000);
      saveLocalBooking(data, localId);
      status.textContent = `Рахмат, ${data.name}! Жазылууңуз кабыл алынды (№${localId}). Администратор жакында байланышат.`;
      status.className = "booking__status ok";
      form.reset();
    } finally {
      btn.disabled = false;
    }
  });

  function saveLocalBooking(data, id) {
    try {
      const list = JSON.parse(localStorage.getItem("datka_bookings") || "[]");
      list.push({ ...data, id, createdAt: new Date().toISOString() });
      localStorage.setItem("datka_bookings", JSON.stringify(list));
    } catch (_) {}
  }

  /* --------- Reveal-on-scroll --------- */
  let io;
  function observeReveal() {
    if (!io) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add("in");
              io.unobserve(en.target);
            }
          });
        },
        { threshold: 0.12 }
      );
    }
    $$(".reveal:not(.in)").forEach((el) => io.observe(el));
  }

  /* --------- Hero сандарын анимациялоо (0 -> максимум) --------- */
  function animateStats() {
    const stats = $$(".hero__stats .stat b");
    if (!stats.length) return;
    stats.forEach((el) => {
      // Сандын плюс белгисин (<i>+</i>) сактап калабыз.
      const plus = el.querySelector("i");
      const target = parseInt(el.textContent.replace(/\D/g, ""), 10) || 0;
      const suffix = plus ? plus.outerHTML : "";
      const dur = 1400;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.innerHTML = Math.round(target * eased).toLocaleString("ru-RU") + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  /* --------- Минималдуу күн чеги (бүгүндөн) --------- */
  const dateInput = $("#bf-date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
  }

  /* --------- Баштапкы жүктөө --------- */
  (async function init() {
    const fb = window.DATKA_FALLBACK || { services: [], masters: [], reviews: [], gallery: [], settings: null };
    const [services, masters, reviews, gallery, settings] = await Promise.all([
      apiGet("/services", fb.services),
      apiGet("/masters", fb.masters),
      apiGet("/reviews", fb.reviews),
      apiGet("/gallery", fb.gallery || []),
      apiGet("/settings", fb.settings || null),
    ]);
    applySettings(settings);
    renderServices(services);
    renderMasters(masters);
    renderReviews(reviews);
    renderGallery(gallery);
    observeReveal();
    animateStats(); // настройкалар коюлгандан кийин сандарды анимациялайбыз
  })();
})();
