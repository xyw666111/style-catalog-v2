import { json, getProducts } from "./_shared";

export async function onRequestGet(context) {
  try {
    const products = await getProducts(context.env.DB);
    return json({ ok: true, products }, 200, {
      cacheControl: "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
    });
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}
