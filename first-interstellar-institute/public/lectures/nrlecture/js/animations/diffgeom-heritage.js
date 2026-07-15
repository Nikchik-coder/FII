// diffgeom-heritage.js - Pre-Einstein differential geometry that GR is built on
(function () {
    let canvas, ctx, W, H, running = false;
    let animFrame;
    let t0 = 0;

    function init() {
        canvas = document.getElementById('diffGeomCanvas');
        if (!canvas) return;
        const container = document.getElementById('diffGeomContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');
        t0 = performance.now();
        running = true;
        draw();
    }

    function panels() {
        const pad = 12;
        const gap = 14;
        const topH = Math.floor(H * 0.62);
        const cardW = (W - pad * 2 - gap * 2) / 3;
        return {
            pad,
            gap,
            topH,
            cards: [
                { x: pad, y: pad, w: cardW, h: topH - pad, title: 'GAUSS', year: '1827', sub: 'Curvature of surfaces' },
                { x: pad + cardW + gap, y: pad, w: cardW, h: topH - pad, title: 'RIEMANN', year: '1854', sub: 'Manifolds & metric' },
                { x: pad + (cardW + gap) * 2, y: pad, w: cardW, h: topH - pad, title: 'CONNECTION', year: '1869–1900', sub: 'How directions twist' }
            ],
            timelineY: topH + 8,
            timelineH: H - topH - 16
        };
    }

    function clipCard(card) {
        ctx.save();
        ctx.beginPath();
        roundRect(card.x, card.y, card.w, card.h, 4);
        ctx.clip();
    }

    function roundRect(x, y, w, h, r) {
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    function drawCardFrame(card) {
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        roundRect(card.x, card.y, card.w, card.h, 4);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(card.title, card.x + 10, card.y + 18);
        ctx.fillStyle = 'rgba(180,180,180,0.55)';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(card.year, card.x + card.w - 10, card.y + 18);
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(160,160,160,0.7)';
        ctx.fillText(card.sub, card.x + 10, card.y + card.h - 10);
    }

    // --- Panel 1: Gauss — sphere with great-circle geodesics ---
    function drawGauss(card, t) {
        clipCard(card);
        const cx = card.x + card.w * 0.5;
        const cy = card.y + card.h * 0.52;
        const R = Math.min(card.w, card.h) * 0.32;

        // Sphere body
        const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
        g.addColorStop(0, 'rgba(90, 130, 170, 0.55)');
        g.addColorStop(1, 'rgba(30, 45, 65, 0.9)');
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = 'rgba(180, 210, 240, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Latitude / longitude (Gaussian surface chart)
        ctx.strokeStyle = 'rgba(160, 200, 240, 0.22)';
        ctx.lineWidth = 1;
        for (let i = -2; i <= 2; i++) {
            const lat = i * 0.45;
            ctx.beginPath();
            for (let a = 0; a <= Math.PI; a += 0.05) {
                const x = cx + R * Math.cos(lat) * Math.cos(a - Math.PI / 2);
                const y = cy + R * Math.sin(lat) * 0.92 + R * 0.15 * Math.sin(a);
                // simple orthographic-ish front hemisphere
                const u = cx + R * Math.sin(a) * Math.cos(lat);
                const v = cy + R * (Math.cos(a) * 0.35 + Math.sin(lat) * 0.85);
                if (a === 0) ctx.moveTo(u, v);
                else ctx.lineTo(u, v);
            }
            ctx.stroke();
        }

        // Two great-circle geodesics (animated dash offset)
        const phase = t * 0.0004;
        drawGreatCircle(cx, cy, R, 0.2 + phase, 0.9, 'rgba(220, 235, 255, 0.85)');
        drawGreatCircle(cx, cy, R, 1.1 - phase * 0.7, -0.4, 'rgba(140, 200, 255, 0.75)');

        // Intersection point
        ctx.beginPath();
        ctx.arc(cx + R * 0.15, cy - R * 0.25, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        ctx.restore();
        drawCardFrame(card);
    }

    function drawGreatCircle(cx, cy, R, tilt, twist, color) {
        ctx.beginPath();
        let first = true;
        for (let a = 0; a <= Math.PI * 2; a += 0.04) {
            const x3 = Math.cos(a);
            const y3 = Math.sin(a) * Math.cos(tilt);
            const z3 = Math.sin(a) * Math.sin(tilt);
            // rotate around vertical
            const xr = x3 * Math.cos(twist) - z3 * Math.sin(twist);
            const zr = x3 * Math.sin(twist) + z3 * Math.cos(twist);
            if (zr < -0.05) { first = true; continue; } // back side
            const u = cx + R * xr;
            const v = cy - R * y3 * 0.92;
            if (first) { ctx.moveTo(u, v); first = false; }
            else ctx.lineTo(u, v);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // --- Panel 2: Riemann — curved manifold with metric grid ---
    function drawRiemann(card, t) {
        clipCard(card);
        const cx = card.x + card.w * 0.5;
        const cy = card.y + card.h * 0.5;
        const pulse = 0.85 + 0.15 * Math.sin(t * 0.0015);

        function surface(u, v) {
            // bump = local curvature (Riemannian manifold vignette)
            const rr = Math.sqrt(u * u + v * v);
            const bump = 28 * Math.exp(-rr * rr * 2.2) * pulse;
            const wave = 4 * Math.sin(u * 3 + t * 0.001) * Math.cos(v * 2);
            return {
                x: cx + u * card.w * 0.38,
                y: cy + v * card.h * 0.32 - bump - wave
            };
        }

        ctx.strokeStyle = 'rgba(120, 180, 230, 0.35)';
        ctx.lineWidth = 1;
        const steps = 12;
        for (let i = 0; i <= steps; i++) {
            const u = -1 + 2 * (i / steps);
            ctx.beginPath();
            for (let j = 0; j <= 40; j++) {
                const v = -1 + 2 * (j / 40);
                const p = surface(u, v);
                if (j === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
        }
        for (let j = 0; j <= steps; j++) {
            const v = -1 + 2 * (j / steps);
            ctx.beginPath();
            for (let i = 0; i <= 40; i++) {
                const u = -1 + 2 * (i / 40);
                const p = surface(u, v);
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
        }

        // ds ruler on the surface
        const a = surface(0.15, 0.1);
        const b = surface(0.45, 0.12);
        ctx.strokeStyle = 'rgba(255, 210, 140, 0.9)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 210, 140, 0.85)';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ds', (a.x + b.x) / 2, (a.y + b.y) / 2 - 8);

        ctx.restore();
        drawCardFrame(card);
    }

    // --- Panel 3: Connection — parallel transport on a sphere ---
    function drawConnection(card, t) {
        clipCard(card);
        const cx = card.x + card.w * 0.5;
        const cy = card.y + card.h * 0.52;
        const R = Math.min(card.w, card.h) * 0.30;

        // Sphere
        const g = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.3, R * 0.1, cx, cy, R);
        g.addColorStop(0, 'rgba(70, 100, 130, 0.5)');
        g.addColorStop(1, 'rgba(25, 35, 50, 0.95)');
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = 'rgba(160, 190, 220, 0.3)';
        ctx.stroke();

        // Closed triangular path of geodesics (latitude → meridian → equator-ish)
        const path = [];
        const n = 60;
        // leg 1: along equator
        for (let i = 0; i <= n; i++) {
            const a = -0.7 + 1.4 * (i / n);
            path.push(spherePoint(cx, cy, R, a, 0.15));
        }
        // leg 2: up a meridian
        for (let i = 1; i <= n; i++) {
            const b = 0.15 + 0.95 * (i / n);
            path.push(spherePoint(cx, cy, R, 0.7, b));
        }
        // leg 3: back
        for (let i = 1; i <= n; i++) {
            const a = 0.7 - 1.4 * (i / n);
            const b = 1.1;
            path.push(spherePoint(cx, cy, R, a, b * (1 - i / n) + 0.15 * (i / n)));
        }

        ctx.beginPath();
        path.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = 'rgba(180, 210, 255, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Animate arrow along path — returns rotated (holonomy = curvature)
        const total = path.length - 1;
        const s = ((t * 0.04) % total);
        const i0 = Math.floor(s);
        const i1 = Math.min(i0 + 1, total);
        const f = s - i0;
        const px = path[i0].x + (path[i1].x - path[i0].x) * f;
        const py = path[i0].y + (path[i1].y - path[i0].y) * f;
        const ang = Math.atan2(path[i1].y - path[i0].y, path[i1].x - path[i0].x);
        // Extra holonomy twist accumulates along the loop
        const holonomy = (s / total) * 0.55;
        drawArrow(px, py, ang + holonomy, 'rgba(255, 220, 160, 0.95)');

        ctx.fillStyle = 'rgba(200,200,200,0.55)';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('parallel transport', cx, card.y + card.h - 28);

        ctx.restore();
        drawCardFrame(card);
    }

    function spherePoint(cx, cy, R, lon, lat) {
        const x = Math.cos(lat) * Math.sin(lon);
        const y = Math.sin(lat);
        const z = Math.cos(lat) * Math.cos(lon);
        return {
            x: cx + R * x,
            y: cy - R * y * 0.95,
            z
        };
    }

    function drawArrow(x, y, ang, color) {
        const len = 18;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-len * 0.3, 0);
        ctx.lineTo(len * 0.55, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(len * 0.55, 0);
        ctx.lineTo(len * 0.25, -5);
        ctx.lineTo(len * 0.25, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // --- Timeline: math → Einstein ---
    function drawTimeline(layout, t) {
        const y = layout.timelineY + layout.timelineH * 0.42;
        const left = layout.pad + 20;
        const right = W - layout.pad - 20;

        const events = [
            { year: '1827', name: 'Gauss', tip: 'surface curvature' },
            { year: '1854', name: 'Riemann', tip: 'manifolds' },
            { year: '1869', name: 'Christoffel', tip: 'Γ symbols' },
            { year: '1900', name: 'Ricci–Levi-Civita', tip: 'tensor calculus' },
            { year: '1915', name: 'Einstein', tip: 'gravity = geometry', highlight: true }
        ];

        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
        ctx.stroke();

        events.forEach((ev, i) => {
            const x = left + (i / (events.length - 1)) * (right - left);
            const pulse = ev.highlight ? 1 + 0.08 * Math.sin(t * 0.004) : 1;

            ctx.beginPath();
            ctx.arc(x, y, (ev.highlight ? 6 : 4) * pulse, 0, Math.PI * 2);
            ctx.fillStyle = ev.highlight ? '#fff' : 'rgba(180,180,180,0.7)';
            ctx.fill();

            ctx.textAlign = 'center';
            ctx.font = 'bold 12px JetBrains Mono, monospace';
            ctx.fillStyle = ev.highlight ? '#fff' : 'rgba(220,220,220,0.85)';
            ctx.fillText(ev.year, x, y - 16);

            ctx.font = '12px EB Garamond, serif';
            ctx.fillStyle = ev.highlight ? 'rgba(255,255,255,0.95)' : 'rgba(200,200,200,0.75)';
            ctx.fillText(ev.name, x, y + 22);

            ctx.font = '9px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(150,150,150,0.7)';
            ctx.fillText(ev.tip, x, y + 38);
        });

        // Bridge caption
        ctx.textAlign = 'center';
        ctx.font = '12px EB Garamond, serif';
        ctx.fillStyle = 'rgba(200,200,200,0.8)';
        ctx.fillText(
            'Einstein did not invent this math — he recognized that gravity is spacetime curvature.',
            W / 2,
            layout.timelineY + layout.timelineH - 4
        );
    }

    function draw() {
        if (!running) return;
        const t = performance.now() - t0;
        ctx.clearRect(0, 0, W, H);

        const layout = panels();
        drawGauss(layout.cards[0], t);
        drawRiemann(layout.cards[1], t);
        drawConnection(layout.cards[2], t);
        drawTimeline(layout, t);

        animFrame = requestAnimationFrame(draw);
    }

    window.initAnim_diffgeom = function () {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(init, 120);
    };
})();
