// parallel-transport.js - Parallel transport on flat vs curved surfaces
// Demonstrates holonomy: a vector parallel-transported around a closed loop
// returns to its original direction on a flat surface but rotates on a curved one.
(function () {
    let canvas, ctx, W, H, running = false;
    let animFrame;
    let t = 0;            // animation parameter 0 → 3 (three legs of triangle)
    let pauseTimer = 0;
    let flashAlpha = 0;

    const SPEED = 0.005;
    const PAUSE_FRAMES = 160;
    const ARROW_LEN = 28;
    const HEAD_LEN = 8;
    const HEAD_W = 3.5;

    // Sphere projection angles (azimuth / elevation)
    const AZ = 0.55, EL = 0.42;
    const cA = Math.cos(AZ), sA = Math.sin(AZ);
    const cE = Math.cos(EL), sE = Math.sin(EL);

    // Orthographic projection: rotate world then take (x, -y)
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

    /* ------------------------------------------------------------------ */
    /*  Helpers                                                           */
    /* ------------------------------------------------------------------ */

    function lerp(a, b, f) { return a + (b - a) * f; }

    function drawArrow(x, y, dx, dy, color, alpha) {
        var len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1e-4) return;
        var nx = dx / len, ny = dy / len;
        var ex = x + nx * ARROW_LEN, ey = y + ny * ARROW_LEN;

        ctx.save();
        ctx.globalAlpha = (alpha !== undefined) ? alpha : 1;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // filled arrowhead
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

    /* ------------------------------------------------------------------ */
    /*  FLAT side                                                         */
    /* ------------------------------------------------------------------ */

    function drawFlat(cx, cy) {
        var s = Math.min(W * 0.19, H * 0.32);

        // background grid
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

        // triangle vertices
        var tri = [
            [cx - s * 0.72, cy + s * 0.48],   // A  bottom-left
            [cx + s * 0.72, cy + s * 0.48],   // B  bottom-right
            [cx,             cy - s * 0.62]    // C  top
        ];

        // traversed path highlight
        var ct = Math.min(t, 3);
        var leg = Math.min(Math.floor(ct), 2);
        var f = ct - leg;
        ctx.strokeStyle = 'rgba(0,229,255,0.12)';
        ctx.lineWidth = 1.6;
        for (var l = 0; l < leg; l++) {
            ctx.beginPath();
            ctx.moveTo(tri[l][0], tri[l][1]);
            ctx.lineTo(tri[(l + 1) % 3][0], tri[(l + 1) % 3][1]);
            ctx.stroke();
        }
        // partial current leg
        var ax = lerp(tri[leg][0], tri[(leg + 1) % 3][0], f);
        var ay = lerp(tri[leg][1], tri[(leg + 1) % 3][1], f);
        ctx.beginPath();
        ctx.moveTo(tri[leg][0], tri[leg][1]);
        ctx.lineTo(ax, ay);
        ctx.stroke();

        // full triangle outline
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tri[0][0], tri[0][1]);
        for (var i = 1; i <= 3; i++) ctx.lineTo(tri[i % 3][0], tri[i % 3][1]);
        ctx.closePath();
        ctx.stroke();

        // dots at vertices
        for (var i = 0; i < 3; i++) disc(tri[i][0], tri[i][1], 2.5, 'rgba(255,255,255,0.3)');

        // start marker ring
        ctx.strokeStyle = 'rgba(0,229,255,0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(tri[0][0], tri[0][1], 6, 0, Math.PI * 2);
        ctx.stroke();

        // arrow — always pointing UP (constant direction on flat surface)
        drawArrow(ax, ay, 0, -1, '#00e5ff', 1);

        // label
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText('FLAT', cx, cy - s - 16);

        // completion note
        if (pauseTimer > 0) {
            ctx.font = '11px "JetBrains Mono", monospace';
            ctx.fillStyle = 'rgba(100,220,160,' + (flashAlpha * 0.85).toFixed(3) + ')';
            ctx.fillText('no rotation', cx, cy + s + 28);
        }
    }

    /* ------------------------------------------------------------------ */
    /*  CURVED side – sphere with spherical triangle                       */
    /* ------------------------------------------------------------------ */

    // Spherical triangle:
    //   A = (theta=pi/2, phi=0)      equator, front
    //   B = (theta=0,     phi=0)      north pole
    //   C = (theta=pi/2, phi=pi/2)   equator, 90deg away
    //
    // Parallel-transported vector (initially pointing east = (0,0,1)):
    //   Leg 0  A->B :  V = (0, 0, 1)                  constant
    //   Leg 1  B->C :  V = (0, -sin(th), cos(th))     rotates smoothly
    //   Leg 2  C->A :  V = (0, -1, 0)                 constant (south)
    //
    // Net holonomy: east -> south = 90 deg clockwise

    function sphereData(leg, f, R) {
        var x, y, z, vx, vy, vz;
        if (leg === 0) {
            var th = Math.PI / 2 * (1 - f);
            x = R * Math.sin(th); y = R * Math.cos(th); z = 0;
            vx = 0; vy = 0; vz = 1;
        } else if (leg === 1) {
            var th = Math.PI / 2 * f;
            x = 0; y = R * Math.cos(th); z = R * Math.sin(th);
            vx = 0; vy = -Math.sin(th); vz = Math.cos(th);
        } else {
            var ph = Math.PI / 2 * (1 - f);
            x = R * Math.cos(ph); y = 0; z = R * Math.sin(ph);
            vx = 0; vy = -1; vz = 0;
        }
        return { pos: [x, y, z], vec: [vx, vy, vz] };
    }

    function drawCurved(cx, cy) {
        var R = Math.min(W * 0.18, H * 0.3);

        // sphere outline
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();

        // latitude wireframe
        var steps = 64;
        var latitudes = [30, 60, 90, 120, 150];
        for (var li = 0; li < latitudes.length; li++) {
            var th = latitudes[li] * Math.PI / 180;
            ctx.strokeStyle = 'rgba(255,255,255,0.045)';
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
        }

        // longitude wireframe
        var longitudes = [0, 30, 60, 90, 120, 150];
        for (var li = 0; li < longitudes.length; li++) {
            var ph = longitudes[li] * Math.PI / 180;
            ctx.strokeStyle = 'rgba(255,255,255,0.045)';
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
        }

        // triangle path on sphere
        var N = 48;
        // traversed highlight
        var ct = Math.min(t, 3);
        var curLeg = Math.min(Math.floor(ct), 2);
        var curF = ct - curLeg;

        ctx.lineWidth = 1.6;
        ctx.strokeStyle = 'rgba(0,229,255,0.15)';
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
        // partial current leg
        var stepsPartial = Math.max(1, Math.round(N * curF));
        ctx.beginPath();
        for (var i = 0; i <= stepsPartial; i++) {
            var sd = sphereData(curLeg, (i / N), R);
            var p = proj(sd.pos[0], sd.pos[1], sd.pos[2]);
            if (i === 0) ctx.moveTo(cx + p[0], cy + p[1]);
            else ctx.lineTo(cx + p[0], cy + p[1]);
        }
        ctx.stroke();

        // full triangle outline (dim)
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
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

        // triangle vertex dots
        var vertPositions = [
            proj(R, 0, 0),    // A
            proj(0, R, 0),    // B (pole)
            proj(0, 0, R)     // C
        ];
        for (var vi = 0; vi < 3; vi++) {
            disc(cx + vertPositions[vi][0], cy + vertPositions[vi][1], 2.5, 'rgba(255,255,255,0.3)');
        }

        // start marker ring at A
        ctx.strokeStyle = 'rgba(0,229,255,0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx + vertPositions[0][0], cy + vertPositions[0][1], 6, 0, Math.PI * 2);
        ctx.stroke();

        // animated arrow on sphere
        var sd = sphereData(curLeg, curF, R);
        var pp = proj(sd.pos[0], sd.pos[1], sd.pos[2]);
        // project the transported vector into screen coords
        var eps = 0.6;
        var pv = proj(
            sd.pos[0] + sd.vec[0] * eps,
            sd.pos[1] + sd.vec[1] * eps,
            sd.pos[2] + sd.vec[2] * eps
        );
        var dvx = pv[0] - pp[0];
        var dvy = pv[1] - pp[1];
        drawArrow(cx + pp[0], cy + pp[1], dvx, dvy, '#00e5ff', 1);

        // ghost arrow at start showing original direction (during pause)
        if (pauseTimer > 0 && flashAlpha > 0.01) {
            var startP = vertPositions[0];
            // initial vector was (0,0,1) at A(R,0,0)
            var ghostEnd = proj(R, 0, eps);
            var gdx = ghostEnd[0] - startP[0];
            var gdy = ghostEnd[1] - startP[1];
            drawArrow(cx + startP[0], cy + startP[1], gdx, gdy, '#00e5ff', flashAlpha * 0.25);

            // small arc showing rotation angle
            var gLen = Math.sqrt(gdx * gdx + gdy * gdy);
            if (gLen > 0.01) {
                var startAngle = Math.atan2(gdy, gdx);
                var endAngle = Math.atan2(dvy, dvx);
                ctx.save();
                ctx.globalAlpha = flashAlpha * 0.4;
                ctx.strokeStyle = 'rgba(255,100,50,0.8)';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(
                    cx + startP[0], cy + startP[1],
                    ARROW_LEN * 0.55,
                    startAngle, endAngle,
                    false
                );
                ctx.stroke();
                ctx.restore();
            }
        }

        // label
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText('CURVED', cx, cy - R - 16);

        // "rotated 90" flash
        if (pauseTimer > 0 && flashAlpha > 0.01) {
            ctx.font = '12px "JetBrains Mono", monospace';
            ctx.fillStyle = 'rgba(255,100,50,' + flashAlpha.toFixed(3) + ')';
            ctx.fillText('rotated 90\u00B0', cx, cy + R + 28);
        }
    }

    /* ------------------------------------------------------------------ */
    /*  Animation loop                                                    */
    /* ------------------------------------------------------------------ */

    function animate() {
        if (!running) return;
        ctx.clearRect(0, 0, W, H);

        var mid = W / 2;

        // subtle divider
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mid, 12);
        ctx.lineTo(mid, H - 12);
        ctx.stroke();

        drawFlat(mid * 0.5, H * 0.5 + 8);
        drawCurved(mid * 1.5, H * 0.5 + 8);

        // advance time
        if (pauseTimer > 0) {
            pauseTimer--;
            flashAlpha = Math.max(0, flashAlpha - 0.005);
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

    /* ------------------------------------------------------------------ */
    /*  Public init                                                       */
    /* ------------------------------------------------------------------ */

    window.initAnim_paralleltransport = function () {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(init, 150);
    };
})();
