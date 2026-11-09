/* 天气：默认取青岛实时天气（Open-Meteo），点按钮可以手动锁定。 */
(function () {
  'use strict';

  var root = document.documentElement;
  var btn = document.querySelector('.weather-toggle');
  var KEYS = ['auto', 'sunny', 'cloudy', 'overcast', 'rain', 'snow'];
  var LABEL = { sunny: '晴', cloudy: '多云', overcast: '阴', rain: '雨', snow: '雪' };
  var CACHE_KEY = 'qingdao-weather-v1';
  var TTL = 30 * 60 * 1000;
  var pref = 'auto';
  var temp = null;

  try {
    var saved = localStorage.getItem('weather');
    if (KEYS.indexOf(saved) >= 0) pref = saved;
  } catch (e) {}

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

  function label(kind) {
    if (!btn) return;
    var text = '天气 · ' + (LABEL[kind] || '—');
    if (pref === 'auto' && typeof temp === 'number') text += ' ' + Math.round(temp) + '°';
    if (pref !== 'auto') text += '（手动）';
    btn.textContent = text;
  }

  function apply(kind) {
    root.dataset.weather = kind || '';
    label(kind);
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

  function fetchWeather() {
    if (!window.fetch) return;
    var url = 'https://api.open-meteo.com/v1/forecast' +
      '?latitude=36.0671&longitude=120.3826' +
      '&current=temperature_2m,weather_code&timezone=Asia%2FShanghai';

    fetch(url, { mode: 'cors' }).then(function (r) {
      return r.json();
    }).then(function (data) {
      if (pref !== 'auto') return;
      var cur = (data && data.current) || {};
      temp = typeof cur.temperature_2m === 'number' ? cur.temperature_2m : null;
      apply(mapCode(Number(cur.weather_code)));
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          t: Date.now(), kind: root.dataset.weather, temp: temp
        }));
      } catch (e) {}
    }).catch(function () {
      if (pref === 'auto') root.dataset.weather = '';
    });
  }

  function refresh() {
    if (pref !== 'auto') {
      apply(pref);
      return;
    }
    var hit = fromCache();
    if (hit) {
      temp = typeof hit.temp === 'number' ? hit.temp : null;
      apply(hit.kind);
      return;
    }
    fetchWeather();
  }

  if (btn) {
    btn.addEventListener('click', function () {
      var i = KEYS.indexOf(pref);
      pref = KEYS[(i + 1) % KEYS.length];
      try {
        localStorage.setItem('weather', pref);
      } catch (e) {}
      temp = null;
      refresh();
    });
  }

  refresh();
})();
