import { json, preflight } from "./_store.js";
export const onRequestOptions = preflight;
export const onRequestGet = () =>
  json({ status: "ok", service: "datka-backend", runtime: "cloudflare-pages-functions", time: new Date().toISOString() });
