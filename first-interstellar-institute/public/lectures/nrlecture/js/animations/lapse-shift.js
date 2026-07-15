// lapse-shift.js — ADM lapse & shift visualisation
// Left panel: LAPSE (α) — controls how fast time flows between slices
// Right panel: SHIFT (β) — controls how the grid slides sideways
// Each panel has its own draggable slider with a clear before/after visual.
(function () {
    var canvas, ctx, W, H, running = false;
    var animFrame;

    var lapseVal = 0.5;   // 0..1
    var shiftVal = 0.0;   // -1..1
    var dragging = null;

    // Panel layout
    var panelW, midX, leftX, rightX, panelTop, panelBottom;
    var sliderH, sliderW;

    function init() {
        canvas = document.getElementById('lapseShiftCanvas');
        if (!canvas) return;
        var container = document.getElementById('lapseShiftContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');

        midX = W / 2;
        panelW = W * 0.46;
        leftX = W * 0.02;
        rightX = midX + W * 0.02;
        panelTop = H * 0.10;
        panelBottom = H * 0.88;
        sliderH = (panelBottom - panelTop) * 0.55;
        sliderW = panelW * 0.7;

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
        return {
            x: leftX + (panelW - sliderW) / 2,
            y: panelTop + 40,
            w: sliderW,
            h: sliderH
        };
    }
    function shiftSliderRect() {
        return {
            x: rightX + (panelW - sliderW) / 2,
            y: panelTop + 40,
            w: sliderW,
            h: sliderH
        };
    }

    function hitSlider(px, py) {
        var ls = lapseSliderRect();
        if (px >= ls.x - 10 && px <= ls.x + ls.w + 10 && py >= ls.y - 10 && py <= ls.y + ls.h + 10)
            return 'lapse';
        var ss = shiftSliderRect();
        if (px >= ss.x - 10 && px <= ss.x + ss.w + 10 && py >= ss.y - 10 && py <= ss.y + ss.h + 10)
            return 'shift';
        return null;
    }

    function updateSlider(px, py) {
        if (dragging === 'lapse') {
            var ls = lapseSliderRect();
            var t = (px - ls.x) / ls.w;
            lapseVal = Math.max(0, Math.min(1, t));
        } else if (dragging === 'shift') {
            var ss = shiftSliderRect();
            var t = (px - ss.x) / ss.w;
            shiftVal = Math.max(-1, Math.min(1, t * 2 - 1));
        }
    }

    function onDown(e) {
        var p = pointerPos(e);
        dragging = hitSlider(p.x, p.y);
        if (dragging) updateSlider(p.x, p.y);
    }
    function onMove(e) {
        if (!dragging) return;
        var p = pointerPos(e);
        updateSlider(p.x, p.y);
    }
    function onUp() { dragging = false; }
    function onTouchStart(e) {
        e.preventDefault();
        var p = pointerPos(e.touches[0]);
        dragging = hitSlider(p.x, p.y);
        if (dragging) updateSlider(p.x, p.y);
    }
    function onTouchMove(e) {
        e.preventDefault();
        if (!dragging) return;
        var p = pointerPos(e.touches[0]);
        updateSlider(p.x, p.y);
    }

    // --- Drawing ---

    function drawDivider() {
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(midX, panelTop - 10);
        ctx.lineTo(midX, panelBottom + 10);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function drawLapsePanel() {
        var cx = leftX + panelW / 2;

        // Title
        ctx.font = 'bold 13px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(100,180,255,0.8)';
        ctx.textAlign = 'center';
        ctx.fillText('LAPSE  \u03B1', cx, panelTop + 14);
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText('how fast time flows', cx, panelTop + 30);

        // Slider
        var sr = lapseSliderRect();
        // Track
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sr.x, sr.y + sr.h / 2);
        ctx.lineTo(sr.x + sr.w, sr.y + sr.h / 2);
        ctx.stroke();

        // Labels at slider ends
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(100,180,255,0.4)';
        ctx.textAlign = 'left';
        ctx.fillText('\u03B1\u21920', sr.x - 4, sr.y + sr.h / 2 + 18);
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(100,255,180,0.4)';
        ctx.fillText('\u03B1=1', sr.x + sr.w + 4, sr.y + sr.h / 2 + 18);

        // Filled portion
        var handleX = sr.x + lapseVal * sr.w;
        ctx.strokeStyle = 'rgba(100,200,255,0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sr.x, sr.y + sr.h / 2);
        ctx.lineTo(handleX, sr.y + sr.h / 2);
        ctx.stroke();

        // Handle
        ctx.beginPath();
        ctx.arc(handleX, sr.y + sr.h / 2, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(handleX, sr.y + sr.h / 2, 12, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(100,200,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // --- Visualisation: stacked slices ---
        var visTop = sr.y + sr.h + 30;
        var visBot = panelBottom;
        var visH = visBot - visTop;
        var visLeft = leftX + 30;
        var visRight = leftX + panelW - 30;
        var visW = visRight - visLeft;

        var numSlices = 5;
        // Spacing depends on lapse: low = compressed, high = spread
        var minGap = visH / (numSlices * 4);
        var maxGap = visH / (numSlices + 0.5);
        var gap = minGap + lapseVal * (maxGap - minGap);
        var totalH = gap * (numSlices - 1);
        var startY = visTop + (visH - totalH) / 2;

        // Draw slices
        for (var i = 0; i < numSlices; i++) {
            var sy = startY + (numSlices - 1 - i) * gap;

            // Slice line
            ctx.strokeStyle = 'rgba(100,200,255,' + (0.2 + 0.15 * (1 - i / numSlices)) + ')';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(visLeft, sy);
            ctx.lineTo(visRight, sy);
            ctx.stroke();

            // Grid dots
            for (var j = 0; j < 5; j++) {
                var dx = visLeft + (j / 4) * visW;
                ctx.beginPath();
                ctx.arc(dx, sy, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0,220,255,0.6)';
                ctx.fill();
            }

            // Time label
            ctx.font = '8px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.textAlign = 'right';
            ctx.fillText('t' + i, visLeft - 6, sy + 3);
        }

        // Clock icon showing relative speed
        var clockR = 14;
        var clockX = visRight + 22;
        var clockY = (visTop + visBot) / 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(clockX, clockY, clockR, 0, Math.PI * 2);
        ctx.stroke();
        // Clock hands — rotate based on lapse
        var ang = Date.now() * 0.001 * (0.2 + lapseVal * 3);
        ctx.beginPath();
        ctx.moveTo(clockX, clockY);
        ctx.lineTo(clockX + Math.cos(ang) * clockR * 0.7, clockY + Math.sin(ang) * clockR * 0.7);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(clockX, clockY);
        ctx.lineTo(clockX + Math.cos(ang * 0.1) * clockR * 0.5, clockY + Math.sin(ang * 0.1) * clockR * 0.5);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.stroke();

        // Status text
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        if (lapseVal < 0.25) {
            ctx.fillStyle = 'rgba(100,180,255,0.6)';
            ctx.fillText('\u23F8 time nearly frozen', cx, visBot + 16);
        } else if (lapseVal > 0.75) {
            ctx.fillStyle = 'rgba(100,255,180,0.6)';
            ctx.fillText('\u25B6 time flowing fast', cx, visBot + 16);
        } else {
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillText('normal time flow', cx, visBot + 16);
        }
    }

    function drawShiftPanel() {
        var cx = rightX + panelW / 2;

        // Title
        ctx.font = 'bold 13px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,180,100,0.8)';
        ctx.textAlign = 'center';
        ctx.fillText('SHIFT  \u03B2', cx, panelTop + 14);
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText('how the grid slides sideways', cx, panelTop + 30);

        // Slider
        var sr = shiftSliderRect();
        // Track
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sr.x, sr.y + sr.h / 2);
        ctx.lineTo(sr.x + sr.w, sr.y + sr.h / 2);
        ctx.stroke();

        // Centre tick
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sr.x + sr.w / 2, sr.y + sr.h / 2 - 6);
        ctx.lineTo(sr.x + sr.w / 2, sr.y + sr.h / 2 + 6);
        ctx.stroke();

        // Labels
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,180,100,0.4)';
        ctx.textAlign = 'left';
        ctx.fillText('\u03B2<0', sr.x - 4, sr.y + sr.h / 2 + 18);
        ctx.textAlign = 'right';
        ctx.fillText('\u03B2>0', sr.x + sr.w + 4, sr.y + sr.h / 2 + 18);
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillText('\u03B2=0', sr.x + sr.w / 2, sr.y + sr.h / 2 + 18);

        // Handle
        var handleX = sr.x + ((shiftVal + 1) / 2) * sr.w;
        ctx.beginPath();
        ctx.arc(handleX, sr.y + sr.h / 2, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(handleX, sr.y + sr.h / 2, 12, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,180,100,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // --- Visualisation: stacked slices with horizontal offset ---
        var visTop = sr.y + sr.h + 30;
        var visBot = panelBottom;
        var visH = visBot - visTop;
        var visLeft = rightX + 30;
        var visRight = rightX + panelW - 30;
        var visW = visRight - visLeft;

        var numSlices = 5;
        var gap = visH / (numSlices + 0.5);
        var totalH = gap * (numSlices - 1);
        var startY = visTop + (visH - totalH) / 2;

        var maxShift = visW * 0.15;

        // Draw reference vertical line (where grid would be with zero shift)
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.setLineDash([2, 4]);
        ctx.lineWidth = 1;
        for (var j = 0; j < 5; j++) {
            var refX = visLeft + (j / 4) * visW;
            ctx.beginPath();
            ctx.moveTo(refX, startY - 8);
            ctx.lineTo(refX, startY + totalH + 8);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Draw slices with shift
        for (var i = 0; i < numSlices; i++) {
            var sy = startY + (numSlices - 1 - i) * gap;
            var xOff = i * shiftVal * maxShift;

            // Slice line
            ctx.strokeStyle = 'rgba(255,180,100,' + (0.2 + 0.15 * (1 - i / numSlices)) + ')';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(visLeft + xOff, sy);
            ctx.lineTo(visRight + xOff, sy);
            ctx.stroke();

            // Grid dots
            for (var j = 0; j < 5; j++) {
                var dx = visLeft + (j / 4) * visW + xOff;
                ctx.beginPath();
                ctx.arc(dx, sy, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,180,100,0.6)';
                ctx.fill();

                // Connecting line to point above (shows the slide)
                if (i < numSlices - 1) {
                    var nextOff = (i + 1) * shiftVal * maxShift;
                    var nextDx = visLeft + (j / 4) * visW + nextOff;
                    var nextSy = startY + (numSlices - 2 - i) * gap;
                    ctx.strokeStyle = 'rgba(255,180,100,0.12)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(dx, sy);
                    ctx.lineTo(nextDx, nextSy);
                    ctx.stroke();
                }
            }

            // Time label
            ctx.font = '8px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.textAlign = 'right';
            ctx.fillText('t' + i, visLeft - 6, sy + 3);
        }

        // Arrow showing shift direction
        if (Math.abs(shiftVal) > 0.05) {
            var arrowY = visTop + visH / 2;
            var arrowStart = visLeft + visW / 2;
            var arrowLen = shiftVal * maxShift * 2;
            ctx.strokeStyle = 'rgba(255,180,100,0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(arrowStart, arrowY);
            ctx.lineTo(arrowStart + arrowLen, arrowY);
            ctx.stroke();
            // Arrowhead
            var dir = shiftVal > 0 ? 1 : -1;
            ctx.beginPath();
            ctx.moveTo(arrowStart + arrowLen, arrowY);
            ctx.lineTo(arrowStart + arrowLen - dir * 6, arrowY - 4);
            ctx.moveTo(arrowStart + arrowLen, arrowY);
            ctx.lineTo(arrowStart + arrowLen - dir * 6, arrowY + 4);
            ctx.stroke();
        }

        // Status text
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        if (Math.abs(shiftVal) < 0.1) {
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillText('grid stays aligned', cx, visBot + 16);
        } else {
            ctx.fillStyle = 'rgba(255,180,100,0.6)';
            ctx.fillText('grid slides ' + (shiftVal > 0 ? 'right' : 'left'), cx, visBot + 16);
        }
    }

    function animate() {
        if (!running) return;
        animFrame = requestAnimationFrame(animate);
        ctx.clearRect(0, 0, W, H);

        drawDivider();
        drawLapsePanel();
        drawShiftPanel();
    }

    window.initAnim_lapseshift = function () {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(init, 150);
    };
})();
