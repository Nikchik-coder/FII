// amr.js - Adaptive Mesh Refinement demonstration
// Shows nested refinement levels tracking a draggable black hole
(function () {
    let canvas, ctx, W, H, running = false;
    let animFrame;
    let time = 0;

    // Black hole position (normalised 0-1 within the domain)
    let bhX = 0.5, bhY = 0.5;
    let dragging = false;

    // Domain padding (px) so labels don't clip
    const PAD = 40;

    // Refinement levels: fraction of domain each level covers
    const LEVELS = [
        { n:  8, frac: 1.0,  color: 'rgba(255,255,255,', alpha: 0.08, label: 'Level 0: \u0394x'   },
        { n: 16, frac: 0.50, color: 'rgba(0,220,255,',   alpha: 0.15, label: 'Level 1: \u0394x/2'  },
        { n: 32, frac: 0.26, color: 'rgba(80,230,120,',  alpha: 0.20, label: 'Level 2: \u0394x/4'  },
        { n: 64, frac: 0.13, color: 'rgba(255,220,70,',  alpha: 0.25, label: 'Level 3: \u0394x/8'  }
    ];

    // ---- helpers ----
    function domainRect() {
        const size = Math.min(W - PAD * 2, H - PAD * 2);
        return {
            x: (W - size) / 2,
            y: (H - size) / 2,
            s: size
        };
    }

    // ---- input handling ----
    function canvasPos(e) {
        const rect = canvas.getBoundingClientRect();
        return { cx: e.clientX - rect.left, cy: e.clientY - rect.top };
    }

    function pxToBH(cx, cy) {
        const d = domainRect();
        bhX = Math.max(0.05, Math.min(0.95, (cx - d.x) / d.s));
        bhY = Math.max(0.05, Math.min(0.95, (cy - d.y) / d.s));
    }

    function isNearBH(cx, cy) {
        const d = domainRect();
        const bx = d.x + bhX * d.s;
        const by = d.y + bhY * d.s;
        const dx = cx - bx, dy = cy - by;
        return dx * dx + dy * dy < 40 * 40;
    }

    function onDown(e) {
        const { cx, cy } = canvasPos(e);
        if (isNearBH(cx, cy)) { dragging = true; pxToBH(cx, cy); }
    }
    function onMove(e) {
        if (!dragging) return;
        const { cx, cy } = canvasPos(e);
        pxToBH(cx, cy);
    }
    function onUp() { dragging = false; }
    function onTouchStart(e) {
        e.preventDefault();
        const { cx, cy } = { cx: e.touches[0].clientX - canvas.getBoundingClientRect().left,
                              cy: e.touches[0].clientY - canvas.getBoundingClientRect().top };
        if (isNearBH(cx, cy)) { dragging = true; pxToBH(cx, cy); }
    }
    function onTouchMove(e) {
        e.preventDefault();
        if (!dragging) return;
        const rect = canvas.getBoundingClientRect();
        pxToBH(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
    }

    // ---- init ----
    function init() {
        canvas = document.getElementById('amrCanvas');
        if (!canvas) return;
        const container = document.getElementById('amrContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');

        bhX = 0.5;
        bhY = 0.5;

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

    // ---- drawing ----

    // Draw a grid of n x n cells inside a given pixel rect
    function drawGrid(rx, ry, rs, n, color, alpha) {
        ctx.strokeStyle = color + alpha + ')';
        ctx.lineWidth = 0.5;
        const step = rs / n;
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
            const off = i * step;
            // vertical
            ctx.moveTo(rx + off, ry);
            ctx.lineTo(rx + off, ry + rs);
            // horizontal
            ctx.moveTo(rx, ry + off);
            ctx.lineTo(rx + rs, ry + off);
        }
        ctx.stroke();
    }

    // Draw refinement-level boundary (dashed outline)
    function drawLevelBorder(rx, ry, rs, color, alpha) {
        ctx.strokeStyle = color + Math.min(alpha * 2.5, 0.6) + ')';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(rx, ry, rs, rs);
        ctx.setLineDash([]);
    }

    function drawBlackHole(bx, by) {
        // Outer glow
        const g1 = ctx.createRadialGradient(bx, by, 0, bx, by, 32);
        g1.addColorStop(0, 'rgba(80, 60, 200, 0.25)');
        g1.addColorStop(0.5, 'rgba(40, 20, 120, 0.10)');
        g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(bx, by, 32, 0, Math.PI * 2);
        ctx.fillStyle = g1;
        ctx.fill();

        // Dark core
        const g2 = ctx.createRadialGradient(bx, by, 0, bx, by, 12);
        g2.addColorStop(0, 'rgba(0, 0, 0, 1)');
        g2.addColorStop(0.6, 'rgba(10, 5, 30, 0.95)');
        g2.addColorStop(1, 'rgba(30, 15, 60, 0)');
        ctx.beginPath();
        ctx.arc(bx, by, 12, 0, Math.PI * 2);
        ctx.fillStyle = g2;
        ctx.fill();

        // Bright ring (accretion-disk nod)
        ctx.beginPath();
        ctx.arc(bx, by, 14, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(160, 130, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(200, 180, 255, 0.6)';
        ctx.textAlign = 'center';
        ctx.fillText('BH', bx, by + 24);
    }

    function computeTotalCells() {
        // Level 0 covers everything: 8x8 = 64
        // Levels 1-3 cover only their sub-region
        let total = 0;
        for (let i = 0; i < LEVELS.length; i++) {
            const lv = LEVELS[i];
            const cellsInLevel = Math.round(lv.n * lv.frac);
            total += cellsInLevel * cellsInLevel;
        }
        return total;
    }

    function drawInfoPanel(d) {
        const panelW = 200;
        const panelH = 110;
        const px = d.x + 6;
        const py = d.y + 6;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.roundRect(px, py, panelW, panelH, 5);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.roundRect(px, py, panelW, panelH, 5);
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.font = '10px JetBrains Mono, monospace';

        // Level labels with color swatches
        LEVELS.forEach(function (lv, i) {
            const ly = py + 16 + i * 16;
            // swatch
            ctx.fillStyle = lv.color + '0.7)';
            ctx.fillRect(px + 8, ly - 4, 10, 3);
            // label
            ctx.fillStyle = lv.color + '0.6)';
            ctx.fillText(lv.label, px + 24, ly);
        });

        // Cell counts
        const totalCells = computeTotalCells();
        const uniformFine = 512 * 512; // if entire domain at level-3 resolution
        const ly = py + 16 + LEVELS.length * 16 + 4;
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255, 220, 70, 0.55)';
        ctx.fillText('AMR cells:  ~' + totalCells.toLocaleString(), px + 8, ly);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillText('Uniform fine: ~' + uniformFine.toLocaleString(), px + 8, ly + 14);
    }

    function drawDragHint(d) {
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.textAlign = 'center';
        ctx.fillText('drag the black hole', d.x + d.s / 2, d.y + d.s + 16);
    }

    // ---- main loop ----
    function animate() {
        if (!running) return;
        time++;
        ctx.clearRect(0, 0, W, H);

        const d = domainRect();
        const bx = d.x + bhX * d.s;
        const by = d.y + bhY * d.s;

        // Draw each refinement level
        for (let i = 0; i < LEVELS.length; i++) {
            const lv = LEVELS[i];
            const halfSize = (d.s * lv.frac) / 2;

            // Centre the sub-region on the BH, but clamp inside the domain
            let rx = bx - halfSize;
            let ry = by - halfSize;
            let rs = d.s * lv.frac;

            // Clamp to domain
            if (rx < d.x) rx = d.x;
            if (ry < d.y) ry = d.y;
            if (rx + rs > d.x + d.s) rx = d.x + d.s - rs;
            if (ry + rs > d.y + d.s) ry = d.y + d.s - rs;

            // For the finest level, add a subtle pulse
            let alpha = lv.alpha;
            if (i === LEVELS.length - 1) {
                alpha += 0.07 * Math.sin(time * 0.06);
            }

            drawGrid(rx, ry, rs, Math.round(lv.n * lv.frac), lv.color, alpha);

            // Draw border for sub-levels
            if (i > 0) {
                drawLevelBorder(rx, ry, rs, lv.color, lv.alpha);
            }
        }

        // Domain outline
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(d.x, d.y, d.s, d.s);

        // Black hole
        drawBlackHole(bx, by);

        // Info panel & hint
        drawInfoPanel(d);
        drawDragHint(d);

        animFrame = requestAnimationFrame(animate);
    }

    window.initAnim_amr = function () {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(init, 150);
    };
})();
