// convergence.js — Richardson convergence testing demonstration
// Shows three resolution waveforms (coarse/medium/fine) with live Q-factor readout.
// For a 4th-order code with refinement ratio 2, Q → 2^4 = 16.
(function () {
    let canvas, ctx, W, H, running = false;
    let animFrame;
    let time = 0;
    const LOOP_DURATION = 900;   // frames before reset
    const SWEEP_SPEED = 0.0018;  // fraction of plot per frame

    // Resolution scaling: coarse=1, medium=1/2, fine=1/4
    // Error scales as Δx^n with n=4 (4th-order convergence)
    const ORDER = 4;
    const RATIO = 2;             // refinement ratio
    const Q_EXPECTED = Math.pow(RATIO, ORDER); // = 16

    // Error amplitudes for each resolution
    const ERR_COARSE = 0.14;
    const ERR_MEDIUM = ERR_COARSE / Math.pow(RATIO, ORDER);   // Δx/2
    const ERR_FINE   = ERR_COARSE / Math.pow(RATIO * 2, ORDER); // Δx/4

    // Colors
    const COL_COARSE = 'rgba(255,90,90,';     // red
    const COL_MEDIUM = 'rgba(255,220,70,';     // yellow
    const COL_FINE   = 'rgba(90,230,120,';     // green
    const COL_EXACT  = 'rgba(255,255,255,';    // white (drawn dim)

    // ---- Exact (analytic) waveform: damped chirp-like sinusoid ----
    function exactWave(t) {
        // t in [0,1]
        const freq = 5 + t * 12;
        const amp = 0.85 * Math.exp(-t * 1.2);
        return amp * Math.sin(freq * Math.PI * 2 * t);
    }

    // ---- Numerical error at a given resolution ----
    // Structured, deterministic error that's smooth but resolution-dependent
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

    // ---- Compute running Q-factor ----
    function computeQ(tEnd) {
        if (tEnd < 0.06) return NaN;
        const N = Math.floor(tEnd * 300);
        if (N < 8) return NaN;
        let sumNum = 0, sumDen = 0;
        for (let i = 1; i <= N; i++) {
            const t = (i / N) * tEnd;
            const dc = coarseWave(t) - mediumWave(t);
            const dm = mediumWave(t) - fineWave(t);
            sumNum += dc * dc;
            sumDen += dm * dm;
        }
        if (sumDen < 1e-20) return NaN;
        return Math.sqrt(sumNum / sumDen);
    }

    // ---- Init ----
    function init() {
        canvas = document.getElementById('convergenceCanvas');
        if (!canvas) return;
        const container = document.getElementById('convergenceContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');
        running = true;
        time = 0;
        container.onclick = function () {
            time = 0;
        };
        animate();
    }

    // ---- Draw helpers ----
    function drawAxes(x0, baseY, plotW, plotH) {
        // Horizontal axis
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x0, baseY);
        ctx.lineTo(x0 + plotW, baseY);
        ctx.stroke();

        // Vertical axis
        ctx.beginPath();
        ctx.moveTo(x0, baseY - plotH * 0.52);
        ctx.lineTo(x0, baseY + plotH * 0.52);
        ctx.stroke();

        // Axis labels
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('coordinate time  t / M', x0 + plotW / 2, baseY + plotH * 0.62);

        ctx.save();
        ctx.translate(x0 - 20, baseY);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('ψ₄  (Weyl scalar)', 0, 0);
        ctx.restore();
    }

    function drawWaveform(x0, baseY, plotW, plotH, waveFn, sweep, colorBase, alpha, lineW) {
        const N = 500;
        const drawEnd = sweep;
        if (drawEnd <= 0.002) return;

        ctx.strokeStyle = colorBase + alpha + ')';
        ctx.lineWidth = lineW;
        ctx.beginPath();
        let first = true;
        for (let i = 0; i <= N; i++) {
            const t = drawEnd * (i / N);
            const px = x0 + t * plotW;
            const py = baseY - waveFn(t) * plotH * 0.44;
            if (first) { ctx.moveTo(px, py); first = false; }
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }

    function drawLegend(x0, baseY, plotH) {
        const lx = x0 + 10;
        const ly = baseY + plotH * 0.34;
        const spacing = 16;

        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'left';

        const entries = [
            { color: COL_EXACT + '0.15)', label: 'exact (analytic)' },
            { color: COL_COARSE + '0.85)', label: 'Δx       (coarse)' },
            { color: COL_MEDIUM + '0.85)', label: 'Δx/2    (medium)' },
            { color: COL_FINE + '0.85)', label: 'Δx/4    (fine)' }
        ];

        entries.forEach(function (e, idx) {
            const ey = ly + idx * spacing;
            // Color swatch line
            ctx.strokeStyle = e.color;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(lx, ey);
            ctx.lineTo(lx + 20, ey);
            ctx.stroke();
            // Label
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillText(e.label, lx + 28, ey + 4);
        });
    }

    function drawQReadout(x0, baseY, plotW, plotH, sweep) {
        const Q = computeQ(sweep);
        const rx = x0 + plotW - 12;
        const ry = baseY - plotH * 0.42;

        // Background panel
        const panelW = 260;
        const panelH = 72;
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.roundRect(rx - panelW - 8, ry - 6, panelW + 16, panelH, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.roundRect(rx - panelW - 8, ry - 6, panelW + 16, panelH, 6);
        ctx.stroke();

        ctx.textAlign = 'right';

        // Title
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText('RICHARDSON CONVERGENCE TEST', rx, ry + 10);

        // Q formula
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText('Q = ‖f_Δx − f_{Δx/2}‖ / ‖f_{Δx/2} − f_{Δx/4}‖', rx, ry + 27);

        // Q value
        ctx.font = 'bold 16px JetBrains Mono, monospace';
        if (isNaN(Q)) {
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillText('Q = ---', rx, ry + 50);
        } else {
            // Color Q based on how close to expected
            const err = Math.abs(Q - Q_EXPECTED) / Q_EXPECTED;
            let qColor;
            if (err < 0.05) qColor = COL_FINE + '0.95)';
            else if (err < 0.15) qColor = COL_MEDIUM + '0.9)';
            else qColor = COL_COARSE + '0.8)';

            ctx.fillStyle = qColor;
            ctx.fillText('Q = ' + Q.toFixed(1), rx - 130, ry + 50);

            ctx.font = '11px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.fillText('→  expected: ' + Q_EXPECTED + '  (4th order)', rx, ry + 50);
        }
    }

    function drawDiffPanel(x0, baseY, plotW, plotH, sweep) {
        // Show |coarse - medium| vs |medium - fine| in a small sub-plot below axes
        const diffH = plotH * 0.22;
        const diffY = baseY + plotH * 0.72;

        // Sub-axis
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x0, diffY);
        ctx.lineTo(x0 + plotW, diffY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('residuals', x0 + 4, diffY - diffH * 0.9);

        if (sweep < 0.01) return;

        const N = 400;
        const drawEnd = sweep;

        // |coarse - medium|
        ctx.strokeStyle = COL_COARSE + '0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        let first = true;
        for (let i = 0; i <= N; i++) {
            const t = drawEnd * (i / N);
            const diff = Math.abs(coarseWave(t) - mediumWave(t));
            const px = x0 + t * plotW;
            const py = diffY - diff * plotH * 3.0;
            if (first) { ctx.moveTo(px, py); first = false; }
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // |medium - fine|
        ctx.strokeStyle = COL_FINE + '0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        first = true;
        for (let i = 0; i <= N; i++) {
            const t = drawEnd * (i / N);
            const diff = Math.abs(mediumWave(t) - fineWave(t));
            const px = x0 + t * plotW;
            const py = diffY - diff * plotH * 3.0;
            if (first) { ctx.moveTo(px, py); first = false; }
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Diff legend
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = COL_COARSE + '0.5)';
        ctx.fillText('|f_Δx − f_{Δx/2}|', x0 + plotW - 4, diffY - diffH * 0.55);
        ctx.fillStyle = COL_FINE + '0.5)';
        ctx.fillText('|f_{Δx/2} − f_{Δx/4}|', x0 + plotW - 4, diffY - diffH * 0.25);
    }

    function drawSweepLine(x0, baseY, plotW, plotH, sweep) {
        const sx = x0 + sweep * plotW;
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(sx, baseY - plotH * 0.52);
        ctx.lineTo(sx, baseY + plotH * 0.52);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // ---- Main animation loop ----
    function animate() {
        if (!running) return;
        animFrame = requestAnimationFrame(animate);

        time += 1;
        if (time > LOOP_DURATION) time = 0;

        ctx.clearRect(0, 0, W, H);

        const margin = { left: 56, right: 24, top: 20, bottom: 20 };
        const plotW = W - margin.left - margin.right;
        const plotH = H * 0.5;
        const baseY = H * 0.42;
        const x0 = margin.left;

        const sweep = Math.min(1.0, time * SWEEP_SPEED);

        drawAxes(x0, baseY, plotW, plotH);
        drawSweepLine(x0, baseY, plotW, plotH, sweep);

        // Draw exact solution (ghost)
        drawWaveform(x0, baseY, plotW, plotH, exactWave, sweep, COL_EXACT, '0.15', 1.5);

        // Draw the three resolutions — fine first (back), then medium, then coarse (front)
        drawWaveform(x0, baseY, plotW, plotH, fineWave, sweep, COL_FINE, '0.8', 1.8);
        drawWaveform(x0, baseY, plotW, plotH, mediumWave, sweep, COL_MEDIUM, '0.7', 1.5);
        drawWaveform(x0, baseY, plotW, plotH, coarseWave, sweep, COL_COARSE, '0.75', 1.5);

        // Residuals sub-plot
        drawDiffPanel(x0, baseY, plotW, plotH, sweep);

        // Legend
        drawLegend(x0, baseY, plotH);

        // Q-factor readout
        drawQReadout(x0, baseY, plotW, plotH, sweep);
    }

    // ---- Public entry point ----
    window.initAnim_convergence = function () {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(init, 150);
    };
})();
