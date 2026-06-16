# Cloudflare 同域名 API 修复包 v1

目的：把前台/后台的数据接口从 `workers.dev` 改成 Pages 同域名 `/api/...`。

修复后：

- 前台读取：`https://style-catalog-v2.pages.dev/api/products`
- 后台保存：`https://style-catalog-v2.pages.dev/api/admin/products`
- 后台删除：`https://style-catalog-v2.pages.dev/api/admin/products/:id`
- 健康检查：`https://style-catalog-v2.pages.dev/api/health`

必须在 Cloudflare Pages 项目 `style-catalog-v2` 中绑定：

- D1 绑定变量名：`DB`
- D1 数据库：`style_catalog_db`
- 环境变量：`ADMIN_KEY`，值与原 Worker 后台密钥一致

不要把 ADMIN_KEY 发给任何人，也不要提交到 GitHub。
