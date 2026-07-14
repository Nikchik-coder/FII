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
        // Update era timeline
        updateEraTimeline(active);

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
        // Re-init the current animation so canvases resize to new container
        setTimeout(() => {
            const active = slides[current];
            if (active) {
                const animName = active.dataset.anim;
                if (animName) {
                    const fn = window['initAnim_' + animName];
                    if (fn) fn();
                }
            }
        }, 350); // wait for CSS transition to finish
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

    // ---- Era timeline (fixed bar at top) ----
    function updateEraTimeline(slide) {
        const timeline = document.getElementById('eraTimeline');
        if (!timeline) return;

        // Determine which era(s) to highlight based on part-label text
        const partLabel = slide ? slide.querySelector('.part-label') : null;
        const text = partLabel ? partLabel.textContent.trim() : '';
        const heading = slide ? (slide.querySelector('h1, h2') || {}).textContent || '' : '';

        // Map slide content to active eras
        // Title/overview slides: show nothing active, or show all dimmed
        // Part 1 = Einstein (1915)
        // Part 2 = ADM(1959) / BSSN(1995) / CCZ4(2005 area)
        // Part 3 = 2005 breakthrough / LIGO 2015
        // Part 4 = GPU era 2026
        // Part 5 = Wormholes 2026
        // Conclusion = all

        let activeEras = [];

        if (/^Lecture$/.test(text) || /^$/.test(text)) {
            // Title / Q&A slides: hide timeline
            timeline.classList.remove('visible');
            return;
        }

        timeline.classList.add('visible');

        if (/Conclusion/.test(text)) {
            activeEras = ['1915', '1959', '1995', '2005', '2015', '2026'];
        } else if (/Part 1/.test(text)) {
            activeEras = ['1915'];
        } else if (/Part 2/.test(text)) {
            // Distinguish within Part 2
            if (/ADM/.test(text) || /Bread Slicer/.test(text) || /Evolution Variable/.test(text) || /Splitting/.test(text) || /Geometry to a Movie/.test(text)) {
                activeEras = ['1915', '1959'];
            } else if (/BSSN/.test(text)) {
                activeEras = ['1915', '1959', '1995'];
            } else if (/CCZ4/.test(text) || /Gauge/.test(text) || /Problem/.test(text) || /Constraint/.test(text)) {
                activeEras = ['1915', '1959', '1995', '2005'];
            } else {
                activeEras = ['1915', '1959'];
            }
        } else if (/Part 3/.test(text)) {
            if (/Breakthrough/.test(text)) {
                activeEras = ['1915', '1959', '1995', '2005'];
            } else {
                activeEras = ['1915', '1959', '1995', '2005', '2015'];
            }
        } else if (/Part 4/.test(text)) {
            activeEras = ['1915', '1959', '1995', '2005', '2015', '2026'];
        } else if (/Part 5/.test(text)) {
            activeEras = ['1915', '1959', '1995', '2005', '2015', '2026'];
        }

        // Update dots
        timeline.querySelectorAll('.era-dot').forEach(dot => {
            const era = dot.dataset.era;
            dot.classList.toggle('active', activeEras.includes(era));
        });

        // Update glowing segment (show a line from first to last active era)
        let segment = timeline.querySelector('.era-segment');
        if (!segment) {
            segment = document.createElement('div');
            segment.className = 'era-segment';
            timeline.appendChild(segment);
        }

        if (activeEras.length >= 2) {
            // Get positions from the CSS percentage positions
            const positions = {
                '1915': 0, '1959': 20, '1995': 40,
                '2005': 55, '2015': 75, '2026': 100
            };
            const first = positions[activeEras[0]];
            const last = positions[activeEras[activeEras.length - 1]];
            segment.style.left = first + '%';
            segment.style.width = (last - first) + '%';
            segment.style.opacity = '1';
        } else {
            segment.style.opacity = '0';
        }
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
