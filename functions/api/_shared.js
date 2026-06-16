export function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

export function requireAdmin(request, env) {
  const key = request.headers.get("X-Admin-Key");
  if (!env.ADMIN_KEY) return false;
  return Boolean(key && key === env.ADMIN_KEY);
}

export function normalizeProduct(product, index = 0) {
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

export async function getProducts(DB) {
  const result = await DB.prepare(
    "SELECT * FROM products ORDER BY sort_order ASC, updated_at DESC"
  ).all();

  return (result.results || []).map(item => {
    let images = [];
    try { images = item.images ? JSON.parse(item.images) : []; } catch (e) { images = []; }
    return { ...item, images };
  });
}

export async function upsertProduct(DB, product, index = 0) {
  const p = normalizeProduct(product, index);
  await DB.prepare(`
    INSERT OR REPLACE INTO products (
      id, code, style, section, price, color, size, material, note, images, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    p.id, p.code, p.style, p.section, p.price, p.color, p.size, p.material,
    p.note, p.images, p.sort_order, p.created_at, p.updated_at
  ).run();
  return p;
}
