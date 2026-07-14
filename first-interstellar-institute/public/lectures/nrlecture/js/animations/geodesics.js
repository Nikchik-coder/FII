// geodesics.js - 3D embedding diagram of curved spacetime
// Shows Schwarzschild-like funnel with particles orbiting on the surface
(function () {
    let scene, camera, renderer, container;
    let surface, particles = [];
    let running = false, time = 0;
    let mouseDown = false, mouseX = 0, mouseY = 0;
    let camTheta = 0.6, camPhi = 0.8, camDist = 12;
    let trails = [];

    const M = 1.5; // "mass" controlling well depth
    const R_MIN = 0.6; // event horizon radius
    const R_MAX = 8;
    const GRID = 80;

    // Embedding height: z(r) = -k / (r + eps)
    function embedZ(r) {
        if (r < R_MIN) return -M * 6;
        return -M * 2.5 / (r * 0.5 + 0.15);
    }

    function init() {
        container = document.getElementById('geodesicsContainer');
        if (!container || !window.THREE) return;

        // Clean up previous
        while (container.firstChild) container.removeChild(container.firstChild);
        particles = [];
        trails = [];
        time = 0;

        const W = container.clientWidth;
        const H = container.clientHeight;

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
        updateCamera();

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x1a1a1a, 1);
        container.appendChild(renderer.domElement);

        createSurface();
        createEventHorizon();

        // Seed particles
        addParticle(2.5, 0.38);
        addParticle(4.0, 0.30);
        addParticle(5.5, 0.25);

        // Mouse controls
        renderer.domElement.addEventListener('mousedown', onMouseDown);
        renderer.domElement.addEventListener('mousemove', onMouseMove);
        renderer.domElement.addEventListener('mouseup', onMouseUp);
        renderer.domElement.addEventListener('click', onClick);

        running = true;
        animate();
    }

    function createSurface() {
        // Parametric surface: polar grid mapped to embedding diagram
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        const rSteps = GRID;
        const thetaSteps = GRID;

        for (let i = 0; i <= rSteps; i++) {
            const r = R_MIN + (R_MAX - R_MIN) * (i / rSteps);
            for (let j = 0; j <= thetaSteps; j++) {
                const theta = (j / thetaSteps) * Math.PI * 2;
                const x = r * Math.cos(theta);
                const z = r * Math.sin(theta);
                const y = embedZ(r);
                vertices.push(x, y, z);
            }
        }

        for (let i = 0; i < rSteps; i++) {
            for (let j = 0; j < thetaSteps; j++) {
                const a = i * (thetaSteps + 1) + j;
                const b = a + thetaSteps + 1;
                indices.push(a, b, a + 1);
                indices.push(b, b + 1, a + 1);
            }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        // Wireframe
        const wireMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.08
        });
        surface = new THREE.Mesh(geometry, wireMat);
        scene.add(surface);

        // Solid translucent underlay
        const solidMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.015,
            side: THREE.DoubleSide
        });
        const solidMesh = new THREE.Mesh(geometry.clone(), solidMat);
        scene.add(solidMesh);
    }

    function createEventHorizon() {
        // Dark sphere at center
        const geo = new THREE.SphereGeometry(R_MIN * 0.8, 24, 24);
        const mat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.95
        });
        const bh = new THREE.Mesh(geo, mat);
        bh.position.y = embedZ(R_MIN) + 0.2;
        scene.add(bh);

        // Subtle ring at horizon
        const ringGeo = new THREE.TorusGeometry(R_MIN, 0.02, 8, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.15
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = embedZ(R_MIN);
        scene.add(ring);
    }

    function addParticle(r, speed) {
        const angle = Math.random() * Math.PI * 2;
        const vTangent = speed;
        particles.push({
            r: r,
            theta: angle,
            vr: 0,
            vtheta: vTangent / r,
            alive: true
        });

        // Trail line
        const trailGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(600 * 3); // 600 points max
        trailGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        trailGeo.setDrawRange(0, 0);
        const trailMat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2
        });
        const trailLine = new THREE.Line(trailGeo, trailMat);
        scene.add(trailLine);
        trails.push({ line: trailLine, points: [], maxPoints: 600 });
    }

    function onClick(e) {
        // Add particle at random orbit
        const r = 2.0 + Math.random() * 4;
        const speed = 0.2 + Math.random() * 0.25;
        addParticle(r, speed);
    }

    function updateParticles() {
        const dt = 0.02;

        particles.forEach((p, idx) => {
            if (!p.alive) return;

            // Pseudo-Schwarzschild effective potential dynamics
            const r = p.r;
            const L = r * r * p.vtheta; // angular momentum (conserved approximately)

            // Gravitational acceleration: -M/r^2 + L^2/r^3 (effective potential)
            const ar = -M / (r * r) + L * L / (r * r * r);

            p.vr += ar * dt;
            p.r += p.vr * dt;
            p.theta += p.vtheta * dt;
            p.vtheta = L / (p.r * p.r); // conserve angular momentum

            // Kill if fallen in or escaped
            if (p.r < R_MIN * 1.1) {
                p.alive = false;
                return;
            }
            if (p.r > R_MAX * 1.5) {
                p.alive = false;
                return;
            }

            // Update trail
            const x = p.r * Math.cos(p.theta);
            const z = p.r * Math.sin(p.theta);
            const y = embedZ(p.r);

            const trail = trails[idx];
            if (trail) {
                trail.points.push(x, y, z);
                if (trail.points.length > trail.maxPoints * 3) {
                    trail.points.splice(0, 3);
                }
                const positions = trail.line.geometry.attributes.position.array;
                for (let i = 0; i < trail.points.length; i++) {
                    positions[i] = trail.points[i];
                }
                trail.line.geometry.attributes.position.needsUpdate = true;
                trail.line.geometry.setDrawRange(0, trail.points.length / 3);
            }
        });
    }

    function drawParticles() {
        // Remove old spheres, add new ones (simple approach)
        scene.children = scene.children.filter(c => !c.userData.isParticle);

        particles.forEach(p => {
            if (!p.alive) return;
            const x = p.r * Math.cos(p.theta);
            const z = p.r * Math.sin(p.theta);
            const y = embedZ(p.r);

            const geo = new THREE.SphereGeometry(0.12, 8, 8);
            const mat = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.9
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y, z);
            mesh.userData.isParticle = true;
            scene.add(mesh);
        });
    }

    function updateCamera() {
        camera.position.x = camDist * Math.sin(camPhi) * Math.cos(camTheta);
        camera.position.y = camDist * Math.cos(camPhi);
        camera.position.z = camDist * Math.sin(camPhi) * Math.sin(camTheta);
        camera.lookAt(0, -1.5, 0);
    }

    function onMouseDown(e) {
        mouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    function onMouseMove(e) {
        if (!mouseDown) return;
        const dx = e.clientX - mouseX;
        const dy = e.clientY - mouseY;
        camTheta += dx * 0.005;
        camPhi = Math.max(0.2, Math.min(1.4, camPhi + dy * 0.005));
        mouseX = e.clientX;
        mouseY = e.clientY;
        updateCamera();
    }

    function onMouseUp() {
        mouseDown = false;
    }

    function animate() {
        if (!running) return;
        time += 0.016;

        // Auto-rotate slowly when not dragging
        if (!mouseDown) {
            camTheta += 0.002;
            updateCamera();
        }

        updateParticles();
        drawParticles();

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    window.initAnim_geodesics = function () {
        running = false;
        setTimeout(init, 150);
    };
})();
