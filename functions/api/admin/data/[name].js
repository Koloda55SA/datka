import { json, preflight, requireAuth, readCol, writeCol, COLLECTIONS } from "../../_store.js";

export const onRequestOptions = preflight;

// GET /api/admin/data/:name — коллекцияны окуу (админ үчүн).
export const onRequestGet = async ({ request, env, params }) => {
  const denied = await requireAuth(request, env);
  if (denied) return denied;
  if (!COLLECTIONS.includes(params.name)) return json({ error: "Белгисиз коллекция." }, 404);
  return json({ data: await readCol(env, params.name) });
};

// PUT /api/admin/data/:name — коллекцияны толугу менен алмаштыруу (сактоо).
export const onRequestPut = async ({ request, env, params }) => {
  const denied = await requireAuth(request, env);
  if (denied) return denied;
  if (!COLLECTIONS.includes(params.name)) return json({ error: "Белгисиз коллекция." }, 404);

  let body;
  try { body = await request.json(); } catch { return json({ error: "Туура эмес JSON." }, 400); }
  const value = body && body.data !== undefined ? body.data : body;

  await writeCol(env, params.name, value);
  return json({ ok: true, data: value });
};
