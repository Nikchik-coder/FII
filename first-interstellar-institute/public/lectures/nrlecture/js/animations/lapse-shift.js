// lapse-shift.js — ADM lapse & shift visualisation
//
// LAPSE (α) = "playback speed" of the universe's movie
//   - High α: lots of proper time between frames → things move fast
//   - Low α: barely any time between frames → everything frozen
//   - Near a black hole: α → 0 (time freezes)
//
// SHIFT (β) = "camera tracking" of the coordinate grid
//   - β = 0: fixed camera, object moves through the grid
//   - β > 0: camera pans to follow, object stays centered in its grid cell
//   - Lets coordinates follow moving black holes
(function () {
    var canvas, ctx, W, H, running = false;
    var animFrame;
    var time = 0;

    var lapseVal = 0.5;   // 0..1
    var shiftVal = 0.0;   // -1..1
    var dragging = null;

    var midX, leftX, rightX, panelW, panelTop, panelBottom;

    function init() {
        canvas = document.getElementById('lapseShiftCanvas');
        if (!canvas) return;
        var container = document.getElementById('lapseShiftContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');

        midX = W / 2;
        panelW = W * 0.47;
        leftX = W * 0.015;
        rightX = midX + W * 0.015;
        panelTop = H * 0.06;
        panelBottom = H * 0.96;

        lapseVal = 0.5;
        shiftVal = 0.0;

        canvas.addEventListener('mousedown', onDown);
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseup', onUp);
        canvas.addEventListener('mouseleave', onUp);
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', onUp);

        running = true;
        animate();
    }

    // --- Pointer ---
    function pointerPos(e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (W / rect.width),
            y: (e.clientY - rect.top) * (H / rect.height)
        };
    }

    function lapseSliderRect() {
        return { x: leftX + 40, y: panelTop + 38, w: panelW - 80, h: 16 };
    }
    function shiftSliderRect() {
        return { x: rightX + 40, y: panelTop + 38, w: panelW - 80, h: 16 };
    }

    function hitSlider(px, py) {
        var ls = lapseSliderRect();
        if (px >= ls.x - 12 && px <= ls.x + ls.w + 12 && py >= ls.y - 12 && py <= ls.y + ls.h + 12)
            return 'lapse';
        var ss = shiftSliderRect();
        if (px >= ss.x - 12 && px <= ss.x + ss.w + 12 && py >= ss.y - 12 && py <= ss.y + ss.h + 12)
            return 'shift';
        return null;
    }

    function updateSlider(px) {
        if (dragging === 'lapse') {
            var ls = lapseSliderRect();
            lapseVal = Math.max(0, Math.min(1, (px - ls.x) / ls.w));
        } else if (dragging === 'shift') {
            var ss = shiftSliderRect();
            shiftVal = Math.max(-1, Math.min(1, ((px - ss.x) / ss.w) * 2 - 1));
        }
    }

    function onDown(e) { var p = pointerPos(e); dragging = hitSlider(p.x, p.y); if (dragging) updateSlider(p.x); }
    function onMove(e) { if (!dragging) return; updateSlider(pointerPos(e).x); }
    function onUp() { dragging = false; }
    function onTouchStart(e) { e.preventDefault(); var p = pointerPos(e.touches[0]); dragging = hitSlider(p.x, p.y); if (dragging) updateSlider(p.x); }
    function onTouchMove(e) { e.preventDefault(); if (!dragging) return; updateSlider(pointerPos(e.touches[0]).x); }

    // --- Slider drawing ---
    function drawSlider(sr, val01, label, leftTag, rightTag, colour) {
        var cy = sr.y + sr.h / 2;
        // Track
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sr.x, cy);
        ctx.lineTo(sr.x + sr.w, cy);
        ctx.stroke();
        // Filled
        var hx = sr.x + val01 * sr.w;
        ctx.strokeStyle = colour + '0.4)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(sr.x, cy);
        ctx.lineTo(hx, cy);
        ctx.stroke();
        // Handle
        ctx.beginPath();
        ctx.arc(hx, cy, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(hx, cy, 11, 0, Math.PI * 2);
        ctx.strokeStyle = colour + '0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        // End labels
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.textAlign = 'left';
        ctx.fillText(leftTag, sr.x, cy + 20);
        ctx.textAlign = 'right';
        ctx.fillText(rightTag, sr.x + sr.w, cy + 20);
    }

    // --- LAPSE panel: bouncing ball at different playback speeds ---
    function drawLapsePanel() {
        var cx = leftX + panelW / 2;

        // Title
        ctx.font = 'bold 13px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(100,180,255,0.85)';
        ctx.textAlign = 'center';
        ctx.fillText('LAPSE  \u03B1  =  playback speed', cx, panelTop + 14);
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText('how much real time passes between frames', cx, panelTop + 28);

        // Slider
        var sr = lapseSliderRect();
        drawSlider(sr, lapseVal, '\u03B1', '\u03B1\u21920 (frozen)', '\u03B1=1 (fast)', 'rgba(100,180,255,');

        // --- Movie frames: a ball bouncing ---
        var visTop = sr.y + sr.h + 30;
        var visBot = panelBottom - 24;
        var visH = visBot - visTop;
        var visLeft = leftX + 20;
        var visRight = leftX + panelW - 20;
        var visW = visRight - visLeft;

        var nFrames = 5;
        // Vertical spacing depends on lapse (compressed = frozen, spread = fast)
        var minGap = visH / (nFrames * 2.5);
        var maxGap = visH / (nFrames + 0.3);
        var gap = minGap + lapseVal * (maxGap - minGap);
        var totalH = gap * (nFrames - 1);
        var startY = visTop + (visH - totalH) / 2;

        // Ball position in each frame depends on lapse
        // At lapse=0, ball barely moves. At lapse=1, ball does a full bounce.
        var ballPhase = time * 0.015;
        var ballBaseX = visLeft + visW * 0.5;

        for (var i = 0; i < nFrames; i++) {
            var fy = startY + (nFrames - 1 - i) * gap;

            // Frame background (subtle box)
            var frameH = Math.min(gap * 0.7, 50);
            ctx.fillStyle = 'rgba(100,180,255,0.03)';
            ctx.fillRect(visLeft, fy - frameH / 2, visW, frameH);
            ctx.strokeStyle = 'rgba(100,180,255,0.08)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(visLeft, fy - frameH / 2, visW, frameH);

            // Ground line
            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(visLeft + 5, fy + frameH / 2 - 4);
            ctx.lineTo(visRight - 5, fy + frameH / 2 - 4);
            ctx.stroke();

            // Ball: position depends on how much "time" has passed
            // Each frame is at time t_i = i * lapse
            var t = i * lapseVal * 0.8 + ballPhase;
            var bounceY = Math.abs(Math.sin(t * Math.PI)) * (frameH * 0.35);
            var ballY = fy + frameH / 2 - 4 - bounceY - 4;

            // Ball trail (faint arc showing path)
            if (i === 0) {
                ctx.strokeStyle = 'rgba(100,180,255,0.06)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (var k = 0; k < 30; k++) {
                    var kt = k * lapseVal * 0.8 / 29 + ballPhase;
                    var ky = fy + frameH / 2 - 4 - Math.abs(Math.sin(kt * Math.PI)) * (frameH * 0.35) - 4;
                    if (k === 0) ctx.moveTo(ballBaseX, ky);
                    else ctx.lineTo(ballBaseX, ky);
                }
                ctx.stroke();
            }

            // Ball
            ctx.beginPath();
            ctx.arc(ballBaseX, ballY, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(100,200,255,0.85)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ballBaseX, ballY, 7, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(100,200,255,0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Frame label
            ctx.font = '7px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.textAlign = 'left';
            ctx.fillText('frame ' + i, visLeft + 4, fy - frameH / 2 + 8);
        }

        // Arrow showing time direction
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(visRight + 10, startY + totalH + 5);
        ctx.lineTo(visRight + 10, startY - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(visRight + 7, startY);
        ctx.lineTo(visRight + 10, startY - 5);
        ctx.lineTo(visRight + 13, startY);
        ctx.stroke();
        ctx.font = '7px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(visRight + 18, startY + totalH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('time', 0, 0);
        ctx.restore();

        // Status
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        if (lapseVal < 0.2) {
            ctx.fillStyle = 'rgba(100,180,255,0.6)';
            ctx.fillText('\u23F8  time nearly frozen (like near a black hole)', cx, panelBottom - 8);
        } else if (lapseVal > 0.8) {
            ctx.fillStyle = 'rgba(100,255,180,0.6)';
            ctx.fillText('\u25B6  time flowing fast (far from any black hole)', cx, panelBottom - 8);
        } else {
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillText('normal time flow', cx, panelBottom - 8);
        }
    }

    // --- SHIFT panel: camera tracking a moving black hole ---
    function drawShiftPanel() {
        var cx = rightX + panelW / 2;

        // Title
        ctx.font = 'bold 13px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,180,100,0.85)';
        ctx.textAlign = 'center';
        ctx.fillText('SHIFT  \u03B2  =  camera tracking', cx, panelTop + 14);
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText('how much the coordinate grid slides between frames', cx, panelTop + 28);

        // Slider
        var sr = shiftSliderRect();
        drawSlider(sr, (shiftVal + 1) / 2, '\u03B2', '\u03B2<0 (slide left)', '\u03B2>0 (slide right)', 'rgba(255,180,100,');
        // Centre tick
        var cy = sr.y + sr.h / 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sr.x + sr.w / 2, cy - 6);
        ctx.lineTo(sr.x + sr.w / 2, cy + 6);
        ctx.stroke();

        // --- Movie frames: BH moving, grid tracking ---
        var visTop = sr.y + sr.h + 30;
        var visBot = panelBottom - 24;
        var visH = visBot - visTop;
        var visLeft = rightX + 20;
        var visRight = rightX + panelW - 20;
        var visW = visRight - visLeft;

        var nFrames = 5;
        var gap = visH / (nFrames + 0.3);
        var totalH = gap * (nFrames - 1);
        var startY = visTop + (visH - totalH) / 2;

        // BH moves left-to-right across the domain
        // In frame 0 it's at 25%, in frame nFrames-1 it's at 75%
        var bhStart = 0.25, bhEnd = 0.75;
        var maxShiftPx = visW * 0.18;

        for (var i = 0; i < nFrames; i++) {
            var fy = startY + (nFrames - 1 - i) * gap;
            var frameH = Math.min(gap * 0.7, 50);

            // Frame background
            ctx.fillStyle = 'rgba(255,180,100,0.03)';
            ctx.fillRect(visLeft, fy - frameH / 2, visW, frameH);
            ctx.strokeStyle = 'rgba(255,180,100,0.08)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(visLeft, fy - frameH / 2, visW, frameH);

            // BH position in this frame (moves left to right)
            var bhFrac = bhStart + (bhEnd - bhStart) * (i / (nFrames - 1));
            var bhX = visLeft + bhFrac * visW;

            // Grid offset: shift accumulates per frame
            // The grid slides by shiftVal * maxShiftPx per frame
            var gridOffset = i * shiftVal * maxShiftPx;

            // Draw grid lines (5 vertical lines)
            for (var g = 0; g < 5; g++) {
                var gx = visLeft + (g / 4) * visW + gridOffset;
                if (gx < visLeft - 2 || gx > visRight + 2) continue;
                ctx.strokeStyle = 'rgba(255,180,100,0.1)';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(gx, fy - frameH / 2 + 2);
                ctx.lineTo(gx, fy + frameH / 2 - 2);
                ctx.stroke();
            }

            // Draw BH
            var bhR = 6;
            // Glow
            var g1 = ctx.createRadialGradient(bhX, fy, 0, bhX, fy, 14);
            g1.addColorStop(0, 'rgba(200,100,40,0.3)');
            g1.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g1;
            ctx.beginPath();
            ctx.arc(bhX, fy, 14, 0, Math.PI * 2);
            ctx.fill();
            // Core
            ctx.beginPath();
            ctx.arc(bhX, fy, bhR, 0, Math.PI * 2);
            ctx.fillStyle = '#111';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,180,100,0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Frame label
            ctx.font = '7px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.textAlign = 'left';
            ctx.fillText('frame ' + i, visLeft + 4, fy - frameH / 2 + 8);

            // Show which grid cell the BH is in
            var cellSize = visW / 4;
            var cellIdx = Math.floor((bhX - visLeft - gridOffset) / cellSize);
            ctx.font = '7px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(255,180,100,0.3)';
            ctx.textAlign = 'right';
            ctx.fillText('cell ' + cellIdx, visRight - 4, fy - frameH / 2 + 8);
        }

        // Arrow showing time direction
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(visRight + 10, startY + totalH + 5);
        ctx.lineTo(visRight + 10, startY - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(visRight + 7, startY);
        ctx.lineTo(visRight + 10, startY - 5);
        ctx.lineTo(visRight + 13, startY);
        ctx.stroke();
        ctx.font = '7px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(visRight + 18, startY + totalH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('time', 0, 0);
        ctx.restore();

        // Status
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        if (Math.abs(shiftVal) < 0.1) {
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillText('\u03B2=0: fixed grid \u2014 BH moves through cells', cx, panelBottom - 8);
        } else if (Math.abs(shiftVal) > 0.6) {
            ctx.fillStyle = 'rgba(100,255,180,0.5)';
            ctx.fillText('\u03B2 tracks BH \u2014 stays in same cell', cx, panelBottom - 8);
        } else {
            ctx.fillStyle = 'rgba(255,180,100,0.5)';
            ctx.fillText('grid partially follows the BH', cx, panelBottom - 8);
        }
    }

    function animate() {
        if (!running) return;
        animFrame = requestAnimationFrame(animate);
        time++;
        ctx.clearRect(0, 0, W, H);

        // Divider
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(midX, panelTop - 5);
        ctx.lineTo(midX, panelBottom + 5);
        ctx.stroke();
        ctx.setLineDash([]);

        drawLapsePanel();
        drawShiftPanel();
    }

    window.initAnim_lapseshift = function () {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(init, 150);
    };
})();
