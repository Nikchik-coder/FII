// gw-motivation.js — Shows why NR is needed for gravitational wave detection
// Three phases of a binary merger waveform:
//   Inspiral (pen & paper OK) → Merger (NR required!) → Ringdown (perturbation theory)
// Click advances through stages, highlighting what's missing without NR.
(function () {
    let canvas, ctx, W, H, running = false;
    let stage = 0; // 0=inspiral only, 1=show merger gap, 2=NR fills it in, 3=full + LIGO match
    let time = 0;

    // Waveform parameters
    const PHASES = {
        inspiral: { start: 0, end: 0.55 },
        merger:   { start: 0.55, end: 0.78 },
        ringdown: { start: 0.78, end: 1.0 }
    };

    function chirpWaveform(t) {
        // t in [0,1], returns amplitude
        // Inspiral: growing frequency and amplitude
        if (t < PHASES.merger.start) {
            const s = t / PHASES.merger.start; // 0→1
            const freq = 3 + s * s * 25;
            const amp = 0.15 + s * s * 0.85;
            return amp * Math.sin(freq * Math.PI * 2 * s);
        }
        // Merger: peak amplitude, rapid oscillation
        if (t < PHASES.ringdown.start) {
            const s = (t - PHASES.merger.start) / (PHASES.ringdown.start - PHASES.merger.start);
            const freq = 28 + s * 8;
            const amp = 1.0 - s * 0.3;
            return amp * Math.sin(freq * Math.PI * 2 * s + 10);
        }
        // Ringdown: exponential decay
        const s = (t - PHASES.ringdown.start) / (1.0 - PHASES.ringdown.start);
        const freq = 20;
        const amp = 0.7 * Math.exp(-s * 4);
        return amp * Math.sin(freq * Math.PI * 2 * s + 18);
    }

    function init() {
        canvas = document.getElementById('gwMotivCanvas');
        if (!canvas) return;
        const container = document.getElementById('gwMotivContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');
        time = 0;
        stage = 0;
        running = true;
        container.onclick = advance;
        animate();
    }

    function advance() {
        if (stage < 3) stage++;
        else { stage = 0; time = 0; }
    }

    function animate() {
        if (!running) return;
        time += 1;
        ctx.clearRect(0, 0, W, H);

        const margin = 60;
        const plotW = W - margin * 2;
        const plotH = H * 0.38;
        const baseY = H * 0.52;

        drawWaveformPlot(margin, baseY, plotW, plotH);
        drawPhaseLabels(margin, baseY, plotW, plotH);
        drawBinaryOrbits(time);

        requestAnimationFrame(animate);
    }

    function drawWaveformPlot(x0, baseY, plotW, plotH) {
        // Axes
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x0, baseY);
        ctx.lineTo(x0 + plotW, baseY);
        ctx.stroke();

        // Axis labels
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('time', x0 + plotW / 2, baseY + plotH * 0.62);
        ctx.save();
        ctx.translate(x0 - 20, baseY);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('h(t) strain', 0, 0);
        ctx.restore();

        const N = 500;
        // Animate a sweep line
        const sweep = Math.min(1.0, time * 0.004);

        // --- Draw waveform in sections ---
        for (let section = 0; section < 3; section++) {
            let phaseStart, phaseEnd, color, shouldDraw;

            if (section === 0) {
                // Inspiral - always visible
                phaseStart = PHASES.inspiral.start;
                phaseEnd = PHASES.inspiral.end;
                color = 'rgba(100,180,255,';
                shouldDraw = true;
            } else if (section === 1) {
                // Merger - only visible at stage >= 2
                phaseStart = PHASES.merger.start;
                phaseEnd = PHASES.merger.end;
                color = 'rgba(255,120,80,';
                shouldDraw = stage >= 2;
            } else {
                // Ringdown - visible at stage >= 1
                phaseStart = PHASES.ringdown.start;
                phaseEnd = PHASES.ringdown.end;
                color = 'rgba(150,255,150,';
                shouldDraw = stage >= 1;
            }

            if (!shouldDraw) continue;

            // Animated reveal
            const drawEnd = Math.min(phaseEnd, sweep);
            if (drawEnd <= phaseStart) continue;

            ctx.strokeStyle = color + '0.85)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            let first = true;
            for (let i = 0; i <= N; i++) {
                const t = phaseStart + (drawEnd - phaseStart) * (i / N);
                const px = x0 + t * plotW;
                const py = baseY - chirpWaveform(t) * plotH * 0.45;
                if (first) { ctx.moveTo(px, py); first = false; }
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
        }

        // --- Question marks in the merger gap (stages 0-1) ---
        if (stage < 2) {
            const gapX0 = x0 + PHASES.merger.start * plotW;
            const gapX1 = x0 + PHASES.merger.end * plotW;
            const gapW = gapX1 - gapX0;

            // Hatched/unknown region
            ctx.fillStyle = 'rgba(255,80,60,0.06)';
            ctx.fillRect(gapX0, baseY - plotH * 0.5, gapW, plotH);

            // Dashed borders
            ctx.strokeStyle = 'rgba(255,80,60,0.25)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(gapX0, baseY - plotH * 0.5);
            ctx.lineTo(gapX0, baseY + plotH * 0.5);
            ctx.moveTo(gapX1, baseY - plotH * 0.5);
            ctx.lineTo(gapX1, baseY + plotH * 0.5);
            ctx.stroke();
            ctx.setLineDash([]);

            // Big question marks
            const pulse = 0.7 + 0.3 * Math.sin(time * 0.05);
            ctx.fillStyle = `rgba(255,100,80,${pulse * 0.6})`;
            ctx.font = 'bold 28px EB Garamond, serif';
            ctx.textAlign = 'center';
            ctx.fillText('???', gapX0 + gapW / 2, baseY + 5);

            ctx.font = '10px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(255,100,80,0.7)';
            ctx.fillText('Non-linear regime', gapX0 + gapW / 2, baseY + plotH * 0.42);
            ctx.fillText('No analytical solution', gapX0 + gapW / 2, baseY + plotH * 0.55);
        }
    }

    function drawPhaseLabels(x0, baseY, plotW, plotH) {
        const labelY = baseY - plotH * 0.55;

        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';

        // Inspiral
        const insX = x0 + (PHASES.inspiral.start + PHASES.inspiral.end) / 2 * plotW;
        ctx.fillStyle = 'rgba(100,180,255,0.6)';
        ctx.fillText('INSPIRAL', insX, labelY);
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(100,180,255,0.35)';
        ctx.fillText('post-Newtonian', insX, labelY + 13);
        ctx.fillText('(pen & paper)', insX, labelY + 24);

        // Merger
        const merX = x0 + (PHASES.merger.start + PHASES.merger.end) / 2 * plotW;
        if (stage >= 2) {
            ctx.font = '10px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(255,120,80,0.7)';
            ctx.fillText('MERGER', merX, labelY);
            ctx.font = '8px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(255,120,80,0.45)';
            ctx.fillText('full NR simulation', merX, labelY + 13);
        } else if (stage >= 1) {
            ctx.font = '10px JetBrains Mono, monospace';
            const pulse = 0.5 + 0.3 * Math.sin(time * 0.06);
            ctx.fillStyle = `rgba(255,80,60,${pulse})`;
            ctx.fillText('MERGER', merX, labelY);
            ctx.font = '8px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(255,80,60,0.5)';
            ctx.fillText('REQUIRES NR!', merX, labelY + 13);
        }

        // Ringdown
        if (stage >= 1) {
            const rdX = x0 + (PHASES.ringdown.start + PHASES.ringdown.end) / 2 * plotW;
            ctx.font = '10px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(150,255,150,0.6)';
            ctx.fillText('RINGDOWN', rdX, labelY);
            ctx.font = '8px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(150,255,150,0.35)';
            ctx.fillText('perturbation theory', rdX, labelY + 13);
        }

        // Stage-specific messages
        ctx.textAlign = 'center';
        const msgY = baseY + plotH * 0.78;

        if (stage === 0) {
            ctx.font = '11px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fillText('Before NR: only the inspiral phase could be calculated', W / 2, msgY);
        } else if (stage === 1) {
            ctx.font = '11px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(255,200,100,0.5)';
            ctx.fillText('The merger — loudest part of the signal — was completely unknown', W / 2, msgY);
        } else if (stage === 2) {
            ctx.font = '11px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(255,120,80,0.6)';
            ctx.fillText('NR fills in the missing piece — the complete waveform', W / 2, msgY);
        } else {
            ctx.font = '11px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(100,255,100,0.5)';
            ctx.fillText('Template matching: compare NR waveforms against detector data', W / 2, msgY);
        }
    }

    function drawBinaryOrbits(t) {
        // Small binary black hole animation in top-right corner
        const cx = W - 80;
        const cy = 55;

        // Orbit shrinks over time (inspiral)
        const baseR = 22;
        const phase = t * 0.04;
        const shrink = stage >= 2 ? Math.max(3, baseR - (t % 200) * 0.1) : baseR;
        const r = shrink;

        const x1 = cx + r * Math.cos(phase);
        const y1 = cy + r * Math.sin(phase);
        const x2 = cx - r * Math.cos(phase);
        const y2 = cy - r * Math.sin(phase);

        // Orbit trail
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // BH 1
        ctx.beginPath();
        ctx.arc(x1, y1, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,200,255,0.6)';
        ctx.fill();

        // BH 2
        ctx.beginPath();
        ctx.arc(x2, y2, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,200,150,0.6)';
        ctx.fill();

        // Gravitational wave rings (when stage >= 2)
        if (stage >= 2) {
            for (let i = 0; i < 3; i++) {
                const waveR = ((t * 1.5 + i * 30) % 80) + 10;
                const alpha = Math.max(0, 0.15 - waveR * 0.0015);
                ctx.strokeStyle = `rgba(255,200,100,${alpha})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.arc(cx, cy, waveR, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = '7px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('binary merger', cx, cy + r + 14);
    }

    window.initAnim_gwmotivation = function () {
        running = false;
        setTimeout(init, 100);
    };
})();
