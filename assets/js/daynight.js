/* 昼夜：按青岛时间给页面加一层很薄的天光。
   日间不动，黄昏偏暖，入夜转冷，深夜最暗。 */
(function () {
  'use strict';

  var root = document.documentElement;
  var phase = 'day';

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

  function resolve(hour) {
    if (hour >= 6 && hour < 17) return 'day';
    if (hour >= 17 && hour < 19) return 'dusk';
    if (hour >= 19 && hour < 23) return 'night';
    return 'late';
  }

  function apply() {
    var next = resolve(qingdaoHour());
    if (next === phase && root.dataset.phase) return;
    phase = next;
    root.dataset.phase = phase;
    document.dispatchEvent(new CustomEvent('phasechange', { detail: { phase: phase } }));
  }

  apply();
  setInterval(apply, 10 * 60 * 1000);
})();
