// anim-gpu.js - CPU islands vs GPU megacity
(function () {
    let canvas, ctx, W, H, running = false;
    let cpuPackets = [], gpuPackets = [];
    let time = 0;

    const cpuIslands = [];
    const gpuBlock = {};

    function init() {
        canvas = document.getElementById('gpuCanvas');
        if (!canvas) return;
        const container = document.getElementById('gpuContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');
        time = 0;

        const half = W / 2;
        const pad = 30;
        const iw = 80, ih = 60;

        // CPU islands (left side)
        cpuIslands.length = 0;
        cpuIslands.push({ x: pad + 20, y: pad + 20, w: iw, h: ih });
        cpuIslands.push({ x: half - iw - 40, y: pad + 20, w: iw, h: ih });
        cpuIslands.push({ x: pad + 20, y: H - ih - pad - 20, w: iw, h: ih });
        cpuIslands.push({ x: half - iw - 40, y: H - ih - pad - 20, w: iw, h: ih });

        // GPU block (right side)
        gpuBlock.x = half + pad + 10;
        gpuBlock.y = pad + 10;
        gpuBlock.w = half - pad * 2 - 20;
        gpuBlock.h = H - pad * 2 - 20;

        // Init packets
        cpuPackets = [];
        for (let i = 0; i < 10; i++) {
            cpuPackets.push(newCpuPacket());
        }

        gpuPackets = [];
        for (let i = 0; i < 30; i++) {
            gpuPackets.push(newGpuPacket());
        }

        running = true;
        animate();
    }

    function newCpuPacket() {
        const from = Math.floor(Math.random() * 4);
        let to = Math.floor(Math.random() * 4);
        while (to === from) to = Math.floor(Math.random() * 4);
        return { from, to, progress: Math.random(), speed: 0.002 + Math.random() * 0.003, stalled: false };
    }

    function newGpuPacket() {
        const b = gpuBlock;
        return {
            x: b.x + Math.random() * b.w,
            y: b.y + Math.random() * b.h,
            tx: b.x + Math.random() * b.w,
            ty: b.y + Math.random() * b.h,
            progress: Math.random(),
            speed: 0.015 + Math.random() * 0.02
        };
    }

    function animate() {
        if (!running) return;
        time += 0.016;
        ctx.clearRect(0, 0, W, H);

        const half = W / 2;

        // Labels
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText('CPU CLUSTER', half / 2, 15);
        ctx.fillText('GPU UNIFIED MEMORY', half + (W - half) / 2, 15);

        // Divider
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(half, 0);
        ctx.lineTo(half, H);
        ctx.stroke();

        // === CPU Side ===
        // Draw bridges (thin lines)
        for (let i = 0; i < cpuIslands.length; i++) {
            for (let j = i + 1; j < cpuIslands.length; j++) {
                const a = cpuIslands[i], b = cpuIslands[j];
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 5]);
                ctx.beginPath();
                ctx.moveTo(a.x + a.w / 2, a.y + a.h / 2);
                ctx.lineTo(b.x + b.w / 2, b.y + b.h / 2);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // Draw islands
        cpuIslands.forEach((isl, i) => {
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(isl.x, isl.y, isl.w, isl.h);

            // Grid dots inside
            for (let gx = isl.x + 8; gx < isl.x + isl.w; gx += 12) {
                for (let gy = isl.y + 8; gy < isl.y + isl.h; gy += 12) {
                    ctx.fillStyle = `rgba(255,255,255,${0.05 + 0.03 * Math.sin(time * 2 + gx)})`;
                    ctx.fillRect(gx, gy, 2, 2);
                }
            }

            ctx.font = '9px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.textAlign = 'center';
            ctx.fillText(`CPU ${i}`, isl.x + isl.w / 2, isl.y + isl.h + 12);
        });

        // CPU packets (slow, some stall)
        cpuPackets.forEach(p => {
            p.progress += p.speed;
            // Random stall at midpoint
            if (p.progress > 0.35 && p.progress < 0.65 && Math.random() < 0.01) {
                p.speed = 0.0005;
                p.stalled = true;
            }
            if (p.progress > 0.65 && p.stalled) {
                p.speed = 0.003;
                p.stalled = false;
            }
            if (p.progress >= 1) {
                Object.assign(p, newCpuPacket());
                p.progress = 0;
            }

            const a = cpuIslands[p.from], b = cpuIslands[p.to];
            const px = (a.x + a.w / 2) + ((b.x + b.w / 2) - (a.x + a.w / 2)) * p.progress;
            const py = (a.y + a.h / 2) + ((b.y + b.h / 2) - (a.y + a.h / 2)) * p.progress;

            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = p.stalled ? 'rgba(255,100,100,0.7)' : 'rgba(255,255,255,0.5)';
            ctx.fill();

            if (p.stalled) {
                ctx.font = '7px JetBrains Mono, monospace';
                ctx.fillStyle = 'rgba(255,100,100,0.5)';
                ctx.textAlign = 'center';
                ctx.fillText('WAIT', px, py - 7);
            }
        });

        // === GPU Side ===
        const b = gpuBlock;

        // Single unified block
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(b.x, b.y, b.w, b.h);

        // Dense grid
        for (let gx = b.x + 6; gx < b.x + b.w; gx += 8) {
            for (let gy = b.y + 6; gy < b.y + b.h; gy += 8) {
                const flicker = Math.sin(time * 3 + gx * 0.1 + gy * 0.1) * 0.5 + 0.5;
                ctx.fillStyle = `rgba(255,255,255,${0.02 + 0.06 * flicker})`;
                ctx.fillRect(gx, gy, 2, 2);
            }
        }

        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.textAlign = 'center';
        ctx.fillText('UNIFIED VRAM', b.x + b.w / 2, b.y + b.h + 12);

        // GPU packets (fast, no stalling)
        gpuPackets.forEach(p => {
            p.progress += p.speed;
            if (p.progress >= 1) {
                p.x = p.tx;
                p.y = p.ty;
                p.tx = b.x + Math.random() * b.w;
                p.ty = b.y + Math.random() * b.h;
                p.progress = 0;
            }

            const px = p.x + (p.tx - p.x) * p.progress;
            const py = p.y + (p.ty - p.y) * p.progress;

            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.fill();
        });

        // Bandwidth labels
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,100,100,0.5)';
        ctx.fillText('25 GB/s PCIe  (slow)', half / 2, H - 8);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('900 GB/s HBM3  (fast)', half + (W - half) / 2, H - 8);

        requestAnimationFrame(animate);
    }

    window.initAnim_gpu = function () {
        running = false;
        setTimeout(init, 100);
    };
})();
