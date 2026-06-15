# 款式预览小册 · 正式后台版 v5.1

这是准备上传 GitHub / Netlify 的正式版本，不是本地草稿版。

## 这一版的后台逻辑

后台地址：

```text
/admin/
```

后台使用 Decap CMS / Netlify Identity / Git Gateway 保存数据到 GitHub。

商品图片字段已经简化为：

```text
商品图片
```

规则：

1. 第一张图片会自动成为前台封面图。
2. 后面的图片会作为详情图。
3. 在后台可以调整图片顺序；把想当封面的图片放到第一张。
4. 建议每个商品最多放 6 张图片。
5. 前台会读取 `images[0]` 作为封面。

## 商品字段

每个商品保留这些字段：

- 商品编号
- 款式名称
- 分区：新品上新 / 常规款式 / 清仓打折
- 价格：¥189 / ¥129 / ¥99
- 颜色
- 尺码
- 材质
- 备注
- 商品图片

已删除：

- 分类
- 单独封面图字段
- 图片位置字段
- 支付链接字段

## 上传 GitHub 方法

1. 解压这个压缩包。
2. 打开解压后的 `jersey_site_v5_1_official_admin` 文件夹。
3. 把里面所有文件复制到你本地的 GitHub 仓库文件夹 `style-catalog-v2`。
4. 允许覆盖旧文件。
5. 打开 GitHub Desktop。
6. Summary 填：

```text
v5.1 official admin
```

7. 点击 `Commit to main`。
8. 点击 `Push origin`。
9. 等 Netlify 自动部署完成。
10. 打开：

```text
https://style-catalog-v2.netlify.app/admin/
```

开始测试上传商品图片。

## 注意

这个正式版不会使用浏览器 localStorage。后台保存后会提交到 GitHub，并触发 Netlify 自动重新部署。
