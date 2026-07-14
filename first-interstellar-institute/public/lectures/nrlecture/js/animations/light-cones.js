// light-cones.js - Light cone tilting near a black hole
// 2D spacetime diagram showing how light cones tip over at the horizon
(function () {
    let canvas, ctx, W, H, running = false;
    let animFrame;
    let time = 0;

    // Diagram layout (set in init based on canvas size)
    let originX, originY, axisW, axisH;
    let horizonX;

    // Physics: Schwarzschild radius units
    const R_S = 2; // horizon at r = 2M
    const R_MIN = 1.2; // leftmost r shown (inside horizon)
    const R_MAX = 8.0; // rightmost r shown

    // Cone positions in r-coordinate
    const CONE_POSITIONS = [1.5, 2.0, 2.8, 3.8, 5.2, 7.0];
    const CONE_HEIGHT = 0.9; // half-height of cone in t-coordinate

    // Photon state
    let photons = [];
    const PHOTON_SPEED = 0.012;

    function rToX(r) {
        return originX + (r - R_MIN) / (R_MAX - R_MIN) * axisW;
    }

    function tToY(t) {
        // t increases upward, but canvas y increases downward
        return originY - t / 6.0 * axisH;
    }

    // Schwarzschild coordinate speed of light: dr/dt = ±(1 - 2M/r)
    function coneSlope(r) {
        return 1 - R_S / r;
    }

    function init() {
        canvas = document.getElementById('lightConesCanvas');
        if (!canvas) return;
        const container = document.getElementById('lightConesContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');

        // Diagram area with margins
        const marginL = 48;
        const marginR = 20;
        const marginT = 24;
        const marginB = 38;

        originX = marginL;
        originY = H - marginB;
        axisW = W - marginL - marginR;
        axisH = H - marginT - marginB;

        horizonX = rToX(R_S);

        canvas.onclick = restart;

        running = true;
        time = 0;
        resetPhotons();
        animate();
    }

    function resetPhotons() {
        photons = [
            // Escaping photon (far away, green)
            {
                r: 5.2, t: 0, dir: 1, color: '#4caf50',
                trail: [], alive: true, label: 'escapes'
            },
            // Photon at horizon (yellow) — stays put
            {
                r: 2.0, t: 0, dir: 1, color: '#fdd835',
                trail: [], alive: true, label: 'trapped'
            },
            // Photon inside horizon (red) — falls in
            {
                r: 1.5, t: 0, dir: 1, color: '#ef5350',
                trail: [], alive: true, label: 'falls in'
            }
        ];
    }

    function restart() {
        time = 0;
        resetPhotons();
    }

    function drawAxes() {
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 1.5;

        // r-axis (horizontal)
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(originX + axisW + 10, originY);
        ctx.stroke();

        // Arrow on r-axis
        ctx.beginPath();
        ctx.moveTo(originX + axisW + 10, originY);
        ctx.lineTo(originX + axisW + 2, originY - 4);
        ctx.moveTo(originX + axisW + 10, originY);
        ctx.lineTo(originX + axisW + 2, originY + 4);
        ctx.stroke();

        // t-axis (vertical)
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(originX, originY - axisH - 10);
        ctx.stroke();

        // Arrow on t-axis
        ctx.beginPath();
        ctx.moveTo(originX, originY - axisH - 10);
        ctx.lineTo(originX - 4, originY - axisH - 2);
        ctx.moveTo(originX, originY - axisH - 10);
        ctx.lineTo(originX + 4, originY - axisH - 2);
        ctx.stroke();

        // Labels
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.textAlign = 'center';
        ctx.fillText('r (radius)', originX + axisW * 0.5, originY + 28);

        ctx.save();
        ctx.translate(originX - 32, originY - axisH * 0.5);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('t (time)', 0, 0);
        ctx.restore();
    }

    function drawHorizon() {
        // Dashed vertical line at r = 2M
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.moveTo(horizonX, originY + 4);
        ctx.lineTo(horizonX, originY - axisH - 6);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.textAlign = 'center';
        ctx.fillText('r = 2M', horizonX, originY + 14);

        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillText('horizon', horizonX, originY + 24);
    }

    function drawInteriorShading() {
        // Subtle dark red tint for interior region (r < 2M)
        const x0 = originX;
        const x1 = horizonX;
        const y0 = originY - axisH;
        const y1 = originY;

        const grad = ctx.createLinearGradient(x0, 0, x1, 0);
        grad.addColorStop(0, 'rgba(120, 20, 20, 0.15)');
        grad.addColorStop(1, 'rgba(80, 10, 10, 0.05)');

        ctx.fillStyle = grad;
        ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }

    function drawLightCone(r, tCenter) {
        const cx = rToX(r);
        const cy = tToY(tCenter);
        const slope = coneSlope(r);

        // Half-height in pixels
        const hPx = CONE_HEIGHT / 6.0 * axisH;

        // dr/dt for outgoing = +slope, ingoing = -slope (in coordinate terms)
        // In the diagram: going up by hPx in t corresponds to moving right by slope * hPx in r
        // But we need to convert properly. dt maps to hPx pixels upward.
        // dr for outgoing = slope * dt, which in pixels = slope * hPx * (axisW / (R_MAX - R_MIN)) / (axisH / 6.0)
        // Simplify: pixel shift in x per pixel shift in y
        const scale = (axisW / (R_MAX - R_MIN)) / (axisH / 6.0);
        const dxPerDy = slope * scale;

        // Outgoing ray: dr/dt = +(1 - 2M/r). Positive outside horizon, negative inside.
        const outTipX = cx + dxPerDy * hPx;
        const outTipY = cy - hPx;

        // Ingoing ray: dr/dt = -(1 - 2M/r). Both edges tilt left inside the horizon
        // because t becomes spacelike and r timelike — no escape.
        const inTipX = cx + (-slope) * scale * hPx;
        const inTipY = cy - hPx;

        // Color: cyan (upright) → orange → red (tilted)
        const tiltFactor = Math.max(0, Math.min(1, 1 - slope));
        const cr = Math.floor(0 + 255 * tiltFactor);
        const cg = Math.floor(220 - 100 * tiltFactor);
        const cb = Math.floor(255 - 200 * tiltFactor);
        const coneColor = `rgba(${cr}, ${cg}, ${cb}, 0.75)`;

        // Fill cone interior (subtle)
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, 0.06)`;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(outTipX, outTipY);
        ctx.lineTo(inTipX, inTipY);
        ctx.closePath();
        ctx.fill();

        // Draw the two edges
        ctx.strokeStyle = coneColor;
        ctx.lineWidth = 2;

        // Right edge (outgoing)
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(outTipX, outTipY);
        ctx.stroke();

        // Left edge (ingoing)
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(inTipX, inTipY);
        ctx.stroke();

        // Vertex dot
        ctx.beginPath();
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = coneColor;
        ctx.fill();
    }

    function drawLabels() {
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';

        // "far away: cones upright" — near rightmost cone
        const farX = rToX(7.0);
        const farY = tToY(0) - axisH * 0.12;
        ctx.fillStyle = 'rgba(0, 220, 255, 0.5)';
        ctx.fillText('far away:', farX, farY);
        ctx.fillText('cones upright', farX, farY + 13);

        // "inside: no escape" — inside the horizon
        const inX = (originX + horizonX) * 0.5;
        const inY = tToY(0) - axisH * 0.85;
        ctx.fillStyle = 'rgba(239, 83, 80, 0.55)';
        ctx.fillText('inside:', inX, inY);
        ctx.fillText('no escape', inX, inY + 13);
    }

    function updatePhotons() {
        photons.forEach(p => {
            if (!p.alive) return;

            const slope = coneSlope(p.r);

            // "Outgoing" photon: dr/dt = (1 - 2M/r)
            // In coordinate time, advance dt and compute dr
            const dt = PHOTON_SPEED;
            const dr = slope * dt * p.dir;
            p.t += dt;
            p.r += dr;

            // Store trail point
            p.trail.push({ x: rToX(p.r), y: tToY(p.t) });
            if (p.trail.length > 500) p.trail.shift();

            // Kill conditions
            if (p.r < R_MIN - 0.3 || p.r > R_MAX + 0.5) p.alive = false;
            if (p.t > 6.0) p.alive = false;
        });
    }

    function drawPhotons() {
        photons.forEach(p => {
            if (p.trail.length < 2) return;

            // Trail
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.trail[0].x, p.trail[0].y);
            for (let i = 1; i < p.trail.length; i++) {
                ctx.lineTo(p.trail[i].x, p.trail[i].y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Current position dot
            if (p.alive) {
                const last = p.trail[p.trail.length - 1];

                // Clip to diagram area
                if (last.x >= originX && last.x <= originX + axisW &&
                    last.y >= originY - axisH && last.y <= originY) {

                    // Glow
                    ctx.beginPath();
                    ctx.arc(last.x, last.y, 6, 0, Math.PI * 2);
                    ctx.globalAlpha = 0.2;
                    ctx.fillStyle = p.color;
                    ctx.fill();
                    ctx.globalAlpha = 1;

                    // Core
                    ctx.beginPath();
                    ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.fill();
                }
            }
        });
    }

    function drawPhotonLegend() {
        const lx = originX + axisW - 140;
        const ly = originY - axisH + 8;

        ctx.fillStyle = 'rgba(26, 26, 26, 0.85)';
        ctx.fillRect(lx - 6, ly - 4, 148, 52);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.strokeRect(lx - 6, ly - 4, 148, 52);

        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';

        // Green
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.arc(lx + 4, ly + 8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText('escapes (r > 2M)', lx + 14, ly + 12);

        // Yellow
        ctx.fillStyle = '#fdd835';
        ctx.beginPath();
        ctx.arc(lx + 4, ly + 24, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText('trapped (r = 2M)', lx + 14, ly + 28);

        // Red
        ctx.fillStyle = '#ef5350';
        ctx.beginPath();
        ctx.arc(lx + 4, ly + 40, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText('falls in (r < 2M)', lx + 14, ly + 44);
    }

    function drawClickHint() {
        const alpha = 0.15 + 0.05 * Math.sin(time * 0.03);
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.textAlign = 'center';
        ctx.fillText('click to restart', W * 0.5, H - 6);
    }

    function animate() {
        if (!running) return;
        time++;

        ctx.clearRect(0, 0, W, H);

        // Interior shading first (behind everything)
        drawInteriorShading();

        // Axes
        drawAxes();

        // Horizon
        drawHorizon();

        // Light cones at fixed positions, staggered vertically for clarity
        const tPositions = [0.5, 0.5, 1.8, 1.8, 3.2, 3.2];
        for (let i = 0; i < CONE_POSITIONS.length; i++) {
            drawLightCone(CONE_POSITIONS[i], tPositions[i]);
        }

        // Labels
        drawLabels();

        // Update and draw photons
        updatePhotons();
        drawPhotons();

        // Legend
        drawPhotonLegend();

        // Restart hint
        drawClickHint();

        // Auto-restart when all photons are dead or have left the diagram
        const allDone = photons.every(p => !p.alive);
        if (allDone) {
            // Pause briefly, then restart
            setTimeout(() => {
                if (running) restart();
            }, 1500);
        }

        animFrame = requestAnimationFrame(animate);
    }

    window.initAnim_lightcones = function () {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(init, 150);
    };
})();
