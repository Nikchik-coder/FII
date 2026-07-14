// anim-timeline.js - dual AI / NR timeline with key figures
(function () {
    let canvas, ctx, W, H, running = false;
    let step = -1;

    const aiEvents = [
        { year: '1958', title: 'Perceptron', detail: 'Rosenblatt' },
        { year: '1969', title: 'AI Limits exposed', detail: 'Minsky & Papert' },
        { year: '1980s', title: 'Expert Systems', detail: 'rule-based AI' },
        { year: '1990s', title: 'AI Winter', detail: 'funding collapses' },
        { year: '2012', title: 'AlexNet + GPUs', detail: 'Krizhevsky et al.', breakthrough: true },
        { year: '2017', title: 'Transformers', detail: 'Vaswani et al.' },
        { year: '2022', title: 'ChatGPT / LLMs', detail: 'foundation models' }
    ];

    const nrEvents = [
        { year: '1915', title: "Einstein's GR", detail: 'field equations' },
        { year: '1962', title: 'ADM Formalism', detail: 'Arnowitt, Deser, Misner' },
        { year: '1987\u201399', title: 'BSSN', detail: 'Nakamura, Shibata,\nBaumgarte & Shapiro' },
        { year: '1993\u201395', title: 'Grand Challenge', detail: 'US national effort' },
        { year: '2005', title: 'Moving Punctures', detail: 'Pretorius; Campanelli\net al.; Baker et al.', breakthrough: true },
        { year: '2004\u201312', title: 'CCZ4', detail: 'Bona, Alic, Rezzolla\nconstraint damping' },
        { year: '2015', title: 'GW150914', detail: 'LIGO detection' },
    ];

    function init() {
        canvas = document.getElementById('timelineCanvas');
        if (!canvas) return;
        const container = document.getElementById('timelineContainer');
        W = canvas.width = container.clientWidth;
        H = canvas.height = container.clientHeight;
        ctx = canvas.getContext('2d');
        step = -1;
        running = true;

        container.addEventListener('click', advance);
        draw();
    }

    function advance() {
        if (step < aiEvents.length - 1) {
            step++;
            draw();
        }
    }

    function fillMultiline(text, x, y, lineH) {
        const lines = text.split('\n');
        lines.forEach((line, i) => {
            ctx.fillText(line, x, y + i * lineH);
        });
        return lines.length;
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        const midY = H / 2;
        const padX = 50;
        const usableW = W - padX * 2;
        const count = aiEvents.length;
        const gap = usableW / (count - 1);

        // ---- Central axis ----
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(padX - 10, midY);
        ctx.lineTo(W - padX + 10, midY);
        ctx.stroke();

        // ---- Track labels ----
        ctx.font = '12px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText('ARTIFICIAL INTELLIGENCE', padX - 10, midY - H * 0.36);
        ctx.fillText('NUMERICAL RELATIVITY', padX - 10, midY + H * 0.36 + 14);

        // ---- Draw events ----
        for (let i = 0; i <= step; i++) {
            const x = padX + i * gap;
            const ai = aiEvents[i];
            const nr = nrEvents[i];

            // Vertical tick through axis
            ctx.strokeStyle = 'rgba(255,255,255,0.12)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, midY - 8);
            ctx.lineTo(x, midY + 8);
            ctx.stroke();

            const alpha = 0.9;
            const dimAlpha = 0.55;

            // ======== AI event (above) ========
            const aiDotY = midY - 30;

            // Dot
            ctx.beginPath();
            ctx.arc(x, aiDotY, ai.breakthrough ? 6 : 4, 0, Math.PI * 2);
            ctx.fillStyle = ai.breakthrough
                ? `rgba(255,255,255,${alpha})`
                : `rgba(180,180,180,${dimAlpha})`;
            ctx.fill();
            if (ai.breakthrough) {
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Connector line from dot to text
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, aiDotY - (ai.breakthrough ? 6 : 4));
            ctx.lineTo(x, midY - 65);
            ctx.stroke();

            // Year
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.font = 'bold 15px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(ai.year, x, midY - 72);

            // Title
            ctx.font = '12px EB Garamond, serif';
            ctx.fillStyle = `rgba(220,220,220,${alpha * 0.85})`;
            ctx.fillText(ai.title, x, midY - 88);

            // Detail (people)
            ctx.font = '9px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(220,220,220,0.7)';
            ctx.fillText(ai.detail, x, midY - 102);

            // ======== NR event (below) ========
            const nrDotY = midY + 30;

            // Dot
            ctx.beginPath();
            ctx.arc(x, nrDotY, nr.breakthrough ? 6 : 4, 0, Math.PI * 2);
            ctx.fillStyle = nr.breakthrough
                ? `rgba(255,255,255,${alpha})`
                : `rgba(180,180,180,${dimAlpha})`;
            ctx.fill();
            if (nr.breakthrough) {
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Connector line from dot to text
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, nrDotY + (nr.breakthrough ? 6 : 4));
            ctx.lineTo(x, midY + 65);
            ctx.stroke();

            // Year
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.font = 'bold 15px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(nr.year, x, midY + 80);

            // Title
            ctx.font = '13px EB Garamond, serif';
            ctx.fillStyle = `rgba(220,220,220,${alpha * 0.85})`;
            ctx.fillText(nr.title, x, midY + 98);

            // Detail (people) - may be multiline
            ctx.font = '9px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(220,220,220,0.75)';
            fillMultiline(nr.detail, x, midY + 114, 12);

            // ======== Breakthrough connector ========
            if (ai.breakthrough && nr.breakthrough) {
                ctx.strokeStyle = 'rgba(255,255,255,0.35)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(x, aiDotY + 6);
                ctx.lineTo(x, nrDotY - 6);
                ctx.stroke();
                ctx.setLineDash([]);

                // Breakthrough label
                ctx.font = '10px JetBrains Mono, monospace';
                ctx.fillStyle = 'rgba(255,255,255,0.55)';
                ctx.fillText('GPU', x, midY - 4);
                ctx.fillText('REVOLUTION', x, midY + 10);
            }
        }

        // ---- Legend ----
        if (step >= 0) {
            ctx.font = '9px JetBrains Mono, monospace';
            ctx.textAlign = 'right';
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillText(`${step + 1} / ${aiEvents.length}`, W - 15, H - 10);
        }
    }

    window.initAnim_timeline = function () {
        running = false;
        setTimeout(init, 100);
    };
})();
