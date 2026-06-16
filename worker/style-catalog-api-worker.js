export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
      "Content-Type": "application/json; charset=utf-8"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    function json(data, status = 200) {
      return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: corsHeaders
      });
    }

    function requireAdmin() {
      const key = request.headers.get("X-Admin-Key");
      if (!env.ADMIN_KEY) return false;
      return key && key === env.ADMIN_KEY;
    }

    function normalizeProduct(product, index = 0) {
      const now = new Date().toISOString();
      const images = Array.isArray(product.images) ? product.images.slice(0, 6) : [];
      return {
        id: product.id || crypto.randomUUID(),
        code: product.code || "",
        style: product.style || "未命名款式",
        section: product.section || "常规款式",
        price: product.price || "¥129",
        color: product.color || "",
        size: product.size || "S / M / XL / XXL",
        material: product.material || "聚酯纤维速干运动面料",
        note: product.note || "",
        images: JSON.stringify(images),
        sort_order: Number.isFinite(Number(product.sort_order)) ? Number(product.sort_order) : index + 1,
        created_at: product.created_at || now,
        updated_at: now
      };
    }

    async function getProducts() {
      const result = await env.DB.prepare(
        "SELECT * FROM products ORDER BY sort_order ASC, updated_at DESC"
      ).all();

      return result.results.map(item => {
        let images = [];
        try { images = item.images ? JSON.parse(item.images) : []; } catch (e) { images = []; }
        return { ...item, images };
      });
    }

    async function upsertProduct(product, index = 0) {
      const p = normalizeProduct(product, index);
      await env.DB.prepare(`
        INSERT OR REPLACE INTO products (
          id, code, style, section, price, color, size, material, note, images, sort_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        p.id, p.code, p.style, p.section, p.price, p.color, p.size, p.material,
        p.note, p.images, p.sort_order, p.created_at, p.updated_at
      ).run();
      return p;
    }

    try {
      if (url.pathname === "/api/health") {
        const result = await env.DB.prepare(
          "SELECT name FROM sqlite_master WHERE type='table'"
        ).all();
        return json({ ok: true, message: "Cloudflare Worker 已连接 D1", tables: result.results });
      }

      if (url.pathname === "/api/products" && request.method === "GET") {
        const products = await getProducts();
        return json({ ok: true, products });
      }

      if (url.pathname === "/api/admin/products" && request.method === "POST") {
        if (!requireAdmin()) return json({ ok: false, error: "Unauthorized" }, 401);
        const body = await request.json();

        if (Array.isArray(body.products)) {
          await env.DB.prepare("DELETE FROM products").run();
          for (let i = 0; i < body.products.length; i++) await upsertProduct(body.products[i], i);
          const products = await getProducts();
          return json({ ok: true, message: "商品列表已保存", products });
        }

        if (body.product) {
          const saved = await upsertProduct(body.product, 0);
          return json({ ok: true, message: "商品已保存", product: saved });
        }

        return json({ ok: false, error: "缺少 products 或 product" }, 400);
      }

      if (url.pathname.startsWith("/api/admin/products/") && request.method === "DELETE") {
        if (!requireAdmin()) return json({ ok: false, error: "Unauthorized" }, 401);
        const id = decodeURIComponent(url.pathname.replace("/api/admin/products/", ""));
        await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
        return json({ ok: true, message: "商品已删除", id });
      }

      return json({ ok: false, error: "Not found" }, 404);
    } catch (error) {
      return json({ ok: false, error: error.message }, 500);
    }
  }
};
