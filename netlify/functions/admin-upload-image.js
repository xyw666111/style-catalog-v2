const REPO = process.env.GITHUB_REPO || "xyw666111/style-catalog-v2";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const UPLOAD_DIR = "images/uploads";

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

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod === "OPTIONS") return json(200, {});
    if (!requireAuth(context)) return json(401, { error: "请先登录后台" });
    if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

    const body = JSON.parse(event.body || "{}");
    const dataUrl = body.dataUrl || "";
    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) return json(400, { error: "图片数据格式不正确" });

    const extMap = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif"
    };
    const ext = extMap[match[1].toLowerCase()] || ".jpg";
    const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
    const rand = Math.random().toString(36).slice(2, 8);
    const filename = `${stamp}-${rand}${ext}`;
    const path = `${UPLOAD_DIR}/${filename}`;

    await github(`contents/${path}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Upload image ${filename}`,
        content: match[2],
        branch: BRANCH
      })
    });

    return json(200, { ok: true, path: `/${path}` });
  } catch (err) {
    return json(500, { error: err.message || "上传失败" });
  }
};