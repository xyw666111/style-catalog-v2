# Cloudflare 版款式预览小册 v1

本包用于把项目从 Netlify 路线切换到 Cloudflare 路线。

## 已锁定的技术路线

- 前端：Cloudflare Pages
- 后台接口：Cloudflare Worker
- 商品数据：Cloudflare D1
- 图片：本阶段暂时压缩后存入 D1 的 images 字段（base64/dataURL），后续如果愿意开通 R2，再迁移到 R2。
- 永久排除 Netlify。

## 当前 Worker 地址

```text
https://style-catalog-api.893380992.workers.dev
```

## 文件说明

```text
index.html              顾客前台，读取 Worker 的 /api/products
admin/index.html        V5.1 后台交互界面，保存到 Worker + D1
worker/style-catalog-api-worker.js  Worker 正式接口代码备份
```

## 已经完成的 Cloudflare 配置

- D1 数据库：style_catalog_db
- D1 商品表：products
- Worker：style-catalog-api
- Worker D1 绑定：DB -> style_catalog_db
- Worker Secret：ADMIN_KEY 已添加

## 部署到 Cloudflare Pages 的建议

1. 把本包解压。
2. 把里面所有文件复制到本地 GitHub 仓库 `style-catalog-v2`。
3. GitHub Desktop 提交并 Push。
4. 在 Cloudflare 里进入 Workers & Pages。
5. 创建 Pages 项目，连接 GitHub 仓库 `xyw666111/style-catalog-v2`。
6. 构建设置：
   - Framework preset：None / 无
   - Build command：留空
   - Output directory：留空或 `/`
7. 部署完成后访问 Cloudflare Pages 给出的地址。

## 后台使用方式

后台地址：

```text
你的 Cloudflare Pages 域名/admin/
```

第一次打开后台会提示输入 ADMIN_KEY。这个密钥就是你在 Worker 里设置的 ADMIN_KEY。

不要把 ADMIN_KEY 发给任何人，也不要截图给别人。

## 注意

本阶段没有开通 R2，因为 R2 页面提示需要添加订阅/付款方式。为了避免付费风险，本阶段先用 D1 跑通完整链路。

图片会在后台上传时自动压缩，再保存到 D1。这个方式适合测试和少量商品，不建议长期大量高清图使用。后续如需正式长期大量图片，建议再单独评估：

- Cloudflare R2
- GitHub 图片目录
- 免费图床
- 其他对象存储
