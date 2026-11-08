# 祝蕊 · 个人主页

<https://imzhurui.github.io>

一个静态站点，托管在 GitHub Pages。页面由 `_tools/build.py` 从 `_tools/content/` 生成，不手写 HTML。

## 结构

```
index.html        首页：身份、问题陈述、三个研究问题、最新笔记
research.html     研究问题：每个问题四行（问题 / 为什么难 / 目前看到 / 我卡在）
notes/            笔记：索引按标签分组，每篇有状态与标签
reading.html      在读：按季度归档，条目关联到研究问题
about.html        关于：自述、本学期课程、联系方式
404.html
```

## 内容在哪

```
_tools/content/site.json     站点文字（首页、研究问题、在读、关于、课程）
_tools/content/notes/*.md    笔记（Markdown + 开头几行元信息）
```

改内容不用手改 HTML：双击 `_tools/editor.cmd` 打开本地编辑器，保存后点「发布」即可。

## 笔记的元信息

```
---
title: 标题
date: 2026-11-08
status: 草稿 / 在读 / 完成
tags: 密码学, 隐私计算
summary: 列表里显示的一句话
---
正文……
```

参考放在正文最后的 `## 参考` 一节。

## 发布

编辑器里点「发布」，或命令行：

```
python _tools/build.py
cd my-github-site && git add -A && git commit -m "更新" && git push
```

推送走 `github.com:22`，失败会自动切到 `ssh.github.com:443`。

## 设计

- 两栏：左侧固定身份与导航，右侧阅读；两栏之间一条渐隐细线
- 近白纸底 `#fbfbfa`，单一强调色（随季节换色相，不换底色）
- 版心 34rem，中文正文行高 1.78，笔记正文首行缩进两字
- 粒子随季节变化，强度很低；系统开了「减少动态效果」时全部关闭
