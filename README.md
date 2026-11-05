# 我的个人主页 · GitHub Pages

一个**零依赖、零构建**的静态个人网站：纯 HTML + CSS + 一点点 JS。
把这个文件夹推到 GitHub，打开 Pages，几分钟后就有 `https://imzhurui.github.io`。

- 首页：`index.html`（关于 / 作品 / 最近文章 / 联系）
- 文章区：`blog/`（列表 + 两篇示例，其中一篇就是教程）
- 深色模式：跟随系统，右上角可手动切换
- 响应式、纯静态、可直接双击打开看

> **状态：已上线** → <https://imzhurui.github.io>
> 本机更新方式：改完文件后运行 `_tools\push.ps1 "改了什么"`（工作区内已备好便携版 git，走 `ssh.github.com:443`，无需另装 Git）。

---

## 一、5 分钟上线（不用装任何软件）

前提：有一个 GitHub 账号。没有就去 <https://github.com/signup> 注册，用户名会变成你的网址，**想好再定**。

### 1. 建仓库

打开 <https://github.com/new>：

- **Repository name** 填 `imzhurui.github.io`
  （规则是 `<用户名>.github.io`，必须和用户名完全一致；填别的名字会变成子路径站点。）
- **Visibility** 选 **Public**（免费账号的 Pages 只支持公开仓库）
- 不要勾 Add README，直接 **Create repository**

### 2. 上传文件

在新仓库页面点 **uploading an existing file**（或地址栏后面加 `/upload/main`），
把这个文件夹里的**所有内容**拖进去（包括 `.nojekyll` 和 `assets/`、`blog/` 文件夹），
填一句提交信息，点 **Commit changes**。

> 拖拽时注意别把外层文件夹 `my-github-site` 本身拖进去，要让 `index.html` 位于**仓库根目录**。

> `.nojekyll` 是隐藏文件，Windows 里以 `.` 开头的文件默认可能不显示。如果没有上传成功，
> 也可以在网页上点 **Add file → Create new file**，文件名写 `.nojekyll`，内容留空，提交。

### 3. 打开 Pages

仓库页 → **Settings** → 左侧 **Pages**：

- **Source** 选 **Deploy from a branch**
- **Branch** 选 `main`，目录选 `/ (root)`，点 **Save**

### 4. 访问

等 1–3 分钟（最长约 10 分钟），打开：

```
https://imzhurui.github.io
```

回到 Settings → Pages，顶部会显示 "Your site is live at ..." 和 **Visit site** 按钮。

---

## 二、用命令行推送（长期更顺手）

你这台机器上目前**没有装 Git**。装一个：

```powershell
winget install --id Git.Git -e --source winget
```

装完**新开一个终端**（让 PATH 生效），验证：

```powershell
git --version
```

首次使用要配置身份（邮箱用你 GitHub 账号绑定的邮箱）：

```powershell
git config --global user.name "你的名字"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
```

然后在 **这个文件夹里** 初始化并推送：

```powershell
cd C:\Users\Tegan\Documents\deepseek-harness\default-workspace\my-github-site
git init
git add .
git commit -m "init: personal site"
git remote add origin https://github.com/imzhurui/imzhurui.github.io.git
git push -u origin main
```

第一次 push 会弹浏览器让你登录 GitHub（Git Credential Manager 会帮你记住）。

改完文件之后，日常就三步：

```powershell
git add .
git commit -m "写清楚改了什么"
git push
```

### 本地预览

改样式时先本地看效果，别靠线上刷新（有缓存还慢）：

```powershell
python -m http.server 8000
```

然后浏览器打开 <http://localhost:8000>。（这台机器已经有 Python，直接可用。）

---

## 三、改成你自己的

搜索替换就行，涉及的位置：

| 想改什么 | 改哪里 |
| --- | --- |
| 名字 `Rui Zhu` | 所有 `index.html`、`blog/*.html` 里的 `Rui Zhu`，以及 `index.html` 里的 brand 首字母 `R` |
| 邮箱 `you@example.com` | `index.html`（两处：社交链接和联系按钮） |
| GitHub 链接 `https://github.com/` | `index.html`（首屏 + 联系区） |
| 自我介绍、作品卡片 | `index.html` 里 `#about`、`#work` 两个 section |
| 配色 | `assets/css/style.css` 顶部 `:root` 里的变量（`--accent` 是主色） |
| 网址（SEO / og） | `index.html` 的 `<link rel="canonical">` 改成真实地址 |
| 404 页 | `404.html` |

改完 push，等一两分钟硬刷新（Ctrl+F5）。

---

## 四、加一篇新文章

1. 复制 `blog/hello-world.html`，重命名为 `blog/我的文章.html`（**别用中文文件名**，用 `my-post.html` 这种英文更稳）
2. 改文件里的 `<title>`、`<h1>`、`<time>` 日期和正文 `<div class="prose">` 内容
3. 打开 `blog/posts.js`，在数组 `posts` 开头加一条：

```js
{
  title: '我的文章',
  date: '2026-11-10',
  tag: '随笔',
  summary: '一句话摘要。',
  url: 'my-post.html'
},
```

4. 首页"最近写的"是手写的静态卡片，想同步更新就改 `index.html` 的 `#writing` 区

---

## 五、可选：绑定自己的域名

1. 买个域名（阿里云 / 腾讯云 / Cloudflare / Namecheap 都行，`.com` 一年几十块）
2. 仓库 Settings → Pages → **Custom domain** 填 `www.你的域名.com`，Save
3. 到域名商那里加解析：`CNAME` 记录，主机记录 `www`，值 `你的用户名.github.io`
4. 等 DNS 生效，回到 Pages 勾上 **Enforce HTTPS**

GitHub 会在仓库里自动生成 `CNAME` 文件，别删它。
**不要**在没配好域名的情况下删除仓库里的 CNAME，否则自定义域名会掉。

---

## 六、常见问题

**打开是 404**
根目录必须有 `index.html`，且它在仓库**根目录**而不是子文件夹里。Settings → Pages 里也要确认分支是 `main`、目录是 `/ (root)`。

**样式没生效 / 页面很丑**
多半是路径大小写问题。Pages 在 Linux 上运行，`assets/css/style.css` 和 `Assets/CSS/Style.css` 是两回事。
检查 CSS 是否真的上传到了 `assets/css/` 目录下。

**推送后没变化**
Pages 有缓存，最多等 10 分钟；也可以 Ctrl+F5 硬刷新。看仓库 **Actions** 标签页里 `pages build and deployment` 是否成功。

**能放后端吗**
不能。Pages 只提供静态文件，没有 PHP / Python / 数据库。

**免费有什么限制**
软限制约：仓库 1 GB、站点 1 GB、每月 100 GB 流量、每小时 10 次构建。别当图床和视频盘用。

**以后想换工具**
纯静态文件的好处是随时能搬：换成 Hugo / Astro / VitePress 只是重新生成一次文件，域名和仓库都不用动。

**如果这个站点放在项目仓库里（不是 `用户名.github.io`）**
`404.html` 里的 `/assets/...` 和 `/blog/` 是绝对路径，会指到域名根目录。需要改成 `/仓库名/assets/...`。

---

## 目录结构

```
my-github-site/
├── index.html              # 首页
├── 404.html                # 自定义 404
├── .nojekyll               # 跳过 Jekyll 处理（纯静态站点必备）
├── assets/
│   ├── css/style.css       # 全部样式，配色变量在顶部
│   └── js/main.js          # 主题切换 + 年份
├── blog/
│   ├── index.html          # 文章列表页（内容由 posts.js 渲染）
│   ├── posts.js            # 文章清单：加文章只改这里
│   ├── hello-world.html    # 示例文章（兼模板）
│   └── github-pages-notes.html
└── README.md               # 本文件
```

## 出处

GitHub Pages 官方文档：<https://docs.github.com/zh/pages>
