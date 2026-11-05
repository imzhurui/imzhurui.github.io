# 祝蕊 · 个人主页

<https://imzhurui.github.io> —— 一个静态站点，托管在 GitHub Pages。

页面由一个小脚本从 `_tools/content/` 里的文字生成，不手写 HTML。
想改内容，用本机的编辑器（`_tools/editor.cmd`），或者直接改 `_tools/content/` 下的文件再运行 `_tools/build.py`。

## 目录

```
my-github-site/            这个仓库（生成结果，推到 GitHub）
├── index.html             首页
├── blog/
│   ├── index.html         文章列表
│   └── <slug>.html        每篇文章
├── 404.html
├── assets/
│   ├── css/style.css      全部样式
│   └── js/{main,leaves}.js
└── .nojekyll              让 Pages 跳过 Jekyll 处理

_tools/                    本机的工具，不参与上线
├── editor.cmd             双击打开编辑器
├── editor.py              本地编辑器（127.0.0.1:4343）
├── build.py               把 content/ 生成上面的 HTML
├── content/
│   ├── site.json          首页文字
│   └── posts/*.md         文章（Markdown）
├── templates/             style.css / main.js / leaves.js 的源文件
└── mingit/                便携版 git
```

## 改内容

1. 双击 `_tools/editor.cmd`
2. 浏览器打开 `http://127.0.0.1:4343`
3. 改文字 → **保存文字** → **生成预览** 看效果 → **发布到网站**
4. 一两分钟后线上更新

命令行等价操作：

```bash
python _tools/build.py        # 只生成到 my-github-site/
cd my-github-site && git add -A && git commit -m "更新" && git push
```

## 写文章

在编辑器里「+ 新建文章」，正文用 Markdown：

- `## 小标题`、`### 更小的标题`
- `- 列表项`
- `**粗体**`、`*斜体*`、`` `代码` ``
- `[文字](https://链接)`
- `> 引用`
- 空行分段

文件名决定网址：`blog/文件名.html`，只能用英文、数字、连字符。

## 发布设置（GitHub）

- 仓库必须是 `<用户名>.github.io` 且 **Public**
- Settings → Pages → Deploy from a branch → `main` / `/ (root)`
- 推送后最长约 10 分钟生效

改配色：`_tools/templates/style.css` 顶部 `:root` 里的变量，改完重跑 `build.py`。
