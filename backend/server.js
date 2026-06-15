/* ===========================================================
   «Датка» сулуулук салону — PLACEHOLDER (демо) бэкенд
   -----------------------------------------------------------
   Бул сервер дипломдук иштин демонстрациясы үчүн жазылган.
   Учурда маалыматтар:
     - кызматтар / шеберлер / пикирлер  -> JSON файлдардан окулат
     - жазылуулар (bookings)            -> сервердин эс тутумунда (in-memory)

   ӨНДҮРҮШКӨ (production) чыгаруу үчүн:
     1) Бул жерге чыныгы маалымат базасын туташтыруу керек
        (мисалы: PostgreSQL / MongoDB / MySQL).
     2) "TODO(DB)" деп белгиленген жерлерди алмаштыруу.
     3) Аутентификация жана валидацияны кеңейтүү.

   Ишке киргизүү:
       npm install
       npm start
   Дарек: http://localhost:4000
   =========================================================== */

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ---- Статикалык маалыматтарды JSON файлдардан окуу ----
const dataDir = path.join(__dirname, "data");
function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf-8"));
  } catch (e) {
    console.error(`[Датка] ${file} окулбай калды:`, e.message);
    return [];
  }
}

// ---- Жазылуулар: убактылуу эс тутумда (placeholder) ----
// TODO(DB): бул массивдин ордуна чыныгы маалымат базасынын таблицасы болот.
const bookings = [];
let bookingSeq = 1000;

/* ------------------- API роуттары ------------------- */

// Ден соолук текшерүү
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "datka-backend", mode: "placeholder", time: new Date().toISOString() });
});

// Кызматтар тизмеси
app.get("/api/services", (req, res) => {
  res.json({ data: readJson("services.json") });
});

// Шеберлер тизмеси
app.get("/api/masters", (req, res) => {
  res.json({ data: readJson("masters.json") });
});

// Пикирлер тизмеси
app.get("/api/reviews", (req, res) => {
  res.json({ data: readJson("reviews.json") });
});

// Жаңы жазылуу кабыл алуу
app.post("/api/bookings", (req, res) => {
  const { name, phone, service, master, date, time, note } = req.body || {};

  // Жөнөкөй валидация
  if (!name || !phone || !service || !date || !time) {
    return res.status(400).json({
      error: "Милдеттүү талаалар толтурулган эмес (name, phone, service, date, time).",
    });
  }

  const booking = {
    id: ++bookingSeq,
    name,
    phone,
    service,
    master: master || "Каалаган шебер",
    date,
    time,
    note: note || "",
    status: "new",
    createdAt: new Date().toISOString(),
  };

  // TODO(DB): бул жерде маалымат базасына INSERT жасалат.
  bookings.push(booking);
  console.log(`[Датка] Жаңы жазылуу №${booking.id}: ${name}, ${service}, ${date} ${time}`);

  res.status(201).json({ ok: true, id: booking.id, booking });
});

// Бардык жазылууларды көрүү (демо/админ үчүн)
app.get("/api/bookings", (req, res) => {
  res.json({ count: bookings.length, data: bookings });
});

// ---- 404 ----
app.use((req, res) => {
  res.status(404).json({ error: "Мындай маршрут табылган жок." });
});

app.listen(PORT, () => {
  console.log(`\n  ✦ «Датка» placeholder бэкенди иштеп жатат`);
  console.log(`  ✦ http://localhost:${PORT}/api/health\n`);
});
