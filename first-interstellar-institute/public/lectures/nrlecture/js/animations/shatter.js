// anim-shatter.js - Einstein equation shatters into 10 PDEs
(function () {
    let canvas, ctx, W, H, running = false, shattered = false;
    let particles = [];
    let fragments = [];
    let revealedEqs = 0;
    let eqAlpha = 1;

    const equations = [
        'R\u2080\u2080 - \u00bdg\u2080\u2080R = 8\u03c0T\u2080\u2080',
        'R\u2080\u2081 - \u00bdg\u2080\u2081R = 8\u03c0T\u2080\u2081',
        'R\u2080\u2082 - \u00bdg\u2080\u2082R = 8\u03c0T\u2080\u2082',
        'R\u2080\u2083 - \u00bdg\u2080\u2083R = 8\u03c0T\u2080\u2083',
        'R\u2081\u2081 - \u00bdg\u2081\u2081R = 8\u03c0T\u2081\u2081',
        'R\u2081\u2082 - \u00bdg\u2081\u2082R = 8\u03c0T\u2081\u2082',
        'R\u2081\u2083 - \u00bdg\u2081\u2083R = 8\u03c0T\u2081\u2083',
        'R\u2082\u2082 - \u00bdg\u2082\u2082R = 8\u03c0T\u2082\u2082',
        'R\u2082\u2083 - \u00bdg\u2082\u2083R = 8\u03c0T\u2082\u2083',
        'R\u2083\u2083 - \u00bdg\u2083\u2083R = 8\u03c0T\u2083\u2083'
    ];

    const eqPositions = [];

    function init() {
        canvas = document.getElementById('shatterCanvas');
        if (!canvas) return;
        const container = document.getElementById('shatterContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');
        shattered = false;
        particles = [];
        fragments = [];
        revealedEqs = 0;
        eqAlpha = 1;

        // Precompute equation grid positions
        eqPositions.length = 0;
        const cols = 2, rows = 5;
        const cellW = W / cols, cellH = H / rows;
        for (let i = 0; i < 10; i++) {
            const col = i % cols, row = Math.floor(i / cols);
            eqPositions.push({
                x: cellW * col + cellW / 2,
                y: cellH * row + cellH / 2 + 5,
                alpha: 0
            });
        }

        container.addEventListener('click', shatter);
        running = true;
        animate();
    }

    function shatter() {
        if (shattered) return;
        shattered = true;

        // Create burst particles
        const cx = W / 2, cy = H / 2;
        for (let i = 0; i < 60; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = Math.random() * 4 + 1;
            particles.push({
                x: cx + (Math.random() - 0.5) * 80,
                y: cy + (Math.random() - 0.5) * 20,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s,
                life: 1,
                decay: 0.01 + Math.random() * 0.015,
                size: Math.random() * 3 + 1
            });
        }

        // Reveal equations one by one
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                revealedEqs = i + 1;
                eqPositions[i].alpha = 1;
            }, 400 + i * 150);
        }
    }

    function animate() {
        if (!running) return;
        ctx.clearRect(0, 0, W, H);

        // Draw main equation (fades on shatter)
        if (eqAlpha > 0) {
            if (shattered) eqAlpha -= 0.03;
            ctx.save();
            ctx.globalAlpha = Math.max(0, eqAlpha);
            ctx.font = `${Math.min(W / 12, 48)}px 'EB Garamond', Georgia, serif`;
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Shake if shattering
            let ox = 0, oy = 0;
            if (shattered && eqAlpha > 0.5) {
                ox = (Math.random() - 0.5) * 6;
                oy = (Math.random() - 0.5) * 4;
            }
            ctx.fillText('G\u03BC\u03BD = 8\u03C0 T\u03BC\u03BD', W / 2 + ox, H / 2 + oy);
            ctx.restore();
        }

        // Draw burst particles
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.97;
            p.vy *= 0.97;
            p.life -= p.decay;
            if (p.life > 0) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.life * 0.6})`;
                ctx.fill();
            }
        });
        particles = particles.filter(p => p.life > 0);

        // Draw revealed equations
        ctx.font = `${Math.min(W / 30, 16)}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < revealedEqs; i++) {
            const eq = eqPositions[i];
            ctx.fillStyle = `rgba(204, 204, 204, ${eq.alpha})`;
            ctx.fillText(equations[i], eq.x, eq.y);
        }

        requestAnimationFrame(animate);
    }

    // Called when this slide becomes active
    window.initAnim_shatter = function () {
        running = false;
        setTimeout(init, 100);
    };
})();
