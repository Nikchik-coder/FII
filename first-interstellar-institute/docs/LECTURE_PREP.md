# Slicing Spacetime — Lecture Prep Guide

Plain-English walkthrough of every concept in the presentation, in lecture order. Use this to prepare: each section matches a slide (or slide group). Equations appear only when they help; the point is always *what it means*.

---

## How to use this guide

1. Read one section at a time.
2. Say the idea out loud in one or two sentences.
3. If you can explain *why it matters for the next section*, you are ready to move on.

**One-sentence arc of the whole lecture:** Einstein’s equations are beautiful but almost impossible by hand → we rewrite them as “space evolving through time” → we fix the math so computers don’t crash → GPUs make big simulations practical → we can even simulate wormholes and the waves they emit.

---

## Opening — The big picture

### Title: Slicing Spacetime

Einstein published general relativity (GR) in 1915 with pen and paper. The lecture’s claim is: today, supercomputers and GPUs turn those equations into a **digital laboratory** for the cosmos.

### Timeline: AI Winter ↔ NR Dark Ages

Two fields were stuck for decades even though the theory existed:

| Field | Stuck because… | Unlocked by… |
|--------|----------------|--------------|
| **AI** | Algorithms + hardware weren’t enough | Deep learning + GPUs (≈2012) |
| **Numerical relativity (NR)** | Same: theory yes, stable sims no | Better formulations + hardware (≈2005 breakthrough, then GPUs) |

**Key NR milestones (names worth knowing):**

- **ADM** (Arnowitt, Deser, Misner) — split spacetime into “space + time”
- **BSSN** (Nakamura, Shibata, Baumgarte, Shapiro) — stable variables for computers
- **CCZ4** (Bona, Alic, Rezzolla, …) — actively damps constraint errors
- **2005** — Pretorius; Campanelli et al.; Baker et al. — binary black holes finally work
- **2015** — LIGO detects GW150914 using NR waveform templates

**Talking point:** Same GPU revolution that made ChatGPT possible also made cutting-edge GR simulations affordable.

---

## Part 1 — Why numerical relativity? Why GR?

### 1. The missing waveforms (why we need NR)

*Comes right after the timeline — use the “NR Dark Ages” story as the bridge.*

Einstein predicted gravitational waves in 1916. For nearly a century, nobody could compute what a **black hole merger** signal really looks like.

| Phase of a binary | What works |
|-------------------|------------|
| Slow inspiral | Pen-and-paper approximations (post-Newtonian) |
| Ringdown (after merger) | Perturbation theory |
| **Merger** (loudest part) | Only **full numerical relativity** |

LIGO matched GW150914 against **~200,000 NR waveform templates**. Without those templates, the signal would have stayed buried in noise.

**Talking point:** Without NR, gravitational-wave astronomy is blind. The timeline showed decades of stuck theory — this plot shows *why that mattered*.

---

### 2. The problem with Newton

**Newtonian gravity:** If the Sun vanished, Earth would change orbit *instantly* — even though light from the Sun takes ~8 minutes.

That contradicts special relativity: nothing (including information) travels faster than light.

**Einstein’s fix:** Gravity must propagate at the speed of light, like electromagnetic waves. If the Sun vanished, Earth would keep orbiting for ~8.3 minutes until the gravitational disturbance arrived.

**Analogy:** Maxwell showed EM changes travel at *c*. Gravity must work the same way.

---

### 3. Einstein built on differential geometry

*Comes right after the Sun/Earth animation.*

Einstein did **not** invent the math of curved space. He inherited a 19th-century toolkit and made the physical leap: **gravity = spacetime curvature**.

| Year | Who | What Einstein inherited |
|------|-----|-------------------------|
| 1827 | **Gauss** | Intrinsic curvature of surfaces (Theorema Egregium) |
| 1854 | **Riemann** | n-dimensional manifolds + metric (ancestor of \(g_{\mu\nu}\)) |
| 1869 | **Christoffel** | Connection symbols \(\Gamma\) — how directions twist |
| ~1900 | **Ricci & Levi-Civita** | Tensor calculus (coordinate-independent laws) |
| 1915 | **Einstein** | Identifies gravity with that geometry |

**Talking point:** Without this differential geometry, the field equation could not have been written. The next slides unpack that toolkit (metric → Christoffel → Riemann → Einstein tensor).

**Interactive slide:** three animated vignettes — sphere/geodesics (Gauss), warped manifold with \(ds\) (Riemann), parallel transport (connection) — plus the heritage timeline ending at Einstein 1915.

---

### 4. Einstein’s field equation

\[
G_{\mu\nu} = 8\pi\, T_{\mu\nu}
\]

**Plain English:**

- **Left side (\(G\)):** geometry of spacetime — how space is curved
- **Right side (\(T\)):** matter and energy — how much “stuff” is there and how it moves

Famous slogan: *Matter tells spacetime how to curve; spacetime tells matter how to move.*

It looks as simple as \(E=mc^2\). That is a trap: it is shorthand for **10 coupled equations**.

---

### 4. Ten coupled non-linear PDEs

That elegant line “shatters” into **10 coupled, non-linear partial differential equations**. Every piece of the metric feeds back into every other piece.

**Why that hurts:**

- **Coupled** = you can’t solve one equation alone
- **Non-linear** = outputs feed back as inputs (gravity creates more gravity)
- **PDEs** = depend on space *and* time derivatives

Pen and paper only handle the simplest cases (static black holes, weak fields, high symmetry). Dynamic mergers need machines.

---

### 5. The metric tensor — the lookup table for distance

On a flat table, distance is Pythagoras: \(ds^2 = dx^2 + dy^2\).

In spacetime:

\[
ds^2 = g_{\mu\nu}\, dx^\mu\, dx^\nu
\]

**Plain English:**

- Coordinates \((t, x, y, z)\) are just **addresses**
- The **metric** \(g_{\mu\nu}\) converts address differences into **real** distances and times
- When the metric changes from place to place, that change **is** gravity

**Schwarzschild (one non-spinning black hole):** near \(r \to 2M\) (the horizon), clocks freeze and radial distances blow up. That is geometry, not a force pulling you.

**Interactive slide:** top = flat table — drag the probe, every ruler stays the same, \(ds^2 = dx^2 + dy^2\). Bottom = curved space — drag the mass, rulers stretch near \(M\), \(ds^2 = g_{\mu\nu}\,dx^\mu dx^\nu\), live \(ds\) readout changes.

---

### 6. Christoffel symbols — “road map corrections”

On a flat table, “forward” means the same everywhere. On a globe, “forward” at the equator and at the pole are different.

**Christoffel symbols \(\Gamma\)** track how directions twist as you move through curved space. They are built from the metric and its first derivatives.

- Flat space → \(\Gamma = 0\)
- Near a black hole → \(\Gamma\) huge
- There are many of them (~40 independent pieces in the bookkeeping)

They are the building blocks of curvature, not curvature itself yet.

---

### 7. Parallel transport

Carry an arrow around a closed loop, always keeping it as “straight” as possible:

- **Flat surface:** arrow returns pointing the same way
- **Curved surface (sphere):** arrow returns **rotated**

That rotation **is** curvature showing up. Parallel transport is how Christoffel symbols “act” on vectors.

---

### 8. Riemann curvature tensor — “how curved is it here?”

The Riemann tensor is the full answer to spacetime curvature. In 4D it has **20 independent components**.

**Physical meaning:** tidal forces — how nearby freely falling objects drift apart or squeeze together.

Example: two balls falling toward Earth drift closer because gravity converges toward the center. That relative drift is curvature.

Riemann is built from Christoffels and how they change.

---

### 9. Geodesic deviation

Two ants walk “straight ahead” side by side:

- Flat table → stay parallel forever
- Sphere / curved spacetime → converge or diverge

The rate of that convergence **is** what Riemann measures. In GR, nearby free-fallers drift not because of a force between them, but because the space between them is curved.

---

### 10. Ricci tensor, Ricci scalar, Einstein tensor

We compress Riemann:

1. **Ricci tensor** — a 10-number “trace” of Riemann  
2. **Ricci scalar** — one number summarizing that further  
3. **Einstein tensor** \(G_{\mu\nu} = R_{\mu\nu} - \tfrac12 g_{\mu\nu} R\)

\(G_{\mu\nu}\) is specially built so energy is automatically conserved (what goes in must come out). This is the left-hand side of Einstein’s equation.

---

### 11. Stress-energy tensor — the right-hand side

\(T_{\mu\nu}\) answers: *how much stuff is here, and how is it moving?*

Examples in the lecture:

- **Perfect fluid:** density \(\rho\), pressure \(p\), velocity \(u\)
- **Scalar field:** used for exotic/wormhole matter — an invisible field whose energy/pressure depend on its gradients and potential \(V(\phi)\)

Normal matter → positive energy → attracts. Exotic (phantom) matter → can have negative energy → effectively repels.

---

### 12. Motion in curved spacetime = geodesics

Objects follow the **straightest possible path** on a curved surface (a geodesic). There is no mystical force yanking them; they move as inertially as geometry allows.

Rubber-sheet analogy: the funnel is steep near the mass, so paths bend sharply. That is a visual aid, not literal 2D rubber in space — but the idea is right.

**Geodesic equation (Newton’s \(F=ma\) rewritten for curved spacetime):**

\[
\frac{d^2 x^\mu}{d\tau^2} + \Gamma^\mu_{\;\alpha\beta}\,\frac{dx^\alpha}{d\tau}\frac{dx^\beta}{d\tau} = 0
\]

- \(\tau\) = time on the falling object’s own clock  
- \(\Gamma\) plays the role of “gravity”  
- Flat space → \(\Gamma=0\) → straight lines  

---

### 13. Non-linearity: gravity creates gravity

In electromagnetism, light does not source more light in the same way. In GR, **gravitational field energy itself gravitates**. Feedback loop → microphone next to a speaker.

That is why dynamic solutions are so hard analytically.

---

### 14. Light cones near a black hole

A light cone = all possible future directions for a light ray.

- Far away: cones upright — light can go out  
- Near horizon: cones tilt inward  
- At horizon: outgoing light barely escapes (infinite coordinate time)  
- Inside: **both** sides of the cone point inward — no future leads out  

Nothing escapes not because of a “suction force,” but because geometry has no outward future.

---

### 15. Discretizing spacetime — how computers see equations

Computers cannot store smooth continuous functions. They:

1. Chop space into a **grid** of cells  
2. Replace derivatives with **finite differences** between neighbors  

Example:

\[
\frac{\partial f}{\partial x}\bigg|_i \approx \frac{f_{i+1} - f_{i-1}}{2\,\Delta x}
\]

“Slope at point \(i\)” ≈ (right neighbor − left neighbor) / gap.

Production runs often use huge grids (e.g. \(512^3\) cells) plus finer nested grids near black holes (**AMR** — later).

**Resolution matters:** coarse grids look jagged; derivatives amplify errors, so NR needs fine grids and high-order stencils (4th/6th order).

**Bridge question into Part 2:** How do we rewrite Einstein’s equations so this grid approach actually works?

---

## Part 2 — From geometry to a movie (ADM → BSSN → CCZ4)

### 16. Why reformulate? Equations don’t point “forward in time”

\(G_{\mu\nu}=8\pi T_{\mu\nu}\) treats space and time symmetrically (covariant 4D block). There is no built-in “now” and “next.”

A computer needs an **initial-value problem**:

> Give me geometry *now* → compute geometry *one step later*.

So we deliberately break 4D symmetry: pick a time direction and rewrite GR as **3D space evolving through time** — like frames in a movie.

**Everything in Part 2 (ADM, BSSN, CCZ4) is the same Einstein physics, better bookkeeping.**

---

### 17. ADM 3+1 decomposition

Split the 4D metric into:

| Piece | Symbol | Role | Count |
|-------|--------|------|-------|
| Spatial metric | \(\gamma_{ij}\) | Shape of space on each “now” slice | 6 |
| Lapse | \(\alpha\) | How much proper time between slices (clock speed) | 1 |
| Shift | \(\beta^i\) | How the coordinate grid slides sideways | 3 |

Total = **10** — same information as the original metric, reorganized for time-stepping.

**Bread-slicer picture:** the history of the universe is a loaf; each slice is space at one instant; the computer flips from slice to slice.

---

### 18. Lapse, shift, extrinsic curvature

**Lapse \(\alpha\)**  
How fast clocks tick between slices. Near a black hole we often drive \(\alpha \to 0\) so the simulation never reaches the singularity (“freeze” the interior in coordinate time).

**Shift \(\beta^i\)**  
How the spatial grid slides sideways between steps — keeps coordinates from tangling as black holes move.

**Extrinsic curvature \(K_{ij}\)**  
How fast the *shape* of each slice is changing — stretching vs compressing from one moment to the next.

Interactive intuition:

- High lapse → lots of proper time between slices  
- Low lapse → slices packed; clocks nearly frozen  
- Nonzero shift → connecting lines between grid points tilt  

---

### 19. Ten equations → 6 evolution + 4 constraints

Feed the 3+1 split back into Einstein. The 10 equations sort into:

**6 evolution equations**  
Contain time derivatives. Tell \(\gamma_{ij}\) and \(K_{ij}\) how to march forward.

**4 constraint equations**  
No time derivatives. Must already be true on *every* slice:

- **1 Hamiltonian** — energy/curvature budget  
- **3 momentum** — flow/bending budget  

Analogy (electricity): \(\nabla\cdot E = \rho\) is a constraint (must hold *now*); Faraday’s law is evolution.

If initial data fails the constraints, it is not a valid universe — the simulation crashes immediately.

---

### 20. ADM evolution (what the computer marches)

Rough intuition:

1. Shape of space changes because the slice is bending (\(K\) is the bending rate)  
2. The bending rate itself changes because of clock gradients, existing curvature, and matter  

Feedback: shape ↔ bending. That loop is what each timestep solves.

---

### 21. Constraints as Sudoku rules

Constraints don’t tell you the next move; they say whether the current board is legal.

- **Hamiltonian:** matter-energy must match curvature  
- **Momentum:** matter flow must match how space is bending  

Exact GR: if you start valid, you stay valid.  
On a computer: rounding errors leak each step. With raw ADM, those errors piled up for ~30 years and blew up simulations. BSSN/CCZ4 fix the *form*, not the physics.

---

### 22. Why ADM crashes on computers

A good numerical system needs disturbances to travel at **definite finite speeds** (like sound).

ADM has modes with zero/undefined speed → numerical junk sits and grows exponentially → crash within milliseconds of simulated physics.

Physics was right; the mathematical packaging was wrong for grids.

Path of progress: **ADM → BSSN → CCZ4**

---

### 23. BSSN — same physics, better variables

Not new gravity. Change of variables so computers can trust the system.

Ideas in plain English:

1. Split overall **scale** of space from its **shape** (conformal factor + unit-determinant metric)  
2. Split average expansion from uneven stretching  
3. Evolve coordinate-drift quantities explicitly  
4. Result: disturbances travel at known finite speeds → noise is carried away instead of exploding  

This is why long simulations stopped dying after decades of failure.

---

### 24. CCZ4 — constraint damping

BSSN stops errors from exploding, but they can still slowly drift.

CCZ4 adds a “clean-up crew”:

- Extra fields (\(\Theta\), \(Z\)) measure how far you are from a valid solution  
- Damping parameters \(\kappa_1, \kappa_2\) act like friction → drag errors back to zero  

Analogy:

- BSSN = ball on a flat table (errors don’t grow, don’t shrink)  
- CCZ4 = ball in a bowl (displacements roll back to center)  

This is what GRTeclyn/GRChombo-style codes lean on.

---

### 25. Gauge conditions (coordinate choices, not physics)

Lapse and shift are **free** — coordinates, not observables. We choose them for stability.

**1+log slicing** \(\partial_t \alpha = -2\alpha K\)  
Slows clocks near singularities — never arrive at the singularity (Zeno-like freezing).

**Gamma-driver shift**  
Steers the grid to follow moving black holes — camera tracking a car instead of letting it fly off-screen.

Together with BSSN: the **moving punctures** recipe that unlocked 2005.

---

## Part 3 — The breakthrough and the payoff

### 26. 2005: binary black holes solved

Three groups, same era:

- Pretorius — generalized harmonic coordinates  
- Campanelli et al. & Baker et al. — moving punctures + BSSN  

**Standard recipe today:** BSSN/CCZ4 + 1+log + Gamma-driver → stable inspiral → merger → ringdown.

---

### 27. Binary merger story (what NR computes)

1. **Inspiral** — orbit shrinks; frequency rises (“chirp”); energy lost to GWs  
2. **Merger** — loudest; amplitude peaks; fully non-linear  
3. **Ringdown** — remnant rings like a struck bell; damped waves  

That waveform is what LIGO matches. Without NR, the merger piece is missing.

---

### 28. LIGO in one picture

Michelson interferometer, two ~4 km arms at right angles.

- Laser split → each arm → recombine  
- Normally destructive interference (dark)  
- A GW stretches one arm and squeezes the other by ~\(10^{-21}\) (absurdly small)  
- Interference pattern shifts → detection  

GW150914: ~36 + 29 solar-mass black holes, ~1.3 billion ly away. Nobel 2017. Enabled by NR templates.

---

### 29. Gravitational-wave polarization

Two polarizations:

- **\(h_+\)** — stretch/squeeze along x/y  
- **\(h_\times\)** — same pattern rotated 45°  

A ring of free particles deforms as the wave passes. LIGO’s perpendicular arms are well suited to catch \(h_+\).

---

## Part 4 — Trust, power, and tools

### 30. Convergence testing — is it real physics?

A grid is an approximation. To check you’re not staring at junk:

Run the **same** problem at three resolutions: \(\Delta x\), \(\Delta x/2\), \(\Delta x/4\).

If the code is correct, differences between solutions shrink at a rate set by the finite-difference order.

---

### 31. Richardson extrapolation / Q-factor

Error model:

\[
f_{\Delta x} = f_{\text{exact}} + C\,(\Delta x)^n + \cdots
\]

Convergence factor:

\[
Q = \frac{f_{\Delta x} - f_{\Delta x/2}}{f_{\Delta x/2} - f_{\Delta x/4}} \;\to\; 2^n
\]

| Scheme order | Expect \(Q \to\) |
|--------------|------------------|
| 2nd | 4 |
| 4th | **16** |

GRTeclyn uses 4th-order stencils → expect \(Q \to 16\). If \(Q\) is wild, bug or under-resolved.

---

### 32. CPU vs GPU

NR update is a **stencil**: every cell reads neighbors every step → often **memory-bandwidth bound**, not just FLOP-bound.

Rough comparison (order of magnitude from the lecture):

| | Server CPU | Data-center GPU (e.g. H100) |
|--|------------|-----------------------------|
| Parallel cores | ~tens–hundreds | ~thousands–tens of thousands |
| Memory bandwidth | ~0.5 TB/s | ~3 TB/s class (HBM) |
| Architecture | Islands that talk over slow links | Shared fast memory pool |

**Talking point:** AI boom mass-produces exactly this hardware; NR rides the same wave for free.

---

### 33. Adaptive Mesh Refinement (AMR)

You don’t need a fine grid everywhere.

- Fine grid near black holes / wave fronts (high curvature)  
- Coarse grid far away  

Cuts cost by orders of magnitude. Without AMR, realistic binary/wormhole runs are impractical.

---

### 34. GRTeclyn / AMReX

- From the GRChombo ecosystem  
- Built for GPUs  
- AMR via AMReX (load balance, refinement, GPU offload)  
- Tool that makes exotic spacetime runs feasible  

---

## Part 5 — Wormholes (research payoff)

### 35. Traversable wormholes

A tunnel through spacetime held open by **exotic matter** — hypothetical stuff with **negative energy** that pushes space apart instead of pulling it together.

Normal matter attracts. Exotic support is like anti-gravity propping the throat open.

**Research question:** What happens when that support is removed?

Paper: [arXiv:2604.00071](https://arxiv.org/abs/2604.00071) — *Wormhole Dynamics: Nonlinear Collapse and GW Emission* (N. Shirokov).

---

### 36. Collapse and the phantom bounce

Story of the simulation:

1. Remove much of the exotic support; give a slight squeeze  
2. Gravity wins → throat collapses → **apparent horizon** (black-hole-like) forms  
3. Swallowed exotic matter fights back → **phantom bounce** (violent curvature rebound)  
4. Asymmetric collapse launches **gravitational waves** outward at \(v \approx c\)

**Result highlight:** a single exotic object can radiate a GW signal without a collision. For the squeeze strength studied, a ~\(10^3 M_\odot\) wormhole at ~1 Mpc sits near Advanced LIGO sensitivity — detection needs closer sources, larger asymmetries, or next-gen detectors.

---

### 37. Rotating case

Spinning ring/torus of exotic matter holds the throat open. “Turn off the pump”:

- Rotation already breaks spherical symmetry  
- Collapse naturally emits a strong, coherent GW burst  
- No artificial squeeze required  

---

## Conclusion — What to leave the audience with

1. GR broke unaided human calculation — 10 non-linear PDEs  
2. ADM slicing turned 4D physics into a 3D movie  
3. 2005 + BSSN/CCZ4 + gauge choices stabilized the movie  
4. GPUs + AMR gave the raw power for exotic spacetimes  

**Closing line from the deck:**  
*We heard black holes merge in 2015. Tomorrow, we might catch a wormhole collapsing.*

---

## Quick glossary (prep cheat sheet)

| Term | One-liner |
|------|-----------|
| Metric \(g_{\mu\nu}\) | Converts coordinate steps into real distances/times |
| Christoffel \(\Gamma\) | How directions twist as you move |
| Riemann | Full curvature / tidal field |
| Ricci / Einstein \(G\) | Compressed curvature that enters Einstein’s equation |
| Stress-energy \(T\) | Matter/energy source of gravity |
| Geodesic | Straightest possible path; free fall |
| Finite difference | Approximate derivatives from neighboring grid values |
| 3+1 / ADM | Split spacetime into evolving 3D slices |
| Lapse \(\alpha\) | Clock speed between slices |
| Shift \(\beta\) | Sideways slide of the grid |
| Extrinsic curvature \(K\) | How fast the slice’s shape changes |
| Constraints | Sanity checks every slice must pass |
| BSSN | Stable rewrite of ADM variables |
| CCZ4 | BSSN + active constraint damping |
| Gauge | Coordinate choice (not physical force laws) |
| Moving punctures | Gauge + BSSN recipe for moving black holes |
| AMR | Fine grid only where needed |
| Convergence / \(Q\) | Proof the answer isn’t a numerical artifact |

---

## Suggested rehearsal path (30–40 min)

1. Timeline → missing waveforms / why NR (4 min)  
2. Newton problem → GR at finite speed (2 min)  
3. Differential geometry heritage → Einstein builds on it (2 min)  
4. Metric → curvature ladder in words only (5 min)  
5. Why we slice + lapse/shift bread-slicer (5 min)  
6. Evolution vs constraints; why ADM failed; BSSN/CCZ4 (7 min)  
7. 2005 + merger + LIGO (5 min)  
8. GPUs + AMR + trust via \(Q\) (5 min)  
9. Wormhole collapse story + paper (5 min)  
10. Closing arc (1 min)  

If short on time: skip equation details for Christoffel/Riemann/Ricci; keep the **stories** (rulers, ants, bread slicer, Sudoku constraints, ball in a bowl, camera tracking).
