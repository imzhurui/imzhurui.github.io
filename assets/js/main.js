/* 主题、季节、页脚年份、滚动入场。没有依赖，没有构建。 */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------------- 深浅色 ---------------- */

  var toggle = document.querySelector('.theme-toggle');

  function applyTheme(theme) {
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
      applyTheme(next);
      try {
        localStorage.setItem('theme', next);
      } catch (e) {}
    });
  }

  try {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onThemeChange = function (e) {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };
    if (mq.addEventListener) mq.addEventListener('change', onThemeChange);
    else if (mq.addListener) mq.addListener(onThemeChange);
  } catch (e) {}

  /* ---------------- 季节 ---------------- */

  var SEASONS = ['spring', 'summer', 'autumn', 'winter'];
  var SEASON_LABEL = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };

  function autoSeason() {
    var m = new Date().getMonth() + 1;
    if (m >= 3 && m <= 5) return 'spring';
    if (m >= 6 && m <= 8) return 'summer';
    if (m >= 9 && m <= 11) return 'autumn';
    return 'winter';
  }

  var seasonBtn = document.querySelector('.season-toggle');
  var pref = 'auto';
  try {
    var saved = localStorage.getItem('season');
    if (saved && (saved === 'auto' || SEASONS.indexOf(saved) >= 0)) pref = saved;
  } catch (e) {}

  function applySeason(next) {
    pref = next;
    var real = next === 'auto' ? autoSeason() : next;
    root.dataset.season = real;
    if (seasonBtn) {
      seasonBtn.textContent = '季节 · ' + SEASON_LABEL[real] + (next === 'auto' ? '（自动）' : '');
      seasonBtn.setAttribute('aria-label', '切换季节，现在是' + SEASON_LABEL[real]);
    }

    var kicker = document.querySelector('.kicker');
    if (kicker) {
      var mark = kicker.querySelector('.season-mark');
      if (!mark) {
        kicker.appendChild(document.createTextNode(' · '));
        mark = document.createElement('span');
        mark.className = 'season-mark';
        kicker.appendChild(mark);
      }
      mark.textContent = SEASON_LABEL[real];
    }
  }

  applySeason(pref);

  if (seasonBtn) {
    seasonBtn.addEventListener('click', function () {
      var next;
      if (pref === 'auto') next = 'spring';
      else if (pref === 'spring') next = 'summer';
      else if (pref === 'summer') next = 'autumn';
      else if (pref === 'autumn') next = 'winter';
      else next = 'auto';
      applySeason(next);
      try {
        localStorage.setItem('season', next);
      } catch (e) {}
      // 通知粒子层换季节
      document.dispatchEvent(
        new CustomEvent('seasonchange', { detail: { season: root.dataset.season } })
      );
    });
  }

  /* ---------------- 年份 ---------------- */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------------- 滚动入场 ---------------- */

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

  /* ---------------- 顶部阅读进度 ---------------- */

  var bar = document.querySelector('.progress');
  if (bar) {
    var updateBar = function () {
      var el = document.documentElement;
      var max = el.scrollHeight - el.clientHeight;
      var ratio = max > 0 ? el.scrollTop / max : 0;
      ratio = Math.min(1, Math.max(0, ratio));
      bar.style.transform = 'scaleX(' + ratio + ')';
    };
    document.addEventListener('scroll', updateBar, { passive: true });
    window.addEventListener('resize', updateBar);
    updateBar();
  }

  /* ---------------- 跟随鼠标的柔光 ---------------- */

  var spot = document.querySelector('.spotlight');
  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (spot && finePointer && !reduceMotion) {
    var rafId = null;
    var move = function (e) {
      if (rafId) return;
      rafId = window.requestAnimationFrame(function () {
        spot.style.setProperty('--mx', e.clientX + 'px');
        spot.style.setProperty('--my', e.clientY + 'px');
        rafId = null;
      });
      if (!spot.classList.contains('on')) spot.classList.add('on');
    };
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('mouseleave', function () { spot.classList.remove('on'); });
  }
})();
