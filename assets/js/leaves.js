/* 飘落的叶子：一层很轻的 canvas，画在文字后面。
   尊重系统的「减少动态效果」设置；标签页隐藏时自动停下。 */
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
  var leaves = [];
  var raf = null;
  var lastT = 0;
  var resizeTimer = null;

  var PALETTE = ['#b8693c', '#c78e50', '#9a7442', '#a9482c', '#7c8352', '#cba46b'];

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeLeaf(spread) {
    return {
      baseX: rand(0, W),
      x: 0,
      y: spread ? rand(-H, H) : rand(-H * 0.6, -20),
      size: rand(4, 9),
      vy: rand(0.15, 0.45),
      sway: rand(12, 38),
      phase: rand(0, Math.PI * 2),
      spin: rand(0, Math.PI * 2),
      spinV: rand(0.004, 0.012),
      rot: rand(0, Math.PI * 2),
      rotV: rand(-0.005, 0.005),
      alpha: rand(0.16, 0.4),
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)]
    };
  }

  function targetCount() {
    return Math.max(6, Math.min(13, Math.round(W / 140)));
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
    while (leaves.length < want) leaves.push(makeLeaf(true));
    if (leaves.length > want) leaves.length = want;
  }

  function drawLeaf(l) {
    var s = l.size;
    ctx.save();
    ctx.globalAlpha = l.alpha;
    ctx.translate(l.x, l.y);
    ctx.rotate(l.rot);
    ctx.scale(Math.cos(l.spin), 1);

    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.95, -s * 0.45, s * 0.55, s * 0.78, 0, s);
    ctx.bezierCurveTo(-s * 0.55, s * 0.78, -s * 0.95, -s * 0.45, 0, -s);
    ctx.fillStyle = l.color;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -s * 0.78);
    ctx.quadraticCurveTo(s * 0.12, 0, 0, s * 0.78);
    ctx.strokeStyle = 'rgba(255, 250, 240, 0.3)';
    ctx.lineWidth = 0.7;
    ctx.stroke();

    ctx.restore();
  }

  function tick(t) {
    if (!lastT) lastT = t;
    var dt = Math.min(t - lastT, 48);
    lastT = t;
    var k = dt / 16.67;

    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < leaves.length; i++) {
      var l = leaves[i];
      l.y += l.vy * k;
      l.spin += l.spinV * k;
      l.rot += l.rotV * k;
      l.x = l.baseX + Math.sin(t * 0.00045 + l.phase) * l.sway;

      if (l.y - l.size > H) {
        l.y = -l.size - rand(20, 160);
        l.baseX = rand(-20, W + 20);
        l.alpha = rand(0.16, 0.4);
        l.size = rand(4, 9);
        l.vy = rand(0.15, 0.45);
      }

      drawLeaf(l);
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

  resize();
  start();

  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 160);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });
})();
