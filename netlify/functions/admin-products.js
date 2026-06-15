const REPO = process.env.GITHUB_REPO || "xyw666111/style-catalog-v2";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const FILE_PATH = "data/products.json";

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body)
  };
}

function requireAuth(context) {
  return context && context.clientContext && context.clientContext.user;
}

async function github(path, options = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("Netlify 环境变量 GITHUB_TOKEN 未设置");
  const res = await fetch(`https://api.github.com/repos/${REPO}/${path}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "User-Agent": "style-catalog-admin",
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `GitHub API 请求失败：${res.status}`);
  return data;
}

async function getFile() {
  return await github(`contents/${FILE_PATH}?ref=${BRANCH}`);
}

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod === "OPTIONS") return json(200, {});
    if (!requireAuth(context)) return json(401, { error: "请先登录后台" });

    if (event.httpMethod === "GET") {
      const file = await getFile();
      const content = Buffer.from(file.content || "", "base64").toString("utf8");
      const parsed = JSON.parse(content || '{"products":[]}');
      return json(200, { products: parsed.products || [], sha: file.sha });
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const products = Array.isArray(body.products) ? body.products : [];
      const file = await getFile();
      const next = JSON.stringify({ products }, null, 2);
      const encoded = Buffer.from(next, "utf8").toString("base64");
      const result = await github(`contents/${FILE_PATH}`, {
        method: "PUT",
        body: JSON.stringify({
          message: "Update products from V5.1 locked admin hotfix",
          content: encoded,
          sha: file.sha,
          branch: BRANCH
        })
      });
      return json(200, { ok: true, commit: result.commit && result.commit.sha });
    }

    return json(405, { error: "Method not allowed" });
  } catch (err) {
    return json(500, { error: err.message || "服务器错误" });
  }
};