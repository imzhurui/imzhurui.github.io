/* 主题切换、页脚年份、滚动时轻轻浮起。没有依赖，没有构建。 */
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

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !reduceMotion) {
    var targets = document.querySelectorAll('.section, .article-header, .posts li');
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -5% 0px', threshold: 0.01 }
    );

    targets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = Math.min(i * 50, 200) + 'ms';
      io.observe(el);
    });

    setTimeout(function () {
      targets.forEach(function (el) {
        el.classList.add('in');
      });
    }, 2500);
  }
})();
