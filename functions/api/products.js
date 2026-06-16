import { json, getProducts } from "./_shared";

export async function onRequestGet(context) {
  try {
    const products = await getProducts(context.env.DB);
    return json({ ok: true, products });
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}
