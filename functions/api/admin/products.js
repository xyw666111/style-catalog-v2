import { json, requireAdmin, getProducts, upsertProduct } from "../_shared";

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    if (!requireAdmin(request, env)) return json({ ok: false, error: "Unauthorized" }, 401);
    const body = await request.json();

    if (Array.isArray(body.products)) {
      await env.DB.prepare("DELETE FROM products").run();
      for (let i = 0; i < body.products.length; i++) {
        await upsertProduct(env.DB, body.products[i], i);
      }
      const products = await getProducts(env.DB);
      return json({ ok: true, message: "商品列表已保存", products });
    }

    if (body.product) {
      const saved = await upsertProduct(env.DB, body.product, 0);
      return json({ ok: true, message: "商品已保存", product: saved });
    }

    return json({ ok: false, error: "缺少 products 或 product" }, 400);
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}
