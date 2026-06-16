# «Датка» — Сулуулук салонунун веб-тиркемеси

> Сулуулук салону үчүн заманбап, адаптивдүү веб-тиркеме: маалымат сайты +
> онлайн жазылуу системасы. **Фронтенд** жана **бэкенд** толук иштелип чыгып,
> булутта (Cloudflare) жайгаштырылган.

🌐 **Жандуу версия (live):** https://datka.pages.dev

![frontend](https://img.shields.io/badge/frontend-live-brightgreen) ![backend](https://img.shields.io/badge/backend-live%20on%20edge-brightgreen) ![db](https://img.shields.io/badge/database-Cloudflare%20KV-orange) ![license](https://img.shields.io/badge/license-MIT-blue)

---

## 📌 Долбоордун максаты

«Датка» сулуулук салону үчүн заманбап веб-тиркеме түзүү. Сайт аркылуу кардарлар:

- салондун **кызматтары** жана **баалары** менен таанышат;
- **шеберлер** жана алардын тажрыйбасын көрөт;
- **онлайн жазылуу** калтырат (кезек күтпөстөн);
- салондун **байланыш** маалыматын жана картадан ордун табат.

---

## 🏗 Архитектура

Тиркеме заманбап **клиент — сервер** архитектурасына негизделген:

```
 [Браузер / Кардар]
        │  HTTPS
        ▼
 ┌─────────────────────────────────────┐
 │  Cloudflare (edge)                   │
 │  ├─ Фронтенд (HTML/CSS/JS)           │  ← статикалык беттер
 │  └─ Бэкенд: Pages Functions (API)    │  ← serverless серверлик логика
 │        └─ Cloudflare KV (база)       │  ← жазылуулар сакталат
 └─────────────────────────────────────┘
```

- **Фронтенд** — HTML5, CSS3, таза JavaScript (ES6+), адаптивдүү дизайн.
- **Бэкенд** — Cloudflare Pages Functions (serverless), REST API. Жазылуулар
  **Cloudflare KV** маалымат базасында туруктуу сакталат.
- **Локалдык иштеп чыгуу сервери** — Node.js + Express (`backend/`), ошол эле
  API'ди Интернетсиз сыноо үчүн.

---

## 🗂 Долбоордун түзүмү

```
datka/
├── frontend/              # Клиенттик бөлүк
│   ├── index.html         # Башкы бет
│   ├── admin.html         # Башкаруу панели (админка)
│   ├── admin.js           # Админканын логикасы
│   ├── css/styles.css     # Дизайн
│   ├── assets/photos/     # Чыныгы сүрөттөр (шеберлер, галерея, hero)
│   └── js/{app.js,data.js}
│
├── functions/api/         # Бэкенд: Cloudflare Pages Functions (serverless API)
│   ├── services.js  masters.js  reviews.js  gallery.js  settings.js
│   ├── bookings.js        # POST/GET — KV базасы менен иштейт
│   ├── _store.js          # KV жардамчы модулу + демейки маалыматтар + авторизация
│   ├── admin/login.js     # Админ кирүү (сырсөз → токен)
│   ├── admin/data/[name].js   # Коллекцияларды окуу/жазуу
│   ├── admin/bookings.js      # Жазылууларды тизмелөө
│   └── admin/bookings/[id].js # Статус өзгөртүү / өчүрүү
│
├── backend/               # Локалдык иштеп чыгуу сервери (Node.js/Express)
│   ├── server.js  package.json  data/
│
├── docs/                  # Дипломдук документация (кыргызча)
├── wrangler.jsonc         # Cloudflare конфигурациясы (KV байланышы)
└── README.md
```

---

## 🔌 REST API

| Метод | Маршрут | Сүрөттөмө |
|-------|---------|-----------|
| Метод | Маршрут | Сүрөттөмө |
|-------|---------|-----------|
| GET  | `/api/health`   | Сервердин абалы |
| GET  | `/api/services` | Кызматтар тизмеси |
| GET  | `/api/masters`  | Шеберлер тизмеси |
| GET  | `/api/gallery`  | Галерея сүрөттөрү |
| GET  | `/api/reviews`  | Пикирлер тизмеси |
| GET  | `/api/settings` | Сайт жөндөөлөрү |
| POST | `/api/bookings` | Жаңы жазылууну сактоо (KV) |

**Администратор API** (`X-Admin-Token` керек):

| Метод | Маршрут | Сүрөттөмө |
|-------|---------|-----------|
| POST | `/api/admin/login` | Сырсөз менен кирүү → токен |
| GET / PUT | `/api/admin/data/:name` | Коллекцияны окуу / сактоо |
| GET  | `/api/admin/bookings` | Бардык жазылуулар |
| PUT / DELETE | `/api/admin/bookings/:id` | Статус өзгөртүү / өчүрүү |

Сынап көрүңүз: <https://datka.pages.dev/api/health>

---

## 🔐 Башкаруу панели (админка)

Сайтты толук **контентти башкаруу** мүмкүнчүлүгү менен жабдылган:

- Дарек: **`/admin`** (мис. <https://datka.pages.dev/admin>)
- Демейки сырсөз: `datka2026` (KV'деги `admin:password` менен өзгөртүүгө болот)

Админ аркылуу администратор:

- **Жазылууларды** көрөт, статусун өзгөртөт (жаңы → ырасталган → аткарылган / жокко чыгарылган), өчүрөт;
- **Кызматтар, шеберлер, галерея, пикирлерди** кошот / түзөтөт / өчүрөт;
- **Сүрөттөрдү жүктөйт** (шеберлердин аватары, галерея) — base64 түрүндө KV'ге сакталат;
- **Сайт жөндөөлөрүн** (hero тексттери, статистика, контакттар, социалдык тармактар) өзгөртөт.

> Бардык өзгөртүүлөр Cloudflare KV'ге сакталып, сайтта дароо көрүнөт.

---

## 🚀 Иштетүү

### Жандуу версия
Эч нерсе орнотпостон ачыңыз: **https://datka.pages.dev**

### Локалда иштетүү
```bash
# 1) Cloudflare режими (фронтенд + serverless API чогуу):
npx wrangler pages dev frontend

# 2) Же Node.js/Express иштеп чыгуу сервери:
cd backend && npm install && npm start   # http://localhost:4000
```

### Жайгаштыруу (deploy)
```bash
npx wrangler pages deploy
```

---

## 🛠 Колдонулган технологиялар

- **Frontend:** HTML5, CSS3 (Flexbox/Grid, анимациялар), Vanilla JavaScript (ES6+)
- **Backend:** Cloudflare Pages Functions (serverless), Node.js/Express (локалдык)
- **Маалымат базасы:** Cloudflare KV
- **Жайгаштыруу:** Cloudflare Pages (CI/CD)
- **Версия башкаруу:** Git, GitHub

---

## 📄 Лицензия

MIT.
