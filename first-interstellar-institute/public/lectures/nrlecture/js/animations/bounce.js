// anim-bounce.js - Wormhole collapse and phantom bounce
(function () {
    let canvas, ctx, W, H, running = false;
    let time = 0;
    let phase = 0; // 0=stable, 1=fading, 2=collapse, 3=horizon, 4=bounce
    let throatRadius = 1.0;
    let targetRadius = 1.0;
    let rotation = 0;
    let waveRings = [];
    let exoticAlpha = 1.0;
    let horizonAlpha = 0;
    let flashAlpha = 0;
    let statusText = 'Stable Wormhole';

    function init() {
        canvas = document.getElementById('bounceCanvas');
        if (!canvas) return;
        const container = document.getElementById('bounceContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');
        time = 0;
        phase = 0;
        throatRadius = 1.0;
        targetRadius = 1.0;
        rotation = 0;
        waveRings = [];
        exoticAlpha = 1.0;
        horizonAlpha = 0;
        flashAlpha = 0;
        statusText = 'Stable Wormhole';
        running = true;

        container.addEventListener('click', startCollapse);
        animate();
    }

    function startCollapse() {
        if (phase !== 0) return;

        // Phase 1: exotic matter fading
        phase = 1;
        statusText = 'Exotic matter fading...';

        setTimeout(() => {
            phase = 2;
            statusText = 'Throat collapsing';
            targetRadius = 0.15;
        }, 2500);

        setTimeout(() => {
            phase = 3;
            statusText = 'Apparent Horizon forms';
            flashAlpha = 0.8;
        }, 5000);

        setTimeout(() => {
            phase = 4;
            statusText = 'Phantom Bounce!';
            targetRadius = 1.8;
            flashAlpha = 0.6;
            // Emit wave rings
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    waveRings.push({ radius: 30, alpha: 0.6, speed: 1.5 + Math.random() * 0.5 });
                }, i * 200);
            }
        }, 7000);
    }

    function drawWormhole(cx, cy, scale) {
        const s = scale * Math.min(W, H) * 0.3;
        const throat = throatRadius * s * 0.3;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);

        // Draw funnel shape (wireframe)
        const segments = 40;
        const rings = 12;

        for (let r = 0; r < rings; r++) {
            const t = (r / (rings - 1) - 0.5) * 2; // -1 to 1
            const radius = throat + Math.abs(t) * s * 0.6;
            const y = t * s * 0.5;
            const alpha = phase >= 2 && phase < 4 ? 0.15 + Math.sin(time * 8) * 0.05 : 0.15;

            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();

            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const px = Math.cos(angle) * radius * (0.7 + 0.3 * Math.cos(angle * 2 + time));
                const py = y + Math.sin(angle) * radius * 0.3;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
        }

        // Vertical lines (ribs)
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.beginPath();
            for (let r = 0; r < rings; r++) {
                const t = (r / (rings - 1) - 0.5) * 2;
                const radius = throat + Math.abs(t) * s * 0.6;
                const y = t * s * 0.5;
                const px = Math.cos(angle) * radius * (0.7 + 0.3 * Math.cos(angle * 2 + time));
                const py = y + Math.sin(angle) * radius * 0.3;
                if (r === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
        }

        // Exotic matter particles (ring at throat)
        if (exoticAlpha > 0.01) {
            for (let i = 0; i < 20; i++) {
                const a = (i / 20) * Math.PI * 2 + time * 2;
                const r = throat + Math.sin(time * 3 + i) * 5;
                const px = Math.cos(a) * r;
                const py = Math.sin(a) * r * 0.3;
                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200, 200, 200, ${exoticAlpha * 0.6})`;
                ctx.fill();
            }
        }

        // Horizon (dark sphere)
        if (horizonAlpha > 0.01) {
            ctx.beginPath();
            ctx.arc(0, 0, throat * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${horizonAlpha})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(255, 255, 255, ${horizonAlpha * 0.3})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        ctx.restore();

        // Wave rings (in world space)
        waveRings.forEach(w => {
            w.radius += w.speed;
            w.alpha *= 0.985;
            ctx.beginPath();
            ctx.arc(cx, cy, w.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${w.alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        });
        waveRings = waveRings.filter(w => w.alpha > 0.01);
    }

    function animate() {
        if (!running) return;
        time += 0.016;
        rotation += 0.003;

        // Interpolate throat
        throatRadius += (targetRadius - throatRadius) * 0.015;

        // Phase logic
        if (phase === 1) exoticAlpha *= 0.99;
        if (phase === 3) { horizonAlpha = Math.min(horizonAlpha + 0.01, 0.9); }
        if (phase === 4) { horizonAlpha *= 0.97; }
        if (flashAlpha > 0) flashAlpha *= 0.93;

        ctx.clearRect(0, 0, W, H);

        // Flash
        if (flashAlpha > 0.01) {
            ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
            ctx.fillRect(0, 0, W, H);
        }

        drawWormhole(W / 2, H / 2, 1);

        // Status text
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText(statusText, W / 2, H - 15);

        // Phase dots
        const dotY = 20;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(W / 2 - 30 + i * 15, dotY, 3, 0, Math.PI * 2);
            if (i === phase) {
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.fill();
            } else if (i < phase) {
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fill();
            } else {
                ctx.strokeStyle = 'rgba(255,255,255,0.15)';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }

        requestAnimationFrame(animate);
    }

    window.initAnim_bounce = function () {
        running = false;
        setTimeout(init, 100);
    };
})();
