// gravity-speed.js - Newton vs Einstein: speed of gravitational interaction
// Shows Sun + Earth orbit. Click removes the Sun.
// Left: Newton (instant) - Earth immediately flies off tangent
// Right: Einstein - ripple expands at c, Earth keeps orbiting until ripple arrives
(function () {
    let canvas, ctx, W, H, running = false;
    let time = 0;
    let sunRemoved = false;
    let removeTime = 0;

    // Layout
    let leftCx, rightCx, centerY;
    const ORBIT_R = 90;
    const SUN_R = 18;
    const EARTH_R = 7;
    const ORBIT_SPEED = 0.012;
    const RIPPLE_SPEED = 1.8; // pixels per frame (represents c)
    const LIGHT_DELAY = ORBIT_R / RIPPLE_SPEED; // frames for ripple to reach Earth

    function init() {
        canvas = document.getElementById('gravSpeedCanvas');
        if (!canvas) return;
        const container = document.getElementById('gravSpeedContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');
        time = 0;
        sunRemoved = false;
        removeTime = 0;
        running = true;

        leftCx = W * 0.28;
        rightCx = W * 0.72;
        centerY = H * 0.50;

        container.onclick = removeSun;
        animate();
    }

    function removeSun() {
        if (sunRemoved) {
            // Reset
            sunRemoved = false;
            removeTime = 0;
            time = 0;
            return;
        }
        sunRemoved = true;
        removeTime = time;
    }

    function animate() {
        if (!running) return;
        time += 1;
        ctx.clearRect(0, 0, W, H);

        const dt = sunRemoved ? time - removeTime : 0;

        // ---- Labels ----
        ctx.font = '12px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('NEWTON', leftCx, 22);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText('Instant action at a distance', leftCx, 36);

        ctx.font = '12px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('EINSTEIN', rightCx, 22);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText('Gravity propagates at c', rightCx, 36);

        // ---- Divider ----
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(W / 2, 10);
        ctx.lineTo(W / 2, H - 10);
        ctx.stroke();

        // ---- Draw both panels ----
        drawPanel(leftCx, centerY, 'newton', dt);
        drawPanel(rightCx, centerY, 'einstein', dt);

        // ---- Status text ----
        if (sunRemoved) {
            ctx.font = '10px JetBrains Mono, monospace';
            ctx.textAlign = 'center';

            if (dt < 3) {
                ctx.fillStyle = 'rgba(255,100,100,0.7)';
                ctx.fillText('Sun removed!', W / 2, H - 15);
            } else {
                // Newton side
                ctx.fillStyle = 'rgba(255,100,100,0.5)';
                ctx.fillText('Earth instantly flies off', leftCx, H - 15);

                // Einstein side
                if (dt < LIGHT_DELAY) {
                    const remaining = ((LIGHT_DELAY - dt) / 60).toFixed(1);
                    ctx.fillStyle = 'rgba(255,255,255,0.4)';
                    ctx.fillText(`Ripple approaching... ${remaining}s`, rightCx, H - 15);
                } else {
                    ctx.fillStyle = 'rgba(255,255,255,0.5)';
                    ctx.fillText('Ripple arrives → Earth flies off', rightCx, H - 15);
                }
            }
        } else {
            ctx.font = '9px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.textAlign = 'center';
            ctx.fillText('click to remove the Sun', W / 2, H - 15);
        }

        requestAnimationFrame(animate);
    }

    function drawPanel(cx, cy, mode, dt) {
        const angle = time * ORBIT_SPEED;

        // Has the ripple reached Earth yet? (Einstein only)
        const newtonReacted = sunRemoved; // Newton: instant
        const einsteinReacted = sunRemoved && dt > LIGHT_DELAY;
        const reacted = mode === 'newton' ? newtonReacted : einsteinReacted;

        // ---- Orbit path ----
        if (!reacted) {
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.arc(cx, cy, ORBIT_R, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // Fading orbit
            ctx.strokeStyle = 'rgba(255,255,255,0.03)';
            ctx.lineWidth = 0.5;
            ctx.setLineDash([4, 6]);
            ctx.beginPath();
            ctx.arc(cx, cy, ORBIT_R, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // ---- Sun ----
        if (!sunRemoved) {
            drawSun(cx, cy);
        } else {
            // Ghost sun (faint X)
            ctx.strokeStyle = 'rgba(255,100,100,0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx - 8, cy - 8);
            ctx.lineTo(cx + 8, cy + 8);
            ctx.moveTo(cx + 8, cy - 8);
            ctx.lineTo(cx - 8, cy + 8);
            ctx.stroke();
        }

        // ---- Ripple (Einstein only) ----
        if (mode === 'einstein' && sunRemoved) {
            const rippleR = dt * RIPPLE_SPEED;
            const maxR = ORBIT_R * 2.5;
            if (rippleR < maxR) {
                // Draw expanding ripple ring
                const alpha = Math.max(0.05, 0.35 - rippleR * 0.001);
                ctx.strokeStyle = `rgba(255, 200, 100, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
                ctx.stroke();

                // Second ripple
                const r2 = dt * RIPPLE_SPEED - 15;
                if (r2 > 0 && r2 < maxR) {
                    const a2 = Math.max(0.02, 0.2 - r2 * 0.001);
                    ctx.strokeStyle = `rgba(255, 200, 100, ${a2})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(cx, cy, r2, 0, Math.PI * 2);
                    ctx.stroke();
                }

                // "c" label on ripple
                if (rippleR > 30 && rippleR < maxR - 20) {
                    ctx.fillStyle = 'rgba(255,200,100,0.5)';
                    ctx.font = 'italic 10px EB Garamond, serif';
                    ctx.textAlign = 'left';
                    ctx.fillText('c', cx + rippleR * 0.7 + 5, cy - rippleR * 0.7 - 3);
                }
            }
        }

        // ---- Earth position ----
        let ex, ey;
        if (!reacted) {
            // Normal circular orbit
            ex = cx + ORBIT_R * Math.cos(angle);
            ey = cy + ORBIT_R * Math.sin(angle);
        } else {
            // Fly off on tangent from the moment of reaction
            let reactAngle;
            if (mode === 'newton') {
                reactAngle = removeTime * ORBIT_SPEED;
            } else {
                reactAngle = (removeTime + LIGHT_DELAY) * ORBIT_SPEED;
            }

            const reactDt = mode === 'newton' ? dt : dt - LIGHT_DELAY;

            // Position at moment of reaction
            const rx = cx + ORBIT_R * Math.cos(reactAngle);
            const ry = cy + ORBIT_R * Math.sin(reactAngle);

            // Tangent direction (perpendicular to radius, in orbit direction)
            const tx = -Math.sin(reactAngle);
            const ty = Math.cos(reactAngle);

            // Fly off along tangent
            const speed = ORBIT_SPEED * ORBIT_R;
            ex = rx + tx * speed * reactDt;
            ey = ry + ty * speed * reactDt;

            // Draw tangent trail
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 0.5;
            ctx.setLineDash([3, 5]);
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        drawEarth(ex, ey);

        // ---- "8 min" annotation for Einstein ----
        if (mode === 'einstein' && !sunRemoved) {
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 0.5;
            ctx.setLineDash([2, 3]);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + ORBIT_R * Math.cos(angle), cy + ORBIT_R * Math.sin(angle));
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.font = '8px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            const mx = cx + ORBIT_R * 0.5 * Math.cos(angle);
            const my = cy + ORBIT_R * 0.5 * Math.sin(angle);
            ctx.fillText('~8 min at c', mx, my - 8);
        }
    }

    function drawSun(x, y) {
        // Glow
        const grad = ctx.createRadialGradient(x, y, 0, x, y, SUN_R * 3);
        grad.addColorStop(0, 'rgba(255, 220, 100, 0.15)');
        grad.addColorStop(0.5, 'rgba(255, 180, 50, 0.05)');
        grad.addColorStop(1, 'rgba(255, 150, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, SUN_R * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(x, y, SUN_R, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 220, 100, 0.8)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 200, 50, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SUN', x, y + SUN_R + 14);
    }

    function drawEarth(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, EARTH_R, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 150, 255, 0.8)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(150, 200, 255, 0.4)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '7px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('EARTH', x, y + EARTH_R + 10);
    }

    window.initAnim_gravspeed = function () {
        running = false;
        setTimeout(init, 100);
    };
})();
