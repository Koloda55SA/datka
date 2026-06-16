import { json, preflight, getAdminPassword, createSession } from "../_store.js";

export const onRequestOptions = preflight;

// POST /api/admin/login  { password }  ->  { token }
export const onRequestPost = async ({ request, env }) => {
  let body;
  try { body = await request.json(); } catch { return json({ error: "Туура эмес JSON." }, 400); }

  const pass = await getAdminPassword(env);
  if (!body || body.password !== pass) {
    return json({ error: "Сырсөз туура эмес." }, 401);
  }
  if (!env.DATKA_BOOKINGS) return json({ ok: true, token: "local-dev-token" });

  const token = await createSession(env);
  return json({ ok: true, token });
};
