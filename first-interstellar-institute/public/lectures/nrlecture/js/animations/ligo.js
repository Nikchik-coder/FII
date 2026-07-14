// ligo.js - LIGO Michelson interferometer schematic
// Shows laser, beam splitter, two arms with mirrors, photodetector,
// wave interference at detector, and GW effect
(function () {
    let canvas, ctx, W, H, running = false;
    let time = 0;
    let gwActive = false;
    let gwTime = 0;
    let signalData = [];

    let ARM_LEN, cx, cy;

    // Pulse system: strictly alternating arms, equal count
    let pulses = [];
    let nextArmX = true; // alternate

    function init() {
        canvas = document.getElementById('ligoCanvas');
        if (!canvas) return;
        const container = document.getElementById('ligoContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');
        time = 0;
        gwActive = false;
        gwTime = 0;
        signalData = [];
        pulses = [];
        nextArmX = true;
        running = true;

        ARM_LEN = Math.min(W * 0.22, H * 0.30);
        cx = W * 0.35;
        cy = H * 0.50;

        // Seed initial pulses - equal in each arm
        for (let i = 0; i < 12; i++) {
            spawnPulse();
        }

        container.addEventListener('click', toggleGW);
        animate();
    }

    function toggleGW() {
        gwActive = !gwActive;
        if (gwActive) gwTime = 0;
    }

    function spawnPulse() {
        pulses.push({
            phase: 1 + Math.random() * 0.5, // start in arm (1-2 = to mirror)
            armX: nextArmX,
            progress: Math.random()
        });
        nextArmX = !nextArmX; // alternate
    }

    function gwStrain() {
        if (!gwActive) return 0;
        const freq = 2 + gwTime * 0.3;
        const amp = Math.min(gwTime * 0.005, 0.12) * Math.exp(-gwTime * 0.003);
        return amp * Math.sin(gwTime * freq * 0.05);
    }

    function drawMirror(x, y, orientation) {
        const len = 20;
        ctx.shadowColor = 'rgba(255,255,255,0.3)';
        ctx.shadowBlur = 6;
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (orientation === 'v') {
            ctx.moveTo(x, y - len);
            ctx.lineTo(x, y + len);
        } else {
            ctx.moveTo(x - len, y);
            ctx.lineTo(x + len, y);
        }
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (orientation === 'v') {
            ctx.moveTo(x + 4, y - len + 3);
            ctx.lineTo(x + 4, y + len - 3);
        } else {
            ctx.moveTo(x - len + 3, y + 4);
            ctx.lineTo(x + len - 3, y + 4);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.lineCap = 'butt';
    }

    function animate() {
        if (!running) return;
        time += 1;
        if (gwActive) gwTime += 1;

        ctx.clearRect(0, 0, W, H);

        const strain = gwStrain();
        const armXLen = ARM_LEN * (1 + strain);
        const armYLen = ARM_LEN * (1 - strain);

        // ---- Laser source ----
        const laserX = cx - ARM_LEN * 0.6;
        const laserY = cy;
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(laserX - 28, laserY - 14, 56, 28);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(laserX - 28, laserY - 14, 56, 28);
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.textAlign = 'center';
        ctx.fillText('LASER', laserX, laserY + 4);

        // Beam: laser to splitter
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(laserX + 28, laserY);
        ctx.lineTo(cx - 14, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        // ---- Beam splitter ----
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.PI / 4);
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-12, -12, 24, 24);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(-12, -12, 24, 24);
        ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BEAM', cx, cy + 28);
        ctx.fillText('SPLITTER', cx, cy + 39);

        // ---- X-arm ----
        const mirrorXx = cx + armXLen;
        const mirrorXy = cy;
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + 16, cy);
        ctx.lineTo(mirrorXx - 4, mirrorXy);
        ctx.stroke();
        drawMirror(mirrorXx, mirrorXy, 'v');
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('4 km', cx + armXLen / 2, cy - 14);
        ctx.fillText('X-ARM', cx + armXLen / 2, cy + 24);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('MIRROR', mirrorXx, mirrorXy + 34);

        // ---- Y-arm ----
        const mirrorYx = cx;
        const mirrorYy = cy - armYLen;
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 16);
        ctx.lineTo(mirrorYx, mirrorYy + 4);
        ctx.stroke();
        drawMirror(mirrorYx, mirrorYy, 'h');
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('4 km', cx + 14, cy - armYLen / 2 + 3);
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('MIRROR', cx, mirrorYy - 18);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText('Y-ARM', cx - 36, cy - armYLen / 2 + 3);

        // ---- Photodetector ----
        const detX = cx;
        const detY = cy + 80;
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 16);
        ctx.lineTo(detX, detY - 14);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(detX - 24, detY - 14, 48, 28);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(detX - 24, detY - 14, 48, 28);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PHOTO', detX, detY);
        ctx.fillText('DETECTOR', detX, detY + 10);

        // ---- Draw continuous wave beams along arms ----
        drawWaveBeam(cx + 16, cy, mirrorXx - 4, cy, strain, 'x');
        drawWaveBeam(cx, cy - 16, cx, mirrorYy + 4, strain, 'y');

        // ---- Laser pulses (equal split) ----
        pulses.forEach(p => {
            p.progress += 0.03;
            if (p.progress > 1) {
                p.progress = 0;
                p.phase = ((p.phase | 0) + 1);
                if (p.phase > 3) p.phase = 1; // loop in arm
            }

            let px, py;
            const t = p.progress;
            const phase = p.phase | 0;

            if (phase === 1) {
                // Splitter to mirror
                if (p.armX) {
                    px = cx + 16 + (armXLen - 20) * t;
                    py = cy;
                } else {
                    px = cx;
                    py = cy - 16 - (armYLen - 20) * t;
                }
            } else if (phase === 2) {
                // Mirror back to splitter
                if (p.armX) {
                    px = mirrorXx - 4 - (armXLen - 20) * t;
                    py = cy;
                } else {
                    px = cx;
                    py = mirrorYy + 4 + (armYLen - 20) * t;
                }
            } else {
                // Splitter to detector
                px = cx;
                py = cy + 16 + (detY - 14 - cy - 16) * t;
            }

            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.fill();
        });

        // Keep pulse count steady and balanced
        while (pulses.length < 16) spawnPulse();

        // ---- Wave interference display ----
        drawInterference(strain);

        // ---- GW source visualization ----
        if (gwActive) {
            const gwSourceX = W * 0.82;
            const gwSourceY = H * 0.08;
            for (let i = 0; i < 6; i++) {
                const r = ((gwTime * 0.8 + i * 40) % 300);
                const alpha = Math.max(0, 0.18 - r * 0.0006);
                ctx.beginPath();
                ctx.arc(gwSourceX, gwSourceY, r, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '10px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('GRAVITATIONAL', gwSourceX, gwSourceY - 10);
            ctx.fillText('WAVE SOURCE', gwSourceX, gwSourceY + 4);

            // Strain arrows
            if (Math.abs(strain) > 0.005) {
                const a = Math.min(Math.abs(strain) * 5, 0.7);
                ctx.strokeStyle = `rgba(255,255,255,${a})`;
                ctx.lineWidth = 1;
                const xDir = strain > 0 ? 1 : -1;
                drawArrow(cx + ARM_LEN * 0.65, cy + 10, cx + ARM_LEN * 0.65 + xDir * 18, cy + 10);
                const yDir = strain > 0 ? 1 : -1;
                drawArrow(cx - 10, cy - ARM_LEN * 0.65, cx - 10, cy - ARM_LEN * 0.65 + yDir * 18);
            }
        }

        // ---- Detector output waveform ----
        const sigX = W * 0.62;
        const sigY = H * 0.72;
        const sigW = W * 0.32;
        const sigH = 60;

        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(sigX, sigY, sigW, sigH);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('DETECTOR OUTPUT', sigX, sigY - 6);

        const signalVal = gwActive ? strain * 300 + (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 1.5;
        signalData.push(signalVal);
        if (signalData.length > sigW) signalData.shift();

        ctx.beginPath();
        const sigMid = sigY + sigH / 2;
        for (let i = 0; i < signalData.length; i++) {
            const sx = sigX + i;
            const sy = sigMid - signalData[i];
            if (i === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Zero line
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath();
        ctx.moveTo(sigX, sigMid);
        ctx.lineTo(sigX + sigW, sigMid);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText('h(t)', sigX - 6, sigMid + 3);

        // Status
        ctx.fillStyle = gwActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(gwActive ? 'GW DETECTED' : 'NO SIGNAL', sigX + sigW / 2, sigY + sigH + 16);

        requestAnimationFrame(animate);
    }

    // Draw a sinusoidal wave beam along an arm to show the light wave
    function drawWaveBeam(x1, y1, x2, y2, strain, armId) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const steps = 80;
        const waveAmp = 4;

        // The phase shift from arm length change
        const phaseShift = armId === 'x' ? strain * 30 : -strain * 30;
        const baseFreq = 0.15;

        // Direction perpendicular to arm
        const nx = -dy / len;
        const ny = dx / len;

        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const bx = x1 + dx * t;
            const by = y1 + dy * t;
            const wave = Math.sin((t * len * baseFreq) + time * 0.08 + phaseShift) * waveAmp;
            const px = bx + nx * wave;
            const py = by + ny * wave;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Draw wave interference diagram near the detector
    function drawInterference(strain) {
        const ifX = W * 0.60;
        const ifY = H * 0.42;
        const ifW = W * 0.34;
        const ifH = 80;

        // Box
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(ifX, ifY, ifW, ifH);

        // Title
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('WAVE INTERFERENCE AT DETECTOR', ifX, ifY - 6);

        const mid = ifY + ifH / 2;
        const amp = 12;
        const freq = 0.12;
        const phaseX = strain * 30;  // X-arm wave phase shift
        const phaseY = -strain * 30; // Y-arm wave phase shift (opposite)

        // Wave from X-arm (top half label)
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = '7px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText('X-arm', ifX - 4, mid - 10);
        ctx.fillText('Y-arm', ifX - 4, mid + 14);
        ctx.fillText('Sum', ifX - 4, mid + 38);

        // Draw X wave
        ctx.beginPath();
        for (let i = 0; i < ifW; i++) {
            const v = amp * 0.5 * Math.sin(i * freq + time * 0.08 + phaseX);
            const py = mid - 16 + v;
            if (i === 0) ctx.moveTo(ifX + i, py);
            else ctx.lineTo(ifX + i, py);
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw Y wave
        ctx.beginPath();
        for (let i = 0; i < ifW; i++) {
            const v = amp * 0.5 * Math.sin(i * freq + time * 0.08 + phaseY + Math.PI); // normally out of phase
            const py = mid + 8 + v;
            if (i === 0) ctx.moveTo(ifX + i, py);
            else ctx.lineTo(ifX + i, py);
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Separation line
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        ctx.moveTo(ifX, mid + 22);
        ctx.lineTo(ifX + ifW, mid + 22);
        ctx.stroke();

        // Draw combined wave (sum = interference)
        ctx.beginPath();
        for (let i = 0; i < ifW; i++) {
            const vx = amp * 0.5 * Math.sin(i * freq + time * 0.08 + phaseX);
            const vy = amp * 0.5 * Math.sin(i * freq + time * 0.08 + phaseY + Math.PI);
            const sum = vx + vy;
            const py = mid + 34 + sum;
            if (i === 0) ctx.moveTo(ifX + i, py);
            else ctx.lineTo(ifX + i, py);
        }
        // Color based on signal strength
        const sumAmp = Math.abs(phaseX - phaseY);
        const brightness = gwActive ? Math.min(0.3 + sumAmp * 0.15, 0.8) : 0.15;
        ctx.strokeStyle = `rgba(255,255,255,${brightness})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Annotations
        if (!gwActive) {
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.font = '8px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Waves cancel \u2192 no signal (destructive interference)', ifX + ifW / 2, ifY + ifH + 14);
        } else {
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.font = '8px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Arms change length \u2192 waves desync \u2192 signal!', ifX + ifW / 2, ifY + ifH + 14);
        }
    }

    function drawArrow(x1, y1, x2, y2) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = 6;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLen * Math.cos(angle - 0.5), y2 - headLen * Math.sin(angle - 0.5));
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLen * Math.cos(angle + 0.5), y2 - headLen * Math.sin(angle + 0.5));
        ctx.stroke();
    }

    window.initAnim_ligo = function () {
        running = false;
        setTimeout(init, 100);
    };
})();
