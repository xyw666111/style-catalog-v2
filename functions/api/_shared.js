export function json(data, status = 200, options = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": options.cacheControl || "no-store"
    }
  });
}

export function requireAdmin(request, env) {
  const key = request.headers.get("X-Admin-Key");
  if (!env.ADMIN_KEY) return false;
  return Boolean(key && key === env.ADMIN_KEY);
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function cleanUrl(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  return String(value.original || value.image || value.src || value.url || value.medium || value.thumb || "").trim();
}

function toOriginalUrl(src) {
  src = cleanUrl(src);
  if (!src) return "";
  return src
    .replace(/-thumb\.jpe?g($|[?#])/i, ".jpg$1")
    .replace(/-medium\.jpe?g($|[?#])/i, ".jpg$1");
}

function toMediumUrl(src) {
  const original = toOriginalUrl(src);
  return original ? original.replace(/\.jpe?g($|[?#])/i, "-medium.jpg$1") : "";
}

function toThumbUrl(src) {
  const original = toOriginalUrl(src);
  return original ? original.replace(/\.jpe?g($|[?#])/i, "-thumb.jpg$1") : "";
}

function keyOf(src) {
  return toOriginalUrl(src).split("?")[0];
}

function addToMap(map, item, preferredType = "") {
  if (!item) return;
  if (typeof item === "object" && !Array.isArray(item)) {
    const base = toOriginalUrl(item.original || item.image || item.src || item.url || item.medium || item.thumb);
    if (!base) return;
    const key = keyOf(base);
    const current = map.get(key) || { thumb: "", medium: "", original: base };
    current.thumb = cleanUrl(item.thumb || item.thumbnail || item.cover_thumb || item.coverThumb) || current.thumb || toThumbUrl(base);
    current.medium = cleanUrl(item.medium || item.preview || item.detail) || current.medium || toMediumUrl(base);
    current.original = cleanUrl(item.original || item.image || item.src || item.url) || current.original || base;
    map.set(key, current);
    return;
  }
  const src = cleanUrl(item);
  const base = toOriginalUrl(src);
  if (!base) return;
  const key = keyOf(base);
  const current = map.get(key) || { thumb: "", medium: "", original: base };
  if (preferredType === "thumb" || /-thumb\.jpe?g($|[?#])/i.test(src)) current.thumb = src;
  else if (preferredType === "medium" || /-medium\.jpe?g($|[?#])/i.test(src)) current.medium = src;
  else current.original = src;
  map.set(key, current);
}

export function buildGallery(product = {}) {
  const map = new Map();
  asArray(product.gallery).forEach(item => addToMap(map, item));
  asArray(product.images).forEach(item => addToMap(map, item));
  asArray(product.thumbs).forEach(item => addToMap(map, item, "thumb"));
  addToMap(map, product.cover);
  addToMap(map, product.cover_medium || product.coverMedium, "medium");
  addToMap(map, product.cover_thumb || product.coverThumb || product.thumb, "thumb");
  return [...map.values()]
    .map(item => {
      const original = item.original || toOriginalUrl(item.medium || item.thumb);
      return {
        thumb: item.thumb || toThumbUrl(original),
        medium: item.medium || toMediumUrl(original),
        original
      };
    })
    .filter(item => item.original || item.medium || item.thumb)
    .slice(0, 9);
}

export function normalizeProduct(product, index = 0) {
  const now = new Date().toISOString();
  const gallery = buildGallery(product);
  const originals = gallery.map(item => item.original).filter(Boolean);
  return {
    id: product.id || product.code || crypto.randomUUID(),
    code: product.code || "",
    style: product.style || "未命名款式",
    section: product.section || "常规款式",
    price: product.price || "¥129",
    color: product.color || "",
    size: product.size || "S / M / L / XL / 2XL / 3XL",
    material: product.material || product.condition || "聚酯纤维速干运动面料",
    note: product.note || "",
    images: JSON.stringify(originals),
    sort_order: Number.isFinite(Number(product.sort_order)) ? Number(product.sort_order) : index + 1,
    created_at: product.created_at || now,
    updated_at: now
  };
}

export function publicProduct(item) {
  let imageItems = [];
  try { imageItems = item.images ? JSON.parse(item.images) : []; } catch (e) { imageItems = []; }
  const gallery = buildGallery({ ...item, images: imageItems });
  const cover = gallery[0] || { thumb: "", medium: "", original: "" };
  return {
    ...item,
    images: gallery.map(g => g.original).filter(Boolean),
    gallery,
    cover: cover.original,
    cover_medium: cover.medium,
    cover_thumb: cover.thumb
  };
}

export async function getProducts(DB) {
  const result = await DB.prepare(
    "SELECT * FROM products ORDER BY sort_order ASC, updated_at DESC"
  ).all();

  return (result.results || []).map(publicProduct);
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
  return publicProduct(p);
}
