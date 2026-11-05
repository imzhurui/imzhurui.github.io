/* =========================================================
   文章清单 —— 新增文章只需要在这里加一条。
   字段：title 标题 / date 日期(YYYY-MM-DD) / tag 分类 /
          summary 摘要 / url 文件名
   ========================================================= */
(function () {
  'use strict';

  var posts = [
    {
      title: '我为什么要有一个自己的网站',
      date: '2026-11-05',
      tag: '随笔',
      summary: '社交平台上的内容属于平台，只有自己的域名和仓库才是自己的。这篇写我决定动手的原因。',
      url: 'hello-world.html'
    },
    {
      title: 'GitHub Pages 是怎么工作的',
      date: '2026-11-01',
      tag: '教程',
      summary: '把一堆文件 push 上去，几分钟后就有了网址——中间发生了什么，以及怎么少踩坑。',
      url: 'github-pages-notes.html'
    }
  ];

  var list = document.getElementById('post-list');
  var empty = document.getElementById('post-empty');
  if (!list) return;

  var sorted = posts.slice().sort(function (a, b) {
    return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
  });

  if (!sorted.length) {
    list.hidden = true;
    if (empty) empty.hidden = false;
    return;
  }

  sorted.forEach(function (post) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.className = 'post-item';
    a.href = post.url;

    var meta = document.createElement('p');
    meta.className = 'post-meta';
    meta.textContent = post.date + ' · ' + post.tag;

    var h2 = document.createElement('h2');
    h2.textContent = post.title;

    var p = document.createElement('p');
    p.textContent = post.summary || '';

    a.appendChild(meta);
    a.appendChild(h2);
    if (post.summary) a.appendChild(p);
    li.appendChild(a);
    list.appendChild(li);
  });
})();
