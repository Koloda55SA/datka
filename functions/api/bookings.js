import { json, preflight } from "./_store.js";

export const onRequestOptions = preflight;

// POST /api/bookings — кардар сайттан жаңы жазылуу калтырат (ачык).
export const onRequestPost = async ({ request, env }) => {
  let body;
  try { body = await request.json(); } catch { return json({ error: "Туура эмес JSON." }, 400); }

  const { name, phone, service, master, date, time, note } = body || {};
  if (!name || !phone || !service || !date || !time) {
    return json({ error: "Милдеттүү талаалар толтурулган эмес." }, 400);
  }

  const id = 1000 + Math.floor(Math.random() * 9000);
  const booking = {
    id, name, phone, service,
    master: master || "Каалаган шебер",
    date, time, note: note || "",
    status: "new",
    createdAt: new Date().toISOString(),
  };

  if (env.DATKA_BOOKINGS) {
    await env.DATKA_BOOKINGS.put(`booking:${id}`, JSON.stringify(booking));
  }
  return json({ ok: true, id, booking }, 201);
};
