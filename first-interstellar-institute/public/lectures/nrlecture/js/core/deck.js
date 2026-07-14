// deck.js - Slide navigation engine
// Manages slide transitions, reveal items, progress bar, notes, table of contents
// Animation dispatch uses data-anim attributes (no hardcoded indices!)
// TOC is auto-generated from slide part-labels and h2 headings

const Deck = (function () {
    let current = 0;
    let slides = [];
    let notesVisible = false;
    let tocVisible = false;
    let notesPanel = null;
    let tocPanel = null;

    function show(n) {
        if (n < 0 || n >= slides.length) return;
        slides.forEach((s, i) => s.classList.toggle('active', i === n));
        current = n;
        document.getElementById('counter').textContent = `${n + 1} / ${slides.length}`;
        document.getElementById('progress').style.width =
            `${((n + 1) / slides.length) * 100}%`;

        // Reset reveal items on new slide
        const active = slides[n];
        active.querySelectorAll('.reveal-item').forEach(el => el.classList.remove('shown'));
        setTimeout(() => revealNext(active), 100);

        // Update notes panel content
        updateNotes();
        // Highlight current in TOC
        updateTOCHighlight();

        // Dispatch animation via data-anim attribute (no index dependency!)
        const animName = active.dataset.anim;
        if (animName) {
            const fn = window['initAnim_' + animName];
            if (fn) fn();
        }
    }

    function updateNotes() {
        if (!notesPanel) return;
        const active = slides[current];
        const noteEl = active ? active.querySelector('.slide-note') : null;
        const inner = notesPanel.querySelector('.notes-inner') || notesPanel;
        if (noteEl && notesVisible) {
            inner.innerHTML = noteEl.innerHTML;
            notesPanel.classList.add('visible');
        } else {
            notesPanel.classList.remove('visible');
        }
    }

    function toggleNotes() {
        notesVisible = !notesVisible;
        const btn = document.getElementById('notesToggle');
        if (btn) btn.classList.toggle('active', notesVisible);
        document.body.classList.toggle('notes-on', notesVisible);
        updateNotes();
    }

    // ---- Table of Contents (auto-generated from slide DOM) ----
    function buildTOC() {
        tocPanel = document.getElementById('tocPanel');
        if (!tocPanel) return;

        let html = '<div class="toc-header">TABLE OF CONTENTS</div>';
        let lastGroup = '';

        slides.forEach((slide, idx) => {
            const partLabel = slide.querySelector('.part-label');
            const raw = partLabel ? partLabel.textContent.trim() : '';

            // Extract group key: "Part 1", "Part 2", "Lecture", "Closing", etc.
            // Strip the subtitle after the dash: "Part 2 — Foo" → "Part 2"
            const dashIdx = raw.indexOf('—');
            const group = dashIdx > 0 ? raw.substring(0, dashIdx).trim() : raw;

            // Show section header only when the group changes
            if (group && group !== lastGroup) {
                html += `<div class="toc-section">${raw}</div>`;
                lastGroup = group;
            } else if (!group && idx === 0) {
                html += '<div class="toc-section">Overview</div>';
            }

            const heading = slide.querySelector('h1, h2');
            const label = heading ? heading.textContent.trim() : `Slide ${idx + 1}`;

            html += `<button class="toc-item" data-slide="${idx}">` +
                `<span class="toc-num">${idx + 1}</span>` +
                `${label}</button>`;
        });

        tocPanel.innerHTML = html;

        // Click handlers
        tocPanel.querySelectorAll('.toc-item').forEach(btn => {
            btn.addEventListener('click', () => {
                show(parseInt(btn.dataset.slide));
            });
        });
    }

    function updateTOCHighlight() {
        if (!tocPanel) return;
        tocPanel.querySelectorAll('.toc-item').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.slide) === current);
        });
        const activeItem = tocPanel.querySelector('.toc-item.active');
        if (activeItem) activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function toggleTOC() {
        tocVisible = !tocVisible;
        const btn = document.getElementById('tocToggle');
        if (btn) {
            btn.classList.toggle('active', tocVisible);
            btn.innerHTML = tocVisible ? '&#9664;' : '&#9654;';
        }
        if (tocPanel) tocPanel.classList.toggle('visible', tocVisible);
        document.body.classList.toggle('toc-open', tocVisible);
    }

    function closeTOC() {
        tocVisible = false;
        const btn = document.getElementById('tocToggle');
        if (btn) {
            btn.classList.remove('active');
            btn.innerHTML = '&#9654;';
        }
        if (tocPanel) tocPanel.classList.remove('visible');
        document.body.classList.remove('toc-open');
    }

    function revealNext(slide) {
        if (!slide) slide = slides[current];
        const hidden = slide.querySelector('.reveal-item:not(.shown)');
        if (hidden) {
            hidden.classList.add('shown');
            return true;
        }
        return false;
    }

    function next() {
        if (revealNext()) return;
        if (current < slides.length - 1) show(current + 1);
    }

    function prev() {
        if (current > 0) show(current - 1);
    }

    function init() {
        slides = Array.from(document.querySelectorAll('.slide'));

        // Notes panel
        notesPanel = document.getElementById('notesPanel');

        // Build TOC (auto-generated from slide DOM)
        buildTOC();

        // Render KaTeX equations
        if (window.renderMathInElement) {
            renderMathInElement(document.body, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
            if (e.key === 'n' || e.key === 'N') { toggleNotes(); }
            if (e.key === 't' || e.key === 'T') { toggleTOC(); }
            if (e.key === 'Escape') { closeTOC(); }
            if (e.key === 'Home') { e.preventDefault(); restart(); }
        });

        show(0);
    }

    function restart() {
        show(0);
    }

    function getCurrent() { return current; }

    return { init, show, next, prev, restart, getCurrent, toggleNotes, toggleTOC };
})();
