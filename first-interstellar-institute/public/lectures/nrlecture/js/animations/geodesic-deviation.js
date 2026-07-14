// geodesic-deviation.js - Geodesic deviation & Riemann curvature tensor
// Split view: flat space (parallel geodesics) vs curved space (converging meridians)
(function () {
    let canvas, ctx, W, H, running = false;
    let animFrame;
    let t = 0;            // progress 0 → 1 (equator → pole)
    let flashTimer = 0;   // countdown for "Riemann ≠ 0" flash
    let pauseTimer = 0;   // dwell at convergence before reset

    const SPEED = 0.0025;
    const FLASH_FRAMES = 100;
    const PAUSE_FRAMES = 130;

    const CYAN    = '#00e5ff';
    const MAGENTA = '#ff4081';
    const PATH_STYLE = 'rgba(255, 255, 255, 0.3)';
    const LABEL_STYLE = 'rgba(255, 255, 255, 0.55)';
    const DIM_STYLE   = 'rgba(255, 255, 255, 0.12)';

    // ── helpers ──────────────────────────────────────────────────────────

    function hexToRgba(hex, a) {
        var n = parseInt(hex.slice(1), 16);
        return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
    }

    function glowDot(x, y, r, color) {
        var grad = ctx.createRadialGradient(x, y, 0, x, y, r * 3.5);
        grad.addColorStop(0, hexToRgba(color, 0.8));
        grad.addColorStop(0.35, hexToRgba(color, 0.25));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        // solid core
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }

    function distanceArrow(x1, x2, y, color) {
        if (Math.abs(x2 - x1) < 6) return;       // too close, skip
        var hl = 4;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        // shaft
        ctx.beginPath();
        ctx.moveTo(x1, y); ctx.lineTo(x2, y);
        ctx.stroke();
        // left head
        ctx.beginPath();
        ctx.moveTo(x1 + hl, y - hl); ctx.lineTo(x1, y); ctx.lineTo(x1 + hl, y + hl);
        ctx.stroke();
        // right head
        ctx.beginPath();
        ctx.moveTo(x2 - hl, y - hl); ctx.lineTo(x2, y); ctx.lineTo(x2 - hl, y + hl);
        ctx.stroke();
    }

    // ── left panel: flat space ──────────────────────────────────────────

    function drawFlat(cx, hw, topY, botY) {
        var sep = Math.min(76, hw * 0.35);
        var x1  = cx - sep / 2;
        var x2  = cx + sep / 2;

        // title
        ctx.font = '12px JetBrains Mono, monospace';
        ctx.fillStyle = LABEL_STYLE;
        ctx.textAlign = 'center';
        ctx.fillText('FLAT SPACE', cx, topY - 14);

        // faint direction arrows (static, behind everything)
        [x1, x2].forEach(function (x) {
            ctx.beginPath();
            ctx.moveTo(x, botY - 20);
            ctx.lineTo(x, topY + 20);
            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 12;
            ctx.stroke();
        });

        // paths
        ctx.lineWidth = 2;
        ctx.strokeStyle = PATH_STYLE;
        ctx.beginPath(); ctx.moveTo(x1, botY); ctx.lineTo(x1, topY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x2, botY); ctx.lineTo(x2, topY); ctx.stroke();

        // small upward chevrons along paths
        var chevCount = 5;
        for (var i = 1; i <= chevCount; i++) {
            var cy = botY - (botY - topY) * (i / (chevCount + 1));
            [x1, x2].forEach(function (x) {
                ctx.beginPath();
                ctx.moveTo(x - 4, cy + 4);
                ctx.lineTo(x, cy);
                ctx.lineTo(x + 4, cy + 4);
                ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                ctx.lineWidth = 1;
                ctx.stroke();
            });
        }

        // ants
        var antY = botY - t * (botY - topY);
        glowDot(x1, antY, 5, CYAN);
        glowDot(x2, antY, 5, MAGENTA);

        // distance arrow + label (follows the ants)
        var arrY = Math.min(antY + 22, botY - 8);
        distanceArrow(x1, x2, arrY, 'rgba(255,255,255,0.45)');

        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillStyle = LABEL_STYLE;
        ctx.textAlign = 'center';
        ctx.fillText('distance = constant', cx, arrY + 16);
    }

    // ── right panel: curved space (sphere) ──────────────────────────────

    function drawCurved(cx, hw, topY, botY) {
        var usableH = botY - topY;
        var R = Math.min(hw * 0.55, usableH * 0.44);
        var scy = topY + usableH * 0.52;     // sphere centre

        // title
        ctx.font = '12px JetBrains Mono, monospace';
        ctx.fillStyle = LABEL_STYLE;
        ctx.textAlign = 'center';
        ctx.fillText('CURVED SPACE (sphere)', cx, topY - 14);

        // sphere outline
        ctx.beginPath();
        ctx.arc(cx, scy, R, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // latitude lines (-60° to +60°, every 30°)
        [-60, -30, 0, 30, 60].forEach(function (deg) {
            var theta = deg * Math.PI / 180;
            var y  = scy - R * Math.sin(theta);
            var rx = R * Math.cos(theta);
            if (rx < 2) return;
            ctx.beginPath();
            ctx.ellipse(cx, y, rx, rx * 0.18, 0, 0, Math.PI * 2);
            ctx.strokeStyle = DIM_STYLE;
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // equator slightly brighter
        ctx.beginPath();
        ctx.ellipse(cx, scy, R, R * 0.18, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // longitude lines
        [-60, -30, 0, 30, 60].forEach(function (deg) {
            var phi = deg * Math.PI / 180;
            ctx.beginPath();
            for (var lat = -90; lat <= 90; lat += 2) {
                var theta = lat * Math.PI / 180;
                var px = cx + R * Math.cos(theta) * Math.sin(phi);
                var py = scy - R * Math.sin(theta);
                if (lat === -90) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.strokeStyle = DIM_STYLE;
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // two geodesic meridians (highlighted paths)
        var phi1 = -0.42;   // ≈ –24°
        var phi2 =  0.42;   // ≈ +24°

        function meridianXY(phi, theta) {
            return {
                x: cx  + R * Math.cos(theta) * Math.sin(phi),
                y: scy - R * Math.sin(theta)
            };
        }

        [phi1, phi2].forEach(function (phi) {
            ctx.beginPath();
            for (var lat = 0; lat <= 90; lat += 1) {
                var th = lat * Math.PI / 180;
                var p  = meridianXY(phi, th);
                if (lat === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.strokeStyle = PATH_STYLE;
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // ants – walk from equator (θ = 0) to pole (θ = π/2)
        var antTheta = t * Math.PI / 2;
        var a1 = meridianXY(phi1, antTheta);
        var a2 = meridianXY(phi2, antTheta);

        glowDot(a1.x, a1.y, 5, CYAN);
        glowDot(a2.x, a2.y, 5, MAGENTA);

        // distance arrow (shrinking)
        if (t < 0.92) {
            var arrY = Math.min(a1.y + 20, scy + R - 6);
            distanceArrow(a1.x, a2.x, arrY, 'rgba(255,255,255,0.45)');

            ctx.font = '11px JetBrains Mono, monospace';
            ctx.fillStyle = LABEL_STYLE;
            ctx.textAlign = 'center';
            ctx.fillText('geodesics converge', cx, arrY + 16);
        }

        // flash text when ants meet
        if (flashTimer > 0) {
            var alpha = flashTimer < 30 ? flashTimer / 30 : 1;
            // pulse gently
            alpha *= 0.7 + 0.3 * Math.sin(flashTimer * 0.18);
            ctx.font = 'bold 13px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(255, 160, 0, ' + Math.max(0, alpha).toFixed(3) + ')';
            ctx.textAlign = 'center';
            ctx.fillText('Riemann curvature ≠ 0', cx, a1.y + 30);
        }

        // small "N" at the pole, "eq" at equator
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.textAlign = 'center';
        ctx.fillText('N', cx, scy - R - 6);
        ctx.fillText('eq', cx + R + 14, scy + 4);
    }

    // ── main loop ───────────────────────────────────────────────────────

    function update() {
        if (pauseTimer > 0) {
            pauseTimer--;
            flashTimer = Math.max(0, flashTimer - 1);
            if (pauseTimer <= 0) { t = 0; }
            return;
        }
        t += SPEED;
        if (t >= 1) {
            t = 1;
            flashTimer  = FLASH_FRAMES;
            pauseTimer  = PAUSE_FRAMES;
        }
    }

    function draw() {
        if (!running) return;
        update();

        ctx.clearRect(0, 0, W, H);

        var midX = W / 2;
        var margin = 50;

        // subtle vertical divider
        ctx.beginPath();
        ctx.moveTo(midX, 18);
        ctx.lineTo(midX, H - 18);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        drawFlat(   midX * 0.5,  midX * 0.5,  margin, H - margin);
        drawCurved( midX * 1.5,  midX * 0.5,  margin, H - margin);

        animFrame = requestAnimationFrame(draw);
    }

    // ── public init ─────────────────────────────────────────────────────

    function init() {
        canvas = document.getElementById('geodevCanvas');
        if (!canvas) return;
        var container = document.getElementById('geodevContainer');
        W = canvas.width  = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');
        t = 0;
        flashTimer = 0;
        pauseTimer = 0;
        running = true;
        draw();
    }

    window.initAnim_geodeviation = function () {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(init, 150);
    };
})();
