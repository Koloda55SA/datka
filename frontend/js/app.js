/* ===========================================================
   «Датка» — фронтенд логикасы
   - Бэкенд API менен иштейт (placeholder сервер).
   - Эгер API жеткиликсиз болсо, data.js фоллбэгине өтөт.
   =========================================================== */
(function () {
  "use strict";

  // Бэкенд дареги. Локалда сервер иштесе, ушуну колдонот.
  // Статикалык хостингде (бэкенд жок) автоматтык түрдө фоллбэк иштейт.
  const API_BASE = "http://localhost:4000/api";

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
        <div class="master-card__photo" style="background:${m.color || "var(--wine)"}">${(m.name || "?")[0]}</div>
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
      // Бэкенд жок болсо — демо режим: локалда ийгиликтүү катары көрсөтөбүз.
      const demoId = "DEMO-" + Math.floor(1000 + Math.random() * 9000);
      saveLocalBooking(data, demoId);
      status.textContent = `Рахмат, ${data.name}! Жазылууңуз кабыл алынды (№${demoId}). (Демо режим: сервер ишке кошулганда маалымат базага сакталат.)`;
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

  /* --------- Минималдуу күн чеги (бүгүндөн) --------- */
  const dateInput = $("#bf-date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
  }

  /* --------- Баштапкы жүктөө --------- */
  (async function init() {
    const fb = window.DATKA_FALLBACK || { services: [], masters: [], reviews: [] };
    const [services, masters, reviews] = await Promise.all([
      apiGet("/services", fb.services),
      apiGet("/masters", fb.masters),
      apiGet("/reviews", fb.reviews),
    ]);
    renderServices(services);
    renderMasters(masters);
    renderReviews(reviews);
    observeReveal();
  })();
})();
