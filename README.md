# 款式预览小册 · V6 V5.1 Locked Admin

这一版的原则：

```text
/admin/ 后台页面布局与交互设计，直接使用 V5.1 本地草稿版
```

不重新设计后台，不改交互逻辑。只把底层保存方式从浏览器 localStorage 换成 GitHub / Netlify Function。

## 必须配置 Netlify 环境变量

这个版本需要 Netlify Function 安全写入 GitHub，所以要配置：

```text
GITHUB_TOKEN
```

建议同时配置：

```text
GITHUB_REPO=xyw666111/style-catalog-v2
GITHUB_BRANCH=main
```

## GitHub Token 权限

使用 Fine-grained token，只授权仓库：

```text
xyw666111/style-catalog-v2
```

权限：

```text
Contents: Read and write
```

## 上传方式

1. 解压压缩包。
2. 把 `jersey_site_v6_v51_locked_admin` 文件夹里的所有文件复制到本地仓库 `style-catalog-v2`。
3. 覆盖旧文件。
4. GitHub Desktop 提交：

```text
v6 v51 locked admin
```

5. Push origin。
6. Netlify 添加环境变量后重新部署。
7. 打开：

```text
https://style-catalog-v2.netlify.app/admin/
```
