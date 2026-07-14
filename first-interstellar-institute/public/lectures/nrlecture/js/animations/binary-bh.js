// binary-bh.js — Binary black hole inspiral, merger, and ringdown
// Top half: top-down orbital view with GW ripples
// Bottom quarter: real-time gravitational waveform h+(t)
(function () {
    let canvas, ctx, W, H, running = false;
    let animFrame;
    let time, phase, phaseTime;
    let waveformHistory;
    let ripples;
    let labelOpacity;
    let mergerFlash;

    // Phase durations in frames (~60fps)
    const INSPIRAL_DUR = 360;  // ~6 seconds
    const MERGER_DUR   = 60;   // ~1 second
    const RINGDOWN_DUR = 180;  // ~3 seconds
    const TOTAL_DUR = INSPIRAL_DUR + MERGER_DUR + RINGDOWN_DUR;

    // BH parameters
    const MASS_RATIO = 1.2;
    const BH1_BASE_R = 14;
    const BH2_BASE_R = BH1_BASE_R / MASS_RATIO;

    // Orbital parameters
    const ORBIT_R_MAX = 120;
    const ORBIT_R_MIN = 8;

    function init() {
        canvas = document.getElementById('binaryBHCanvas');
        if (!canvas) return;
        const container = document.getElementById('binaryBHContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');
        running = true;
        time = 0;
        phase = 'inspiral';
        phaseTime = 0;
        waveformHistory = [];
        ripples = [];
        labelOpacity = { inspiral: 0, merger: 0, ringdown: 0 };
        mergerFlash = 0;

        container.onclick = function () {
            time = 0;
            phase = 'inspiral';
            phaseTime = 0;
            accumPhase = 0;
            waveformHistory = [];
            ripples = [];
            trailPoints = [];
            labelOpacity = { inspiral: 0, merger: 0, ringdown: 0 };
            mergerFlash = 0;
        };

        animate();
    }

    // --- Orbital state ---
    function getOrbitalState(t) {
        if (phase === 'inspiral') {
            const s = t / INSPIRAL_DUR; // 0→1
            // Radius shrinks: faster near end (cubic ease-in)
            const r = ORBIT_R_MAX - (ORBIT_R_MAX - ORBIT_R_MIN) * (s * s * s);
            // Frequency increases as radius shrinks (Kepler-ish: omega ~ r^(-3/2))
            const baseOmega = 0.012;
            const omega = baseOmega * Math.pow(ORBIT_R_MAX / r, 1.5);
            return { r, omega, merged: false };
        }
        if (phase === 'merger') {
            const s = t / MERGER_DUR;
            const r = ORBIT_R_MIN * (1 - s);
            const omega = 0.012 * Math.pow(ORBIT_R_MAX / Math.max(r, 1), 1.5);
            return { r: Math.max(r, 0), omega, merged: s > 0.5 };
        }
        // ringdown
        return { r: 0, omega: 0, merged: true };
    }

    // --- Waveform h+(t) ---
    function getStrain(t) {
        if (phase === 'inspiral') {
            const s = t / INSPIRAL_DUR;
            const r = ORBIT_R_MAX - (ORBIT_R_MAX - ORBIT_R_MIN) * (s * s * s);
            const freq = 0.012 * Math.pow(ORBIT_R_MAX / r, 1.5);
            // Amplitude grows as 1/r (quadrupole formula)
            const amp = 0.15 + 0.85 * (1 - r / ORBIT_R_MAX);
            return amp * Math.sin(accumulatedPhase(t) * 2);
        }
        if (phase === 'merger') {
            const s = t / MERGER_DUR;
            // Peak amplitude with rapid oscillation
            const amp = 1.0 - 0.2 * s;
            const freq = 0.25 + s * 0.1;
            return amp * Math.sin(mergerPhaseAccum(t) * 2);
        }
        // ringdown: damped sinusoid
        const s = t / RINGDOWN_DUR;
        const amp = 0.8 * Math.exp(-s * 4.5);
        const freq = 0.22;
        return amp * Math.sin(2 * Math.PI * freq * t + ringdownPhase0);
    }

    // Accumulated orbital phase for smooth waveform
    let accumPhase = 0;
    let lastPhaseTime = -1;
    let ringdownPhase0 = 0;
    let mergerPhase0 = 0;

    function accumulatedPhase(t) {
        // Integrate omega over time for smooth phase
        const s = t / INSPIRAL_DUR;
        // Approximate integral: sum omega*dt
        const r = ORBIT_R_MAX - (ORBIT_R_MAX - ORBIT_R_MIN) * (s * s * s);
        const omega = 0.012 * Math.pow(ORBIT_R_MAX / r, 1.5);
        return accumPhase + omega;
    }

    function mergerPhaseAccum(t) {
        const s = t / MERGER_DUR;
        const freq = 0.25 + s * 0.1;
        return mergerPhase0 + freq * t;
    }

    // --- Ripple system ---
    function spawnRipple(cx, cy, strength) {
        ripples.push({ x: cx, y: cy, r: 5, opacity: strength, speed: 2.5 + strength });
    }

    function updateRipples() {
        for (let i = ripples.length - 1; i >= 0; i--) {
            const rip = ripples[i];
            rip.r += rip.speed;
            rip.opacity *= 0.985;
            if (rip.opacity < 0.005 || rip.r > Math.max(W, H)) {
                ripples.splice(i, 1);
            }
        }
    }

    function drawRipples() {
        ripples.forEach(rip => {
            ctx.beginPath();
            ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0,230,255,${rip.opacity * 0.35})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });
    }

    // --- Draw black hole ---
    function drawBH(x, y, radius, wobbleAmt) {
        const r = radius + (wobbleAmt || 0);
        // Dark glow
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#111';
        ctx.fill();
        ctx.restore();

        // Subtle border
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // --- Draw merged BH with wobble ---
    function drawMergedBH(cx, cy, t) {
        const s = t / RINGDOWN_DUR;
        const wobble = 4 * Math.exp(-s * 4) * Math.sin(2 * Math.PI * 0.22 * t);
        const baseR = BH1_BASE_R + BH2_BASE_R * 0.7; // combined, slightly smaller than sum
        const rx = baseR + wobble;
        const ry = baseR - wobble;

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(rx, 2), Math.max(ry, 2), 0, 0, Math.PI * 2);
        ctx.fillStyle = '#111';
        ctx.fill();
        ctx.restore();

        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(rx, 2), Math.max(ry, 2), 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // --- Orbit trail ---
    let trailPoints = [];

    function updateTrail(x1, y1, x2, y2) {
        trailPoints.push({ x1, y1, x2, y2, age: 0 });
        // Keep last ~90 points
        if (trailPoints.length > 90) trailPoints.shift();
        trailPoints.forEach(p => p.age++);
    }

    function drawTrail() {
        for (let i = 0; i < trailPoints.length; i++) {
            const p = trailPoints[i];
            const alpha = Math.max(0, 0.3 * (1 - p.age / 90));
            ctx.fillStyle = `rgba(100,180,255,${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x1, p.y1, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(p.x2, p.y2, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // --- Waveform plot ---
    function drawWaveform() {
        const plotH = H * 0.2;
        const plotY = H * 0.82;
        const plotX0 = 60;
        const plotW = W - 120;

        // Axis
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(plotX0, plotY);
        ctx.lineTo(plotX0 + plotW, plotY);
        ctx.stroke();

        // Axis labels
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('time', plotX0 + plotW / 2, plotY + plotH * 0.55 + 8);
        ctx.save();
        ctx.translate(plotX0 - 22, plotY);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('h₊(t)', 0, 0);
        ctx.restore();

        // Draw waveform
        if (waveformHistory.length < 2) return;
        const maxPts = Math.floor(plotW);
        const startIdx = Math.max(0, waveformHistory.length - maxPts);
        const pts = waveformHistory.slice(startIdx);

        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) {
            const px = plotX0 + plotW - (pts.length - 1 - i);
            const py = plotY - pts[i] * plotH * 0.42;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = 'rgba(0,230,255,0.85)';
        ctx.lineWidth = 1.8;
        ctx.stroke();
    }

    // --- Phase labels ---
    function drawPhaseLabel() {
        // Fade target
        const target = { inspiral: 0, merger: 0, ringdown: 0 };
        target[phase] = 1;
        const fadeSpeed = 0.04;
        for (const k in labelOpacity) {
            labelOpacity[k] += (target[k] - labelOpacity[k]) * fadeSpeed;
        }

        const orbitCY = H * 0.38;
        ctx.font = '13px JetBrains Mono, monospace';
        ctx.textAlign = 'center';

        if (labelOpacity.inspiral > 0.01) {
            ctx.fillStyle = `rgba(0,230,255,${labelOpacity.inspiral * 0.7})`;
            ctx.fillText('INSPIRAL', W / 2, orbitCY + ORBIT_R_MAX + 50);
        }
        if (labelOpacity.merger > 0.01) {
            ctx.fillStyle = `rgba(0,230,255,${labelOpacity.merger * 0.9})`;
            ctx.fillText('MERGER', W / 2, orbitCY + ORBIT_R_MAX + 50);
        }
        if (labelOpacity.ringdown > 0.01) {
            ctx.fillStyle = `rgba(0,230,255,${labelOpacity.ringdown * 0.7})`;
            ctx.fillText('RINGDOWN', W / 2, orbitCY + ORBIT_R_MAX + 50);
        }
    }

    // --- Merger flash ---
    function drawMergerFlash(cx, cy) {
        if (mergerFlash <= 0) return;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80 * mergerFlash);
        gradient.addColorStop(0, `rgba(255,255,255,${mergerFlash * 0.7})`);
        gradient.addColorStop(0.3, `rgba(200,240,255,${mergerFlash * 0.3})`);
        gradient.addColorStop(1, 'rgba(0,230,255,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, 80, 0, Math.PI * 2);
        ctx.fill();
        mergerFlash *= 0.92;
        if (mergerFlash < 0.005) mergerFlash = 0;
    }

    // --- Main loop ---
    function animate() {
        if (!running) return;
        animFrame = requestAnimationFrame(animate);

        ctx.clearRect(0, 0, W, H);
        time++;
        phaseTime++;

        const orbitCX = W / 2;
        const orbitCY = H * 0.38;

        // --- Phase transitions ---
        if (phase === 'inspiral' && phaseTime >= INSPIRAL_DUR) {
            phase = 'merger';
            phaseTime = 0;
            mergerPhase0 = accumPhase;
            mergerFlash = 0;
            trailPoints = [];
        } else if (phase === 'merger' && phaseTime >= MERGER_DUR) {
            phase = 'ringdown';
            phaseTime = 0;
            ringdownPhase0 = mergerPhase0 + (0.25 + 0.5) * MERGER_DUR;
            mergerFlash = 1.0;
            trailPoints = [];
        } else if (phase === 'ringdown' && phaseTime >= RINGDOWN_DUR) {
            // Loop
            phase = 'inspiral';
            phaseTime = 0;
            time = 0;
            accumPhase = 0;
            waveformHistory = [];
            ripples = [];
            trailPoints = [];
            labelOpacity = { inspiral: 0, merger: 0, ringdown: 0 };
            mergerFlash = 0;
        }

        // --- Update accumulated phase ---
        if (phase === 'inspiral') {
            const s = phaseTime / INSPIRAL_DUR;
            const r = ORBIT_R_MAX - (ORBIT_R_MAX - ORBIT_R_MIN) * (s * s * s);
            const omega = 0.012 * Math.pow(ORBIT_R_MAX / r, 1.5);
            accumPhase += omega;
        }

        // --- Compute strain and record ---
        const strain = getStrain(phaseTime);
        waveformHistory.push(strain);

        // --- Draw GW ripples ---
        updateRipples();

        // Spawn ripples
        if (phase === 'inspiral') {
            const s = phaseTime / INSPIRAL_DUR;
            const interval = Math.max(4, Math.floor(25 * (1 - s * s)));
            if (phaseTime % interval === 0) {
                const strength = 0.15 + 0.5 * s * s;
                spawnRipple(orbitCX, orbitCY, strength);
            }
        } else if (phase === 'merger') {
            if (phaseTime % 3 === 0) {
                spawnRipple(orbitCX, orbitCY, 0.9);
            }
        } else if (phase === 'ringdown') {
            const s = phaseTime / RINGDOWN_DUR;
            const interval = Math.max(8, Math.floor(12 + 30 * s));
            if (phaseTime % interval === 0) {
                const strength = 0.6 * Math.exp(-s * 3);
                if (strength > 0.02) spawnRipple(orbitCX, orbitCY, strength);
            }
        }

        drawRipples();

        // --- Draw orbital view ---
        if (phase === 'inspiral') {
            const state = getOrbitalState(phaseTime);
            const angle = accumPhase;
            // BH positions (center of mass offset by mass ratio)
            const m1 = 1, m2 = 1 / MASS_RATIO;
            const mtot = m1 + m2;
            const r1 = state.r * m2 / mtot;
            const r2 = state.r * m1 / mtot;

            const x1 = orbitCX + r1 * Math.cos(angle);
            const y1 = orbitCY + r1 * Math.sin(angle);
            const x2 = orbitCX - r2 * Math.cos(angle);
            const y2 = orbitCY - r2 * Math.sin(angle);

            updateTrail(x1, y1, x2, y2);
            drawTrail();
            drawBH(x1, y1, BH1_BASE_R);
            drawBH(x2, y2, BH2_BASE_R);

        } else if (phase === 'merger') {
            const s = phaseTime / MERGER_DUR;
            if (s < 0.5) {
                // Still approaching
                const r = ORBIT_R_MIN * (1 - 2 * s);
                const angle = accumPhase + 0.3 * phaseTime;
                const m1 = 1, m2 = 1 / MASS_RATIO;
                const mtot = m1 + m2;
                const r1 = r * m2 / mtot;
                const r2 = r * m1 / mtot;

                const x1 = orbitCX + r1 * Math.cos(angle);
                const y1 = orbitCY + r1 * Math.sin(angle);
                const x2 = orbitCX - r2 * Math.cos(angle);
                const y2 = orbitCY - r2 * Math.sin(angle);

                // Sizes grow as they approach merger
                const growFactor = 1 + 0.3 * s;
                drawBH(x1, y1, BH1_BASE_R * growFactor);
                drawBH(x2, y2, BH2_BASE_R * growFactor);
            } else {
                // Merged
                drawMergedBH(orbitCX, orbitCY, phaseTime - MERGER_DUR / 2);
            }

        } else {
            // Ringdown
            drawMergedBH(orbitCX, orbitCY, phaseTime);
        }

        // Merger flash
        drawMergerFlash(orbitCX, orbitCY);

        // --- Waveform ---
        drawWaveform();

        // --- Phase label ---
        drawPhaseLabel();
    }

    window.initAnim_binarybh = function () {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(init, 150);
    };
})();
