// finite-diff.js - Finite differencing / discretisation demo
// Shows how a smooth function is approximated by grid points,
// and how the derivative approximation degrades at low resolution
(function () {
    let canvas, ctx, W, H, running = false;
    let animFrame;

    // Slider state
    let sliderX = 0;           // current thumb position (px)
    let sliderDragging = false;
    let N = 12;                // number of grid points (5..50)
    const N_MIN = 5;
    const N_MAX = 50;

    // Layout regions (computed in init)
    let plotTop, plotFunc, plotSlider, plotDeriv;

    // ---- math helpers ----
    function f(x)  { return Math.sin(x) + 0.3 * Math.sin(3 * x); }
    function df(x) { return Math.cos(x) + 0.9 * Math.cos(3 * x); }

    const X_MIN = 0;
    const X_MAX = 2 * Math.PI;

    // ---- layout helper ----
    function computeLayout() {
        const pad = 14;
        const sliderH = 38;
        const gap = 10;
        const usable = H - pad * 2 - sliderH - gap * 2;
        const funcH = usable * 0.55;
        const derivH = usable * 0.45;

        plotFunc = {
            x: 52, y: pad + 18,
            w: W - 64, h: funcH
        };
        plotSlider = {
            x: 52, y: plotFunc.y + plotFunc.h + gap,
            w: W - 64, h: sliderH
        };
        plotDeriv = {
            x: 52, y: plotSlider.y + plotSlider.h + gap + 14,
            w: W - 64, h: derivH - 14
        };
    }

    // ---- coordinate transforms ----
    function toCanvasX(xVal, region) {
        return region.x + ((xVal - X_MIN) / (X_MAX - X_MIN)) * region.w;
    }
    function toCanvasY(yVal, yMin, yMax, region) {
        return region.y + region.h - ((yVal - yMin) / (yMax - yMin)) * region.h;
    }

    // ---- compute grid data ----
    function getGridData() {
        const dx = (X_MAX - X_MIN) / (N - 1);
        const pts = [];
        for (let i = 0; i < N; i++) {
            const x = X_MIN + i * dx;
            pts.push({ x: x, y: f(x) });
        }
        // central finite difference for derivative
        const derivPts = [];
        for (let i = 0; i < N; i++) {
            let dydx;
            if (i === 0) {
                dydx = (pts[1].y - pts[0].y) / dx;              // forward
            } else if (i === N - 1) {
                dydx = (pts[N - 1].y - pts[N - 2].y) / dx;     // backward
            } else {
                dydx = (pts[i + 1].y - pts[i - 1].y) / (2 * dx); // central
            }
            derivPts.push({ x: pts[i].x, y: dydx });
        }
        return { pts, derivPts, dx };
    }

    // ---- compute L2 error as percentage ----
    function computeError(pts) {
        // sample many points, compare linear interp of grid to exact
        const samples = 200;
        let sumSq = 0, sumExactSq = 0;
        for (let s = 0; s <= samples; s++) {
            const x = X_MIN + (s / samples) * (X_MAX - X_MIN);
            const exact = f(x);

            // find surrounding grid pts
            let interp = exact;
            for (let i = 0; i < pts.length - 1; i++) {
                if (x >= pts[i].x && x <= pts[i + 1].x) {
                    const t = (x - pts[i].x) / (pts[i + 1].x - pts[i].x);
                    interp = pts[i].y * (1 - t) + pts[i + 1].y * t;
                    break;
                }
            }
            const err = exact - interp;
            sumSq += err * err;
            sumExactSq += exact * exact;
        }
        if (sumExactSq < 1e-12) return 0;
        return Math.sqrt(sumSq / sumExactSq) * 100;
    }

    // ---- drawing ----
    function draw() {
        if (!running) return;
        ctx.clearRect(0, 0, W, H);

        const { pts, derivPts } = getGridData();
        const errPct = computeError(pts);

        drawFuncPlot(pts, errPct);
        drawSlider();
        drawDerivPlot(derivPts);

        animFrame = requestAnimationFrame(draw);
    }

    function drawFuncPlot(pts, errPct) {
        const region = plotFunc;
        const yMin = -1.5, yMax = 1.5;

        // axes
        drawAxes(region, yMin, yMax, 'f(x)');

        // --- error shading (fill between exact and linear interp) ---
        ctx.save();
        ctx.beginPath();
        const steps = 300;
        // top edge: exact curve
        for (let i = 0; i <= steps; i++) {
            const x = X_MIN + (i / steps) * (X_MAX - X_MIN);
            const cx = toCanvasX(x, region);
            const cy = toCanvasY(f(x), yMin, yMax, region);
            if (i === 0) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        }
        // bottom edge: linear interp going backwards
        for (let i = steps; i >= 0; i--) {
            const x = X_MIN + (i / steps) * (X_MAX - X_MIN);
            // linear interp
            let interp = f(x);
            for (let j = 0; j < pts.length - 1; j++) {
                if (x >= pts[j].x - 1e-9 && x <= pts[j + 1].x + 1e-9) {
                    const t = (x - pts[j].x) / (pts[j + 1].x - pts[j].x);
                    interp = pts[j].y * (1 - t) + pts[j + 1].y * t;
                    break;
                }
            }
            const cx = toCanvasX(x, region);
            const cy = toCanvasY(interp, yMin, yMax, region);
            ctx.lineTo(cx, cy);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 60, 60, 0.10)';
        ctx.fill();
        ctx.restore();

        // --- exact curve (thin white) ---
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
            const x = X_MIN + (i / steps) * (X_MAX - X_MIN);
            const cx = toCanvasX(x, region);
            const cy = toCanvasY(f(x), yMin, yMax, region);
            if (i === 0) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // --- grid approximation (cyan segments) ---
        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) {
            const cx = toCanvasX(pts[i].x, region);
            const cy = toCanvasY(pts[i].y, yMin, yMax, region);
            if (i === 0) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        }
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // --- grid dots ---
        for (let i = 0; i < pts.length; i++) {
            const cx = toCanvasX(pts[i].x, region);
            const cy = toCanvasY(pts[i].y, yMin, yMax, region);
            ctx.beginPath();
            ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#00e5ff';
            ctx.fill();
        }

        // --- vertical grid lines (faint) ---
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.07)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < pts.length; i++) {
            const cx = toCanvasX(pts[i].x, region);
            ctx.beginPath();
            ctx.moveTo(cx, region.y);
            ctx.lineTo(cx, region.y + region.h);
            ctx.stroke();
        }

        // --- readout ---
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        const errStr = errPct < 0.1 ? '<0.1' : errPct.toFixed(1);
        ctx.fillText(
            'N = ' + N + ' points,  error = ' + errStr + '%',
            region.x + region.w, region.y - 5
        );

        // label
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillText('FUNCTION APPROXIMATION', region.x, region.y - 5);
    }

    function drawDerivPlot(derivPts) {
        const region = plotDeriv;
        const yMin = -2.2, yMax = 2.2;

        drawAxes(region, yMin, yMax, "f'(x)");

        // --- exact derivative (thin white) ---
        const steps = 300;
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
            const x = X_MIN + (i / steps) * (X_MAX - X_MIN);
            const cx = toCanvasX(x, region);
            const cy = toCanvasY(df(x), yMin, yMax, region);
            if (i === 0) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // --- finite difference derivative (cyan segments) ---
        ctx.beginPath();
        for (let i = 0; i < derivPts.length; i++) {
            const cx = toCanvasX(derivPts[i].x, region);
            const cy = toCanvasY(derivPts[i].y, yMin, yMax, region);
            if (i === 0) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        }
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // --- dots ---
        for (let i = 0; i < derivPts.length; i++) {
            const cx = toCanvasX(derivPts[i].x, region);
            const cy = toCanvasY(derivPts[i].y, yMin, yMax, region);
            ctx.beginPath();
            ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#00e5ff';
            ctx.fill();
        }

        // --- vertical grid lines (faint) ---
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.07)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < derivPts.length; i++) {
            const cx = toCanvasX(derivPts[i].x, region);
            ctx.beginPath();
            ctx.moveTo(cx, region.y);
            ctx.lineTo(cx, region.y + region.h);
            ctx.stroke();
        }

        // --- error shading for derivative ---
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
            const x = X_MIN + (i / steps) * (X_MAX - X_MIN);
            const cx = toCanvasX(x, region);
            const cy = toCanvasY(df(x), yMin, yMax, region);
            if (i === 0) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        }
        for (let i = steps; i >= 0; i--) {
            const x = X_MIN + (i / steps) * (X_MAX - X_MIN);
            let interp = df(x);
            for (let j = 0; j < derivPts.length - 1; j++) {
                if (x >= derivPts[j].x - 1e-9 && x <= derivPts[j + 1].x + 1e-9) {
                    const t = (x - derivPts[j].x) / (derivPts[j + 1].x - derivPts[j].x);
                    interp = derivPts[j].y * (1 - t) + derivPts[j + 1].y * t;
                    break;
                }
            }
            const cx = toCanvasX(x, region);
            const cy = toCanvasY(interp, yMin, yMax, region);
            ctx.lineTo(cx, cy);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 60, 60, 0.10)';
        ctx.fill();
        ctx.restore();

        // label
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillText('DERIVATIVE  (finite difference)', region.x, region.y - 5);

        // dx readout
        const dx = (X_MAX - X_MIN) / (N - 1);
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText('\u0394x = ' + dx.toFixed(3), region.x + region.w, region.y - 5);
    }

    // ---- axes / grid ----
    function drawAxes(region, yMin, yMax, label) {
        // bounding box
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(region.x, region.y, region.w, region.h);

        // zero line
        const zeroY = toCanvasY(0, yMin, yMax, region);
        if (zeroY > region.y && zeroY < region.y + region.h) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 0.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(region.x, zeroY);
            ctx.lineTo(region.x + region.w, zeroY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // y-axis label
        ctx.save();
        ctx.translate(region.x - 6, region.y + region.h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.textAlign = 'center';
        ctx.fillText(label, 0, 0);
        ctx.restore();

        // y-axis tick labels
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.textAlign = 'right';
        const yStep = (yMax - yMin) <= 3 ? 1 : 1;
        for (let v = Math.ceil(yMin); v <= Math.floor(yMax); v += yStep) {
            const cy = toCanvasY(v, yMin, yMax, region);
            if (cy > region.y + 8 && cy < region.y + region.h - 4) {
                ctx.fillText(v.toString(), region.x - 8, cy + 3);
            }
        }

        // x-axis tick labels
        ctx.textAlign = 'center';
        const xTicks = [0, Math.PI, 2 * Math.PI];
        const xLabels = ['0', '\u03C0', '2\u03C0'];
        for (let i = 0; i < xTicks.length; i++) {
            const cx = toCanvasX(xTicks[i], region);
            ctx.fillText(xLabels[i], cx, region.y + region.h + 12);
        }
    }

    // ---- slider ----
    function drawSlider() {
        const region = plotSlider;
        const trackY = region.y + region.h / 2;
        const trackLeft = region.x + 12;
        const trackRight = region.x + region.w - 12;
        const trackW = trackRight - trackLeft;

        // compute thumb position from N
        const frac = (N - N_MIN) / (N_MAX - N_MIN);
        const thumbX = trackLeft + frac * trackW;
        sliderX = thumbX;

        // track
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(trackLeft, trackY);
        ctx.lineTo(trackRight, trackY);
        ctx.stroke();

        // filled portion
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(trackLeft, trackY);
        ctx.lineTo(thumbX, trackY);
        ctx.stroke();

        // thumb
        ctx.beginPath();
        ctx.arc(thumbX, trackY, 8, 0, Math.PI * 2);
        ctx.fillStyle = sliderDragging ? '#00e5ff' : 'rgba(0, 229, 255, 0.7)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // inner dot
        ctx.beginPath();
        ctx.arc(thumbX, trackY, 3, 0, Math.PI * 2);
        ctx.fillStyle = sliderDragging ? '#fff' : 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        // label
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillText('RESOLUTION', region.x + region.w / 2, region.y + 6);

        // min/max labels
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.textAlign = 'right';
        ctx.fillText(N_MIN.toString(), trackLeft - 4, trackY + 4);
        ctx.textAlign = 'left';
        ctx.fillText(N_MAX.toString(), trackRight + 4, trackY + 4);
    }

    // ---- slider interaction ----
    function getSliderTrack() {
        const region = plotSlider;
        const trackLeft = region.x + 12;
        const trackRight = region.x + region.w - 12;
        const trackY = region.y + region.h / 2;
        return { trackLeft, trackRight, trackY, trackW: trackRight - trackLeft };
    }

    function updateNFromPointer(px) {
        const { trackLeft, trackW } = getSliderTrack();
        let frac = (px - trackLeft) / trackW;
        frac = Math.max(0, Math.min(1, frac));
        N = Math.round(N_MIN + frac * (N_MAX - N_MIN));
    }

    function isOnSlider(px, py) {
        const { trackLeft, trackRight, trackY } = getSliderTrack();
        const frac = (N - N_MIN) / (N_MAX - N_MIN);
        const thumbX = trackLeft + frac * (trackRight - trackLeft);
        const dx = px - thumbX;
        const dy = py - trackY;
        // generous hit area
        return (dx * dx + dy * dy) < 20 * 20 ||
            (Math.abs(py - trackY) < 16 && px >= trackLeft - 8 && px <= trackRight + 8);
    }

    function onDown(e) {
        const rect = canvas.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        if (isOnSlider(px, py)) {
            sliderDragging = true;
            updateNFromPointer(px);
        }
    }
    function onMove(e) {
        if (!sliderDragging) return;
        const rect = canvas.getBoundingClientRect();
        const px = e.clientX - rect.left;
        updateNFromPointer(px);
    }
    function onUp() {
        sliderDragging = false;
    }

    function onTouchStart(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const px = e.touches[0].clientX - rect.left;
        const py = e.touches[0].clientY - rect.top;
        if (isOnSlider(px, py)) {
            sliderDragging = true;
            updateNFromPointer(px);
        }
    }
    function onTouchMove(e) {
        e.preventDefault();
        if (!sliderDragging) return;
        const rect = canvas.getBoundingClientRect();
        const px = e.touches[0].clientX - rect.left;
        updateNFromPointer(px);
    }

    // ---- init / teardown ----
    function init() {
        canvas = document.getElementById('finiteDiffCanvas');
        if (!canvas) return;
        const container = document.getElementById('finiteDiffContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');

        computeLayout();

        // event listeners
        canvas.addEventListener('mousedown', onDown);
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseup', onUp);
        canvas.addEventListener('mouseleave', onUp);
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', onUp);

        running = true;
        draw();
    }

    window.initAnim_finitediff = function () {
        running = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(init, 150);
    };
})();
