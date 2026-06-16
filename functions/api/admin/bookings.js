import { json, preflight, requireAuth } from "../_store.js";

export const onRequestOptions = preflight;

// GET /api/admin/bookings — бардык жазылууларды алуу (авторизация менен).
export const onRequestGet = async ({ request, env }) => {
  const denied = await requireAuth(request, env);
  if (denied) return denied;
  if (!env.DATKA_BOOKINGS) return json({ count: 0, data: [] });

  const list = await env.DATKA_BOOKINGS.list({ prefix: "booking:" });
  const items = await Promise.all(list.keys.map((k) => env.DATKA_BOOKINGS.get(k.name, "json")));
  const data = items.filter(Boolean).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  return json({ count: data.length, data });
};
