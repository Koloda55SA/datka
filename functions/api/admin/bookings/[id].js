import { json, preflight, requireAuth } from "../../_store.js";

export const onRequestOptions = preflight;

// PUT /api/admin/bookings/:id  — жазылуунун статусун өзгөртүү.
export const onRequestPut = async ({ request, env, params }) => {
  const denied = await requireAuth(request, env);
  if (denied) return denied;
  const key = `booking:${params.id}`;
  const current = await env.DATKA_BOOKINGS.get(key, "json");
  if (!current) return json({ error: "Жазылуу табылган жок." }, 404);

  let body;
  try { body = await request.json(); } catch { body = {}; }
  const allowed = ["new", "confirmed", "done", "cancelled"];
  if (body.status && allowed.includes(body.status)) current.status = body.status;
  if (typeof body.note === "string") current.note = body.note;

  await env.DATKA_BOOKINGS.put(key, JSON.stringify(current));
  return json({ ok: true, booking: current });
};

// DELETE /api/admin/bookings/:id — жазылууну өчүрүү.
export const onRequestDelete = async ({ request, env, params }) => {
  const denied = await requireAuth(request, env);
  if (denied) return denied;
  await env.DATKA_BOOKINGS.delete(`booking:${params.id}`);
  return json({ ok: true });
};
