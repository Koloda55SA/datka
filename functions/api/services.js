import { readCol, json, preflight } from "./_store.js";
export const onRequestOptions = preflight;
export const onRequestGet = async ({ env }) => json({ data: await readCol(env, "services") });
