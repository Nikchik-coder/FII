// gw-polarization.js — Gravitational wave polarization modes (h+ and hx)
// Left: plus mode — ring squeezes/stretches along x/y axes
// Right: cross mode — ring squeezes/stretches along 45-degree axes
// Each side shows deformed test-particle ring + reference circle + live waveform
(function () {
    let canvas, ctx, W, H, running = false;
    let animFrame;
    let time = 0;

    const NUM_PARTICLES = 24;
    const AMP = 0.15;
    const OMEGA = Math.PI; // 1 full cycle per 2 seconds (at 60fps, period ~120 frames)

    // Pre-compute base particle angles
    const angles = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
        angles.push((i / NUM_PARTICLES) * Math.PI * 2);
    }

    function init() {
        canvas = document.getElementById('gwPolCanvas');
        if (!canvas) return;
        const container = document.getElementById('gwPolContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');
        running = true;
        time = 0;
        animate();
    }

    function animate() {
        if (!running) return;
        animFrame = requestAnimationFrame(animate);

        time += 1 / 60; // seconds
        ctx.clearRect(0, 0, W, H);

        const halfW = W / 2;

        // Divider line
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(halfW, 0);
        ctx.lineTo(halfW, H);
        ctx.stroke();

        // Ring sizing: fit within each half with room for waveform below
        const ringAreaH = H * 0.62;
        const waveAreaH = H * 0.22;
        const ringRadius = Math.min(halfW * 0.32, ringAreaH * 0.38);
        const ringCenterY = ringAreaH * 0.52;

        // ---- LEFT: h+ (plus) mode ----
        const plusCX = halfW * 0.5;
        drawLabel(plusCX, 24, 'h\u208A (plus)');
        drawReferenceCircle(plusCX, ringCenterY, ringRadius);
        drawPlusMode(plusCX, ringCenterY, ringRadius, time);
        drawWaveform(plusCX, ringAreaH + 16, halfW * 0.7, waveAreaH, time, 'h\u208A');

        // ---- RIGHT: hx (cross) mode ----
        const crossCX = halfW + halfW * 0.5;
        drawLabel(crossCX, 24, 'h\u00D7 (cross)');
        drawReferenceCircle(crossCX, ringCenterY, ringRadius);
        drawCrossMode(crossCX, ringCenterY, ringRadius, time);
        drawWaveform(crossCX, ringAreaH + 16, halfW * 0.7, waveAreaH, time, 'h\u00D7');
    }

    // ---- Label ----
    function drawLabel(cx, y, text) {
        ctx.font = '13px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(text, cx, y);
    }

    // ---- Reference circle (dashed, faint) ----
    function drawReferenceCircle(cx, cy, r) {
        ctx.strokeStyle = 'rgba(255,255,255,0.10)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // ---- Plus mode ring ----
    function drawPlusMode(cx, cy, r, t) {
        const s = Math.sin(OMEGA * t);
        const positions = [];

        for (let i = 0; i < NUM_PARTICLES; i++) {
            const theta = angles[i];
            const baseX = r * Math.cos(theta);
            const baseY = r * Math.sin(theta);
            // h+ deformation: stretch x, squeeze y (and vice versa)
            const x = baseX * (1 + AMP * s);
            const y = baseY * (1 - AMP * s);
            positions.push({ x: cx + x, y: cy + y });
        }

        drawRing(positions);
    }

    // ---- Cross mode ring ----
    function drawCrossMode(cx, cy, r, t) {
        const s = Math.sin(OMEGA * t);
        const positions = [];

        for (let i = 0; i < NUM_PARTICLES; i++) {
            const theta = angles[i];
            const baseX = r * Math.cos(theta);
            const baseY = r * Math.sin(theta);
            // hx deformation: squeeze/stretch along 45-degree axes
            const x = baseX + AMP * baseY * s;
            const y = baseY + AMP * baseX * s;
            positions.push({ x: cx + x, y: cy + y });
        }

        drawRing(positions);
    }

    // ---- Draw ring: connecting lines + particle dots ----
    function drawRing(positions) {
        const n = positions.length;

        // Connecting lines
        ctx.strokeStyle = 'rgba(255,255,255,0.20)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(positions[0].x, positions[0].y);
        for (let i = 1; i < n; i++) {
            ctx.lineTo(positions[i].x, positions[i].y);
        }
        ctx.closePath();
        ctx.stroke();

        // Faint fill to show shape
        ctx.fillStyle = 'rgba(0,229,255,0.03)';
        ctx.fill();

        // Particle dots
        for (let i = 0; i < n; i++) {
            const p = positions[i];

            // Glow
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,229,255,0.12)';
            ctx.fill();

            // Core
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#00e5ff';
            ctx.fill();
        }
    }

    // ---- Waveform graph below ring ----
    function drawWaveform(cx, topY, plotW, plotH, t, label) {
        const x0 = cx - plotW / 2;
        const midY = topY + plotH * 0.5;
        const ampPx = plotH * 0.35;

        // Axis line
        ctx.strokeStyle = 'rgba(255,255,255,0.10)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x0, midY);
        ctx.lineTo(x0 + plotW, midY);
        ctx.stroke();

        // Axis label
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('t', x0 + plotW + 10, midY - 4);

        // Draw waveform: show ~3 cycles worth of history, "now" at 75% across
        const windowDuration = 6; // seconds visible
        const nowFrac = 0.75; // "now" position as fraction of plot width

        ctx.strokeStyle = 'rgba(0,229,255,0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        let first = true;
        const steps = Math.floor(plotW);
        for (let i = 0; i <= steps; i++) {
            const frac = i / steps;
            const tSample = t - (nowFrac - frac) * windowDuration;
            const val = Math.sin(OMEGA * tSample);
            const px = x0 + frac * plotW;
            const py = midY - val * ampPx;

            // Fade out future part (right of "now")
            if (frac > nowFrac + 0.02) continue;

            if (first) { ctx.moveTo(px, py); first = false; }
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Faint future projection
        ctx.strokeStyle = 'rgba(0,229,255,0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        first = true;
        for (let i = 0; i <= steps; i++) {
            const frac = i / steps;
            if (frac < nowFrac - 0.01) continue;
            const tSample = t - (nowFrac - frac) * windowDuration;
            const val = Math.sin(OMEGA * tSample);
            const px = x0 + frac * plotW;
            const py = midY - val * ampPx;
            if (first) { ctx.moveTo(px, py); first = false; }
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // "Now" indicator: vertical line + dot
        const nowX = x0 + nowFrac * plotW;
        const nowVal = Math.sin(OMEGA * t);
        const nowY = midY - nowVal * ampPx;

        // Vertical line
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nowX, topY + 4);
        ctx.lineTo(nowX, topY + plotH - 4);
        ctx.stroke();

        // Dot on waveform
        ctx.beginPath();
        ctx.arc(nowX, nowY, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,229,255,0.3)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(nowX, nowY, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#00e5ff';
        ctx.fill();

        // "now" label
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.30)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('now', nowX, topY + 2);

        // Strain label on left
        ctx.save();
        ctx.translate(x0 - 10, midY);
        ctx.rotate(-Math.PI / 2);
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.20)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 0, 0);
        ctx.restore();
    }

    window.initAnim_gwpolarization = function () {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(init, 150);
    };
})();
