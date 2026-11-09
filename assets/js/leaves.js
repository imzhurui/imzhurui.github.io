/* 四季粒子：春落樱、夏流萤、秋飘叶、冬飞雪。
   画在文字后面的一层 canvas；尊重「减少动态效果」；标签页隐藏时停下。 */
(function () {
  'use strict';

  var canvas = document.getElementById('leaves');
  if (!canvas || !canvas.getContext) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce && reduce.matches) return;

  var ctx = canvas.getContext('2d');
  var TAU = Math.PI * 2;
  var dpr = 1;
  var W = 0;
  var H = 0;
  var parts = [];
  var raf = null;
  var lastT = 0;
  var resizeTimer = null;
  var MODE = 'leaf';
  var glow = null;

  var CFG = {
    sakura: {
      colors: ['#f7c6d5', '#fbdce6', '#f2b3c7', '#fde9f0', '#f9d2de'],
      size: [4, 8], vy: [0.07, 0.26], sway: [22, 60], alpha: [0.65, 0.95],
      spinV: [0.012, 0.03], rotV: [-0.004, 0.004],
      step: 20, min: 22, max: 90
    },
    firefly: {
      colors: ['#ffe9a8', '#e9ffb4', '#fff4c8'],
      size: [1.4, 2.6], vy: [0.02, 0.08], sway: [12, 34], alpha: [0.6, 1],
      spinV: [0, 0], rotV: [0, 0],
      step: 30, min: 16, max: 62
    },
    leaf: {
      colors: ['#c98c63', '#d3a173', '#b57c55', '#c07a5e', '#a98a6a'],
      size: [4, 9], vy: [0.12, 0.5], sway: [8, 32], alpha: [0.3, 0.58],
      spinV: [0.03, 0.07], rotV: [-0.02, 0.02],
      step: 24, min: 20, max: 72
    },
    snow: {
      colors: ['#ffffff', '#f4f9ff', '#e8f2ff', '#dbe9fb'],
      size: [2.2, 5], vy: [0.3, 0.9], sway: [0, 2], alpha: [0.8, 1],
      spinV: [0, 0], rotV: [0, 0],
      step: 16, min: 30, max: 110
    }
  };

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeGlow() {
    var s = 64;
    var c = document.createElement('canvas');
    c.width = c.height = s;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grd.addColorStop(0, 'rgba(255, 240, 180, 1)');
    grd.addColorStop(0.25, 'rgba(255, 232, 160, 0.75)');
    grd.addColorStop(0.6, 'rgba(255, 226, 140, 0.18)');
    grd.addColorStop(1, 'rgba(255, 226, 140, 0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, s, s);
    return c;
  }

  function cfg() { return CFG[MODE] || CFG.leaf; }

  function makeParticle(spread) {
    var c = cfg();
    return {
      baseX: rand(-10, W + 10),
      x: 0,
      y: spread ? rand(-H, H) : rand(-H * 0.5, -20),
      size: rand(c.size[0], c.size[1]),
      vy: rand(c.vy[0], c.vy[1]),
      sway: rand(c.sway[0], c.sway[1]),
      vx: rand(-0.22, 0.22),
      phase: rand(0, TAU),
      spin: rand(0, TAU),
      spinV: rand(c.spinV[0], c.spinV[1]),
      rot: rand(0, TAU),
      rotV: rand(c.rotV[0], c.rotV[1]),
      pulse: rand(0.0007, 0.0018),
      alpha: rand(c.alpha[0], c.alpha[1]),
      color: c.colors[Math.floor(Math.random() * c.colors.length)]
    };
  }

  function targetCount() {
    var c = cfg();
    return Math.max(c.min, Math.min(c.max, Math.round(W / c.step)));
  }

  function respawn(p) {
    var c = cfg();
    p.baseX = rand(-10, W + 10);
    p.y = -p.size - rand(20, 160);
    p.size = rand(c.size[0], c.size[1]);
    p.vy = rand(c.vy[0], c.vy[1]);
    p.alpha = rand(c.alpha[0], c.alpha[1]);
    p.color = c.colors[Math.floor(Math.random() * c.colors.length)];
  }

  /* ---------------- 形状 ---------------- */

  function drawSakura(p) {
    var s = p.size;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.95, -s * 0.5, s * 0.7, s * 0.55, 0, s * 0.7);
    ctx.bezierCurveTo(-s * 0.7, s * 0.55, -s * 0.95, -s * 0.5, 0, -s);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.55);
    ctx.lineTo(0, s * 0.45);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  function drawLeaf(p) {
    var s = p.size;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.95, -s * 0.45, s * 0.55, s * 0.78, 0, s);
    ctx.bezierCurveTo(-s * 0.55, s * 0.78, -s * 0.95, -s * 0.45, 0, -s);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.78);
    ctx.quadraticCurveTo(s * 0.12, 0, 0, s * 0.78);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }

  function drawSnow(p) {
    ctx.beginPath();
    ctx.arc(0, 0, p.size * 0.55, 0, TAU);
    ctx.fillStyle = p.color;
    ctx.fill();
  }

  function drawFirefly(p, t) {
    if (!glow) glow = makeGlow();
    var pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * p.pulse + p.phase));
    var size = p.size * 9 * (0.85 + 0.3 * pulse);
    ctx.globalAlpha = p.alpha * pulse;
    ctx.drawImage(glow, -size / 2, -size / 2, size, size);
    ctx.globalAlpha = p.alpha * pulse * 0.9;
    ctx.beginPath();
    ctx.arc(0, 0, p.size * 0.5, 0, TAU);
    ctx.fillStyle = '#fffbe6';
    ctx.fill();
  }

  /* ---------------- 运动 ---------------- */

  function update(p, t, k) {
    if (MODE === 'firefly') {
      p.baseX += p.vx * k;
      p.y += (Math.sin(t * 0.0006 + p.phase) * 0.22 + p.vy * 0.5) * k;
      if (p.baseX < -24) p.baseX = W + 24;
      if (p.baseX > W + 24) p.baseX = -24;
      if (p.y < -30) p.y = H + 24;
      if (p.y > H + 30) p.y = -24;
      p.x = p.baseX + Math.sin(t * 0.0007 + p.phase) * p.sway;
      return;
    }

    p.y += p.vy * k;
    if (MODE !== 'snow') {
      p.spin += p.spinV * k;
      p.rot += p.rotV * k;
    }
    p.x = p.baseX + (MODE === 'snow' ? 0 : Math.sin(t * 0.00045 + p.phase) * p.sway);
    if (p.y - p.size > H) respawn(p);
  }

  function draw(p, t) {
    ctx.save();
    ctx.translate(p.x, p.y);
    if (MODE === 'firefly') {
      drawFirefly(p, t);
      ctx.restore();
      return;
    }
    ctx.globalAlpha = p.alpha;
    ctx.rotate(p.rot);
    if (MODE !== 'snow') ctx.scale(Math.cos(p.spin), 1);
    if (MODE === 'sakura') drawSakura(p);
    else if (MODE === 'snow') drawSnow(p);
    else drawLeaf(p);
    ctx.restore();
  }

  function tick(t) {
    if (!lastT) lastT = t;
    var dt = Math.min(t - lastT, 48);
    lastT = t;
    var k = dt / 16.67;

    ctx.clearRect(0, 0, W, H);
    if (MODE === 'firefly') ctx.globalCompositeOperation = 'lighter';

    for (var i = 0; i < parts.length; i++) {
      update(parts[i], t, k);
      draw(parts[i], t);
    }

    ctx.globalCompositeOperation = 'source-over';
    raf = window.requestAnimationFrame(tick);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var want = targetCount();
    parts.length = Math.min(parts.length, want);
    while (parts.length < want) parts.push(makeParticle(true));
  }

  var SEASON_MODE = { spring: 'sakura', summer: 'firefly', autumn: 'leaf', winter: 'snow' };

  function setSeason(name) {
    MODE = SEASON_MODE[name] || 'leaf';
    parts.length = 0;
    resize();
  }

  function start() {
    if (raf) return;
    lastT = 0;
    raf = window.requestAnimationFrame(tick);
  }

  function stop() {
    if (raf) {
      window.cancelAnimationFrame(raf);
      raf = null;
    }
  }

  setSeason(document.documentElement.dataset.season || 'leaf');
  start();

  document.addEventListener('seasonchange', function (e) {
    setSeason(e.detail && e.detail.season);
  });

  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 160);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });
})();
