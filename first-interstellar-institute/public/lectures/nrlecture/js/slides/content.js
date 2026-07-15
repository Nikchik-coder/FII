// content.js - All slide HTML content
// Single responsibility: defines the presentation content and injects into DOM

const Slides = (function () {


    const html = [

        // 0 - Title
        `<div class="slide">
            <span class="part-label">Lecture</span>
            <h1>Slicing Spacetime</h1>
            <div class="sep"></div>
            <p style="text-align:center; color:#bbb; font-style:italic;">
                How Supercomputers and GPUs Unlock<br>the Universe's Deepest Secrets
            </p>
            
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
            
        </div>`,

        // 2 - Motivation: GW detection needs NR (right after timeline — "why NR?")
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
            
        </div>`,

        // 3 - Motivation: why GR?
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
            
        </div>`,

        // 3b - Differential geometry heritage (after Newton motivation)
        `<div class="slide" data-anim="diffgeom">
            <span class="part-label">Part 1 &mdash; The Mathematical Inheritance</span>
            <h2>Einstein Built on Differential Geometry</h2>
            <p style="text-align:center; color:#bbb; margin-bottom:6px; font-size:0.95rem; max-width:820px;">
                The toolkit for curved space existed decades before 1915 &mdash; Einstein's leap was to say
                <em>gravity is that curvature</em>.
            </p>
            <div class="anim-container" id="diffGeomContainer" style="height:480px;">
                <canvas id="diffGeomCanvas"></canvas>
            </div>
            <p class="anim-hint">Gauss &rarr; Riemann &rarr; Christoffel / Ricci&ndash;Levi-Civita &rarr; Einstein</p>
            
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
            
        </div>`,

        // 5 - Shattering animation
        `<div class="slide" data-anim="shatter">
            <span class="part-label">Part 1 &mdash; The Reality Check</span>
            <h2>10 Coupled Non-Linear PDEs</h2>
            <div class="anim-container" id="shatterContainer">
                <canvas id="shatterCanvas"></canvas>
            </div>
            <p class="anim-hint">click to shatter the equation</p>
            
        </div>`,

        // 6 - The Metric
        `<div class="slide">
            <span class="part-label">Part 1 &mdash; Unpacking the Geometry</span>
            <h2>The Metric Tensor</h2>
            <div class="reveal-item">
                <p>$ds^2$ is the <strong>proper distance</strong> &mdash; the actual physical separation between two
                nearby events, as measured by a ruler or a clock right there.</p>
            </div>
            <div class="reveal-item" style="margin-top:12px;">
                <div class="eq-box small">
                    $$ ds^2 = g_{\\mu\\nu}\\, dx^\\mu\\, dx^\\nu $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:0.95rem; margin-top:6px;">
                    The metric $g_{\\mu\\nu}$ is the lookup table that converts coordinate differences
                    ($dx$) into real distances ($ds$). It changes from point to point &mdash; that change <em>is</em> gravity.
                </p>
            </div>
            <div class="reveal-item" style="margin-top:12px;">
                <p style="color:#bbb; font-size:1.05rem;">For a single non-spinning black hole (Schwarzschild):</p>
                <div class="eq-box small" style="margin-top:8px;">
                    $$ ds^2 = -\\left(1 - \\frac{2M}{r}\\right)dt^2 + \\left(1 - \\frac{2M}{r}\\right)^{-1}dr^2 + r^2 d\\Omega^2 $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:0.95rem; margin-top:6px;">
                    Near the black hole ($r \\to 2M$): clocks freeze, radial distances blow up.
                </p>
            </div>
            
        </div>`,

        // 6b - ds interactive demo (flat table vs curved space)
        `<div class="slide" data-anim="dsmetric">
            <span class="part-label">Part 1 &mdash; Seeing the Metric</span>
            <h2>How $ds$ Changes Near a Mass</h2>
            <div class="anim-container" id="dsMetricContainer" style="height:520px;">
                <canvas id="dsMetricCanvas"></canvas>
            </div>
            <p class="anim-hint">drag the probe in either panel &mdash; far from $M$, both show $ds=1.00$; near $M$, only the bottom stretches. Drag $M$ to move the mass.</p>
            
        </div>`,

        // 7 - Christoffel symbols
        `<div class="slide">
            <span class="part-label">Part 1 &mdash; Connection</span>
            <h2>Christoffel Symbols</h2>
            <div class="reveal-item">
                <p>The "road map corrections" &mdash; they tell you how much your rulers and protractors twist as you move through curved space:</p>
            </div>
            <div class="reveal-item" style="margin-top:20px;">
                <div class="eq-box small">
                    $$ \\Gamma^\\alpha_{\\;\\mu\\nu} = \\frac{1}{2}\\,g^{\\alpha\\beta}\\left( \\partial_\\mu g_{\\beta\\nu} + \\partial_\\nu g_{\\beta\\mu} - \\partial_\\beta g_{\\mu\\nu} \\right) $$
                </div>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <p style="color:#bbb; font-size:1rem;">40 of these correction terms &mdash; each computed from the metric and how it changes nearby.</p>
            </div>
            
        </div>`,

        // 7b - Parallel transport animation
        `<div class="slide" data-anim="paralleltransport">
            <span class="part-label">Part 1 &mdash; Connection</span>
            <h2>Parallel Transport</h2>
            <div class="anim-container" id="parallelTransportContainer" style="height:380px;">
                <canvas id="parallelTransportCanvas"></canvas>
            </div>
            <p class="anim-hint">watch the arrow return rotated on the curved surface</p>
            
        </div>`,

        // 8 - Riemann tensor
        `<div class="slide">
            <span class="part-label">Part 1 &mdash; Curvature</span>
            <h2>Riemann Curvature Tensor</h2>
            <div class="reveal-item">
                <div class="eq-box small">
                    $$ R^\\alpha_{\\;\\beta\\mu\\nu} = \\partial_\\mu \\Gamma^\\alpha_{\\nu\\beta} - \\partial_\\nu \\Gamma^\\alpha_{\\mu\\beta} + \\Gamma^\\alpha_{\\mu\\lambda}\\Gamma^\\lambda_{\\nu\\beta} - \\Gamma^\\alpha_{\\nu\\lambda}\\Gamma^\\lambda_{\\mu\\beta} $$
                </div>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <p>20 independent components in 4D &mdash; this is the complete answer to "how curved is spacetime here?"</p>
            </div>
            
        </div>`,

        // 8b - Geodesic deviation animation
        `<div class="slide" data-anim="geodeviation">
            <span class="part-label">Part 1 &mdash; Curvature</span>
            <h2>Geodesic Deviation</h2>
            <div class="anim-container" id="geodevContainer" style="height:380px;">
                <canvas id="geodevCanvas"></canvas>
            </div>
            <p class="anim-hint">two "ants" walk straight &mdash; on a curved surface they converge</p>
            
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
                <div class="eq-box small">
                    $$ G_{\\mu\\nu} = R_{\\mu\\nu} - \\tfrac{1}{2}\\,g_{\\mu\\nu}\\,R $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:1rem; margin-top:8px;">The Einstein tensor &mdash; built from the metric, its first and second derivatives.</p>
            </div>
            
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
            
        </div>`,

        // 11 - Geodesics animation (3D)
        `<div class="slide" data-anim="geodesics">
            <span class="part-label">Part 1 &mdash; Curved Spacetime</span>
            <h2>Motion in Curved Spacetime</h2>
            <div class="anim-container" id="geodesicsContainer"></div>
            <p class="anim-hint">click the surface to add particles &mdash; drag to rotate</p>
            
        </div>`,

        // 12 - Geodesic equation
        `<div class="slide">
            <span class="part-label">Part 1 &mdash; Geodesic Equation</span>
            <h2>Free Fall = Straightest Possible Path</h2>
            <div class="reveal-item">
                <div class="eq-box small">
                    $$ \\frac{d^2 x^\\mu}{d\\tau^2} + \\Gamma^\\mu_{\\;\\alpha\\beta}\\,\\frac{dx^\\alpha}{d\\tau}\\frac{dx^\\beta}{d\\tau} = 0 $$
                </div>
            </div>
            <div class="reveal-item" style="margin-top:20px;">
                <p>No forces &mdash; only the curvature of spacetime guides the motion.</p>
            </div>
            
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
            
        </div>`,

        // 13b - Light cone tilting animation
        `<div class="slide" data-anim="lightcones">
            <span class="part-label">Part 1 &mdash; Non-Linear Feedback</span>
            <h2>Light Cones Near a Black Hole</h2>
            <div class="anim-container" id="lightConesContainer" style="height:380px;">
                <canvas id="lightConesCanvas"></canvas>
            </div>
            <p class="anim-hint">watch the photons try to escape &mdash; click to restart</p>
            
        </div>`,

        // -- Discretization (moved here: the audience should know what a grid is before ADM)
        `<div class="slide">
            <span class="part-label">Part 1 &mdash; How Computers See Equations</span>
            <h2>Discretizing Spacetime</h2>
            <div class="reveal-item">
                <p style="max-width:760px;">
                    A computer can't handle smooth, continuous functions. It needs to chop
                    space into a grid of tiny cubes and approximate derivatives as simple differences
                    between neighbouring points.
                </p>
            </div>
            <div class="reveal-item" style="margin-top:20px;">
                <div class="eq-box small">
                    $$ \\frac{\\partial f}{\\partial x}\\bigg|_i \\approx \\frac{f_{i+1} - f_{i-1}}{2\\,\\Delta x} $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:0.9rem; margin-top:6px;">
                    "Slope at point $i$" &asymp; "value to the right minus value to the left, divided by the gap"
                </p>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <p style="text-align:center; color:#bbb; max-width:760px;">
                    This is how every simulation in physics works. The question for GR is:
                    <strong>how do we rewrite Einstein's equations so this grid approach actually works?</strong>
                </p>
            </div>
            
        </div>`,

        // Finite difference interactive demo
        `<div class="slide" data-anim="finitediff">
            <span class="part-label">Part 1 &mdash; How Computers See Equations</span>
            <h2>Resolution Matters</h2>
            <div class="anim-container" id="finiteDiffContainer" style="height:380px;">
                <canvas id="finiteDiffCanvas"></canvas>
            </div>
            <p class="anim-hint">drag the slider to change grid resolution</p>
            
        </div>`,

        // 14 - Bridge: why reformulate Einstein's equations
        `<div class="slide">
            <span class="part-label">Part 2 &mdash; From Geometry to a Movie</span>
            <h2>The Equations Don't Point Forward in Time</h2>
            <div class="reveal-item">
                <p style="text-align:center; max-width:760px;">
                    $G_{\\mu\\nu} = 8\\pi T_{\\mu\\nu}$ is <strong>covariant</strong>: space and time are fused into one
                    4D block. There is no built-in "now", no "next".
                </p>
            </div>
            <div class="reveal-item" style="margin-top:18px;">
                <p style="text-align:center; max-width:760px;">
                    But a computer can't solve for all of spacetime at once. It needs an
                    <strong>initial-value problem</strong>: give it the geometry <em>now</em>,
                    ask for the geometry an instant <em>later</em>.
                </p>
            </div>
            <div class="reveal-item" style="margin-top:18px;">
                <p style="text-align:center; color:#bbb; max-width:760px;">
                    So we must break the 4D symmetry &mdash; single out a time direction and rewrite GR as
                    <strong>3D space evolving through time</strong>.
                </p>
            </div>
            
        </div>`,

        // 15 - Part 2: ADM 3+1 decomposition
        `<div class="slide">
            <span class="part-label">Part 2 &mdash; The ADM Formalism</span>
            <h2>The 3+1 Decomposition</h2>
            <div class="reveal-item">
                <p>Rewrite the 4D metric so that time is explicitly separated from space:</p>
            </div>
            <div class="reveal-item" style="margin-top:20px;">
                <div class="eq-box small">
                    $$ ds^2 = -\\alpha^2 dt^2 + \\gamma_{ij}\\left(dx^i + \\beta^i dt\\right)\\left(dx^j + \\beta^j dt\\right) $$
                </div>
            </div>
            <div class="reveal-item" style="margin-top:18px;">
                <p style="text-align:center; color:#bbb; max-width:760px;">
                    The 10 metric components regroup into a 3D spatial metric $\\gamma_{ij}$ (6),
                    a lapse $\\alpha$ (1), and a shift $\\beta^i$ (3). Same geometry &mdash; new bookkeeping.
                </p>
            </div>
            
        </div>`,

        // 15 - Bread slicer animation
        `<div class="slide" data-anim="slicer">
            <span class="part-label">Part 2 &mdash; The Cosmic Bread Slicer</span>
            <h2>Slicing 4D Spacetime</h2>
            <div class="anim-container" id="slicerContainer">
                <canvas id="slicerCanvas"></canvas>
            </div>
            <p class="anim-hint">click to slice &mdash; each slice = space at one moment</p>
            
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
                <p style="text-align:center; color:#bbb; font-size:0.95rem; margin-top:8px;">Extrinsic curvature &mdash; how fast the shape of each slice is changing</p>
            </div>
            
        </div>`,

        // 16b - Lapse & Shift interactive demo
        `<div class="slide" data-anim="lapseshift">
            <span class="part-label">Part 2 &mdash; Evolution Variables</span>
            <h2>Lapse &amp; Shift in Action</h2>
            <div class="anim-container" id="lapseShiftContainer" style="height:380px;">
                <canvas id="lapseShiftCanvas"></canvas>
            </div>
            <p class="anim-hint">drag the sliders to change lapse and shift</p>
            
        </div>`,

        // 17 - Splitting Einstein's equations: 10 = 6 + 4
        `<div class="slide">
            <span class="part-label">Part 2 &mdash; Splitting Einstein's Equations</span>
            <h2>10 Equations &rarr; 6 + 4</h2>
            <div class="reveal-item">
                <p style="text-align:center; max-width:760px;">
                    Feed the 3+1 split back into $G_{\\mu\\nu} = 8\\pi T_{\\mu\\nu}$.
                    The 10 equations sort themselves into two very different kinds:
                </p>
            </div>
            <div class="columns" style="margin-top:20px;">
                <div class="col reveal-item">
                    <h3>6 Evolution</h3>
                    <p style="font-size:1.05rem;">Contain <strong>second time derivatives</strong>. They tell you how the
                    geometry $\\gamma_{ij}$ and its rate of change $K_{ij}$ march forward in time.</p>
                </div>
                <div class="col reveal-item">
                    <h3>4 Constraints</h3>
                    <p style="font-size:1.05rem;">Contain <strong>no time derivatives</strong>. They are conditions the data
                    must already satisfy on <em>every</em> slice &mdash; 1 Hamiltonian + 3 momentum.</p>
                </div>
            </div>
            <div class="reveal-item" style="margin-top:22px;">
                <p style="text-align:center; color:#bbb; max-width:760px;">
                    This is the bridge back to Einstein: ADM <em>is</em> $G_{\\mu\\nu}=8\\pi T_{\\mu\\nu}$,
                    just sorted into <strong>&ldquo;what evolves&rdquo;</strong> and <strong>&ldquo;what must stay true.&rdquo;</strong>
                </p>
            </div>
            
        </div>`,

        // 18 - ADM evolution equations
        `<div class="slide">
            <span class="part-label">Part 2 &mdash; ADM Evolution</span>
            <h2>ADM Evolution Equations</h2>
            <div class="reveal-item">
                <p>The <strong>6 evolution</strong> equations, written for the spatial metric $\\gamma_{ij}$ and the extrinsic curvature $K_{ij}$:</p>
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
                <p style="text-align:center; color:#bbb; font-size:0.9rem; margin-top:4px; max-width:760px; margin-left:auto; margin-right:auto;">How the bending rate changes &mdash; this is where matter and gravity feed back into each other</p>
            </div>
            
        </div>`,

        // 18 - ADM constraints
        `<div class="slide">
            <span class="part-label">Part 2 &mdash; ADM Constraints</span>
            <h2>Constraint Equations</h2>
            <div class="reveal-item">
                <p>The other <strong>4</strong> equations have no time derivatives &mdash; they are <strong>sanity checks</strong> that the data on every slice must pass.</p>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <div class="eq-box small">
                    $$ \\mathcal{H} \\equiv R + K^2 - K_{ij}K^{ij} - 16\\pi\\rho = 0 \\qquad \\text{(Hamiltonian)} $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:0.9rem; margin-top:4px;">
                    The amount of matter-energy must match the curvature of space.<br>
                    <em>Too much energy for the curvature? Not a valid universe.</em>
                </p>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <div class="eq-box small">
                    $$ \\mathcal{M}^i \\equiv D_j K^{ij} - D^i K - 8\\pi j^i = 0 \\qquad \\text{(Momentum)} $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:0.9rem; margin-top:4px;">
                    The flow of momentum must match how space is bending over time.<br>
                    <em>Matter moving left but space bending right? Impossible.</em>
                </p>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <p style="text-align:center; color:#e87d7d; max-width:760px; margin:0 auto;">
                    If you start with bad initial data (constraints violated), the simulation <strong>crashes immediately</strong> &mdash; it's not a valid starting point for any universe.
                </p>
            </div>
            
        </div>`,

        // 19 - Why ADM fails
        `<div class="slide">
            <span class="part-label">Part 2 &mdash; The Problem</span>
            <h2>Why ADM Crashes</h2>
            <div class="reveal-item">
                <ul>
                    <li>ADM's equations don't move information at well-defined speeds</li>
                    <li>Tiny numerical errors have no "speed limit" &mdash; they pile up instantly</li>
                    <li>Errors grow exponentially &rarr; simulation blows up within milliseconds of physics</li>
                </ul>
            </div>
            <div class="reveal-item" style="margin-top:20px;">
                <p>The physics is correct, but the <em>mathematical form</em> is unsuitable for computers. We need to rewrite the same physics in a better way.</p>
            </div>
            <div class="reveal-item" style="margin-top:20px; text-align:center;">
                <p style="color:#bbb;">ADM &rarr; BSSN &rarr; CCZ4</p>
            </div>
            
        </div>`,

        // 19b - ADM vs BSSN stability animation
        `<div class="slide" data-anim="admbssn">
            <span class="part-label">Part 2 &mdash; The Problem</span>
            <h2>ADM vs BSSN: Stability</h2>
            <div class="anim-container" id="admBssnContainer" style="height:380px;">
                <canvas id="admBssnCanvas"></canvas>
            </div>
            <p class="anim-hint">watch ADM crash while BSSN stays stable &mdash; click to restart</p>
            
        </div>`,

        // 20 - BSSN decomposition
        `<div class="slide">
            <span class="part-label">Part 2 &mdash; BSSN Formulation</span>
            <h2>BSSN: Same Physics, Better Variables</h2>
            <div class="reveal-item">
                <p style="text-align:center; color:#bbb; max-width:760px;">
                    The fix is <em>not</em> new physics &mdash; it's a change of variables. We rewrite the exact same
                    ADM equations in a form the computer can trust.
                </p>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <p>Separate the overall "scale" of space from its "shape":</p>
                <div class="eq-box small" style="margin-top:10px;">
                    $$ \\gamma_{ij} = e^{4\\phi}\\,\\tilde{\\gamma}_{ij} \\qquad \\text{where } \\det(\\tilde{\\gamma}_{ij}) = 1 $$
                </div>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <p>Separate the "average expansion" of space from how it's being stretched unevenly:</p>
                <div class="eq-box small" style="margin-top:10px;">
                    $$ K_{ij} = e^{4\\phi}\\left(\\tilde{A}_{ij} + \\tfrac{1}{3}\\tilde{\\gamma}_{ij} K\\right) $$
                </div>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <p>Track how the coordinates drift as their own evolving quantity:</p>
                <div class="eq-box small" style="margin-top:10px;">
                    $$ \\tilde{\\Gamma}^i = \\tilde{\\gamma}^{jk}\\tilde{\\Gamma}^i_{\\;jk} $$
                </div>
            </div>
            
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
            
        </div>`,

        // 22 - CCZ4
        `<div class="slide">
            <span class="part-label">Part 2 &mdash; CCZ4 Formulation</span>
            <h2>CCZ4: Constraint Damping</h2>
            <div class="reveal-item">
                <p style="text-align:center; color:#bbb; max-width:780px;">
                    Recap: <strong>ADM</strong> = Einstein as evolution + constraints &nbsp;&rarr;&nbsp;
                    <strong>BSSN</strong> = same equations, stable variables &nbsp;&rarr;&nbsp;
                    <strong>CCZ4</strong> = the final refinement.
                </p>
            </div>
            <div class="reveal-item" style="margin-top:15px;">
                <p>BSSN keeps constraint errors from exploding, but they still slowly drift. CCZ4 actively <strong>damps</strong> them back to zero:</p>
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
            
        </div>`,

        // 24b - Binary black hole inspiral animation
        `<div class="slide" data-anim="binarybh">
            <span class="part-label">Part 3 &mdash; The Breakthrough</span>
            <h2>Binary Black Hole Merger</h2>
            <div class="anim-container" id="binaryBHContainer" style="height:380px;">
                <canvas id="binaryBHCanvas"></canvas>
            </div>
            <p class="anim-hint">inspiral &rarr; merger &rarr; ringdown &mdash; click to restart</p>
            
        </div>`,

        // 25 - LIGO schematic + explanation
        `<div class="slide" data-anim="ligo">
            <span class="part-label">Part 3 &mdash; The Payoff</span>
            <h2>LIGO &mdash; Laser Interferometer</h2>
            <div class="anim-container" id="ligoContainer" style="height:340px;">
                <canvas id="ligoCanvas"></canvas>
            </div>
            <p class="anim-hint">click to send a gravitational wave through the detector</p>
            
        </div>`,

        // 25b - GW Polarization animation
        `<div class="slide" data-anim="gwpolarization">
            <span class="part-label">Part 3 &mdash; The Payoff</span>
            <h2>Gravitational Wave Polarization</h2>
            <div class="anim-container" id="gwPolContainer" style="height:380px;">
                <canvas id="gwPolCanvas"></canvas>
            </div>
            <p class="anim-hint">a ring of test particles deforms as the wave passes</p>
            
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
                <div class="eq-box small" style="margin:8px 0;">
                    $$ Q = \\frac{f_{\\Delta x} - f_{\\Delta x/2}}{f_{\\Delta x/2} - f_{\\Delta x/4}} $$
                </div>
            </div>
            <div class="reveal-item" style="margin-top:6px;">
                <div class="eq-box small" style="margin:8px 0;">
                    $$ Q \\to 2^n \\quad \\text{as } \\Delta x \\to 0 $$
                </div>
                <p style="text-align:center; color:#bbb; font-size:0.9rem; margin-top:4px;">4th-order code &rArr; $Q \\to 16$ &emsp; | &emsp; 2nd-order &rArr; $Q \\to 4$</p>
            </div>
            
        </div>`,

        // 28b - Convergence animation
        `<div class="slide" data-anim="convergence">
            <span class="part-label">Part 4 &mdash; Richardson Convergence</span>
            <h2>Convergence in Action</h2>
            <div class="anim-container" id="convergenceContainer" style="height:380px;">
                <canvas id="convergenceCanvas"></canvas>
            </div>
            <p class="anim-hint">three resolutions converge &mdash; Q &rarr; 16 for 4th-order &mdash; click to restart</p>
            
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
            
        </div>`,

        // 30 - CPU vs GPU: the numbers
        `<div class="slide">
            <span class="part-label">Part 4 &mdash; The Numbers</span>
            <h2>Why the GPU Wins</h2>
            <div class="reveal-item">
                <table style="border-collapse:collapse; margin:10px auto; font-size:1.05rem; min-width:640px;">
                    <thead>
                        <tr style="color:#bbb; font-family:'JetBrains Mono',monospace; font-size:0.8rem; text-transform:uppercase; letter-spacing:1px;">
                            <th style="text-align:left; padding:10px 18px; border-bottom:1px solid rgba(255,255,255,0.15);"></th>
                            <th style="text-align:right; padding:10px 18px; border-bottom:1px solid rgba(255,255,255,0.15);">Server CPU<br><span style="font-size:0.7rem; color:#888;">64-core, DDR5</span></th>
                            <th style="text-align:right; padding:10px 18px; border-bottom:1px solid rgba(255,255,255,0.15);">Data-center GPU<br><span style="font-size:0.7rem; color:#888;">NVIDIA H100</span></th>
                            <th style="text-align:right; padding:10px 18px; border-bottom:1px solid rgba(255,255,255,0.15); color:#fff;">Gain</th>
                        </tr>
                    </thead>
                    <tbody style="font-family:'JetBrains Mono',monospace; font-size:0.95rem;">
                        <tr>
                            <td style="text-align:left; padding:9px 18px; color:#ddd;">Parallel cores</td>
                            <td style="text-align:right; padding:9px 18px; color:#aaa;">~64</td>
                            <td style="text-align:right; padding:9px 18px; color:#fff;">~16,900</td>
                            <td style="text-align:right; padding:9px 18px; color:#8fdc9c;">~260&times;</td>
                        </tr>
                        <tr>
                            <td style="text-align:left; padding:9px 18px; color:#ddd;">FP64 throughput</td>
                            <td style="text-align:right; padding:9px 18px; color:#aaa;">~4 TFLOP/s</td>
                            <td style="text-align:right; padding:9px 18px; color:#fff;">~34 TFLOP/s</td>
                            <td style="text-align:right; padding:9px 18px; color:#8fdc9c;">~8&times;</td>
                        </tr>
                        <tr>
                            <td style="text-align:left; padding:9px 18px; color:#ddd;">Memory bandwidth</td>
                            <td style="text-align:right; padding:9px 18px; color:#aaa;">~0.5 TB/s</td>
                            <td style="text-align:right; padding:9px 18px; color:#fff;">~3.35 TB/s</td>
                            <td style="text-align:right; padding:9px 18px; color:#8fdc9c;">~7&times;</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="reveal-item" style="margin-top:18px;">
                <p style="text-align:center; color:#bbb; max-width:780px;">
                    Every timestep, each grid cell reads its neighbours &mdash; the update is
                    <strong>memory-bandwidth bound</strong>. That ~7&times; bandwidth is the number that matters most.
                </p>
            </div>
            
        </div>`,

        // 31 - Riding the AI wave
        `<div class="slide">
            <span class="part-label">Part 4 &mdash; The AI Tailwind</span>
            <h2>Riding the AI Wave</h2>
            <div class="reveal-item">
                <p style="text-align:center; max-width:780px;">
                    The same hardware that trains ChatGPT &mdash; H100s, HBM stacks, NVLink fabrics &mdash;
                    is <strong>exactly</strong> what solves Einstein's equations.
                </p>
            </div>
            <div class="columns" style="margin-top:22px;">
                <div class="col reveal-item">
                    <h3>The Boom</h3>
                    <p style="font-size:1.05rem;">AI demand has driven data-center GPU revenue up
                    <strong>~10&times; in two years</strong>, pouring billions into faster memory and interconnects.</p>
                </div>
                <div class="col reveal-item">
                    <h3>The Free Ride</h3>
                    <p style="font-size:1.05rem;">Numerical relativity inherits it all &mdash; cheaper FLOPs,
                    bigger VRAM, faster HBM &mdash; without funding a single chip.</p>
                </div>
            </div>
            <div class="reveal-item" style="margin-top:22px;">
                <p style="text-align:center; color:#bbb; max-width:780px;">
                    Just as GPUs turned neural nets from curiosity into ChatGPT, they are turning
                    Einstein's equations into a routine numerical experiment.
                </p>
            </div>
            
        </div>`,

        // AMR animation + explanation
        `<div class="slide" data-anim="amr">
            <span class="part-label">Part 4 &mdash; Adaptive Mesh Refinement</span>
            <h2>AMR: Resolution Where It Matters</h2>
            <div class="anim-container" id="amrContainer" style="height:380px;">
                <canvas id="amrCanvas"></canvas>
            </div>
            <p class="anim-hint">drag the black hole &mdash; the refined grid follows</p>
            
        </div>`,

        // 32 - GRTeclyn
        `<div class="slide">
            <span class="part-label">Part 4 &mdash; GRTeclyn</span>
            <h2>GRTeclyn / AMReX</h2>
            <div class="reveal-item">
                <ul>
                    <li>From the GRChombo collaboration</li>
                    <li>Built entirely for GPU architectures</li>
                    <li>Adaptive Mesh Refinement &mdash; finer grid where curvature is large</li>
                    <li>HBM3 memory: ~3.35 TB/s bandwidth</li>
                    <li>NVLink: multi-GPU without bottlenecks</li>
                </ul>
            </div>
            
        </div>`,

        // 31 - Wormholes intro
        `<div class="slide">
            <span class="part-label">Part 5 &mdash; Wormholes</span>
            <h2>Traversable Wormholes</h2>
            <div class="reveal-item">
                <p>A tunnel through spacetime held open by <em>exotic matter</em> &mdash; a hypothetical substance with <strong>negative</strong> energy that pushes space apart instead of pulling it together.</p>
            </div>
            <div class="reveal-item" style="margin-top:20px;">
                <div class="eq-box small">
                    $$ T_{\\mu\\nu}\\, k^\\mu k^\\nu < 0 \\quad \\text{(negative energy &mdash; "anti-gravity")} $$
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
        // Stamp stable ids so notes JSON / TTS can key by slide index
        deck.querySelectorAll('.slide').forEach((el, i) => {
            el.dataset.slideId = String(i);
        });
    }

    return { inject };
})();
