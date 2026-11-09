/* 青岛的实时天气：拿到就叠加到页面上，拿不到就交给季节默认。
   数据来自 Open-Meteo（免费、无需 key），缓存 30 分钟。 */
(function () {
  'use strict';

  var root = document.documentElement;
  var note = document.querySelector('.weather-note');
  var CACHE_KEY = 'qingdao-weather-v1';
  var TTL = 30 * 60 * 1000;
  var LABEL = { sunny: '晴', cloudy: '多云', overcast: '阴', rain: '雨', snow: '雪' };

  function mapCode(code) {
    if (code === 0) return 'sunny';
    if (code === 1 || code === 2) return 'cloudy';
    if (code === 3 || code === 45 || code === 48) return 'overcast';
    if (code >= 51 && code <= 67) return 'rain';
    if (code >= 71 && code <= 77) return 'snow';
    if (code >= 80 && code <= 82) return 'rain';
    if (code === 85 || code === 86) return 'snow';
    if (code >= 95) return 'rain';
    return 'cloudy';
  }

  function apply(kind, temp) {
    root.dataset.weather = kind;
    if (note) {
      var text = '青岛 · ' + (LABEL[kind] || '');
      if (typeof temp === 'number') text += ' ' + Math.round(temp) + '°';
      note.textContent = text;
      note.hidden = false;
    }
    document.dispatchEvent(new CustomEvent('weatherchange', { detail: { weather: kind } }));
  }

  function fromCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || Date.now() - obj.t > TTL) return null;
      return obj;
    } catch (e) {
      return null;
    }
  }

  var hit = fromCache();
  if (hit) {
    apply(hit.kind, hit.temp);
    return;
  }

  if (!window.fetch) return;

  var url = 'https://api.open-meteo.com/v1/forecast' +
    '?latitude=36.0671&longitude=120.3826' +
    '&current=temperature_2m,weather_code&timezone=Asia%2FShanghai';

  fetch(url, { mode: 'cors' }).then(function (r) {
    return r.json();
  }).then(function (data) {
    var cur = (data && data.current) || {};
    var kind = mapCode(Number(cur.weather_code));
    var temp = typeof cur.temperature_2m === 'number' ? cur.temperature_2m : null;
    apply(kind, temp);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), kind: kind, temp: temp }));
    } catch (e) {}
  }).catch(function () {
    root.dataset.weather = '';
  });
})();
