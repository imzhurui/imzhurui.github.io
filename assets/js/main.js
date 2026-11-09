/* 主题、季节、页脚年份、滚动入场。没有依赖，没有构建。 */
(function () {
  'use strict';

  var root = document.documentElement;

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

  var pref = 'auto';
  try {
    var savedSeason = localStorage.getItem('season');
    if (savedSeason && (savedSeason === 'auto' || SEASONS.indexOf(savedSeason) >= 0)) pref = savedSeason;
  } catch (e) {}

  function applySeason(next) {
    pref = next;
    var real = next === 'auto' ? autoSeason() : next;
    root.dataset.season = real;

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

  /* ---------------- 氛围面板 ---------------- */

  var layersBtn = document.querySelector('.layers-toggle');
  var panel = document.querySelector('.layers-panel');
  var opts = document.querySelectorAll('.opt');
  var autoBtn = document.querySelector('.layer-auto');

  var LAYER_LABEL = {
    season: { spring: '春', summer: '夏', autumn: '秋', winter: '冬' },
    phase: { day: '白天', dusk: '黄昏', night: '夜间', late: '深夜' },
    weather: { sunny: '晴', cloudy: '多云', overcast: '阴', rain: '雨', snow: '雪' }
  };

  function currentOf(layer) {
    if (layer === 'season') return root.dataset.season;
    if (layer === 'phase') return root.dataset.phase;
    return root.dataset.weather;
  }

  function updateLayersBtn() {
    if (layersBtn) {
      var s = LAYER_LABEL.season[root.dataset.season] || '—';
      var w = LAYER_LABEL.weather[root.dataset.weather] || '—';
      var p = LAYER_LABEL.phase[root.dataset.phase] || '—';
      layersBtn.textContent = s + ' · ' + w + ' · ' + p;
      layersBtn.setAttribute('title', '当前：' + s + ' / ' + w + ' / ' + p + '，点开可改');
    }

    for (var i = 0; i < opts.length; i++) {
      var opt = opts[i];
      var on = currentOf(opt.dataset.layer) === opt.dataset.value;
      opt.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function remember(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  }

  if (layersBtn && panel) {
    layersBtn.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
      if (!panel.hidden) updateLayersBtn();
    });

    for (var k = 0; k < opts.length; k++) {
      opts[k].addEventListener('click', function () {
        var layer = this.dataset.layer;
        var value = this.dataset.value;

        if (layer === 'season') {
          remember('season', value);
          applySeason(value);
          document.dispatchEvent(
            new CustomEvent('seasonchange', { detail: { season: root.dataset.season } })
          );
        } else if (layer === 'phase') {
          remember('phase', value);
          root.dataset.phase = value;
          document.dispatchEvent(new CustomEvent('applylayers', { detail: { phase: value } }));
        } else {
          remember('weather', value);
          root.dataset.weather = value;
          document.dispatchEvent(new CustomEvent('applylayers', { detail: { weather: value } }));
        }

        updateLayersBtn();
      });
    }

    if (autoBtn) {
      autoBtn.addEventListener('click', function () {
        remember('season', 'auto');
        remember('phase', 'auto');
        remember('weather', 'auto');
        applySeason('auto');
        document.dispatchEvent(
          new CustomEvent('seasonchange', { detail: { season: root.dataset.season } })
        );
        document.dispatchEvent(new CustomEvent('resetlayers'));
        panel.hidden = true;
        updateLayersBtn();
      });
    }
  }

  document.addEventListener('seasonchange', updateLayersBtn);
  document.addEventListener('phasechange', updateLayersBtn);
  document.addEventListener('weatherchange', updateLayersBtn);
  updateLayersBtn();

  /* ---------------- 年份 ---------------- */  /* ---------------- 年份 ---------------- */  /* ---------------- 年份 ---------------- */

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

})();
