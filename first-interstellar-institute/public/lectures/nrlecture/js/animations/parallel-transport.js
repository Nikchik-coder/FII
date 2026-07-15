// parallel-transport.js - Parallel transport on flat vs curved surfaces
// Demonstrates holonomy: a vector parallel-transported around a closed loop
// returns unchanged on a flat surface but rotates on a curved one.
(function () {
    let canvas, ctx, W, H, running = false;
    let animFrame;
    let t = 0;            // 0 → 3 (three legs)
    let pauseTimer = 0;
    let flashAlpha = 0;

    const SPEED = 0.0045;
    const PAUSE_FRAMES = 200;
    const ARROW_LEN = 32;
    const HEAD_LEN = 9;
    const HEAD_W = 4;

    // Sphere view: slightly more face-on so east vs south differ clearly on screen
    const AZ = 0.35, EL = 0.55;
    const cA = Math.cos(AZ), sA = Math.sin(AZ);
    const cE = Math.cos(EL), sE = Math.sin(EL);

    function proj(x, y, z) {
        const x1 = x * cA + z * sA;
        const z1 = -x * sA + z * cA;
        return [x1, -(y * cE - z1 * sE)];
    }

    function init() {
        canvas = document.getElementById('parallelTransportCanvas');
        if (!canvas) return;
        const container = document.getElementById('parallelTransportContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');
        t = 0;
        pauseTimer = 0;
        flashAlpha = 0;
        running = true;
        animate();
    }

    function lerp(a, b, f) { return a + (b - a) * f; }

    function drawArrow(x, y, dx, dy, color, alpha, lenScale) {
        var len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1e-6) return;
        var scale = (lenScale !== undefined) ? lenScale : 1;
        var nx = dx / len, ny = dy / len;
        var L = ARROW_LEN * scale;
        var ex = x + nx * L, ey = y + ny * L;

        ctx.save();
        ctx.globalAlpha = (alpha !== undefined) ? alpha : 1;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - nx * HEAD_LEN + ny * HEAD_W, ey - ny * HEAD_LEN - nx * HEAD_W);
        ctx.lineTo(ex - nx * HEAD_LEN - ny * HEAD_W, ey - ny * HEAD_LEN + nx * HEAD_W);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function disc(x, y, r, color) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }

    function screenAngle(dx, dy) {
        return Math.atan2(dy, dx);
    }

    function angleDiffDeg(a0, a1) {
        var d = (a1 - a0) * 180 / Math.PI;
        while (d > 180) d -= 360;
        while (d < -180) d += 360;
        return d;
    }

    /* ------------------------------------------------------------------ */
    /*  FLAT side                                                         */
    /* ------------------------------------------------------------------ */

    function drawFlat(cx, cy) {
        var s = Math.min(W * 0.19, H * 0.32);

        var gs = s * 2.2, step = gs / 8;
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 0.7;
        for (var i = -4; i <= 4; i++) {
            ctx.beginPath();
            ctx.moveTo(cx + i * step, cy - gs / 2);
            ctx.lineTo(cx + i * step, cy + gs / 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx - gs / 2, cy + i * step);
            ctx.lineTo(cx + gs / 2, cy + i * step);
            ctx.stroke();
        }

        var tri = [
            [cx - s * 0.72, cy + s * 0.48],
            [cx + s * 0.72, cy + s * 0.48],
            [cx, cy - s * 0.62]
        ];

        var ct = Math.min(t, 3);
        var leg = Math.min(Math.floor(ct), 2);
        var f = ct - leg;
        ctx.strokeStyle = 'rgba(0,229,255,0.14)';
        ctx.lineWidth = 1.8;
        for (var l = 0; l < leg; l++) {
            ctx.beginPath();
            ctx.moveTo(tri[l][0], tri[l][1]);
            ctx.lineTo(tri[(l + 1) % 3][0], tri[(l + 1) % 3][1]);
            ctx.stroke();
        }
        var ax = lerp(tri[leg][0], tri[(leg + 1) % 3][0], f);
        var ay = lerp(tri[leg][1], tri[(leg + 1) % 3][1], f);
        ctx.beginPath();
        ctx.moveTo(tri[leg][0], tri[leg][1]);
        ctx.lineTo(ax, ay);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tri[0][0], tri[0][1]);
        for (var i = 1; i <= 3; i++) ctx.lineTo(tri[i % 3][0], tri[i % 3][1]);
        ctx.closePath();
        ctx.stroke();

        for (var i = 0; i < 3; i++) disc(tri[i][0], tri[i][1], 2.5, 'rgba(255,255,255,0.3)');

        ctx.strokeStyle = 'rgba(0,229,255,0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(tri[0][0], tri[0][1], 6, 0, Math.PI * 2);
        ctx.stroke();

        // Flat: arrow always points UP (no holonomy)
        drawArrow(ax, ay, 0, -1, '#00e5ff', 1, 1);

        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText('FLAT', cx, cy - s - 16);

        if (pauseTimer > 0) {
            ctx.fillStyle = 'rgba(100,220,160,' + (flashAlpha * 0.9).toFixed(3) + ')';
            ctx.fillText('no rotation', cx, cy + s + 28);
        }
    }

    /* ------------------------------------------------------------------ */
    /*  CURVED side                                                       */
    /* ------------------------------------------------------------------ */

    // Spherical triangle A → B → C → A with parallel transport.
    // Start vector at A points "east". After the loop it points "south" (90° holonomy).
    function sphereData(leg, f, R) {
        var x, y, z, vx, vy, vz;
        if (leg === 0) {
            // A (equator) → B (north pole) along meridian φ=0; V stays east
            var th = Math.PI / 2 * (1 - f);
            x = R * Math.sin(th); y = R * Math.cos(th); z = 0;
            vx = 0; vy = 0; vz = 1;
        } else if (leg === 1) {
            // B → C along meridian φ=π/2; V rotates from east toward south
            var th = Math.PI / 2 * f;
            x = 0; y = R * Math.cos(th); z = R * Math.sin(th);
            vx = 0; vy = -Math.sin(th); vz = Math.cos(th);
        } else {
            // C → A along equator; V stays south
            var ph = Math.PI / 2 * (1 - f);
            x = R * Math.cos(ph); y = 0; z = R * Math.sin(ph);
            vx = 0; vy = -1; vz = 0;
        }
        return { pos: [x, y, z], vec: [vx, vy, vz] };
    }

    function tipScreen(cx, cy, pos, vec, R) {
        // Project a finite tip offset in the tangent direction (not tiny eps)
        var tipScale = R * 0.28;
        var pp = proj(pos[0], pos[1], pos[2]);
        var tip = proj(
            pos[0] + vec[0] * tipScale,
            pos[1] + vec[1] * tipScale,
            pos[2] + vec[2] * tipScale
        );
        return {
            x: cx + pp[0],
            y: cy + pp[1],
            dx: tip[0] - pp[0],
            dy: tip[1] - pp[1]
        };
    }

    function drawCurved(cx, cy) {
        var R = Math.min(W * 0.19, H * 0.32);
        var N = 56;

        // sphere outline
        ctx.strokeStyle = 'rgba(255,255,255,0.14)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();

        // latitude / longitude wireframe
        var steps = 64;
        [35, 60, 90, 120, 145].forEach(function (lat) {
            var th = lat * Math.PI / 180;
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            for (var i = 0; i <= steps; i++) {
                var ph = (i / steps) * Math.PI * 2;
                var p = proj(
                    R * Math.sin(th) * Math.cos(ph),
                    R * Math.cos(th),
                    R * Math.sin(th) * Math.sin(ph)
                );
                if (i === 0) ctx.moveTo(cx + p[0], cy + p[1]);
                else ctx.lineTo(cx + p[0], cy + p[1]);
            }
            ctx.stroke();
        });
        [0, 45, 90, 135].forEach(function (lon) {
            var ph = lon * Math.PI / 180;
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            for (var i = 0; i <= steps; i++) {
                var th = (i / steps) * Math.PI;
                var p = proj(
                    R * Math.sin(th) * Math.cos(ph),
                    R * Math.cos(th),
                    R * Math.sin(th) * Math.sin(ph)
                );
                if (i === 0) ctx.moveTo(cx + p[0], cy + p[1]);
                else ctx.lineTo(cx + p[0], cy + p[1]);
            }
            ctx.stroke();
        });

        var ct = Math.min(t, 3);
        var curLeg = Math.min(Math.floor(ct), 2);
        var curF = ct - curLeg;

        // full triangle outline
        ctx.strokeStyle = 'rgba(255,255,255,0.16)';
        ctx.lineWidth = 1;
        for (var leg = 0; leg < 3; leg++) {
            ctx.beginPath();
            for (var i = 0; i <= N; i++) {
                var sd = sphereData(leg, i / N, R);
                var p = proj(sd.pos[0], sd.pos[1], sd.pos[2]);
                if (i === 0) ctx.moveTo(cx + p[0], cy + p[1]);
                else ctx.lineTo(cx + p[0], cy + p[1]);
            }
            ctx.stroke();
        }

        // traversed path
        ctx.strokeStyle = 'rgba(0,229,255,0.22)';
        ctx.lineWidth = 2;
        for (var leg = 0; leg < curLeg; leg++) {
            ctx.beginPath();
            for (var i = 0; i <= N; i++) {
                var sd = sphereData(leg, i / N, R);
                var p = proj(sd.pos[0], sd.pos[1], sd.pos[2]);
                if (i === 0) ctx.moveTo(cx + p[0], cy + p[1]);
                else ctx.lineTo(cx + p[0], cy + p[1]);
            }
            ctx.stroke();
        }
        var stepsPartial = Math.max(1, Math.round(N * curF));
        ctx.beginPath();
        for (var i = 0; i <= stepsPartial; i++) {
            var frac = (stepsPartial === 0) ? 0 : (i / stepsPartial) * curF;
            var sd = sphereData(curLeg, frac, R);
            var p = proj(sd.pos[0], sd.pos[1], sd.pos[2]);
            if (i === 0) ctx.moveTo(cx + p[0], cy + p[1]);
            else ctx.lineTo(cx + p[0], cy + p[1]);
        }
        ctx.stroke();

        // vertices
        var verts = [
            proj(R, 0, 0),
            proj(0, R, 0),
            proj(0, 0, R)
        ];
        for (var vi = 0; vi < 3; vi++) {
            disc(cx + verts[vi][0], cy + verts[vi][1], 2.8, 'rgba(255,255,255,0.35)');
        }
        ctx.strokeStyle = 'rgba(0,229,255,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx + verts[0][0], cy + verts[0][1], 7, 0, Math.PI * 2);
        ctx.stroke();

        // Ghost trail of past arrow directions (makes rotation obvious)
        var startSd = sphereData(0, 0, R);
        var startTip = tipScreen(cx, cy, startSd.pos, startSd.vec, R);
        var startAng = screenAngle(startTip.dx, startTip.dy);

        var trailEvery = 0.18;
        for (var u = 0; u < ct; u += trailEvery) {
            var legT = Math.min(Math.floor(u), 2);
            var fT = u - legT;
            var sdT = sphereData(legT, fT, R);
            var tipT = tipScreen(cx, cy, sdT.pos, sdT.vec, R);
            var age = 1 - (ct - u) / Math.max(ct, 0.01);
            drawArrow(tipT.x, tipT.y, tipT.dx, tipT.dy, '#ff7a45', 0.12 + 0.22 * age, 0.55);
        }

        // Current arrow (bright)
        var sdNow = sphereData(curLeg, curF, R);
        var tipNow = tipScreen(cx, cy, sdNow.pos, sdNow.vec, R);
        drawArrow(tipNow.x, tipNow.y, tipNow.dx, tipNow.dy, '#00e5ff', 1, 1.05);

        // Reference ghost at start: original "east" direction
        drawArrow(startTip.x, startTip.y, startTip.dx, startTip.dy, '#8fdc9c', 0.45, 0.85);
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(143,220,156,0.7)';
        ctx.fillText('start', startTip.x + 10, startTip.y - 8);

        // Live rotation readout (screen-space angle vs start)
        var nowAng = screenAngle(tipNow.dx, tipNow.dy);
        var deg = angleDiffDeg(startAng, nowAng);
        ctx.textAlign = 'center';
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255,160,100,0.9)';
        ctx.fillText('turn ' + (deg >= 0 ? '+' : '') + deg.toFixed(0) + '\u00B0', cx, cy + R + 22);

        // Pause: emphasize returned arrow vs start at A
        if (pauseTimer > 0 && flashAlpha > 0.01) {
            var endAtA = tipScreen(cx, cy, sphereData(2, 1, R).pos, sphereData(2, 1, R).vec, R);
            // Both at vertex A for comparison
            var aPos = sphereData(0, 0, R).pos;
            var startAtA = tipScreen(cx, cy, aPos, [0, 0, 1], R);
            var endVecAtA = tipScreen(cx, cy, aPos, [0, -1, 0], R);

            drawArrow(startAtA.x, startAtA.y, startAtA.dx, startAtA.dy, '#8fdc9c', flashAlpha * 0.85, 1);
            drawArrow(endVecAtA.x, endVecAtA.y, endVecAtA.dx, endVecAtA.dy, '#ff6b4a', flashAlpha, 1.1);

            var a0 = screenAngle(startAtA.dx, startAtA.dy);
            var a1 = screenAngle(endVecAtA.dx, endVecAtA.dy);
            ctx.save();
            ctx.globalAlpha = flashAlpha * 0.7;
            ctx.strokeStyle = 'rgba(255,100,50,0.95)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx + verts[0][0], cy + verts[0][1], ARROW_LEN * 0.7, a0, a1, false);
            ctx.stroke();
            ctx.restore();

            ctx.font = '12px "JetBrains Mono", monospace';
            ctx.fillStyle = 'rgba(255,100,50,' + flashAlpha.toFixed(3) + ')';
            ctx.fillText('rotated ~90\u00B0', cx, cy + R + 40);
        }

        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText('CURVED', cx, cy - R - 16);
    }

    function animate() {
        if (!running) return;
        ctx.clearRect(0, 0, W, H);

        var mid = W / 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mid, 12);
        ctx.lineTo(mid, H - 12);
        ctx.stroke();

        drawFlat(mid * 0.5, H * 0.5 + 8);
        drawCurved(mid * 1.5, H * 0.5 + 8);

        if (pauseTimer > 0) {
            pauseTimer--;
            flashAlpha = Math.max(0, flashAlpha - 0.004);
            if (pauseTimer <= 0) {
                t = 0;
                flashAlpha = 0;
            }
        } else {
            t += SPEED;
            if (t >= 3) {
                t = 3;
                pauseTimer = PAUSE_FRAMES;
                flashAlpha = 1;
            }
        }

        animFrame = requestAnimationFrame(animate);
    }

    window.initAnim_paralleltransport = function () {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(init, 150);
    };
})();
