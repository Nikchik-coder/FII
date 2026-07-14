// lapse-shift.js - Visualise the lapse function (alpha) and shift vector (beta)
// from the ADM 3+1 formalism. Stacked spatial slices with adjustable
// proper-time spacing (lapse) and coordinate sliding (shift).
(function () {
    let canvas, ctx, W, H, running = false;
    let animFrame;

    // Slider state
    let lapseVal = 0.5;   // 0..1  (maps to visual spacing)
    let shiftVal = 0.0;   // -1..1 (maps to horizontal offset per slice)

    // Drag tracking
    let dragging = null;  // 'lapse' | 'shift' | null

    // Layout constants computed on init
    let sliderLen, sliderY, lapseSliderX, shiftSliderX;
    let viewLeft, viewRight, viewTop, viewBottom;

    const NUM_SLICES = 8;
    const NUM_POINTS = 9;
    const HANDLE_R = 8;

    function init() {
        canvas = document.getElementById('lapseShiftCanvas');
        if (!canvas) return;
        const container = document.getElementById('lapseShiftContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');

        // Slider layout - vertical sliders on left and right edges
        sliderLen = H * 0.50;
        sliderY = H * 0.28;
        lapseSliderX = W * 0.08;
        shiftSliderX = W * 0.92;

        // Central visualisation area
        viewLeft = W * 0.18;
        viewRight = W * 0.82;
        viewTop = H * 0.08;
        viewBottom = H * 0.90;

        // Reset values
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

    // --- Pointer helpers ---------------------------------------------------

    function pointerPos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        const scaleY = H / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    function hitSlider(px, py) {
        // Check lapse slider
        if (Math.abs(px - lapseSliderX) < 24 &&
            py >= sliderY && py <= sliderY + sliderLen) {
            return 'lapse';
        }
        // Check shift slider
        if (Math.abs(px - shiftSliderX) < 24 &&
            py >= sliderY && py <= sliderY + sliderLen) {
            return 'shift';
        }
        return null;
    }

    function updateSlider(px, py) {
        const t = Math.max(0, Math.min(1, (py - sliderY) / sliderLen));
        if (dragging === 'lapse') {
            lapseVal = 1 - t; // top = high lapse, bottom = low
        } else if (dragging === 'shift') {
            shiftVal = (1 - t) * 2 - 1; // top = +1, bottom = -1
        }
    }

    function onDown(e) {
        const p = pointerPos(e);
        dragging = hitSlider(p.x, p.y);
        if (dragging) updateSlider(p.x, p.y);
    }
    function onMove(e) {
        if (!dragging) return;
        const p = pointerPos(e);
        updateSlider(p.x, p.y);
    }
    function onUp() { dragging = false; }
    function onTouchStart(e) {
        e.preventDefault();
        const p = pointerPos(e.touches[0]);
        dragging = hitSlider(p.x, p.y);
        if (dragging) updateSlider(p.x, p.y);
    }
    function onTouchMove(e) {
        e.preventDefault();
        if (!dragging) return;
        const p = pointerPos(e.touches[0]);
        updateSlider(p.x, p.y);
    }

    // --- Drawing -----------------------------------------------------------

    function drawSlider(x, val01, label, sublabel, isShift) {
        // Track
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, sliderY);
        ctx.lineTo(x, sliderY + sliderLen);
        ctx.stroke();

        // Tick marks at ends and centre
        const tickW = 5;
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        [0, 0.5, 1].forEach(function (t) {
            const ty = sliderY + (1 - t) * sliderLen;
            ctx.beginPath();
            ctx.moveTo(x - tickW, ty);
            ctx.lineTo(x + tickW, ty);
            ctx.stroke();
        });

        // Handle
        const hy = sliderY + (1 - val01) * sliderLen;
        ctx.beginPath();
        ctx.arc(x, hy, HANDLE_R, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // Faint glow around handle
        ctx.beginPath();
        ctx.arc(x, hy, HANDLE_R + 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label above
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, sliderY - 22);

        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText(sublabel, x, sliderY - 10);

        // Dynamic feedback below slider
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        if (!isShift) {
            // Lapse feedback
            if (lapseVal < 0.25) {
                ctx.fillStyle = 'rgba(100,180,255,0.5)';
                ctx.fillText('time slows', x, sliderY + sliderLen + 16);
                ctx.fillText('down', x, sliderY + sliderLen + 28);
            } else if (lapseVal > 0.75) {
                ctx.fillStyle = 'rgba(100,255,180,0.5)';
                ctx.fillText('time runs', x, sliderY + sliderLen + 16);
                ctx.fillText('fast', x, sliderY + sliderLen + 28);
            } else {
                ctx.fillText('moderate', x, sliderY + sliderLen + 16);
            }
        } else {
            // Shift feedback
            var absShift = Math.abs(shiftVal);
            if (absShift < 0.1) {
                ctx.fillText('grid aligned', x, sliderY + sliderLen + 16);
            } else {
                var dir = shiftVal > 0 ? 'right' : 'left';
                ctx.fillText('grid slides ' + dir, x, sliderY + sliderLen + 16);
            }
        }
    }

    function drawSlices() {
        // Compute vertical positions based on lapse
        // lapse maps [0.05 .. 1] controlling spacing
        var alphaEff = 0.05 + lapseVal * 0.95;

        // Spacing: lerp between compressed and expanded
        var minGap = (viewBottom - viewTop) / (NUM_SLICES * 3.5);
        var maxGap = (viewBottom - viewTop) / (NUM_SLICES * 0.85);
        var gap = minGap + alphaEff * (maxGap - minGap);

        // Centre the stack vertically
        var totalH = gap * (NUM_SLICES - 1);
        var startY = (viewTop + viewBottom) / 2 - totalH / 2;

        // Shift per slice (cumulative)
        var maxShiftPx = (viewRight - viewLeft) * 0.06;
        var shiftPx = shiftVal * maxShiftPx;

        // Horizontal span for grid points
        var margin = (viewRight - viewLeft) * 0.08;
        var spanLeft = viewLeft + margin;
        var spanRight = viewRight - margin;

        // Draw from bottom slice (earliest) to top slice (latest)
        for (var i = 0; i < NUM_SLICES; i++) {
            var sliceY = startY + (NUM_SLICES - 1 - i) * gap;
            var xOffset = i * shiftPx;

            // Slice line
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(spanLeft + xOffset, sliceY);
            ctx.lineTo(spanRight + xOffset, sliceY);
            ctx.stroke();

            // Time label on far left of slice
            ctx.font = '9px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.18)';
            ctx.textAlign = 'right';
            ctx.fillText('t' + i, spanLeft + xOffset - 8, sliceY + 3);

            // Grid points
            for (var j = 0; j < NUM_POINTS; j++) {
                var frac = j / (NUM_POINTS - 1);
                var px = spanLeft + frac * (spanRight - spanLeft) + xOffset;

                ctx.beginPath();
                ctx.arc(px, sliceY, 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0,220,255,0.7)';
                ctx.fill();

                // Connecting line to next slice above
                if (i < NUM_SLICES - 1) {
                    var nextY = startY + (NUM_SLICES - 2 - i) * gap;
                    var nextX = px + shiftPx;

                    ctx.save();
                    ctx.setLineDash([3, 4]);
                    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(px, sliceY);
                    ctx.lineTo(nextX, nextY);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }

        // "TIME" arrow on the right side of the view area
        var arrowX = viewRight + 18;
        var arrowTop = startY - 12;
        var arrowBot = startY + totalH + 12;

        ctx.strokeStyle = 'rgba(255,255,255,0.20)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowBot);
        ctx.lineTo(arrowX, arrowTop);
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(arrowX - 4, arrowTop + 8);
        ctx.lineTo(arrowX, arrowTop);
        ctx.lineTo(arrowX + 4, arrowTop + 8);
        ctx.stroke();

        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(arrowX + 12, (arrowTop + arrowBot) / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('TIME', 0, 0);
        ctx.restore();

        // Title
        ctx.font = '12px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.textAlign = 'center';
        ctx.fillText('ADM foliation — lapse & shift', W / 2, viewTop - 8);
    }

    function animate() {
        if (!running) return;
        ctx.clearRect(0, 0, W, H);

        // Draw the two sliders
        var lapse01 = lapseVal;
        var shift01 = (shiftVal + 1) / 2; // map -1..1 to 0..1 for slider display
        drawSlider(lapseSliderX, lapse01, '\u03B1 (lapse)', 'clock speed', false);
        drawSlider(shiftSliderX, shift01, '\u03B2 (shift)', 'grid slides', true);

        // Draw the slices
        drawSlices();

        animFrame = requestAnimationFrame(animate);
    }

    window.initAnim_lapseshift = function () {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(init, 150);
    };
})();
