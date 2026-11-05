/* 随季节变化的粒子：春花瓣、夏绿叶、秋落叶、冬小雪。
   画在文字后面的一层 canvas，尊重「减少动态效果」，标签页隐藏时自动停下。 */
(function () {
  'use strict';

  var canvas = document.getElementById('leaves');
  if (!canvas || !canvas.getContext) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce && reduce.matches) return;

  var ctx = canvas.getContext('2d');
  var dpr = 1;
  var W = 0;
  var H = 0;
  var parts = [];
  var raf = null;
  var lastT = 0;
  var resizeTimer = null;

  var MODE = 'leaf';
  var PALETTE = ['#b8693c'];
  var SHAPE = drawLeaf;

  var MODES = { spring: 'petal', summer: 'leaf', autumn: 'leaf', winter: 'snow' };
  var PALETTES = {
    spring: ['#e7b6c3', '#f1d2da', '#dda3b3', '#f6e3d8'],
    summer: ['#7fa06a', '#8fae76', '#6f8f5c', '#a6bb8c'],
    autumn: ['#b8693c', '#c78e50', '#9a7442', '#a9482c', '#7c8352', '#cba46b'],
    winter: ['#c3cfdd', '#b2c0d1', '#d3dde8', '#a9b8c9']
  };

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeParticle(spread) {
    var size, vy, alpha;
    if (MODE === 'snow') {
      size = rand(1.6, 3.8);
      vy = rand(0.22, 0.7);
      alpha = rand(0.3, 0.7);
    } else if (MODE === 'petal') {
      size = rand(3, 6);
      vy = rand(0.12, 0.34);
      alpha = rand(0.4, 0.7);
    } else {
      size = rand(4, 9);
      vy = rand(0.15, 0.45);
      alpha = rand(0.16, 0.4);
    }

    return {
      baseX: rand(0, W),
      x: 0,
      y: spread ? rand(-H, H) : rand(-H * 0.6, -20),
      size: size,
      vy: vy,
      sway: rand(10, 38),
      phase: rand(0, Math.PI * 2),
      spin: rand(0, Math.PI * 2),
      spinV: rand(0.004, 0.012),
      rot: rand(0, Math.PI * 2),
      rotV: rand(-0.005, 0.005),
      alpha: alpha,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)]
    };
  }

  function targetCount() {
    return Math.max(6, Math.min(14, Math.round(W / 135)));
  }

  function drawLeaf(s) {
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.95, -s * 0.45, s * 0.55, s * 0.78, 0, s);
    ctx.bezierCurveTo(-s * 0.55, s * 0.78, -s * 0.95, -s * 0.45, 0, -s);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -s * 0.78);
    ctx.quadraticCurveTo(s * 0.12, 0, 0, s * 0.78);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }

  function drawPetal(s) {
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.55, s, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  function drawSnow(s) {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
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
    while (parts.length < want) parts.push(makeParticle(true));
    if (parts.length > want) parts.length = want;
  }

  function setSeason(name) {
    MODE = MODES[name] || 'leaf';
    PALETTE = PALETTES[name] || PALETTES.autumn;
    SHAPE = MODE === 'snow' ? drawSnow : (MODE === 'petal' ? drawPetal : drawLeaf);
    parts.length = 0;
    resize();
  }

  function draw(p) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    if (MODE !== 'snow') ctx.scale(Math.cos(p.spin), 1);
    SHAPE.call(p, p.size);
    ctx.restore();
  }

  function tick(t) {
    if (!lastT) lastT = t;
    var dt = Math.min(t - lastT, 48);
    lastT = t;
    var k = dt / 16.67;

    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.y += p.vy * k;
      p.spin += p.spinV * k;
      p.rot += p.rotV * k;
      p.x = p.baseX + Math.sin(t * 0.00045 + p.phase) * p.sway;

      if (p.y - p.size > H) {
        p.y = -p.size - rand(20, 160);
        p.baseX = rand(-20, W + 20);
      }

      draw(p);
    }

    raf = window.requestAnimationFrame(tick);
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

  setSeason(document.documentElement.dataset.season || 'autumn');
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
