// content.js - All slide HTML content
// Single responsibility: defines the presentation content and injects into DOM

const Slides = (function () {

    // Helper: wraps note text in the note div
    function note(text) {
        return `<div class="slide-note">${text}</div>`;
    }

    const html = [

        // 0 - Title
        `<div class="slide">
            <span class="part-label">Lecture</span>
            <h1>Slicing Spacetime</h1>
            <div class="sep"></div>
            <p style="text-align:center; color:#bbb; font-style:italic;">
                How Supercomputers and GPUs Unlock<br>the Universe's Deepest Secrets
            </p>
            ${note("Einstein published GR in 1915 using pen and paper. Today we'll see how supercomputers and GPUs turned his impossible equations into a digital laboratory for the cosmos.")}
        </div>`,

        // 1 - Timeline animation (overview first)
        `<div class="slide" data-anim="timeline">
            <h2>AI Winter &harr; NR Dark Ages</h2>
            <p style="text-align:center; color:#bbb; margin-bottom:8px; font-size:0.95rem;">
                Two fields stuck for decades &mdash; both unlocked by the same revolution.
            </p>
            <div class="anim-container" id="timelineContainer" style="height:500px;">
                <canvas id="timelineCanvas"></canvas>
            </div>
            <p class="anim-hint">click to advance the timeline</p>
            ${note("Both AI and Numerical Relativity had decades-long 'dark ages' where the theory existed but the algorithms and hardware couldn't deliver. Both broke through when the right mathematical tricks were paired with GPUs and massive computational power. Key NR figures: Arnowitt, Deser, Misner (ADM), Nakamura, Shibata, Baumgarte, Shapiro (BSSN), Bona, Alic, Rezzolla (CCZ4), Pretorius, Campanelli, Baker (2005 breakthrough).")}
        </div>`,

        // 2 - Motivation: why GR?
        `<div class="slide" data-anim="gravspeed">
            <span class="part-label">Part 1 &mdash; Why General Relativity?</span>
            <h2>The Problem with Newton</h2>
            <div class="reveal-item">
                <p style="text-align:center; max-width:700px;">
                    In Newtonian gravity, if the Sun vanished, Earth would <strong>instantly</strong> change orbit &mdash;
                    even though the Sun is 8 light-minutes away.
                </p>
            </div>
            <div class="anim-container" id="gravSpeedContainer" style="height:380px;">
                <canvas id="gravSpeedCanvas"></canvas>
            </div>
            <p class="anim-hint">click to remove the Sun</p>
            <div class="reveal-item" style="margin-top:10px;">
                <p style="text-align:center; max-width:700px;">
                    Einstein's insight: gravity, like electromagnetism, must propagate at the <strong>speed of light</strong>.
                    Maxwell showed electromagnetic changes travel at <em>c</em> &mdash; gravity must too.
                </p>
            </div>
            ${note("Newton's law of gravitation implies instantaneous action at a distance: F = GMm/r². If the Sun disappeared, Earth would instantly feel the change. But special relativity (1905) showed nothing travels faster than light. Einstein spent 10 years (1905–1915) building GR to fix this. In GR, changes in the gravitational field propagate as gravitational waves at exactly c. If the Sun vanished, Earth would continue orbiting for ~8.3 minutes until the gravitational disturbance arrived. This is directly analogous to Maxwell's equations, where changes in the electromagnetic field propagate at c.")}
        </div>`,

        // 3 - Motivation: GW detection needs NR
        `<div class="slide" data-anim="gwmotivation">
            <span class="part-label">Part 1 &mdash; Why Numerical Relativity?</span>
            <h2>The Missing Waveforms</h2>
            <div class="anim-container" id="gwMotivContainer" style="height:370px;">
                <canvas id="gwMotivCanvas"></canvas>
            </div>
            <p class="anim-hint">click to advance</p>
            <div class="reveal-item" style="margin-top:8px;">
                <p style="text-align:center; max-width:720px;">
                    LIGO matched its signal against <strong>~200,000 NR waveform templates</strong>.<br>
                    Without numerical relativity, gravitational wave astronomy would be blind.
                </p>
            </div>
            ${note("Einstein predicted gravitational waves in 1916, but for nearly a century no one could calculate what the signal from a black hole merger actually looks like. Pen-and-paper approximations (post-Newtonian theory) work for the slow inspiral phase, and perturbation theory handles the ringdown, but the merger — where the signal is loudest and carries the most information — is violently non-linear. Only full numerical relativity can solve it. LIGO's 2015 detection of GW150914 was only possible because NR had produced a bank of ~200,000 template waveforms to match against the detector noise. Without those templates, the signal would have been buried.")}
        </div>`,

        // 4 - Einstein equation
        `<div class="slide">
            <span class="part-label">Part 1 &mdash; The Beautiful, Impossible Math</span>
            <h2>Einstein's Field Equation</h2>
            <div class="eq-box">
                $$ G_{\\mu\\nu} = 8\\pi\\, T_{\\mu\\nu} $$
            </div>
            <p style="text-align:center; margin-top:15px;">
                <em>"Matter tells spacetime how to curve,<br>and spacetime tells matter how to move."</em>
            </p>
            ${note("Left side: geometry of spacetime (how space is curved). Right side: matter and energy content. Looks simple like E=mc², but this is a deception — it's a shorthand for 10 equations.")}
        </div>`,

        // 5 - Shattering animation
        `<div class="slide" data-anim="shatter">
            <span class="part-label">Part 1 &mdash; The Reality Check</span>
            <h2>10 Coupled Non-Linear PDEs</h2>
            <div class="anim-container" id="shatterContainer">
                <canvas id="shatterCanvas"></canvas>
            </div>
            <p class="anim-hint">click to shatter the equation</p>
            ${note("That single elegant line shatters into 10 coupled, non-linear partial differential equations. Each component of the metric tensor contributes its own equation, and they all feed back into each other.")}
        </div>`,

        // 6 - The Metric
        `<div class="slide">
            <span class="part-label">Part 1 &mdash; Unpacking the Geometry</span>
            <h2>The Metric Tensor</h2>
            <div class="reveal-item">
                <p>The metric $g_{\\mu\\nu}$ encodes all information about distances and angles in spacetime.</p>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <div class="eq-box small">
                    $$ ds^2 = g_{\\mu\\nu}\\, dx^\\mu\\, dx^\\nu $$
                </div>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <p style="color:#bbb; font-size:1.1rem;">For Schwarzschild (a single black hole):</p>
                <div class="eq-box small" style="margin-top:10px;">
                    $$ ds^2 = -\\left(1 - \\frac{2M}{r}\\right)dt^2 + \\left(1 - \\frac{2M}{r}\\right)^{-1}dr^2 + r^2 d\\Omega^2 $$
                </div>
            </div>
            ${note("The metric is the fundamental object. It's a 4&times;4 symmetric matrix (10 independent components) that tells you how to measure distances. The Schwarzschild metric describes a single non-rotating black hole &mdash; one of the few exact solutions we have.")}
        </div>`,

        // 7 - Christoffel symbols
        `<div class="slide">
            <span class="part-label">Part 1 &mdash; Connection</span>
            <h2>Christoffel Symbols</h2>
            <div class="reveal-item">
                <p>How the coordinate basis vectors change from point to point:</p>
            </div>
            <div class="reveal-item" style="margin-top:20px;">
                <div class="eq-box">
                    $$ \\Gamma^\\alpha_{\\;\\mu\\nu} = \\frac{1}{2}\\,g^{\\alpha\\beta}\\left( \\partial_\\mu g_{\\beta\\nu} + \\partial_\\nu g_{\\beta\\mu} - \\partial_\\beta g_{\\mu\\nu} \\right) $$
                </div>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <p style="color:#bbb; font-size:1rem;">40 independent components &mdash; each built from the metric and its first derivatives.</p>
            </div>
            ${note("The Christoffel symbols are not tensors &mdash; they encode how the coordinate system itself bends. They are the 'building blocks' that go into the Riemann tensor. In flat space they vanish; near a black hole they blow up.")}
        </div>`,

        // 8 - Riemann tensor
        `<div class="slide">
            <span class="part-label">Part 1 &mdash; Curvature</span>
            <h2>Riemann Curvature Tensor</h2>
            <div class="reveal-item">
                <div class="eq-box">
                    $$ R^\\alpha_{\\;\\beta\\mu\\nu} = \\partial_\\mu \\Gamma^\\alpha_{\\nu\\beta} - \\partial_\\nu \\Gamma^\\alpha_{\\mu\\beta} + \\Gamma^\\alpha_{\\mu\\lambda}\\Gamma^\\lambda_{\\nu\\beta} - \\Gamma^\\alpha_{\\nu\\lambda}\\Gamma^\\lambda_{\\mu\\beta} $$
                </div>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <p>20 independent components in 4D. This is the full curvature of spacetime.</p>
            </div>
            ${note("The Riemann tensor measures tidal forces &mdash; how nearby geodesics converge or diverge. If you parallel-transport a vector around a small loop, the Riemann tensor tells you how much it rotates. It contains all the information about curvature.")}
        </div>`,

        // 9 - Ricci tensor and scalar
        `<div class="slide">
            <span class="part-label">Part 1 &mdash; Contracting to Einstein</span>
            <h2>Ricci Tensor &amp; Scalar</h2>
            <div class="reveal-item">
                <div class="eq-box small">
                    $$ R_{\\mu\\nu} = R^\\alpha_{\\;\\mu\\alpha\\nu} \\qquad \\text{(trace of Riemann)} $$
                </div>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <div class="eq-box small">
                    $$ R = g^{\\mu\\nu} R_{\\mu\\nu} \\qquad \\text{(Ricci scalar)} $$
                </div>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <div class="eq-box">
                    $$ G_{\\mu\\nu} = R_{\\mu\\nu} - \\tfrac{1}{2}\\,g_{\\mu\\nu}\\,R $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:1rem; margin-top:8px;">The Einstein tensor &mdash; built from the metric, its first and second derivatives.</p>
            </div>
            ${note("We contract the 20-component Riemann tensor down to the 10-component Ricci tensor, then further to a single number (the Ricci scalar). The Einstein tensor G combines them so that it is automatically divergence-free &mdash; ensuring energy-momentum conservation.")}
        </div>`,

        // 10 - Stress-energy tensor
        `<div class="slide">
            <span class="part-label">Part 1 &mdash; The Right-Hand Side</span>
            <h2>Stress-Energy Tensor</h2>
            <div class="reveal-item">
                <p>$T_{\\mu\\nu}$ describes the matter and energy content of spacetime.</p>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <p style="color:#bbb; font-size:1.05rem;">Perfect fluid:</p>
                <div class="eq-box small" style="margin-top:8px;">
                    $$ T_{\\mu\\nu} = (\\rho + p)\\,u_\\mu\\, u_\\nu + p\\,g_{\\mu\\nu} $$
                </div>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <p style="color:#bbb; font-size:1.05rem;">Scalar field (e.g. exotic matter):</p>
                <div class="eq-box small" style="margin-top:8px;">
                    $$ T_{\\mu\\nu} = \\nabla_\\mu \\phi\\, \\nabla_\\nu \\phi - g_{\\mu\\nu}\\left(\\tfrac{1}{2}\\nabla_\\alpha\\phi\\,\\nabla^\\alpha\\phi + V(\\phi)\\right) $$
                </div>
            </div>
            ${note("The stress-energy tensor is the source of gravity. For a perfect fluid: &rho; is energy density, p is pressure, u is the 4-velocity. For a scalar field (which is what we use for wormhole exotic matter), the field &phi; and its potential V(&phi;) determine the gravitational source.")}
        </div>`,

        // 11 - Geodesics animation (3D)
        `<div class="slide" data-anim="geodesics">
            <span class="part-label">Part 1 &mdash; Curved Spacetime</span>
            <h2>Motion in Curved Spacetime</h2>
            <div class="anim-container" id="geodesicsContainer"></div>
            <p class="anim-hint">click the surface to add particles &mdash; drag to rotate</p>
            ${note("The curved surface is an embedding diagram &mdash; a 2D slice of Schwarzschild spacetime embedded in 3D. The depth of the funnel represents the gravitational potential. Objects follow geodesics (straightest paths on this surface). Near the black hole, orbits tighten and particles spiral in. No forces &mdash; pure geometry.")}
        </div>`,

        // 12 - Geodesic equation
        `<div class="slide">
            <span class="part-label">Part 1 &mdash; Geodesic Equation</span>
            <h2>Free Fall = Straightest Possible Path</h2>
            <div class="reveal-item">
                <div class="eq-box">
                    $$ \\frac{d^2 x^\\mu}{d\\tau^2} + \\Gamma^\\mu_{\\;\\alpha\\beta}\\,\\frac{dx^\\alpha}{d\\tau}\\frac{dx^\\beta}{d\\tau} = 0 $$
                </div>
            </div>
            <div class="reveal-item" style="margin-top:20px;">
                <p>No forces &mdash; only the curvature of spacetime guides the motion.</p>
            </div>
            ${note("The geodesic equation is Newton's second law in curved spacetime. The Christoffel symbols play the role of the gravitational 'force'. In flat spacetime they vanish and you get straight lines. &tau; is the proper time measured by the falling object.")}
        </div>`,

        // 13 - Non-linearity
        `<div class="slide">
            <span class="part-label">Part 1 &mdash; Non-Linear Feedback</span>
            <h2>Gravity Creates Gravity</h2>
            <div class="reveal-item">
                <ul>
                    <li>Gravitational energy itself has mass</li>
                    <li>This creates a feedback loop in the equations</li>
                    <li>Like a microphone too close to a speaker</li>
                </ul>
            </div>
            <div class="reveal-item" style="margin-top:25px;">
                <p style="text-align:center; color:#bbb;">
                    Pen and paper can only solve the simplest cases.<br>
                    For anything dynamic &mdash; we need machines.
                </p>
            </div>
            ${note("This is the key difficulty. In electromagnetism, light doesn't create more light. But in GR, gravity gravitates. The energy stored in the gravitational field itself acts as a source of more gravity. This non-linearity makes analytical solutions almost impossible for dynamic scenarios.")}
        </div>`,

        // 14 - Part 2: ADM intro
        `<div class="slide">
            <span class="part-label">Part 2 &mdash; The ADM Formalism</span>
            <h2>Putting the Universe in a Computer</h2>
            <div class="reveal-item">
                <p>Spacetime is a 4D block. Computers need cause &rarr; effect.</p>
            </div>
            <div class="reveal-item" style="margin-top:20px;">
                <p><strong>The 3+1 Decomposition</strong> &mdash; slice the 4D loaf into 3D spatial slices, one moment at a time.</p>
            </div>
            <div class="reveal-item" style="margin-top:20px;">
                <div class="eq-box small">
                    $$ ds^2 = -\\alpha^2 dt^2 + \\gamma_{ij}\\left(dx^i + \\beta^i dt\\right)\\left(dx^j + \\beta^j dt\\right) $$
                </div>
            </div>
            ${note("Arnowitt, Deser, and Misner (1959) showed how to decompose the 4D metric into a 3D spatial metric &gamma;, a lapse function &alpha;, and a shift vector &beta;. This turns Einstein's equations from a geometric statement about 4D spacetime into an initial-value problem: given the state now, compute the state one timestep later.")}
        </div>`,

        // 15 - Bread slicer animation
        `<div class="slide" data-anim="slicer">
            <span class="part-label">Part 2 &mdash; The Cosmic Bread Slicer</span>
            <h2>Slicing 4D Spacetime</h2>
            <div class="anim-container" id="slicerContainer">
                <canvas id="slicerCanvas"></canvas>
            </div>
            <p class="anim-hint">click to slice &mdash; each slice = space at one moment</p>
            ${note("Think of the entire history of the universe as a loaf of bread. Each slice is a 3D snapshot of space at one instant. The computer calculates the geometry of each slice, then uses the evolution equations to step to the next one &mdash; like a flipbook.")}
        </div>`,

        // 16 - Lapse, Shift, Extrinsic Curvature
        `<div class="slide">
            <span class="part-label">Part 2 &mdash; Evolution Variables</span>
            <h2>Lapse, Shift &amp; Extrinsic Curvature</h2>
            <div class="columns">
                <div class="col reveal-item">
                    <h3>Lapse $\\alpha$</h3>
                    <p>How fast time ticks between slices.<br>Near a black hole: $\\alpha \\to 0$.</p>
                </div>
                <div class="col reveal-item">
                    <h3>Shift $\\beta^i$</h3>
                    <p>How the spatial grid slides sideways between time steps.</p>
                </div>
            </div>
            <div class="reveal-item" style="margin-top:25px;">
                <div class="eq-box small">
                    $$ K_{ij} = -\\frac{1}{2\\alpha}\\left(\\partial_t \\gamma_{ij} - D_i\\beta_j - D_j\\beta_i\\right) $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:0.95rem; margin-top:8px;">Extrinsic curvature &mdash; how each slice bends in the 4D embedding</p>
            </div>
            ${note("The lapse controls time: near a black hole, we slow the clock down (&alpha;&rarr;0) to prevent the simulation from falling into the singularity. The shift slides the coordinates to keep the grid from tangling. The extrinsic curvature K tells us how each 3D slice is 'bent' as seen from the 4D perspective.")}
        </div>`,

        // 17 - ADM evolution equations
        `<div class="slide">
            <span class="part-label">Part 2 &mdash; ADM Evolution</span>
            <h2>ADM Evolution Equations</h2>
            <div class="reveal-item">
                <p>Two dynamical variables: the spatial metric $\\gamma_{ij}$ and the extrinsic curvature $K_{ij}$.</p>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <div class="eq-box small">
                    $$ \\partial_t \\gamma_{ij} = -2\\alpha K_{ij} + D_i\\beta_j + D_j\\beta_i $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:0.9rem; margin-top:4px;">How the 3D geometry changes from slice to slice</p>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <div class="eq-box small">
                    $$ \\partial_t K_{ij} = -D_i D_j \\alpha + \\alpha\\left(R_{ij} + K K_{ij} - 2K_{ik}K^k_{\\;j}\\right) + \\beta^k D_k K_{ij} + K_{ik}D_j\\beta^k + K_{jk}D_i\\beta^k - 8\\pi\\alpha\\left(S_{ij} - \\tfrac{1}{2}\\gamma_{ij}(S - \\rho)\\right) $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:0.9rem; margin-top:4px;">How the embedding curvature evolves &mdash; this is where matter couples in</p>
            </div>
            ${note("These are the heart of numerical relativity. The first equation says the spatial metric evolves via the extrinsic curvature (how the slice is bending). The second is more complex &mdash; it involves the 3D Ricci tensor R_ij, the lapse gradient, and the matter source terms S_ij and &rho;. Together they form a coupled system: &gamma; drives K, K drives &gamma;.")}
        </div>`,

        // 18 - ADM constraints
        `<div class="slide">
            <span class="part-label">Part 2 &mdash; ADM Constraints</span>
            <h2>Constraint Equations</h2>
            <div class="reveal-item">
                <p>Not all of Einstein's equations are evolution. Four are <em>constraints</em> &mdash; conditions that must hold on every slice.</p>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <div class="eq-box small">
                    $$ \\mathcal{H} \\equiv R + K^2 - K_{ij}K^{ij} - 16\\pi\\rho = 0 \\qquad \\text{(Hamiltonian)} $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:0.9rem; margin-top:4px;">Energy must be consistent with curvature</p>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <div class="eq-box small">
                    $$ \\mathcal{M}^i \\equiv D_j K^{ij} - D^i K - 8\\pi j^i = 0 \\qquad \\text{(Momentum)} $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:0.9rem; margin-top:4px;">Momentum flow must be consistent with how the slice bends</p>
            </div>
            ${note("If you start with valid initial data (constraints = 0), the evolution equations guarantee they stay zero &mdash; analytically. But on a computer, truncation errors accumulate and the constraints drift. If the drift grows exponentially, the simulation crashes. This is exactly what happened for 30 years. The key insight of BSSN/CCZ4: reformulate so that constraint violations are damped, not amplified.")}
        </div>`,

        // 19 - Why ADM fails
        `<div class="slide">
            <span class="part-label">Part 2 &mdash; The Problem</span>
            <h2>Why ADM Crashes</h2>
            <div class="reveal-item">
                <ul>
                    <li>ADM equations are only <em>weakly hyperbolic</em></li>
                    <li>Small numerical errors grow exponentially</li>
                    <li>Constraint violations amplify &rarr; simulation blows up</li>
                </ul>
            </div>
            <div class="reveal-item" style="margin-top:20px;">
                <p>The physics is correct, but the <em>mathematical form</em> is unsuitable for computers. We need to rewrite the same physics in a better way.</p>
            </div>
            <div class="reveal-item" style="margin-top:20px; text-align:center;">
                <p style="color:#bbb;">ADM &rarr; BSSN &rarr; CCZ4</p>
            </div>
            ${note("Weak hyperbolicity means the system has degenerate characteristics &mdash; some wave speeds are zero or ill-defined. This allows high-frequency numerical noise to grow without bound. The solution: add new variables and algebraic constraints that make the system strongly hyperbolic, meaning all modes propagate at well-defined finite speeds.")}
        </div>`,

        // 20 - BSSN decomposition
        `<div class="slide">
            <span class="part-label">Part 2 &mdash; BSSN Formulation</span>
            <h2>BSSN: The Conformal Decomposition</h2>
            <div class="reveal-item">
                <p>Split the metric into a conformal factor and a unit-determinant piece:</p>
                <div class="eq-box small" style="margin-top:10px;">
                    $$ \\gamma_{ij} = e^{4\\phi}\\,\\tilde{\\gamma}_{ij} \\qquad \\text{where } \\det(\\tilde{\\gamma}_{ij}) = 1 $$
                </div>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <p>Split the extrinsic curvature into trace and traceless parts:</p>
                <div class="eq-box small" style="margin-top:10px;">
                    $$ K_{ij} = e^{4\\phi}\\left(\\tilde{A}_{ij} + \\tfrac{1}{3}\\tilde{\\gamma}_{ij} K\\right) $$
                </div>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <p>Promote the contracted Christoffel symbols to independent variables:</p>
                <div class="eq-box small" style="margin-top:10px;">
                    $$ \\tilde{\\Gamma}^i = \\tilde{\\gamma}^{jk}\\tilde{\\Gamma}^i_{\\;jk} $$
                </div>
            </div>
            ${note("BSSN (Baumgarte-Shapiro-Shibata-Nakamura) introduces 5 key changes: (1) conformal factor &phi; separated out, (2) traceless A_ij instead of full K_ij, (3) trace K evolved separately, (4) conformal connection functions promoted to evolved variables, (5) determinant constraint enforced algebraically. This transforms weakly hyperbolic ADM into a strongly hyperbolic system.")}
        </div>`,

        // 21 - BSSN evolution equations
        `<div class="slide">
            <span class="part-label">Part 2 &mdash; BSSN Evolution</span>
            <h2>BSSN Evolution Equations</h2>
            <div class="reveal-item">
                <div class="eq-box small">
                    $$ \\partial_t \\phi = -\\tfrac{1}{6}\\alpha K + \\beta^k\\partial_k\\phi + \\tfrac{1}{6}\\partial_k\\beta^k $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:0.85rem; margin-top:4px;">Conformal factor</p>
            </div>
            <div class="reveal-item" style="margin-top:10px;">
                <div class="eq-box small">
                    $$ \\partial_t \\tilde{\\gamma}_{ij} = -2\\alpha \\tilde{A}_{ij} + \\beta^k\\partial_k\\tilde{\\gamma}_{ij} + \\tilde{\\gamma}_{ik}\\partial_j\\beta^k + \\tilde{\\gamma}_{jk}\\partial_i\\beta^k - \\tfrac{2}{3}\\tilde{\\gamma}_{ij}\\partial_k\\beta^k $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:0.85rem; margin-top:4px;">Conformal metric (unit determinant preserved)</p>
            </div>
            <div class="reveal-item" style="margin-top:10px;">
                <div class="eq-box small">
                    $$ \\partial_t K = -D^2\\alpha + \\alpha\\left(\\tilde{A}_{ij}\\tilde{A}^{ij} + \\tfrac{1}{3}K^2\\right) + 4\\pi\\alpha(\\rho + S) + \\beta^k\\partial_k K $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:0.85rem; margin-top:4px;">Trace of extrinsic curvature</p>
            </div>
            ${note("Now we evolve &phi;, the conformal metric, K, the traceless part A_ij, and the conformal connection functions separately. Each equation is simpler than the monolithic ADM version, and crucially, the system is strongly hyperbolic: all characteristic speeds are finite and well-defined. This is why simulations stopped crashing.")}
        </div>`,

        // 22 - CCZ4
        `<div class="slide">
            <span class="part-label">Part 2 &mdash; CCZ4 Formulation</span>
            <h2>CCZ4: Constraint Damping</h2>
            <div class="reveal-item">
                <p>BSSN is stable, but constraint violations still slowly drift. CCZ4 actively damps them:</p>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <div class="eq-box small">
                    $$ \\partial_t \\Theta = \\tfrac{1}{2}\\alpha\\left(R + 2D_k Z^k + K^2 - K_{ij}K^{ij} - 16\\pi\\rho\\right) - \\alpha\\kappa_1(2 + \\kappa_2)\\Theta $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:0.85rem; margin-top:4px;">$\\Theta$ tracks the Hamiltonian constraint violation &mdash; $\\kappa_1$ damps it exponentially</p>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <ul>
                    <li>$Z^\\mu$ &mdash; new vector field, zero for exact solutions</li>
                    <li>$\\kappa_1, \\kappa_2$ &mdash; damping parameters (typically $\\kappa_1 \\sim 0.02$)</li>
                    <li>Constraint errors are actively suppressed, not just tolerated</li>
                </ul>
            </div>
            ${note("CCZ4 (Conformal and Covariant Z4) extends BSSN by adding a 4-vector Z&mu; that absorbs constraint violations. The damping terms with &kappa;1 and &kappa;2 ensure that any constraint error decays exponentially in time rather than growing or persisting. This is the formulation used in GRTeclyn/GRChombo. It's like adding friction to a pendulum &mdash; small oscillations die out instead of persisting.")}
        </div>`,

        // 23 - Gauge conditions
        `<div class="slide">
            <span class="part-label">Part 2 &mdash; Gauge Choices</span>
            <h2>Gauge Conditions</h2>
            <div class="reveal-item">
                <p>The lapse $\\alpha$ and shift $\\beta^i$ are <em>free</em> &mdash; they represent coordinate choice, not physics. We pick them for stability:</p>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <div class="eq-box small">
                    $$ \\partial_t \\alpha = -2\\alpha K \\qquad \\text{(1+log slicing)} $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:0.85rem; margin-top:4px;">Collapses the lapse near singularities &mdash; "freezes" the black hole interior</p>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <div class="eq-box small">
                    $$ \\partial_t \\beta^i = \\tfrac{3}{4}\\tilde{\\Gamma}^i - \\eta\\,\\beta^i \\qquad \\text{(Gamma-driver)} $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:0.85rem; margin-top:4px;">Steers the grid to prevent coordinate stretching</p>
            </div>
            ${note("These gauge conditions are the 'moving punctures' breakthrough. 1+log slicing makes &alpha;&rarr;0 at the singularity, effectively freezing the slice before it hits the black hole interior. The Gamma-driver condition adjusts the shift to follow the black hole as it moves through the grid. Together they made long-term stable binary black hole simulations possible for the first time in 2005.")}
        </div>`,

        // 24 - 2005 summary
        `<div class="slide">
            <span class="part-label">Part 3 &mdash; The Breakthrough</span>
            <h2>2005: The Binary Black Hole Problem Solved</h2>
            <div class="reveal-item">
                <ul>
                    <li>Pretorius (generalized harmonic coordinates)</li>
                    <li>Campanelli et al. &amp; Baker et al. (moving punctures + BSSN)</li>
                    <li>Three groups, two methods, same year</li>
                </ul>
            </div>
            <div class="reveal-item" style="margin-top:20px;">
                <p>The recipe: <strong>BSSN/CCZ4</strong> + <strong>1+log slicing</strong> + <strong>Gamma-driver shift</strong> = stable, long-term evolution of binary black holes through merger and ringdown.</p>
            </div>
            ${note("Three independent groups solved it nearly simultaneously in 2005-2006. Pretorius used generalized harmonic coordinates (a different approach). Campanelli et al. and Baker et al. used the moving punctures method with BSSN. The community quickly converged on BSSN/CCZ4 with moving punctures as the standard workhorse, which is what GRTeclyn uses today.")}
        </div>`,

        // 25 - LIGO schematic + explanation
        `<div class="slide" data-anim="ligo">
            <span class="part-label">Part 3 &mdash; The Payoff</span>
            <h2>LIGO &mdash; Laser Interferometer</h2>
            <div class="anim-container" id="ligoContainer" style="height:340px;">
                <canvas id="ligoCanvas"></canvas>
            </div>
            <p class="anim-hint">click to send a gravitational wave through the detector</p>
            ${note("LIGO is a Michelson interferometer with two 4 km arms at right angles. A laser is split at the beam splitter; each half travels down an arm, bounces off a mirror, and returns. Normally the beams recombine destructively (no signal). A gravitational wave stretches one arm and compresses the other by ~10⁻²¹ m, shifting the interference pattern. LIGO matched its signal against ~200,000 NR waveform templates to identify GW150914: two black holes (36+29 solar masses) merging 1.3 billion light-years away. Nobel Prize 2017.")}
        </div>`,

        // 26 - Discretization
        `<div class="slide">
            <span class="part-label">Part 4 &mdash; Modern Tech</span>
            <h2>Discretizing Spacetime</h2>
            <div class="reveal-item">
                <p>Chop 3D space into a grid of tiny cubes. Calculate gravity at every corner.</p>
            </div>
            <div class="reveal-item" style="margin-top:20px;">
                <div class="eq-box small">
                    $$ \\frac{\\partial f}{\\partial x}\\bigg|_i \\approx \\frac{f_{i+1} - f_{i-1}}{2\\,\\Delta x} $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:0.9rem; margin-top:6px;">Finite differencing on the grid</p>
            </div>
            ${note("We replace continuous spacetime with a discrete grid. Derivatives become finite differences. A typical production run might have 512³ grid cells with 6-8 levels of adaptive mesh refinement, resolving features from the gravitational wave zone all the way down to the black hole horizon.")}
        </div>`,

        // 27 - Convergence testing
        `<div class="slide">
            <span class="part-label">Part 4 &mdash; Is It Real Physics?</span>
            <h2>Convergence Testing</h2>
            <div class="reveal-item">
                <p>A discrete grid is an <em>approximation</em>. How do we know the result isn't a numerical artifact?</p>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <p>Run the <strong>same simulation at three resolutions</strong>:</p>
                <ul style="margin-top:10px;">
                    <li>Coarse: $\\Delta x$</li>
                    <li>Medium: $\\Delta x / 2$</li>
                    <li>Fine: $\\Delta x / 4$</li>
                </ul>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <p>If the code is correct, the differences between solutions must shrink at a predictable rate set by the finite-difference order.</p>
            </div>
            ${note("This is the single most important validation step in numerical relativity. Without convergence testing, you cannot distinguish real physics from numerical noise. The idea: a 4th-order finite difference scheme means the error scales as (Δx)⁴. Double the resolution and the error should drop by a factor of 2⁴ = 16. If it doesn't, something is wrong with the code.")}
        </div>`,

        // 28 - Richardson extrapolation
        `<div class="slide">
            <span class="part-label">Part 4 &mdash; Richardson Convergence</span>
            <h2>Richardson Extrapolation</h2>
            <div class="reveal-item">
                <p style="font-size:0.95rem;">For a scheme of order $n$, the error in a quantity $f$ at resolution $\\Delta x$ is:</p>
                <div class="eq-box small" style="margin:8px 0;">
                    $$ f_{\\Delta x} = f_{\\text{exact}} + C\\,(\\Delta x)^n + \\mathcal{O}(\\Delta x^{n+1}) $$
                </div>
            </div>
            <div class="reveal-item" style="margin-top:6px;">
                <p style="font-size:0.95rem;">With three resolutions ($\\Delta x,\\; \\Delta x/2,\\; \\Delta x/4$), compute the <strong>convergence factor</strong>:</p>
                <div class="eq-box small" style="margin:8px 0; font-size:1.3rem;">
                    $$ Q = \\frac{f_{\\Delta x} - f_{\\Delta x/2}}{f_{\\Delta x/2} - f_{\\Delta x/4}} $$
                </div>
            </div>
            <div class="reveal-item" style="margin-top:6px;">
                <div class="eq-box small" style="margin:8px 0;">
                    $$ Q \\to 2^n \\quad \\text{as } \\Delta x \\to 0 $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:0.9rem; margin-top:4px;">4th-order code &rArr; $Q \\to 16$ &emsp; | &emsp; 2nd-order &rArr; $Q \\to 4$</p>
            </div>
            ${note("Q is the self-convergence ratio. If Q approaches 2ⁿ (where n is the finite-difference order), the code is converging correctly. In practice you plot (f_coarse − f_medium) vs (f_medium − f_fine) × 2ⁿ — if the curves overlap, convergence is clean. GRTeclyn uses 4th-order spatial stencils, so we expect Q→16. This is shown in the wormhole paper (arXiv:2604.00071, Fig. 5) for the gravitational wave extraction at different radii.")}
        </div>`,

        // 29 - CPU vs GPU animation
        `<div class="slide" data-anim="gpu">
            <span class="part-label">Part 4 &mdash; The GPU Revolution</span>
            <h2>CPU Islands vs GPU Megacity</h2>
            <p style="max-width:700px; text-align:center; margin-bottom:10px;">
                Left: CPU cores are isolated &mdash; data crawls between them (red dots stall).<br>
                Right: GPU cores share one fast memory pool &mdash; everything moves in parallel.
            </p>
            <div class="anim-container" id="gpuContainer">
                <canvas id="gpuCanvas"></canvas>
            </div>
            <p class="anim-hint">animation runs continuously &mdash; watch the red stalls on the CPU side</p>
            ${note("LEFT PANEL: A CPU cluster with 4 cores. Each core has its own memory (small box). To share data, packets must travel through PCIe interconnect at ~25 GB/s with microsecond latency. Red 'WAIT' labels show where a packet stalls waiting for the link. RIGHT PANEL: A GPU with thousands of tiny cores (dots in the grid) all sharing a single unified VRAM pool via HBM3 at 900 GB/s. No stalling &mdash; any core can read any data instantly. For NR, every grid cell needs its neighbours' data every timestep, so the GPU's shared memory is transformative.")}
        </div>`,

        // 30 - GRTeclyn
        `<div class="slide">
            <span class="part-label">Part 4 &mdash; GRTeclyn</span>
            <h2>GRTeclyn / AMReX</h2>
            <div class="reveal-item">
                <ul>
                    <li>From the GRChombo collaboration</li>
                    <li>Built entirely for GPU architectures</li>
                    <li>Adaptive Mesh Refinement &mdash; finer grid where curvature is large</li>
                    <li>HBM3 memory: 900 GB/s bandwidth</li>
                    <li>NVLink: multi-GPU without bottlenecks</li>
                </ul>
            </div>
            ${note("GRTeclyn is built on AMReX (Adaptive Mesh Refinement for the Exascale). It offloads all physics computation to the GPU. The grid automatically refines around black holes and gravitational wave fronts, putting resolution only where it's needed. This is what makes exotic spacetime simulations like wormholes computationally feasible.")}
        </div>`,

        // 31 - Wormholes intro
        `<div class="slide">
            <span class="part-label">Part 5 &mdash; Wormholes</span>
            <h2>Traversable Wormholes</h2>
            <div class="reveal-item">
                <p>A topological bridge held open by <em>exotic matter</em> &mdash; matter that violates the null energy condition.</p>
            </div>
            <div class="reveal-item" style="margin-top:20px;">
                <div class="eq-box small">
                    $$ T_{\\mu\\nu}\\, k^\\mu k^\\nu < 0 \\quad \\text{(NEC violated)} $$
                </div>
            </div>
            <div class="reveal-item" style="margin-top:20px;">
                <p><strong>Question:</strong> What happens when the exotic support is removed?</p>
            </div>
            <div class="reveal-item" style="margin-top:15px; text-align:center;">
                <a class="paper-ref" href="https://arxiv.org/abs/2604.00071" target="_blank">
                    <span class="paper-label">Research Paper</span>
                    N. Shirokov &mdash; <em>Wormhole Dynamics: Nonlinear Collapse and GW Emission</em> &mdash; arXiv:2604.00071
                </a>
            </div>
            ${note("The Null Energy Condition (NEC) says that for any null vector k, the stress-energy must be non-negative. Exotic matter violates this &mdash; it has negative energy density, acting as 'anti-gravity'. Ellis-Bronnikov wormholes use a phantom scalar field (&phi; with wrong-sign kinetic term). See arXiv:2604.00071 for the full 3D numerical-relativity evolutions using GRTeclyn.")}
        </div>`,

        // 32 - Phantom bounce animation
        `<div class="slide" data-anim="bounce">
            <span class="part-label">Part 5 &mdash; The Phantom Bounce</span>
            <h2>Wormhole Collapse</h2>
            <div class="anim-container" id="bounceContainer">
                <canvas id="bounceCanvas"></canvas>
            </div>
            <p class="anim-hint">click to begin collapse sequence</p>
            <a class="paper-ref" href="https://arxiv.org/abs/2604.00071" target="_blank">
                <span class="paper-label">Research Paper</span>
                N. Shirokov &mdash; <em>Wormhole Dynamics: Nonlinear Collapse and Gravitational-Wave Emission</em> &mdash; arXiv:2604.00071 [gr-qc]
            </a>
            ${note("We remove half the exotic matter support (S_support=0.5) and add a quadrupolar perturbation (A_phi=0.02). Gravity crushes the throat. An apparent horizon forms. But the swallowed phantom matter triggers a violent rebound — the 'phantom bounce' — launching an outward curvature shock and gravitational waves propagating at v≈c.")}
        </div>`,

        // 33 - Results
        `<div class="slide">
            <span class="part-label">Part 5 &mdash; Results</span>
            <h2>What We Found</h2>
            <div class="reveal-item">
                <ul>
                    <li>Throat collapses &rarr; Apparent Horizon forms</li>
                    <li>Exotic matter pushes back &rarr; <strong>Phantom Bounce</strong></li>
                    <li>Asymmetric collapse emits gravitational waves at $v \\approx c$</li>
                    <li>$10^3 M_\\odot$ wormhole at 1 Mpc &mdash; near Advanced LIGO sensitivity</li>
                </ul>
            </div>
            <div class="reveal-item" style="margin-top:20px;">
                <p>A single exotic object can produce a detectable gravitational wave signal &mdash; no collision required. Detection needs closer sources, larger asymmetries, or next-gen detectors.</p>
            </div>
            ${note("For the moderate perturbation amplitude simulated, an intermediate-mass (10³ solar mass) wormhole at D=1 Mpc falls slightly below Advanced LIGO design sensitivity. The GW peak propagates between extraction radii at v≈c, distinct from superluminal CCZ4 constraint modes. arXiv:2604.00071")}
        </div>`,

        // 34 - Rotating wormhole
        `<div class="slide">
            <span class="part-label">Part 5 &mdash; Rotating Case</span>
            <h2>Rotating Wormhole &amp; Q-Ball Torus</h2>
            <div class="reveal-item">
                <ul>
                    <li>Spinning ring of exotic matter holds the throat open</li>
                    <li>Smoothly "turn off the pump"</li>
                    <li>Rotation alone breaks symmetry</li>
                    <li>Massive, coherent burst of gravitational waves</li>
                </ul>
            </div>
            ${note("For the rotating case, we engineer a Q-ball torus &mdash; a spinning ring of complex scalar field. The angular momentum means the system already has no spherical symmetry. When we smoothly turn off the exotic support, the rotating throat collapses and emits gravitational waves without needing any extra perturbation. The signal is strong and coherent.")}
        </div>`,

        // 35 - Conclusion
        `<div class="slide">
            <span class="part-label">Conclusion</span>
            <h2>From Pen &amp; Paper to Digital Laboratories</h2>
            <div class="reveal-item">
                <ul>
                    <li>GR broke human math &mdash; 10 non-linear PDEs</li>
                    <li>ADM slicing turned 4D physics into a 3D movie</li>
                    <li>2005 breakthroughs stabilized the simulations</li>
                    <li>GPUs gave us the raw power to explore exotic spacetimes</li>
                </ul>
            </div>
            <div class="reveal-item" style="margin-top:30px; text-align:center;">
                <p><em>We heard black holes merge in 2015.<br>Tomorrow, we might catch a wormhole collapsing.</em></p>
            </div>
            ${note("Key takeaway: the journey from Einstein's pen-and-paper theory to GPU-powered wormhole simulations required breakthroughs in mathematics (ADM, BSSN), algorithms (moving punctures, AMR), and hardware (GPUs, NVLink). Each was necessary. None was sufficient alone.")}
        </div>`,

        // 36 - Q&A
        `<div class="slide">
            <h1 style="font-size:2.5rem;">Thank You</h1>
            <div class="sep"></div>
            <p style="text-align:center; color:#bbb; margin-top:10px;">Questions?</p>
        </div>`,
    ];

    function inject() {
        const deck = document.getElementById('deck');
        deck.innerHTML = html.join('');
    }

    return { inject };
})();
