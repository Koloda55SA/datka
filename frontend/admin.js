/* ===========================================================
   «Датка» — башкаруу панелинин логикасы (admin.js)
   - Cloudflare Pages Functions API менен иштейт.
   - Логин -> токен (localStorage) -> коллекцияларды/жазылууларды башкаруу.
   - Сүрөттөрдү base64 катары жүктөйт (өзүнчө файл сактагыч талап кылбайт).
   =========================================================== */
(function () {
  "use strict";

  const API_BASE = location.protocol.startsWith("http") ? "/api" : "http://localhost:4000/api";
  const TOKEN_KEY = "datka_admin_token";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  let token = localStorage.getItem(TOKEN_KEY) || "";

  /* ---------- API жардамчылары ---------- */
  async function api(path, opts = {}) {
    const headers = { ...(opts.headers || {}) };
    if (opts.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
    if (token) headers["X-Admin-Token"] = token;
    const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
    if (res.status === 401) { logout(); throw new Error("Авторизация мөөнөтү бүттү. Кайра кириңиз."); }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || "Сервер катасы.");
    return json;
  }
  const getCol = (name) => api(`/admin/data/${name}`).then((r) => r.data);
  const putCol = (name, data) => api(`/admin/data/${name}`, { method: "PUT", body: JSON.stringify({ data }) });

  /* ---------- Toast ---------- */
  let toastT;
  function toast(msg, isErr = false) {
    const t = $("#toast");
    t.textContent = msg;
    t.className = "toast show" + (isErr ? " err" : "");
    clearTimeout(toastT);
    toastT = setTimeout(() => (t.className = "toast" + (isErr ? " err" : "")), 2800);
  }

  /* ---------- Логин / Логаут ---------- */
  const loginView = $("#loginView");
  const appView = $("#appView");

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = $("#loginStatus");
    const btn = $("#loginBtn");
    const password = $("#pwd").value;
    btn.disabled = true; status.textContent = "Текшерилүүдө…"; status.className = "status";
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Кирүү катасы.");
      token = json.token;
      localStorage.setItem(TOKEN_KEY, token);
      enterApp();
    } catch (err) {
      status.textContent = err.message; status.className = "status err";
    } finally {
      btn.disabled = false;
    }
  });

  $("#logoutBtn").addEventListener("click", logout);
  function logout() {
    token = ""; localStorage.removeItem(TOKEN_KEY);
    appView.classList.add("hidden");
    loginView.classList.remove("hidden");
    $("#pwd").value = "";
  }

  function enterApp() {
    loginView.classList.add("hidden");
    appView.classList.remove("hidden");
    const valid = ["bookings", "services", "masters", "gallery", "reviews", "settings"];
    const start = valid.includes(location.hash.slice(1)) ? location.hash.slice(1) : "bookings";
    openTab(start);
  }

  /* ---------- Tabs ---------- */
  const loaded = {}; // коллекция бир жолу жүктөлсүн
  function openTab(name) {
    const tab = $(`#tabs .tab[data-tab="${name}"]`);
    if (!tab) return;
    $$("#tabs .tab").forEach((t) => t.classList.remove("active"));
    $$(".panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    $(`#panel-${name}`).classList.add("active");
    if (location.hash !== `#${name}`) history.replaceState(null, "", `#${name}`);
    if (name === "bookings") { loadBookings(); return; }
    if (name === "settings") { if (!loaded.settings) renderSettings(); }
    else if (!loaded[name]) renderCollection(name);
  }
  $$("#tabs .tab").forEach((tab) => tab.addEventListener("click", () => openTab(tab.dataset.tab)));

  /* ===========================================================
     ЖАЗЫЛУУЛАР (bookings)
     =========================================================== */
  const STATUS_LABEL = { new: "Жаңы", confirmed: "Ырасталган", done: "Аткарылган", cancelled: "Жокко чыгарылган" };

  $("#refreshBookings").addEventListener("click", loadBookings);

  async function loadBookings() {
    const box = $("#bookingsList");
    box.innerHTML = '<div class="loader">Жүктөлүүдө…</div>';
    try {
      const { data = [] } = await api("/admin/bookings");
      $("#bkBadge").textContent = data.filter((b) => b.status === "new").length;
      if (!data.length) { box.innerHTML = '<div class="empty">Азырынча жазылуулар жок.</div>'; return; }
      box.innerHTML = data.map(bookingCard).join("");
      $$("[data-bk-status]", box).forEach((sel) =>
        sel.addEventListener("change", () => changeBooking(sel.dataset.bkStatus, { status: sel.value })));
      $$("[data-bk-del]", box).forEach((btn) =>
        btn.addEventListener("click", () => deleteBooking(btn.dataset.bkDel)));
    } catch (err) {
      box.innerHTML = `<div class="empty">${esc(err.message)}</div>`;
    }
  }

  function bookingCard(b) {
    const st = b.status || "new";
    const created = b.createdAt ? new Date(b.createdAt).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" }) : "";
    const opts = Object.keys(STATUS_LABEL)
      .map((k) => `<option value="${k}"${k === st ? " selected" : ""}>${STATUS_LABEL[k]}</option>`).join("");
    return `
      <article class="bk">
        <div class="bk__main">
          <h3>${esc(b.name)} <span class="chip ${st}">${STATUS_LABEL[st] || st}</span></h3>
          <p class="bk__meta">
            <b>${esc(b.service)}</b>${b.master ? " · " + esc(b.master) : ""}<br>
            📅 ${esc(b.date)} ⏰ ${esc(b.time)} &nbsp;·&nbsp;
            📞 <a href="tel:${esc((b.phone || "").replace(/[^+\d]/g, ""))}">${esc(b.phone)}</a>
          </p>
          ${b.note ? `<p class="bk__note">«${esc(b.note)}»</p>` : ""}
          <p class="bk__meta" style="margin-top:.3rem;font-size:.78rem">№${esc(b.id)} · ${esc(created)}</p>
        </div>
        <div class="bk__side">
          <select data-bk-status="${esc(b.id)}">${opts}</select>
          <button class="btn btn--danger btn--sm" data-bk-del="${esc(b.id)}">Өчүрүү</button>
        </div>
      </article>`;
  }

  async function changeBooking(id, patch) {
    try { await api(`/admin/bookings/${id}`, { method: "PUT", body: JSON.stringify(patch) }); toast("Статус жаңыланды."); loadBookings(); }
    catch (err) { toast(err.message, true); }
  }
  async function deleteBooking(id) {
    if (!confirm("Бул жазылууну өчүрөсүзбү?")) return;
    try { await api(`/admin/bookings/${id}`, { method: "DELETE" }); toast("Жазылуу өчүрүлдү."); loadBookings(); }
    catch (err) { toast(err.message, true); }
  }

  /* ===========================================================
     КОЛЛЕКЦИЯЛАР (services / masters / gallery / reviews)
     =========================================================== */

  // Ар бир коллекциянын талаа схемасы
  const SCHEMAS = {
    services: {
      title: "Кызматтар", single: "кызмат",
      fields: [
        { key: "emoji", label: "Эмодзи", w: ".25" },
        { key: "title", label: "Аталышы", w: "1" },
        { key: "desc", label: "Сүрөттөмө", type: "textarea", full: true },
        { key: "price", label: "Баасы" },
        { key: "duration", label: "Узактыгы" },
      ],
      blank: () => ({ emoji: "✦", title: "", desc: "", price: "", duration: "" }),
      titleOf: (it) => it.title || "Жаңы кызмат",
    },
    masters: {
      title: "Шеберлер", single: "шебер", photo: "round",
      fields: [
        { key: "name", label: "Аты" },
        { key: "role", label: "Кызматы" },
        { key: "exp", label: "Тажрыйбасы" },
      ],
      blank: () => ({ name: "", role: "", exp: "", photo: "", color: "linear-gradient(135deg,#6d2a4d,#2a1726)" }),
      titleOf: (it) => it.name || "Жаңы шебер",
    },
    gallery: {
      title: "Галерея", single: "сүрөт", photo: "wide", photoKey: "src",
      fields: [
        { key: "caption", label: "Аталышы" },
      ],
      blank: () => ({ caption: "", src: "", color: "linear-gradient(135deg,#6d2a4d,#2a1726)" }),
      titleOf: (it) => it.caption || "Жаңы сүрөт",
    },
    reviews: {
      title: "Пикирлер", single: "пикир",
      fields: [
        { key: "author", label: "Автор" },
        { key: "meta", label: "Кызмат" },
        { key: "stars", label: "Жылдыз (1-5)", type: "number" },
        { key: "text", label: "Текст", type: "textarea", full: true },
      ],
      blank: () => ({ author: "", meta: "", stars: 5, text: "" }),
      titleOf: (it) => it.author || "Жаңы пикир",
    },
  };

  const state = {}; // state[name] = массив

  async function renderCollection(name) {
    const panel = $(`#panel-${name}`);
    const sc = SCHEMAS[name];
    panel.innerHTML = `<div class="loader">Жүктөлүүдө…</div>`;
    try {
      state[name] = await getCol(name);
      loaded[name] = true;
      drawCollection(name);
    } catch (err) {
      panel.innerHTML = `<div class="empty">${esc(err.message)}</div>`;
    }
  }

  function drawCollection(name) {
    const panel = $(`#panel-${name}`);
    const sc = SCHEMAS[name];
    const items = state[name] || [];
    panel.innerHTML = `
      <div class="panel__head">
        <div><h2>${sc.title}</h2><p class="sub">Кошуу, түзөтүү жана өчүрүү. Сактоону унутпаңыз.</p></div>
        <button class="btn btn--ghost btn--sm" data-add>+ ${sc.single} кошуу</button>
      </div>
      <div class="cards" data-cards></div>
      <div class="savebar">
        <button class="btn btn--gold" data-save>Сактоо</button>
        <span class="sub" data-count>${items.length} жазуу</span>
      </div>`;

    const cards = $("[data-cards]", panel);
    cards.innerHTML = items.map((it, i) => collectionCard(name, it, i)).join("");

    bindCardInputs(name);

    $("[data-add]", panel).addEventListener("click", () => {
      state[name].push(sc.blank());
      drawCollection(name);
    });
    $("[data-save]", panel).addEventListener("click", () => saveCollection(name));
  }

  function collectionCard(name, it, i) {
    const sc = SCHEMAS[name];
    const photoKey = sc.photoKey || "photo";
    let photoHTML = "";
    if (sc.photo) {
      const src = it[photoKey];
      const cls = sc.photo === "round" ? "thumb thumb--round" : "thumb";
      const bg = src ? `background-image:url('${esc(src)}')` : "";
      photoHTML = `
        <div class="${cls}" style="${bg}" data-thumb="${i}">${src ? "" : "Сүрөт жок"}</div>
        <div class="upload">
          <label class="btn btn--ghost btn--sm">Сүрөт жүктөө
            <input type="file" accept="image/*" data-file="${i}">
          </label>
          ${src ? `<button class="btn btn--danger btn--sm" data-photodel="${i}">Сүрөттү алып салуу</button>` : ""}
          <span class="upload__label">JPG/PNG, ≤1.5MB</span>
        </div>`;
    }
    const fieldsHTML = sc.fields.map((f) => fieldHTML(i, f, it[f.key])).join("");
    return `
      <div class="card" data-card="${i}">
        <button class="btn btn--danger btn--sm card__del" data-del="${i}">✕</button>
        ${photoHTML}
        ${fieldsHTML}
      </div>`;
  }

  function fieldHTML(i, f, val) {
    const id = `f-${i}-${f.key}`;
    let input;
    if (f.type === "textarea") input = `<textarea id="${id}" data-field="${i}:${f.key}">${esc(val)}</textarea>`;
    else input = `<input id="${id}" type="${f.type || "text"}" data-field="${i}:${f.key}" value="${esc(val)}">`;
    return `<div class="field">${f.label ? `<label for="${id}">${f.label}</label>` : ""}${input}</div>`;
  }

  function bindCardInputs(name) {
    const panel = $(`#panel-${name}`);
    const sc = SCHEMAS[name];
    const photoKey = sc.photoKey || "photo";

    $$("[data-field]", panel).forEach((el) => {
      el.addEventListener("input", () => {
        const [i, key] = el.dataset.field.split(":");
        let v = el.value;
        if (el.type === "number") v = v === "" ? "" : Number(v);
        state[name][+i][key] = v;
      });
    });
    $$("[data-del]", panel).forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!confirm("Бул жазууну тизмеден алып салабызбы?")) return;
        state[name].splice(+btn.dataset.del, 1);
        drawCollection(name);
      });
    });
    $$("[data-photodel]", panel).forEach((btn) => {
      btn.addEventListener("click", () => {
        state[name][+btn.dataset.photodel][photoKey] = "";
        drawCollection(name);
      });
    });
    $$("[data-file]", panel).forEach((inp) => {
      inp.addEventListener("change", async () => {
        const file = inp.files[0];
        if (!file) return;
        if (file.size > 1.5 * 1024 * 1024) { toast("Сүрөт өтө чоң (1.5MB чейин).", true); return; }
        try {
          const dataUrl = await fileToDataURL(file);
          state[name][+inp.dataset.file][photoKey] = dataUrl;
          drawCollection(name);
          toast("Сүрөт кошулду. Сактоону унутпаңыз.");
        } catch { toast("Сүрөттү окуу мүмкүн болбоду.", true); }
      });
    });
  }

  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  async function saveCollection(name) {
    const panel = $(`#panel-${name}`);
    const btn = $("[data-save]", panel);
    btn.disabled = true;
    const prev = btn.textContent; btn.textContent = "Сакталууда…";
    try {
      // id'лерди тартипке келтирүү
      state[name].forEach((it, idx) => { if (it.id == null) it.id = idx + 1; });
      await putCol(name, state[name]);
      toast(`«${SCHEMAS[name].title}» сакталды.`);
    } catch (err) {
      toast(err.message, true);
    } finally {
      btn.disabled = false; btn.textContent = prev;
    }
  }

  /* ===========================================================
     ЖӨНДӨӨЛӨР (settings) — жалгыз объект
     =========================================================== */
  const SETTINGS_FIELDS = [
    { key: "salonName", label: "Салондун аты" },
    { key: "tagline", label: "Урааны (tagline)" },
    { key: "heroEyebrow", label: "Hero — жогорку текст" },
    { key: "heroTitle", label: "Hero — башкы аталыш", type: "textarea" },
    { key: "heroSubtitle", label: "Hero — кошумча текст", type: "textarea" },
    { key: "stat1Value", label: "Статистика 1 — маани" },
    { key: "stat1Label", label: "Статистика 1 — белги" },
    { key: "stat2Value", label: "Статистика 2 — маани" },
    { key: "stat2Label", label: "Статистика 2 — белги" },
    { key: "stat3Value", label: "Статистика 3 — маани" },
    { key: "stat3Label", label: "Статистика 3 — белги" },
    { key: "phone1", label: "Телефон 1" },
    { key: "phone2", label: "Телефон 2" },
    { key: "address", label: "Дарек", type: "textarea" },
    { key: "hours", label: "Иш убактысы (; менен ажыратыңыз)", type: "textarea" },
    { key: "instagram", label: "Instagram шилтемеси" },
    { key: "whatsapp", label: "WhatsApp шилтемеси" },
    { key: "telegram", label: "Telegram шилтемеси" },
  ];

  async function renderSettings() {
    const panel = $("#panel-settings");
    panel.innerHTML = `<div class="loader">Жүктөлүүдө…</div>`;
    try {
      state.settings = (await getCol("settings")) || {};
      loaded.settings = true;
      const s = state.settings;
      const fields = SETTINGS_FIELDS.map((f) => {
        const id = `s-${f.key}`;
        const v = esc(s[f.key]);
        const input = f.type === "textarea"
          ? `<textarea id="${id}" data-sfield="${f.key}">${v}</textarea>`
          : `<input id="${id}" data-sfield="${f.key}" value="${v}">`;
        return `<div class="field">${f.label ? `<label for="${id}">${f.label}</label>` : ""}${input}</div>`;
      }).join("");
      panel.innerHTML = `
        <div class="panel__head">
          <div><h2>Сайт жөндөөлөрү</h2><p class="sub">Hero, контакттар жана социалдык тармактар.</p></div>
        </div>
        <div class="cards"><div class="card">${fields}</div></div>
        <div class="savebar"><button class="btn btn--gold" id="saveSettings">Сактоо</button></div>`;

      $$("[data-sfield]", panel).forEach((el) =>
        el.addEventListener("input", () => { state.settings[el.dataset.sfield] = el.value; }));
      $("#saveSettings").addEventListener("click", async () => {
        const btn = $("#saveSettings"); btn.disabled = true; btn.textContent = "Сакталууда…";
        try { await putCol("settings", state.settings); toast("Жөндөөлөр сакталды."); }
        catch (err) { toast(err.message, true); }
        finally { btn.disabled = false; btn.textContent = "Сактоо"; }
      });
    } catch (err) {
      panel.innerHTML = `<div class="empty">${esc(err.message)}</div>`;
    }
  }

  /* ---------- Баштапкы абал ---------- */
  if (token) enterApp(); else loginView.classList.remove("hidden");
})();
