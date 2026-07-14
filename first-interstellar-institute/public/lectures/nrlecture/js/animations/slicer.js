// slicer.js - 3+1 decomposition: slicing spacetime into spatial slices
// Clear visual: a "loaf" with time axis, a knife sweeps through,
// the current slice is shown large on the right with evolving geometry
(function () {
    let canvas, ctx, W, H, running = false;
    let time = 0;
    let knifeT = 0;       // knife position 0..1
    let autoPlay = false;
    let sliceHistory = [];
    const MAX_T = 1.0;

    function init() {
        canvas = document.getElementById('slicerCanvas');
        if (!canvas) return;
        const container = document.getElementById('slicerContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');
        time = 0;
        knifeT = 0;
        autoPlay = false;
        sliceHistory = [];
        running = true;

        container.addEventListener('click', onClick);
        animate();
    }

    function onClick() {
        if (autoPlay) return;
        autoPlay = true;
    }

    // The "physics" on each slice: two black holes orbiting and merging
    // Returns array of {x, y, mass} for a given time t (0..1)
    function getBHPositions(t) {
        if (t < 0.7) {
            // Inspiral: two BHs orbiting, getting closer
            const sep = 0.35 * (1 - t * 1.1);
            const angle = t * 12;
            return [
                { x: sep * Math.cos(angle), y: sep * Math.sin(angle), mass: 0.8 },
                { x: -sep * Math.cos(angle), y: -sep * Math.sin(angle), mass: 0.6 }
            ];
        } else {
            // Merger: single remnant with ring-down oscillation
            const ringdown = Math.exp(-(t - 0.7) * 8);
            const wobble = ringdown * 0.03 * Math.sin(t * 40);
            return [
                { x: wobble, y: 0, mass: 1.4 }
            ];
        }
    }

    // Draw a spatial grid warped by BH positions
    function drawSpatialSlice(cx, cy, size, t, alpha, isThumb) {
        const bhs = getBHPositions(t);
        const gridN = isThumb ? 8 : 16;
        const step = size / gridN;
        const half = size / 2;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Draw warped grid lines
        const lineAlpha = isThumb ? 0.4 : 0.2;
        ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha * alpha})`;
        ctx.lineWidth = isThumb ? 0.8 : 0.5;

        // Horizontal lines
        for (let i = 0; i <= gridN; i++) {
            ctx.beginPath();
            for (let j = 0; j <= gridN * 2; j++) {
                const gx = -half + (j / (gridN * 2)) * size;
                const gy = -half + i * step;
                const w = warpPoint(gx / half, gy / half, bhs);
                const px = cx + w.x * half;
                const py = cy + w.y * half;
                if (j === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
        }

        // Vertical lines
        for (let i = 0; i <= gridN; i++) {
            ctx.beginPath();
            for (let j = 0; j <= gridN * 2; j++) {
                const gx = -half + i * step;
                const gy = -half + (j / (gridN * 2)) * size;
                const w = warpPoint(gx / half, gy / half, bhs);
                const px = cx + w.x * half;
                const py = cy + w.y * half;
                if (j === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
        }

        // Draw black holes
        bhs.forEach(bh => {
            const px = cx + bh.x * half;
            const py = cy + bh.y * half;
            const r = bh.mass * (isThumb ? 4 : 8);

            // Glow
            const grad = ctx.createRadialGradient(px, py, 0, px, py, r * 4);
            grad.addColorStop(0, `rgba(255,255,255,${0.15 * alpha})`);
            grad.addColorStop(0.4, `rgba(0,0,0,${0.3 * alpha})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(px, py, r * 4, 0, Math.PI * 2);
            ctx.fill();

            // Solid core
            ctx.beginPath();
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,0,0,${0.9 * alpha})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(255,255,255,${0.25 * alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        });

        ctx.restore();
    }

    // Warp a point (normalised -1..1) toward black hole positions
    function warpPoint(x, y, bhs) {
        let wx = x, wy = y;
        bhs.forEach(bh => {
            const dx = x - bh.x;
            const dy = y - bh.y;
            const dist = Math.sqrt(dx * dx + dy * dy) + 0.05;
            const strength = bh.mass * 0.06 / (dist * dist);
            wx -= dx * strength;
            wy -= dy * strength;
        });
        return { x: wx, y: wy };
    }

    // Draw the spacetime "loaf" on the left
    function drawLoaf() {
        const loafX = W * 0.06;
        const loafW = W * 0.28;
        const loafTop = H * 0.08;
        const loafBot = H * 0.88;
        const loafH = loafBot - loafTop;

        // Background block
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.strokeRect(loafX, loafTop, loafW, loafH);

        // Fill with subtle gradient
        const grad = ctx.createLinearGradient(loafX, loafTop, loafX, loafBot);
        grad.addColorStop(0, 'rgba(255,255,255,0.02)');
        grad.addColorStop(1, 'rgba(255,255,255,0.005)');
        ctx.fillStyle = grad;
        ctx.fillRect(loafX, loafTop, loafW, loafH);

        // Draw mini spatial patterns at several time positions in the loaf
        const steps = 12;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const y = loafBot - t * loafH;

            // Horizontal reference line
            ctx.strokeStyle = 'rgba(255,255,255,0.04)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(loafX, y);
            ctx.lineTo(loafX + loafW, y);
            ctx.stroke();

            // Mini BH dots in the loaf
            const bhs = getBHPositions(t);
            bhs.forEach(bh => {
                const px = loafX + loafW / 2 + bh.x * loafW * 0.35;
                const py = y;
                ctx.beginPath();
                ctx.arc(px, py, bh.mass * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.12)';
                ctx.fill();
            });
        }

        // Worldlines of BHs through the loaf (faint trace)
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 0.5;
        for (let bhIdx = 0; bhIdx < 2; bhIdx++) {
            ctx.beginPath();
            for (let i = 0; i <= 60; i++) {
                const t = i / 60;
                const bhs = getBHPositions(t);
                if (bhIdx >= bhs.length) continue;
                const bh = bhs[bhIdx];
                const px = loafX + loafW / 2 + bh.x * loafW * 0.35;
                const py = loafBot - t * loafH;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
        }

        // Time arrow
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';

        // Arrow on the left
        ctx.save();
        ctx.translate(loafX - 14, loafTop + loafH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('TIME', 0, 0);
        ctx.restore();

        // Arrow head
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(loafX - 8, loafTop + 25);
        ctx.lineTo(loafX - 8, loafTop + 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(loafX - 12, loafTop + 12);
        ctx.lineTo(loafX - 8, loafTop + 3);
        ctx.lineTo(loafX - 4, loafTop + 12);
        ctx.stroke();

        // Space label at bottom
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.textAlign = 'center';
        ctx.fillText('SPACE', loafX + loafW / 2, loafBot + 18);

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText('4D Spacetime', loafX + loafW / 2, loafTop - 8);

        // ---- Knife / slice plane ----
        const knifeY = loafBot - knifeT * loafH;

        // Highlight the current slice line
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(loafX - 2, knifeY);
        ctx.lineTo(loafX + loafW + 2, knifeY);
        ctx.stroke();

        // Glow around knife
        const knifeGrad = ctx.createLinearGradient(loafX, knifeY - 8, loafX, knifeY + 8);
        knifeGrad.addColorStop(0, 'rgba(255,255,255,0)');
        knifeGrad.addColorStop(0.5, 'rgba(255,255,255,0.08)');
        knifeGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = knifeGrad;
        ctx.fillRect(loafX, knifeY - 8, loafW, 16);

        // Time label next to knife
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`t = ${knifeT.toFixed(2)}`, loafX + loafW + 8, knifeY + 4);

        // Dashed connector from knife to the big slice on the right
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(loafX + loafW + 2, knifeY);
        ctx.lineTo(W * 0.42, H * 0.5);
        ctx.stroke();
        ctx.setLineDash([]);

        // Past slice lines in the loaf
        sliceHistory.forEach(s => {
            const sy = loafBot - s.t * loafH;
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(loafX, sy);
            ctx.lineTo(loafX + loafW, sy);
            ctx.stroke();
        });

        return { loafX, loafW, loafTop, loafBot, loafH };
    }

    // Draw the big spatial slice on the right
    function drawCurrentSlice() {
        // Reserve bottom strip for filmstrip
        const thumbH = 60;
        const filmstripTop = H - thumbH - 16;

        // Main slice fits between top and filmstrip
        const availH = filmstripTop - 30; // 30px gap above filmstrip
        const sliceSize = Math.min(W * 0.34, availH * 0.85);
        const cx = W * 0.42 + sliceSize / 2 + 20;
        const cy = 10 + sliceSize / 2;

        // Border
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(cx - sliceSize / 2 - 5, cy - sliceSize / 2 - 5, sliceSize + 10, sliceSize + 10);

        drawSpatialSlice(cx, cy, sliceSize, knifeT, 1.0, false);

        // Label below main slice
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`3D Spatial Slice at t = ${knifeT.toFixed(2)}`, cx, cy + sliceSize / 2 + 18);

        // Phase label
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '9px JetBrains Mono, monospace';
        if (knifeT < 0.7) {
            ctx.fillText('Binary inspiral', cx, cy + sliceSize / 2 + 32);
        } else {
            ctx.fillText('Post-merger remnant', cx, cy + sliceSize / 2 + 32);
        }
    }

    // Draw past slice thumbnails along the bottom
    function drawHistory() {
        if (sliceHistory.length === 0) return;
        const thumbSize = 60;
        const gap = 8;
        const maxShow = Math.min(sliceHistory.length, Math.floor((W * 0.56) / (thumbSize + gap)));
        const startIdx = Math.max(0, sliceHistory.length - maxShow);
        const totalW = maxShow * (thumbSize + gap) - gap;
        const baseX = W * 0.42 + (W * 0.56 - totalW) / 2;
        const baseY = H - thumbSize - 6;

        for (let i = startIdx; i < sliceHistory.length; i++) {
            const idx = i - startIdx;
            const tx = baseX + idx * (thumbSize + gap) + thumbSize / 2;
            const ty = baseY + thumbSize / 2;

            // Background fill
            ctx.fillStyle = 'rgba(255,255,255,0.02)';
            ctx.fillRect(tx - thumbSize / 2, ty - thumbSize / 2, thumbSize, thumbSize);

            // Border
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(tx - thumbSize / 2, ty - thumbSize / 2, thumbSize, thumbSize);

            drawSpatialSlice(tx, ty, thumbSize, sliceHistory[i].t, 0.8, true);

            // Time label above each thumbnail
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '8px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`t=${sliceHistory[i].t.toFixed(1)}`, tx, baseY - 4);
        }
    }

    function animate() {
        if (!running) return;
        time += 0.016;
        ctx.clearRect(0, 0, W, H);

        // Auto-advance the knife
        if (autoPlay && knifeT < MAX_T) {
            knifeT += 0.002;

            // Record slice snapshots at regular intervals
            const interval = 0.15;
            const lastSnap = sliceHistory.length > 0 ? sliceHistory[sliceHistory.length - 1].t : -1;
            if (knifeT - lastSnap >= interval) {
                sliceHistory.push({ t: knifeT });
            }

            if (knifeT >= MAX_T) {
                knifeT = MAX_T;
                // Restart after pause
                setTimeout(() => {
                    knifeT = 0;
                    sliceHistory = [];
                }, 3000);
            }
        }

        drawLoaf();
        drawCurrentSlice();
        drawHistory();

        requestAnimationFrame(animate);
    }

    window.initAnim_slicer = function () {
        running = false;
        setTimeout(init, 100);
    };
})();
