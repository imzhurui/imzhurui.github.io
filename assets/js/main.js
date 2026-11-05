/* 极简交互：主题切换 + 页脚年份。没有依赖，没有构建。 */
(function () {
  'use strict';

  var root = document.documentElement;
  var toggle = document.querySelector('.theme-toggle');

  function apply(theme) {
    root.dataset.theme = theme;
    if (toggle) {
      toggle.setAttribute(
        'aria-label',
        theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'
      );
    }
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(next);
      try {
        localStorage.setItem('theme', next);
      } catch (e) {}
    });
  }

  // 用户没手动选过主题时，跟随系统设置变化
  try {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function (e) {
      if (!localStorage.getItem('theme')) {
        apply(e.matches ? 'dark' : 'light');
      }
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  } catch (e) {}

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
