# GitHub + Netlify 后台设置步骤

1. 在 GitHub 新建仓库，例如 `style-catalog`。
2. 把本文件夹里的全部内容上传到 GitHub 仓库。
3. 在 Netlify 里选择 Add new site → Import an existing project。
4. 选择这个 GitHub 仓库并部署。
5. 部署成功后，进入 Netlify 项目设置。
6. 打开 Identity，选择 Enable Identity。
7. 打开 Git Gateway，选择 Enable Git Gateway。
8. 在 Identity 里邀请你的后台登录邮箱。
9. 用收到的邀请邮件设置密码。
10. 打开 `https://你的网址.netlify.app/admin/` 登录后台。

以后在后台上传图片/修改商品，保存后 Netlify 会自动重新部署，前台会更新。
