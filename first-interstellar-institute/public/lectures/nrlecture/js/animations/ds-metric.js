// ds-metric.js - Interactive visualisation of how ds changes with geometry
// Shows a 2D grid that warps near a "mass", with ds rulers stretching/compressing
(function () {
    let canvas, ctx, W, H, running = false;
    let massX, massY;
    let dragging = false;
    let animFrame;

    const GRID_SPACING = 40;
    const MASS_STRENGTH = 4000; // controls warping amount

    function init() {
        canvas = document.getElementById('dsMetricCanvas');
        if (!canvas) return;
        const container = document.getElementById('dsMetricContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');

        // Start mass in centre
        massX = W * 0.5;
        massY = H * 0.5;

        // Mouse/touch controls
        canvas.addEventListener('mousedown', onDown);
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseup', onUp);
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', onUp);

        running = true;
        draw();
    }

    function onDown(e) {
        dragging = true;
        const rect = canvas.getBoundingClientRect();
        massX = e.clientX - rect.left;
        massY = e.clientY - rect.top;
    }
    function onMove(e) {
        if (!dragging) return;
        const rect = canvas.getBoundingClientRect();
        massX = e.clientX - rect.left;
        massY = e.clientY - rect.top;
    }
    function onUp() { dragging = false; }
    function onTouchStart(e) {
        e.preventDefault();
        dragging = true;
        const rect = canvas.getBoundingClientRect();
        massX = e.touches[0].clientX - rect.left;
        massY = e.touches[0].clientY - rect.top;
    }
    function onTouchMove(e) {
        e.preventDefault();
        if (!dragging) return;
        const rect = canvas.getBoundingClientRect();
        massX = e.touches[0].clientX - rect.left;
        massY = e.touches[0].clientY - rect.top;
    }

    // Displacement field from the mass (Schwarzschild-inspired radial warp)
    function warp(x, y) {
        const dx = x - massX;
        const dy = y - massY;
        const r2 = dx * dx + dy * dy;
        const r = Math.sqrt(r2) + 1;
        const factor = MASS_STRENGTH / (r2 + 200);
        return {
            wx: x + dx * factor * 0.3,
            wy: y + dy * factor * 0.3
        };
    }

    // How much ds is stretched at a point (ratio of warped to flat spacing)
    function dsStretch(x, y) {
        const dx = x - massX;
        const dy = y - massY;
        const r2 = dx * dx + dy * dy;
        return 1 + MASS_STRENGTH * 1.5 / (r2 + 300);
    }

    function draw() {
        if (!running) return;
        ctx.clearRect(0, 0, W, H);

        // Draw warped grid lines
        ctx.lineWidth = 1;

        // Vertical lines
        for (let gx = 0; gx <= W + GRID_SPACING; gx += GRID_SPACING) {
            ctx.beginPath();
            for (let gy = 0; gy <= H; gy += 4) {
                const { wx, wy } = warp(gx, gy);
                if (gy === 0) ctx.moveTo(wx, wy);
                else ctx.lineTo(wx, wy);
            }
            ctx.strokeStyle = 'rgba(100, 160, 255, 0.2)';
            ctx.stroke();
        }

        // Horizontal lines
        for (let gy = 0; gy <= H + GRID_SPACING; gy += GRID_SPACING) {
            ctx.beginPath();
            for (let gx = 0; gx <= W; gx += 4) {
                const { wx, wy } = warp(gx, gy);
                if (gx === 0) ctx.moveTo(wx, wy);
                else ctx.lineTo(wx, wy);
            }
            ctx.strokeStyle = 'rgba(100, 160, 255, 0.2)';
            ctx.stroke();
        }

        // Draw ds rulers at grid intersections
        const rulerLen = 14;
        for (let gx = GRID_SPACING; gx < W; gx += GRID_SPACING * 2) {
            for (let gy = GRID_SPACING; gy < H; gy += GRID_SPACING * 2) {
                const { wx, wy } = warp(gx, gy);
                const stretch = dsStretch(gx, gy);
                const len = rulerLen * stretch;

                // Clamp for visual sanity
                const displayLen = Math.min(len, 50);

                // Color: green=flat, yellow=mild, red=extreme
                const t = Math.min((stretch - 1) / 3, 1);
                const r = Math.floor(80 + 175 * t);
                const g = Math.floor(220 - 140 * t);
                const b = Math.floor(100 - 80 * t);
                const color = `rgba(${r}, ${g}, ${b}, 0.8)`;

                // Horizontal ruler
                ctx.beginPath();
                ctx.moveTo(wx - displayLen / 2, wy);
                ctx.lineTo(wx + displayLen / 2, wy);
                ctx.strokeStyle = color;
                ctx.lineWidth = 2.5;
                ctx.stroke();

                // Tick marks
                ctx.beginPath();
                ctx.moveTo(wx - displayLen / 2, wy - 3);
                ctx.lineTo(wx - displayLen / 2, wy + 3);
                ctx.moveTo(wx + displayLen / 2, wy - 3);
                ctx.lineTo(wx + displayLen / 2, wy + 3);
                ctx.stroke();
            }
        }

        // Draw mass
        const gradient = ctx.createRadialGradient(massX, massY, 0, massX, massY, 40);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.3, 'rgba(200, 200, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
        ctx.beginPath();
        ctx.arc(massX, massY, 40, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Mass core
        ctx.beginPath();
        ctx.arc(massX, massY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // Label
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'center';
        ctx.fillText('M', massX, massY + 20);

        // Legend
        ctx.textAlign = 'left';
        ctx.font = '12px JetBrains Mono, monospace';

        // Green ruler
        ctx.strokeStyle = 'rgba(80, 220, 100, 0.8)';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(15, H - 50); ctx.lineTo(29, H - 50); ctx.stroke();
        ctx.fillStyle = 'rgba(80, 220, 100, 0.8)';
        ctx.fillText('ds = normal (flat space)', 35, H - 46);

        // Red ruler
        ctx.strokeStyle = 'rgba(255, 80, 20, 0.8)';
        ctx.beginPath(); ctx.moveTo(15, H - 30); ctx.lineTo(39, H - 30); ctx.stroke();
        ctx.fillStyle = 'rgba(255, 80, 20, 0.8)';
        ctx.fillText('ds = stretched (near mass)', 45, H - 26);

        animFrame = requestAnimationFrame(draw);
    }

    window.initAnim_dsmetric = function () {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(init, 150);
    };
})();
