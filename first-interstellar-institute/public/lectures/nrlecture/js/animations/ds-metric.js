// ds-metric.js - Flat table vs curved space: how ds stays constant or stretches
(function () {
    let canvas, ctx, W, H, running = false;
    let animFrame;

    // Both panels use a probe; curved also has a draggable mass
    let flatProbeX, flatProbeY;
    let curvedProbeX, curvedProbeY;
    let massX, massY;

    let dragTarget = null; // 'flat' | 'curvedProbe' | 'mass' | null

    const GRID = 36;
    const MASS_STRENGTH = 2800;
    const BASE_RULER = 12;
    const GAP = 10;
    const HEADER = 28;
    const MASS_HIT_R = 28;

    function init() {
        canvas = document.getElementById('dsMetricCanvas');
        if (!canvas) return;
        const container = document.getElementById('dsMetricContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');

        const { flat, curved } = panels();
        flatProbeX = flat.x + flat.w * 0.35;
        flatProbeY = flat.y + flat.h * 0.55;

        // Mass on the left; probe starts far to the right so ds = 1.00 (same as flat)
        massX = curved.x + curved.w * 0.28;
        massY = curved.y + curved.h * 0.55;
        curvedProbeX = curved.x + curved.w * 0.78;
        curvedProbeY = curved.y + curved.h * 0.55;

        canvas.addEventListener('mousedown', onDown);
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseup', onUp);
        canvas.addEventListener('mouseleave', onUp);
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', onUp);

        running = true;
        draw();
    }

    function panels() {
        const usable = H - GAP;
        const half = usable / 2;
        return {
            flat: { x: 0, y: 0, w: W, h: half, labelY: 16 },
            curved: { x: 0, y: half + GAP, w: W, h: half, labelY: half + GAP + 16 }
        };
    }

    function localCoords(panel, clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        return {
            x: clamp(x, panel.x + 8, panel.x + panel.w - 8),
            y: clamp(y, panel.y + HEADER, panel.y + panel.h - 8)
        };
    }

    function clamp(v, a, b) {
        return Math.max(a, Math.min(b, v));
    }

    function hitPanel(x, y) {
        const { flat, curved } = panels();
        if (y >= flat.y && y <= flat.y + flat.h) return 'flat';
        if (y >= curved.y && y <= curved.y + curved.h) return 'curved';
        return null;
    }

    function dist(ax, ay, bx, by) {
        const dx = ax - bx;
        const dy = ay - by;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function onDown(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const which = hitPanel(x, y);

        if (which === 'flat') {
            dragTarget = 'flat';
            const loc = localCoords(panels().flat, e.clientX, e.clientY);
            flatProbeX = loc.x;
            flatProbeY = loc.y;
            return;
        }

        if (which === 'curved') {
            const loc = localCoords(panels().curved, e.clientX, e.clientY);
            // Grab mass only if click is on it; otherwise move the probe
            if (dist(loc.x, loc.y, massX, massY) <= MASS_HIT_R) {
                dragTarget = 'mass';
                massX = loc.x;
                massY = loc.y;
            } else {
                dragTarget = 'curvedProbe';
                curvedProbeX = loc.x;
                curvedProbeY = loc.y;
            }
        }
    }

    function onMove(e) {
        if (!dragTarget) return;
        if (dragTarget === 'flat') {
            const loc = localCoords(panels().flat, e.clientX, e.clientY);
            flatProbeX = loc.x;
            flatProbeY = loc.y;
        } else if (dragTarget === 'mass') {
            const loc = localCoords(panels().curved, e.clientX, e.clientY);
            massX = loc.x;
            massY = loc.y;
        } else if (dragTarget === 'curvedProbe') {
            const loc = localCoords(panels().curved, e.clientX, e.clientY);
            curvedProbeX = loc.x;
            curvedProbeY = loc.y;
        }
    }

    function onUp() { dragTarget = null; }

    function onTouchStart(e) {
        e.preventDefault();
        const t = e.touches[0];
        onDown({ clientX: t.clientX, clientY: t.clientY });
    }

    function onTouchMove(e) {
        e.preventDefault();
        if (!dragTarget) return;
        const t = e.touches[0];
        onMove({ clientX: t.clientX, clientY: t.clientY });
    }

    function warp(x, y, panel) {
        const dx = x - massX;
        const dy = y - massY;
        const r2 = dx * dx + dy * dy;
        const factor = MASS_STRENGTH / (r2 + 200);
        return {
            wx: clamp(x + dx * factor * 0.28, panel.x, panel.x + panel.w),
            wy: clamp(y + dy * factor * 0.28, panel.y + HEADER * 0.5, panel.y + panel.h)
        };
    }

    // Same coordinate gap as flat (dx = 1 in ruler units) → flat limit is exactly 1.00
    function dsStretch(x, y) {
        const dx = x - massX;
        const dy = y - massY;
        const r2 = dx * dx + dy * dy;
        return 1 + MASS_STRENGTH * 1.4 / (r2 + 300);
    }

    function stretchColor(stretch) {
        const t = Math.min((stretch - 1) / 3, 1);
        const r = Math.floor(80 + 175 * t);
        const g = Math.floor(220 - 140 * t);
        const b = Math.floor(100 - 80 * t);
        return `rgba(${r}, ${g}, ${b}, 0.85)`;
    }

    function dsLabel(stretch) {
        if (stretch < 1.08) return 'same as flat';
        if (stretch < 1.5) return 'mildly stretched';
        if (stretch < 2.2) return 'stretched';
        return 'strongly stretched';
    }

    function drawRuler(x, y, len, color) {
        const displayLen = Math.min(len, 42);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x - displayLen / 2, y);
        ctx.lineTo(x + displayLen / 2, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - displayLen / 2, y - 3);
        ctx.lineTo(x - displayLen / 2, y + 3);
        ctx.moveTo(x + displayLen / 2, y - 3);
        ctx.lineTo(x + displayLen / 2, y + 3);
        ctx.stroke();
    }

    function drawProbe(x, y, color) {
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function clipPanel(panel) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(panel.x, panel.y, panel.w, panel.h);
        ctx.clip();
    }

    function drawPanelFrame(panel) {
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(panel.x + 0.5, panel.y + 0.5, panel.w - 1, panel.h - 1);
    }

    function drawFlatPanel(panel) {
        clipPanel(panel);

        ctx.strokeStyle = 'rgba(100, 160, 255, 0.18)';
        ctx.lineWidth = 1;
        for (let gx = panel.x; gx <= panel.x + panel.w; gx += GRID) {
            ctx.beginPath();
            ctx.moveTo(gx, panel.y);
            ctx.lineTo(gx, panel.y + panel.h);
            ctx.stroke();
        }
        for (let gy = panel.y + HEADER; gy <= panel.y + panel.h; gy += GRID) {
            ctx.beginPath();
            ctx.moveTo(panel.x, gy);
            ctx.lineTo(panel.x + panel.w, gy);
            ctx.stroke();
        }

        for (let gx = panel.x + GRID; gx < panel.x + panel.w - 8; gx += GRID * 2) {
            for (let gy = panel.y + HEADER + GRID; gy < panel.y + panel.h - 8; gy += GRID * 2) {
                drawRuler(gx, gy, BASE_RULER, 'rgba(80, 220, 100, 0.8)');
            }
        }

        drawProbe(flatProbeX, flatProbeY, 'rgba(80, 220, 100, 0.9)');
        drawRuler(flatProbeX, flatProbeY - 18, BASE_RULER, 'rgba(80, 220, 100, 1)');

        ctx.restore();

        ctx.textAlign = 'left';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.fillText('FLAT SPACE  (table)', panel.x + 10, panel.labelY);

        ctx.font = '13px EB Garamond, serif';
        ctx.fillStyle = 'rgba(200, 220, 255, 0.9)';
        ctx.textAlign = 'right';
        ctx.fillText('ds\u00b2 = dx\u00b2 + dy\u00b2', panel.x + panel.w - 12, panel.labelY);

        // Same units / same baseline as curved panel
        ctx.textAlign = 'left';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(80, 220, 100, 0.95)';
        ctx.fillText('ds = 1.00  (same everywhere)', panel.x + 10, panel.y + panel.h - 10);
    }

    function drawCurvedPanel(panel) {
        clipPanel(panel);

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(100, 160, 255, 0.22)';
        for (let gx = panel.x; gx <= panel.x + panel.w + GRID; gx += GRID) {
            ctx.beginPath();
            let started = false;
            for (let gy = panel.y; gy <= panel.y + panel.h; gy += 3) {
                const { wx, wy } = warp(gx, gy, panel);
                if (!started) { ctx.moveTo(wx, wy); started = true; }
                else ctx.lineTo(wx, wy);
            }
            ctx.stroke();
        }
        for (let gy = panel.y; gy <= panel.y + panel.h + GRID; gy += GRID) {
            ctx.beginPath();
            let started = false;
            for (let gx = panel.x; gx <= panel.x + panel.w; gx += 3) {
                const { wx, wy } = warp(gx, gy, panel);
                if (!started) { ctx.moveTo(wx, wy); started = true; }
                else ctx.lineTo(wx, wy);
            }
            ctx.stroke();
        }

        for (let gx = panel.x + GRID; gx < panel.x + panel.w - 8; gx += GRID * 2) {
            for (let gy = panel.y + HEADER + GRID * 0.5; gy < panel.y + panel.h - 8; gy += GRID * 2) {
                const { wx, wy } = warp(gx, gy, panel);
                const stretch = dsStretch(gx, gy);
                drawRuler(wx, wy, BASE_RULER * stretch, stretchColor(stretch));
            }
        }

        // Mass
        const gradient = ctx.createRadialGradient(massX, massY, 0, massX, massY, 36);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.35, 'rgba(200, 200, 255, 0.35)');
        gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
        ctx.beginPath();
        ctx.arc(massX, massY, 36, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(massX, massY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'center';
        ctx.fillText('M', massX, massY + 18);

        // Probe at local ds (same units as flat: far away → 1.00)
        const stretch = dsStretch(curvedProbeX, curvedProbeY);
        const { wx, wy } = warp(curvedProbeX, curvedProbeY, panel);
        const probeColor = stretchColor(stretch);
        drawProbe(wx, wy, probeColor);
        drawRuler(wx, wy - 18, BASE_RULER * stretch, probeColor);

        ctx.restore();

        ctx.textAlign = 'left';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.fillText('CURVED SPACE  (near a mass)', panel.x + 10, panel.labelY);

        ctx.font = '13px EB Garamond, serif';
        ctx.fillStyle = 'rgba(255, 200, 160, 0.95)';
        ctx.textAlign = 'right';
        ctx.fillText('ds\u00b2 = g\u03bc\u03bd  dx\u03bc dx\u03bd', panel.x + panel.w - 12, panel.labelY);

        // Same format / same baseline as flat panel
        ctx.textAlign = 'left';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillStyle = probeColor;
        ctx.fillText(
            `ds = ${stretch.toFixed(2)}  (${dsLabel(stretch)})`,
            panel.x + 10,
            panel.y + panel.h - 10
        );

        ctx.fillStyle = 'rgba(180,180,180,0.55)';
        ctx.textAlign = 'right';
        ctx.fillText('drag probe  ·  drag M', panel.x + panel.w - 12, panel.y + panel.h - 10);
    }

    function draw() {
        if (!running) return;
        ctx.clearRect(0, 0, W, H);

        const { flat, curved } = panels();
        drawPanelFrame(flat);
        drawPanelFrame(curved);
        drawFlatPanel(flat);
        drawCurvedPanel(curved);

        animFrame = requestAnimationFrame(draw);
    }

    window.initAnim_dsmetric = function () {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(init, 150);
    };
})();
