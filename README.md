# youlyu-homepage

密码学博士 You Lyu 的学术个人主页源码，托管于 GitHub Pages：<https://lvyouyw.github.io/youlyu/>

## 项目说明

本目录是新主页的源码，**纯静态站点**（`index.html` + `assets/`），无需任何构建步骤，直接部署即可。

```
youlyu-homepage/
├── index.html                    # 主页（单文件，含样式与脚本）
├── assets/
│   ├── avatar.jpg                # 头像 800x800
│   └── avatar-small.jpg          # 头像 480x480
├── googledec545a98f5861cd.html   # Google 搜索控制台验证文件（必须保留）
├── sitemap.xml                   # 站点地图（在 Search Console 中提交）
├── .nojekyll                     # 让 GitHub Pages 跳过 Jekyll 处理
├── server.js                     # 本地预览用零依赖静态服务器
└── package.json
```

## 本地预览

```bash
npm run dev
```

然后打开 <http://localhost:7100/> 即可（支持 `--port` / `--host` 参数或 `PORT` / `HOST` 环境变量）。

## 部署步骤

1. 删除旧仓库中的 `_config.yml` 和 `index.md`（旧版 Jekyll 文件，不再需要）。
2. 把本目录的**全部内容**（包括 `.nojekyll` 和 `googledec545a98f5861cd.html` 验证文件）提交到 `LVYOUyw/youlyu` 仓库根目录。
3. GitHub Pages 会自动发布到 <https://lvyouyw.github.io/youlyu/>。

## 如何维护内容（重要）

主页全部内容都在 `data/site-data.js` 中，有两种维护方式：

**方式一（推荐，无需懂 HTML / JS）**：使用可视化编辑器

```bash
npm run dev
```

然后打开 <http://localhost:7100/edit.html>，在表单里修改内容 → 点击「导出 site-data.js」→ 用下载的文件**覆盖**仓库中的 `data/site-data.js` → `git add -A && git commit && git push` 即可上线。

**方式二**：直接编辑 `data/site-data.js`（文件头部有字段格式注释），改完提交推送。

> 注意：`edit.html` 也会被部署到线上（<https://lvyouyw.github.io/youlyu/edit.html>），它不影响主页本身；介意的话可以不提交它（将其加入 `.gitignore`）。

## 其他说明

- 访客地图（MapMyVisitors）已保留在页脚，装在固定深墨底色的小卡片里，明/暗主题下都协调；卡片现在可折叠，默认收起，点击标题栏即可展开，收起时统计脚本仍正常加载计数。嵌入代码与旧版完全一致（`cl=ffffff` 白色文字）。地图内部配色由第三方服务控制，如需换配色可在 mapmyvisitors.com 重新生成嵌入码，替换 `index.html` 页脚中的 `<script id="mapmyvisitors">` 一行即可。
- 站点对首次访问者现在默认使用浅色主题；再次访问时沿用本地保存的明/暗选择（存于 localStorage 的 `yl-theme`），右上角按钮可随时切换。
- 头像 `assets/avatar.jpg` 由 `photo_ly.jpg`（5472x3648 原图）裁剪而来；如需替换，直接替换 `assets/avatar.jpg` 即可（建议同时替换 `avatar-small.jpg`）。
