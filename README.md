# gxj · 测试与工程手记

独立的纯静态测试博客，全部代码位于 `dist/`，无需安装依赖或构建。不会修改外层 FrameForge 项目。

## 线上发布

- 网站地址：https://park947.github.io/gxj-blog/
- 代码仓库：https://github.com/Park947/gxj-blog
- GitHub Pages 通过 `.github/workflows/deploy-pages.yml` 发布 `dist/`，推送到 `main` 后自动更新，也可在 Actions 中手动触发。
- 修改文章生成模板或原始正文快照后，先执行 `python3 scripts/build-articles.py`，再提交生成后的 `dist/posts/` 页面。
- `.openai/` 为本地 Site 配置，已排除出版本控制；仅 `dist/` 中的静态资源会部署到网站。

## 本地预览

在本目录执行：

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

打开 `http://127.0.0.1:4173`。也可以把 `dist/` 内的文件部署到 GitHub Pages 或任意静态托管服务；资源使用相对路径，支持子目录部署。

## 功能

- 独立的首页 `index.html`、博客列表 `blog.html` 与项目列表 `projects.html`；首页只保留工程主题首屏，导航在当前标签页切换页面。
- 首页、博客、项目和文章页共用头部布局：桌面高度 92px，手机高度 76px，Logo、居中导航和右侧阅读入口的位置、字号与间距一致；首页使用深色，列表与文章页使用米白配色，选中状态随当前页面变化。
- 项目列表使用详细介绍卡片，包含项目简介、功能清单、技术标签与 GitHub 仓库入口，保留三个项目和现有仓库链接。
- 博客与项目列表内容区居中，最大宽度为 1400px（含两侧内边距），避免大屏卡片过宽；项目卡片保持自然内容高度，不随屏幕高度拉伸，页脚保留在页面底部。
- 5 篇主题手记，直接展示全部文章，不设分类筛选、搜索栏或加载更多。
- 点击文章封面、标题或“阅读全文”，在当前标签页进入本站 `posts/` 下的完整文章，不打开新标签页、不跳转 PGH、不使用摘要弹窗。
- 浏览器后退可回到列表，前进可重新进入文章；文章顶部和底部都提供“返回博客列表”。
- 五篇文章正文完整同步自用户拥有的 PGH 博客，保留文字、代码、表格、图片与 Mermaid 架构图；页面使用 gxj 的米白、粉色、青蓝设计。
- 文章页支持桌面目录、阅读进度、复制代码、复制链接、架构图放大、上一篇 / 下一篇、返回博客和手机导航。
- 旧的 `#article/文章标识` 链接跳转至对应本站文章页；不存在的文章标识返回博客列表。
- 首页旧的 `#journal`、`#projects` 链接分别兼容跳转至博客列表、项目列表。
- 移动导航、阅读进度与减少动态效果设置。
- 正文为静态 HTML；Mermaid 库也已保存在本地，不依赖 PGH 在线服务或远程字体。关闭 JavaScript 时仍可阅读全文和代码。

## 修改内容

- `dist/data.js`：文章标题、日期、分类、摘要、延伸思考与验证问题。
- `dist/index.html`：独立首页，保留原有首屏布局。
- `dist/blog.html`、`dist/projects.html`：博客列表和项目列表；列表页和文章页保留紧凑页脚，包含版权、英文标语和回到顶部入口。
- `dist/projects.css`：项目介绍卡片及其响应式布局。
- `dist/styles.css`：配色、响应式布局和视觉图形。
- `dist/app.js`：文章列表、本站文章链接、导航与旧阅读链接兼容逻辑。
- `dist/posts/`：五篇完整文章的静态页面。
- `dist/article.css`、`dist/article.js`：文章页样式、目录、代码复制与本地流程图渲染。
- `content/source/`：五篇文章的原始 HTML 快照，正文不改写。
- `scripts/build-articles.py`：从快照生成文章页的 Python 标准库脚本，无需额外依赖。

新增文章时，为每项提供唯一 `slug`、`category`、ISO 格式 `date`、`title` 和 `summary`。封面还需 `visual`、`color` 和 `label`；`type` 类型使用 `word`、`subline`，`grid` 类型使用 `word`。同时在 `content/source/` 添加正文快照，并更新生成脚本的文章清单。文章数量会从数据生成。

## 重建文章页

修改文章外壳或样式后，使用本地快照重建，不会访问远程网站：

```sh
python3 scripts/build-articles.py
```

需要主动同步 PGH 博客最新正文时再执行：

```sh
python3 scripts/build-articles.py --refresh
```

## 内容与归属

内容参考：https://pgh11.github.io/pgh-blog/index.html

设计参考：https://park947.github.io/aigc-portfolio/

用户确认两个博客均为自己所有。本次将五篇原文完整迁入本站，只替换页面外壳与排版，不缩写或改写正文；文章阅读始终留在本站。项目链接分别指向配置的 GitHub 仓库。

本地 Mermaid 版本为 10.9.5，其许可证保存在 `dist/assets/vendor/mermaid-LICENSE.txt`。

`.openai/hosting.json` 保留了已有 Site 标识与静态部署目录；本地预览无需使用该配置。
