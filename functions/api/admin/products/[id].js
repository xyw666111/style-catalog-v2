import { json, requireAdmin } from "../../_shared";

export async function onRequestDelete(context) {
  const { request, env, params } = context;
  try {
    if (!requireAdmin(request, env)) return json({ ok: false, error: "Unauthorized" }, 401);
    const id = decodeURIComponent(params.id || "");
    if (!id) return json({ ok: false, error: "缺少商品 ID" }, 400);
    await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
    return json({ ok: true, message: "商品已删除", id });
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}
