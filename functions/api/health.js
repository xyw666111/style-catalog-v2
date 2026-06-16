import { json } from "./_shared";

export async function onRequestGet(context) {
  try {
    const result = await context.env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table'"
    ).all();
    return json({ ok: true, message: "Cloudflare Pages Functions 已连接 D1", tables: result.results || [] });
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}
