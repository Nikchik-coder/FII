// amr.js - Adaptive Mesh Refinement demonstration
// Shows nested refinement levels tracking a draggable black hole
(function () {
    var canvas, ctx, W, H, running = false;
    var animFrame;
    var time = 0;

    var bhX = 0.5, bhY = 0.5;
    var dragging = false;

    var LEVELS = [
        { n:  8, frac: 1.0,  color: 'rgba(255,255,255,', alpha: 0.08, label: 'Level 0: \u0394x'   },
        { n: 16, frac: 0.50, color: 'rgba(0,220,255,',   alpha: 0.15, label: 'Level 1: \u0394x/2'  },
        { n: 32, frac: 0.26, color: 'rgba(80,230,120,',  alpha: 0.20, label: 'Level 2: \u0394x/4'  },
        { n: 64, frac: 0.13, color: 'rgba(255,220,70,',  alpha: 0.25, label: 'Level 3: \u0394x/8'  }
    ];

    // Domain fills the canvas with small margins
    function domainRect() {
        var infoW = 150; // space for the info panel on the left
        var pad = 12;
        var domW = W - infoW - pad * 2;
        var domH = H - pad * 2 - 16; // 16px for bottom hint text
        var size = Math.min(domW, domH);
        // Centre the square domain in the right portion of the canvas
        var x = infoW + (domW - size) / 2 + pad;
        var y = pad + (domH - size) / 2;
        return { x: x, y: y, s: size };
    }

    function canvasPos(e) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = W / rect.width;
        var scaleY = H / rect.height;
        return { cx: (e.clientX - rect.left) * scaleX, cy: (e.clientY - rect.top) * scaleY };
    }

    function pxToBH(cx, cy) {
        var d = domainRect();
        bhX = Math.max(0.05, Math.min(0.95, (cx - d.x) / d.s));
        bhY = Math.max(0.05, Math.min(0.95, (cy - d.y) / d.s));
    }

    function isNearBH(cx, cy) {
        var d = domainRect();
        var bx = d.x + bhX * d.s;
        var by = d.y + bhY * d.s;
        var dx = cx - bx, dy = cy - by;
        return dx * dx + dy * dy < 50 * 50;
    }

    function onDown(e) {
        var p = canvasPos(e);
        if (isNearBH(p.cx, p.cy)) { dragging = true; pxToBH(p.cx, p.cy); }
    }
    function onMove(e) {
        if (!dragging) return;
        var p = canvasPos(e);
        pxToBH(p.cx, p.cy);
    }
    function onUp() { dragging = false; }
    function onTouchStart(e) {
        e.preventDefault();
        var rect = canvas.getBoundingClientRect();
        var scaleX = W / rect.width;
        var scaleY = H / rect.height;
        var cx = (e.touches[0].clientX - rect.left) * scaleX;
        var cy = (e.touches[0].clientY - rect.top) * scaleY;
        if (isNearBH(cx, cy)) { dragging = true; pxToBH(cx, cy); }
    }
    function onTouchMove(e) {
        e.preventDefault();
        if (!dragging) return;
        var rect = canvas.getBoundingClientRect();
        var scaleX = W / rect.width;
        var scaleY = H / rect.height;
        pxToBH((e.touches[0].clientX - rect.left) * scaleX,
               (e.touches[0].clientY - rect.top) * scaleY);
    }

    function init() {
        canvas = document.getElementById('amrCanvas');
        if (!canvas) return;
        var container = document.getElementById('amrContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');

        bhX = 0.5; bhY = 0.5;

        canvas.addEventListener('mousedown', onDown);
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseup', onUp);
        canvas.addEventListener('mouseleave', onUp);
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', onUp);

        running = true;
        time = 0;
        animate();
    }

    function drawGrid(rx, ry, rs, n, color, alpha) {
        ctx.strokeStyle = color + alpha + ')';
        ctx.lineWidth = 0.5;
        var step = rs / n;
        ctx.beginPath();
        for (var i = 0; i <= n; i++) {
            var off = i * step;
            ctx.moveTo(rx + off, ry);
            ctx.lineTo(rx + off, ry + rs);
            ctx.moveTo(rx, ry + off);
            ctx.lineTo(rx + rs, ry + off);
        }
        ctx.stroke();
    }

    function drawLevelBorder(rx, ry, rs, color, alpha) {
        ctx.strokeStyle = color + Math.min(alpha * 2.5, 0.6) + ')';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(rx, ry, rs, rs);
        ctx.setLineDash([]);
    }

    function drawBlackHole(bx, by) {
        var g1 = ctx.createRadialGradient(bx, by, 0, bx, by, 28);
        g1.addColorStop(0, 'rgba(80, 60, 200, 0.25)');
        g1.addColorStop(0.5, 'rgba(40, 20, 120, 0.10)');
        g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(bx, by, 28, 0, Math.PI * 2);
        ctx.fillStyle = g1;
        ctx.fill();

        var g2 = ctx.createRadialGradient(bx, by, 0, bx, by, 10);
        g2.addColorStop(0, 'rgba(0, 0, 0, 1)');
        g2.addColorStop(0.6, 'rgba(10, 5, 30, 0.95)');
        g2.addColorStop(1, 'rgba(30, 15, 60, 0)');
        ctx.beginPath();
        ctx.arc(bx, by, 10, 0, Math.PI * 2);
        ctx.fillStyle = g2;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(bx, by, 12, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(160, 130, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    function computeTotalCells() {
        var total = 0;
        for (var i = 0; i < LEVELS.length; i++) {
            var c = Math.round(LEVELS[i].n * LEVELS[i].frac);
            total += c * c;
        }
        return total;
    }

    function drawInfoPanel() {
        var px = 10, py = 14;
        ctx.textAlign = 'left';
        ctx.font = '9px JetBrains Mono, monospace';

        for (var i = 0; i < LEVELS.length; i++) {
            var lv = LEVELS[i];
            var ly = py + i * 15;
            ctx.fillStyle = lv.color + '0.7)';
            ctx.fillRect(px, ly - 3, 10, 3);
            ctx.fillStyle = lv.color + '0.55)';
            ctx.fillText(lv.label, px + 16, ly);
        }

        var totalCells = computeTotalCells();
        var uniformFine = 512 * 512;
        var by = py + LEVELS.length * 15 + 8;
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255, 220, 70, 0.55)';
        ctx.fillText('AMR:  ~' + totalCells.toLocaleString() + ' cells', px, by);
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fillText('Uniform: ~' + uniformFine.toLocaleString(), px, by + 13);
    }

    function animate() {
        if (!running) return;
        animFrame = requestAnimationFrame(animate);
        time++;
        ctx.clearRect(0, 0, W, H);

        var d = domainRect();
        var bx = d.x + bhX * d.s;
        var by = d.y + bhY * d.s;

        // Draw each refinement level
        for (var i = 0; i < LEVELS.length; i++) {
            var lv = LEVELS[i];
            var halfSize = (d.s * lv.frac) / 2;

            var rx, ry, rs;
            if (i === 0) {
                rx = d.x; ry = d.y; rs = d.s;
            } else {
                rx = Math.max(d.x, bx - halfSize);
                ry = Math.max(d.y, by - halfSize);
                rs = d.s * lv.frac;
                if (rx + rs > d.x + d.s) rx = d.x + d.s - rs;
                if (ry + rs > d.y + d.s) ry = d.y + d.s - rs;
            }

            // Pulse finest level
            var a = lv.alpha;
            if (i === LEVELS.length - 1) {
                a += 0.06 * Math.sin(time * 0.06);
            }

            drawGrid(rx, ry, rs, lv.n, lv.color, a);
            if (i > 0) drawLevelBorder(rx, ry, rs, lv.color, lv.alpha);
        }

        drawBlackHole(bx, by);
        drawInfoPanel();

        // Drag hint
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.textAlign = 'center';
        ctx.fillText('drag the black hole', d.x + d.s / 2, d.y + d.s + 14);
    }

    window.initAnim_amr = function () {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(init, 150);
    };
})();
