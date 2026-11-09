/* 昼夜：默认按青岛时间，点按钮可以手动锁定。
   网址加 ?phase=night 可临时预览。 */
(function () {
  'use strict';

  var root = document.documentElement;
  var btn = document.querySelector('.phase-toggle');
  var KEYS = ['auto', 'day', 'dusk', 'night', 'late'];
  var LABEL = { day: '白天', dusk: '黄昏', night: '夜间', late: '深夜' };
  var pref = 'auto';

  try {
    var saved = localStorage.getItem('phase');
    if (KEYS.indexOf(saved) >= 0) pref = saved;
  } catch (e) {}

  function qingdaoHour() {
    try {
      var h = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Shanghai', hour: '2-digit', hour12: false
      }).format(new Date());
      return parseInt(h, 10);
    } catch (e) {
      return new Date().getHours();
    }
  }

  function byTime(hour) {
    if (hour >= 6 && hour < 17) return 'day';
    if (hour >= 17 && hour < 19) return 'dusk';
    if (hour >= 19 && hour < 23) return 'night';
    return 'late';
  }

  function urlPhase() {
    var m = /[?&]phase=(day|dusk|night|late)/.exec(
      (window.location && window.location.search) || ''
    );
    return m ? m[1] : null;
  }

  function current() {
    var forced = urlPhase();
    if (forced) return forced;
    if (pref !== 'auto') return pref;
    return byTime(qingdaoHour());
  }

  function label(phase) {
    if (!btn) return;
    var suffix = (pref === 'auto' && !urlPhase()) ? '（自动）' : '';
    btn.textContent = '昼夜 · ' + LABEL[phase] + suffix;
  }

  function apply() {
    var phase = current();
    if (root.dataset.phase !== phase) {
      root.dataset.phase = phase;
      document.dispatchEvent(new CustomEvent('phasechange', { detail: { phase: phase } }));
    }
    label(phase);
  }

  if (btn) {
    btn.addEventListener('click', function () {
      var i = KEYS.indexOf(pref);
      pref = KEYS[(i + 1) % KEYS.length];
      try {
        localStorage.setItem('phase', pref);
      } catch (e) {}
      apply();
    });
  }

  document.addEventListener('resetlayers', function () {
    pref = 'auto';
    apply();
  });

  apply();
  setInterval(apply, 10 * 60 * 1000);
})();
