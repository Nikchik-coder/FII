// adm-vs-bssn.js - ADM instability vs BSSN stability in numerical relativity
// Left: ADM formulation - numerical noise grows exponentially until crash
// Right: BSSN formulation - noise stays bounded, wave remains smooth
(function () {
    let canvas, ctx, W, H, running = false;
    let animFrame;
    let time = 0;

    // Grid
    const N_POINTS = 64;
    let admWave, bssnWave;
    let admNoise, bssnNoise;
    let phase = 0;
    let crashed = false;
    let crashTime = 0;
    const CRASH_THRESHOLD = 8.0;
    const LOOP_PAUSE = 180;      // frames to hold after crash before reset
    let loopTimer = 0;

    // Noise seeds (fixed random pattern for reproducibility per run)
    let noiseSeed = [];

    function init() {
        canvas = document.getElementById('admBssnCanvas');
        if (!canvas) return;
        const container = document.getElementById('admBssnContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');
        time = 0;
        phase = 0;
        crashed = false;
        crashTime = 0;
        loopTimer = 0;
        running = true;

        // Generate noise seed
        noiseSeed = [];
        for (let i = 0; i < N_POINTS; i++) {
            noiseSeed.push((Math.random() - 0.5) * 2);
        }

        // Initialise wave arrays
        admWave = new Float64Array(N_POINTS);
        bssnWave = new Float64Array(N_POINTS);
        admNoise = new Float64Array(N_POINTS);
        bssnNoise = new Float64Array(N_POINTS);

        container.onclick = function () {
            running = false;
            if (animFrame) cancelAnimationFrame(animFrame);
            setTimeout(init, 100);
        };

        animate();
    }

    // Base wave: a travelling sine packet
    function baseWave(i, t) {
        const x = i / N_POINTS;
        const envelope = Math.exp(-((x - 0.5) * (x - 0.5)) / 0.06);
        return envelope * Math.sin(2 * Math.PI * 3 * x - t * 0.03);
    }

    function animate() {
        if (!running) return;
        animFrame = requestAnimationFrame(animate);
        time++;
        phase = time;

        ctx.clearRect(0, 0, W, H);

        const halfW = W / 2;
        const waveH = H * 0.35;       // vertical amplitude range
        const baseY = H * 0.55;       // centre line of wave area
        const padX = 30;              // horizontal padding per panel

        // ---- Divider ----
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(halfW, 10);
        ctx.lineTo(halfW, H - 10);
        ctx.stroke();

        // ---- Compute noise growth ----
        // ADM: exponential growth after initial quiet period
        const noiseOnset = 90;        // frames before noise appears
        const admElapsed = Math.max(0, time - noiseOnset);
        const admGrowthRate = 0.018;
        let admAmplitude = admElapsed > 0 ? 0.0005 * Math.exp(admGrowthRate * admElapsed) : 0;

        // Clamp for drawing sanity but track if "crashed"
        if (admAmplitude > CRASH_THRESHOLD && !crashed) {
            crashed = true;
            crashTime = time;
        }
        const admAmpClamped = Math.min(admAmplitude, 60);

        // BSSN: bounded noise - oscillates but stays small
        const bssnAmplitude = admElapsed > 0
            ? 0.0005 * (1 + 0.4 * Math.sin(admElapsed * 0.05)) * Math.min(1, admElapsed * 0.02)
            : 0;

        // Compute wave values
        for (let i = 0; i < N_POINTS; i++) {
            const base = baseWave(i, phase);

            // ADM: base + growing noise
            const highFreqNoise = noiseSeed[i] * Math.sin(i * 1.7 + time * 0.1)
                + noiseSeed[(i + 7) % N_POINTS] * 0.5 * Math.sin(i * 3.1 + time * 0.15);
            admNoise[i] = highFreqNoise * admAmpClamped;

            if (crashed) {
                // After crash, wild oscillations dominate
                const crashDt = time - crashTime;
                const chaos = Math.sin(i * 5.3 + crashDt * 0.3) * 3
                    + Math.sin(i * 8.7 - crashDt * 0.5) * 2
                    + noiseSeed[i] * Math.sin(crashDt * 0.8) * 4;
                admWave[i] = chaos * Math.min(1, crashDt * 0.05);
            } else {
                admWave[i] = base + admNoise[i];
            }

            // BSSN: base + bounded noise
            const bssnHighFreq = noiseSeed[i] * 0.3 * Math.sin(i * 1.7 + time * 0.1)
                + noiseSeed[(i + 7) % N_POINTS] * 0.15 * Math.sin(i * 3.1 + time * 0.15);
            bssnNoise[i] = bssnHighFreq * bssnAmplitude;
            bssnWave[i] = base + bssnNoise[i];
        }

        // ---- Error readouts ----
        let admMaxErr = 0;
        let bssnMaxErr = 0;
        for (let i = 0; i < N_POINTS; i++) {
            admMaxErr = Math.max(admMaxErr, Math.abs(admNoise[i]));
            bssnMaxErr = Math.max(bssnMaxErr, Math.abs(bssnNoise[i]));
        }

        // ---- Draw LEFT (ADM) ----
        drawPanel(0, halfW, baseY, waveH, padX, admWave, admMaxErr, 'ADM', true);

        // ---- Draw RIGHT (BSSN) ----
        drawPanel(halfW, W, baseY, waveH, padX, bssnWave, bssnMaxErr, 'BSSN', false);

        // ---- ADM crash overlay ----
        if (crashed) {
            const crashDt = time - crashTime;
            const flashAlpha = Math.min(1, crashDt * 0.04);

            // "CRASH" label
            ctx.save();
            ctx.font = 'bold 28px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const shake = crashDt < 20 ? (Math.random() - 0.5) * 6 : 0;
            ctx.fillStyle = `rgba(255, 60, 60, ${flashAlpha * (0.7 + 0.3 * Math.sin(crashDt * 0.15))})`;
            ctx.fillText('CRASH', halfW / 2 + shake, baseY - waveH * 0.65);
            ctx.restore();

            // Scanlines / static effect
            if (crashDt < 60) {
                ctx.save();
                ctx.globalAlpha = Math.max(0, 0.15 - crashDt * 0.003);
                for (let y = 0; y < H; y += 3) {
                    if (Math.random() > 0.5) {
                        ctx.fillStyle = 'rgba(255,60,60,0.08)';
                        ctx.fillRect(0, y, halfW, 1);
                    }
                }
                ctx.restore();
            }

            // Loop reset
            loopTimer++;
            if (loopTimer > LOOP_PAUSE) {
                running = false;
                if (animFrame) cancelAnimationFrame(animFrame);
                setTimeout(init, 50);
                return;
            }
        }

        // ---- BSSN stable label ----
        if (crashed) {
            const crashDt = time - crashTime;
            const stableAlpha = Math.min(0.8, crashDt * 0.02);
            ctx.font = 'bold 16px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(0, 230, 100, ${stableAlpha})`;
            ctx.fillText('STABLE', halfW + halfW / 2, baseY - waveH * 0.65);
        }

        // ---- Bottom hint ----
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.textAlign = 'center';
        ctx.fillText('click to restart', W / 2, H - 12);
    }

    function drawPanel(x0, x1, baseY, waveH, padX, wave, maxErr, label, isADM) {
        const pw = x1 - x0;
        const cx = x0 + pw / 2;

        // ---- Label ----
        ctx.font = '12px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText(label, cx, 22);

        // ---- Subtitle ----
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        if (isADM) {
            ctx.fillText('Arnowitt-Deser-Misner', cx, 36);
        } else {
            ctx.fillText('Baumgarte-Shapiro-Shibata-Nakamura', cx, 36);
        }

        // ---- Error readout ----
        let errStr;
        if (isADM && crashed) {
            errStr = 'max error: \u221E';
        } else if (maxErr < 0.0001) {
            errStr = 'max error: 0.0000';
        } else if (maxErr < 0.01) {
            errStr = 'max error: ' + maxErr.toFixed(4);
        } else if (maxErr < 1) {
            errStr = 'max error: ' + maxErr.toFixed(3);
        } else if (maxErr < 100) {
            errStr = 'max error: ' + maxErr.toFixed(1);
        } else {
            errStr = 'max error: \u221E';
        }

        ctx.font = '10px JetBrains Mono, monospace';
        const errColor = isADM
            ? `rgba(${Math.min(255, 100 + maxErr * 40)}, ${Math.max(80, 230 - maxErr * 60)}, ${Math.max(50, 255 - maxErr * 80)}, 0.6)`
            : 'rgba(0, 230, 180, 0.5)';
        ctx.fillStyle = errColor;
        ctx.textAlign = 'center';
        ctx.fillText(errStr, cx, H - 30);

        // ---- Wave colour ----
        // ADM: shift from cyan to yellow to red as error grows
        let r, g, b;
        if (isADM) {
            const errNorm = Math.min(1, maxErr / 2.0);  // normalise 0..1
            // cyan (0,229,255) -> yellow (255,220,0) -> red (255,60,60)
            if (errNorm < 0.5) {
                const t = errNorm * 2;
                r = Math.round(0 + 255 * t);
                g = Math.round(229 + (220 - 229) * t);
                b = Math.round(255 * (1 - t));
            } else {
                const t = (errNorm - 0.5) * 2;
                r = 255;
                g = Math.round(220 - 160 * t);
                b = Math.round(0 + 60 * t);
            }
        } else {
            // BSSN stays cyan
            r = 0; g = 229; b = 255;
        }

        // ---- Draw grid points and wave ----
        const drawX0 = x0 + padX;
        const drawW = pw - padX * 2;

        // Grid baseline (faint)
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(drawX0, baseY);
        ctx.lineTo(drawX0 + drawW, baseY);
        ctx.stroke();

        // Wave path
        ctx.beginPath();
        for (let i = 0; i < N_POINTS; i++) {
            const px = drawX0 + (i / (N_POINTS - 1)) * drawW;
            const val = wave[i];
            const py = baseY - val * waveH * 0.4;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glow on the wave
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        for (let i = 0; i < N_POINTS; i++) {
            const px = drawX0 + (i / (N_POINTS - 1)) * drawW;
            const val = wave[i];
            const py = baseY - val * waveH * 0.4;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Grid point dots
        const dotSpacing = 4;    // draw every Nth point as a dot
        for (let i = 0; i < N_POINTS; i += dotSpacing) {
            const px = drawX0 + (i / (N_POINTS - 1)) * drawW;
            const val = wave[i];
            const py = baseY - val * waveH * 0.4;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
            ctx.fill();
        }

        // ---- Vertical error bars (show noise growth for ADM) ----
        if (isADM && maxErr > 0.005 && !crashed) {
            ctx.strokeStyle = `rgba(255, 80, 80, ${Math.min(0.4, maxErr * 0.3)})`;
            ctx.lineWidth = 0.8;
            for (let i = 0; i < N_POINTS; i += dotSpacing) {
                const px = drawX0 + (i / (N_POINTS - 1)) * drawW;
                const base = baseWave(i, phase);
                const basePy = baseY - base * waveH * 0.4;
                const noisePy = baseY - wave[i] * waveH * 0.4;
                if (Math.abs(noisePy - basePy) > 2) {
                    ctx.beginPath();
                    ctx.moveTo(px, basePy);
                    ctx.lineTo(px, noisePy);
                    ctx.stroke();
                }
            }
        }

        // ---- "Ghost" of original wave for ADM when error is large ----
        if (isADM && maxErr > 0.1 && !crashed) {
            ctx.beginPath();
            for (let i = 0; i < N_POINTS; i++) {
                const px = drawX0 + (i / (N_POINTS - 1)) * drawW;
                const base = baseWave(i, phase);
                const py = baseY - base * waveH * 0.4;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // ---- "time" progress bar ----
        const barY = baseY + waveH * 0.55;
        const barW = drawW * 0.6;
        const barX = cx - barW / 2;
        const progress = Math.min(1, time / 500);

        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(barX, barY, barW, 3);
        ctx.fillStyle = isADM
            ? `rgba(${r}, ${g}, ${b}, 0.3)`
            : 'rgba(0, 229, 255, 0.3)';
        ctx.fillRect(barX, barY, barW * progress, 3);

        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.textAlign = 'center';
        ctx.fillText('simulation time', cx, barY + 14);
    }

    window.initAnim_admbssn = function () {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(init, 150);
    };
})();
