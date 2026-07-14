// convergence.js — Richardson convergence testing demonstration
// Shows three resolution waveforms (coarse/medium/fine) with live Q-factor readout.
// For a 4th-order code with refinement ratio 2, Q → 2^4 = 16.
(function () {
    let canvas, ctx, W, H, running = false;
    let animFrame;
    let time = 0;
    const LOOP_DURATION = 900;
    const SWEEP_SPEED = 0.0018;

    const ORDER = 4;
    const RATIO = 2;
    const Q_EXPECTED = Math.pow(RATIO, ORDER); // 16

    const ERR_COARSE = 0.14;
    const ERR_MEDIUM = ERR_COARSE / Math.pow(RATIO, ORDER);
    const ERR_FINE   = ERR_COARSE / Math.pow(RATIO * 2, ORDER);

    const COL_COARSE = 'rgba(255,90,90,';
    const COL_MEDIUM = 'rgba(255,220,70,';
    const COL_FINE   = 'rgba(90,230,120,';
    const COL_EXACT  = 'rgba(255,255,255,';

    function exactWave(t) {
        var freq = 5 + t * 12;
        var amp = 0.85 * Math.exp(-t * 1.2);
        return amp * Math.sin(freq * Math.PI * 2 * t);
    }

    function numError(t, errAmp) {
        return errAmp * (
            Math.sin(31.7 * t + 1.3) * 0.45 +
            Math.sin(53.1 * t + 2.7) * 0.35 +
            Math.sin(97.3 * t + 0.8) * 0.20
        );
    }

    function coarseWave(t) { return exactWave(t) + numError(t, ERR_COARSE); }
    function mediumWave(t) { return exactWave(t) + numError(t, ERR_MEDIUM); }
    function fineWave(t)   { return exactWave(t) + numError(t, ERR_FINE); }

    function computeQ(tEnd) {
        if (tEnd < 0.06) return NaN;
        var N = Math.floor(tEnd * 300);
        if (N < 8) return NaN;
        var sumNum = 0, sumDen = 0;
        for (var i = 1; i <= N; i++) {
            var t = (i / N) * tEnd;
            var dc = coarseWave(t) - mediumWave(t);
            var dm = mediumWave(t) - fineWave(t);
            sumNum += dc * dc;
            sumDen += dm * dm;
        }
        if (sumDen < 1e-20) return NaN;
        return Math.sqrt(sumNum / sumDen);
    }

    function init() {
        canvas = document.getElementById('convergenceCanvas');
        if (!canvas) return;
        var container = document.getElementById('convergenceContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');
        running = true;
        time = 0;
        container.onclick = function () { time = 0; };
        animate();
    }

    function drawWaveform(x0, baseY, plotW, plotH, waveFn, sweep, colorBase, alpha, lineW) {
        var N = 500;
        if (sweep <= 0.002) return;
        ctx.strokeStyle = colorBase + alpha + ')';
        ctx.lineWidth = lineW;
        ctx.beginPath();
        var first = true;
        for (var i = 0; i <= N; i++) {
            var t = sweep * (i / N);
            var px = x0 + t * plotW;
            var py = baseY - waveFn(t) * plotH * 0.42;
            if (first) { ctx.moveTo(px, py); first = false; }
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }

    function animate() {
        if (!running) return;
        animFrame = requestAnimationFrame(animate);

        time += 1;
        if (time > LOOP_DURATION) time = 0;

        ctx.clearRect(0, 0, W, H);

        // Layout: generous margins, single plot area
        var pad = { left: 40, right: 20, top: 14, bottom: 14 };
        var plotW = W - pad.left - pad.right;
        var plotH = H - pad.top - pad.bottom;
        var x0 = pad.left;
        var baseY = pad.top + plotH * 0.5; // centre line

        var sweep = Math.min(1.0, time * SWEEP_SPEED);

        // Axes
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x0, baseY);
        ctx.lineTo(x0 + plotW, baseY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x0, pad.top);
        ctx.lineTo(x0, pad.top + plotH);
        ctx.stroke();

        // Sweep line
        var sx = x0 + sweep * plotW;
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(sx, pad.top);
        ctx.lineTo(sx, pad.top + plotH);
        ctx.stroke();
        ctx.setLineDash([]);

        // Waveforms
        drawWaveform(x0, baseY, plotW, plotH, exactWave, sweep, COL_EXACT, '0.12', 1.5);
        drawWaveform(x0, baseY, plotW, plotH, fineWave, sweep, COL_FINE, '0.8', 1.8);
        drawWaveform(x0, baseY, plotW, plotH, mediumWave, sweep, COL_MEDIUM, '0.7', 1.5);
        drawWaveform(x0, baseY, plotW, plotH, coarseWave, sweep, COL_COARSE, '0.75', 1.5);

        // Legend — bottom-left, inside the plot area
        var lx = x0 + 8;
        var ly = pad.top + plotH - 56;
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        var entries = [
            { col: COL_EXACT + '0.15)', lbl: 'exact' },
            { col: COL_COARSE + '0.85)', lbl: '\u0394x  coarse' },
            { col: COL_MEDIUM + '0.85)', lbl: '\u0394x/2 medium' },
            { col: COL_FINE + '0.85)', lbl: '\u0394x/4 fine' }
        ];
        for (var i = 0; i < entries.length; i++) {
            var ey = ly + i * 13;
            ctx.strokeStyle = entries[i].col;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(lx, ey);
            ctx.lineTo(lx + 14, ey);
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.fillText(entries[i].lbl, lx + 20, ey + 3);
        }

        // Q readout — top-right corner, compact
        var Q = computeQ(sweep);
        var qx = x0 + plotW - 8;
        var qy = pad.top + 8;

        // panel background
        var pw = 180, ph = 44;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(qx - pw, qy - 4, pw + 4, ph, 4);
            ctx.fill();
        } else {
            ctx.fillRect(qx - pw, qy - 4, pw + 4, ph);
        }

        ctx.textAlign = 'right';
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText('CONVERGENCE FACTOR', qx, qy + 8);

        if (isNaN(Q)) {
            ctx.font = 'bold 14px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillText('Q = ---', qx, qy + 28);
        } else {
            var err = Math.abs(Q - Q_EXPECTED) / Q_EXPECTED;
            var qColor = err < 0.05 ? COL_FINE + '0.95)'
                       : err < 0.15 ? COL_MEDIUM + '0.9)'
                       : COL_COARSE + '0.8)';

            ctx.font = 'bold 14px JetBrains Mono, monospace';
            ctx.fillStyle = qColor;
            ctx.fillText('Q = ' + Q.toFixed(1), qx - 90, qy + 28);

            ctx.font = '9px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.fillText('expect ' + Q_EXPECTED + ' (4th order)', qx, qy + 28);
        }

        // Axis labels — small, out of the way
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.textAlign = 'center';
        ctx.fillText('t / M', x0 + plotW / 2, pad.top + plotH + 12);
        ctx.save();
        ctx.translate(x0 - 14, baseY);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('\u03C8\u2084', 0, 0);
        ctx.restore();
    }

    window.initAnim_convergence = function () {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(init, 150);
    };
})();
