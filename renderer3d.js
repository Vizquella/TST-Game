// renderer3d.js - Three.js 3D Engine for Tetris with Dynamic Themes & Visual FX

class Tetris3DRenderer {
    constructor(canvasContainerId) {
        this.container = document.getElementById(canvasContainerId);
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        this.currentTheme = 'christmas';
        this.boardWidth = 10;
        this.boardHeight = 20;
        this.blockSize = 1.0;

        // Three.js Core
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.clock = new THREE.Clock();

        // Object Groups
        this.boardGroup = new THREE.Group();
        this.blocksGroup = new THREE.Group();
        this.activePieceGroup = new THREE.Group();
        this.ghostPieceGroup = new THREE.Group();
        this.effectsGroup = new THREE.Group();
        this.themeEnvironmentGroup = new THREE.Group();

        // Stored meshes
        this.boardMeshes = []; // 20 x 10 array of meshes or null
        this.particleSystems = [];
        this.floatingProps = [];
        this.lightningTimer = 0;
        this.lightningLight = null;
        this.fairyLights = [];

        // Camera Shake
        this.shakeIntensity = 0;
        this.shakeDecay = 5.0;
        this.cameraBasePos = new THREE.Vector3(0, 0, 24);
        this.cameraTarget = new THREE.Vector3(0, 0, 0);

        // Geometries
        this.blockGeometry = this.createBeveledBlockGeometry();
        this.ghostGeometry = new THREE.BoxGeometry(0.96, 0.96, 0.96);

        // Theme Definitions
        this.themes = {
            christmas: {
                name: 'Christmas',
                background: 0x050d1a,
                fogColor: 0x071526,
                fogNear: 25,
                fogFar: 60,
                ambientColor: 0x88aacc,
                ambientIntensity: 0.65,
                dirLightColor: 0xffe8d6,
                dirLightIntensity: 0.9,
                dirLightPos: [10, 20, 15],
                accentLightColor: 0x00e5ff,
                frameColor: 0x1b4332,
                frameGlow: 0xd80032,
                gridColor: 0x2d6a4f,
                floorColor: 0x0d1f2d,
                palette: [
                    0x00f5d4, // I: Frost Mint
                    0x00bbf9, // J: Glacier Blue
                    0xfb8500, // L: Warm Amber Gingerbread
                    0xffb703, // O: Golden Star
                    0x2ec4b6, // S: Pine Needle
                    0x9d4edd, // T: Sugarplum Berry
                    0xe63946  // Z: Christmas Ribbon Red
                ]
            },
            halloween: {
                name: 'Halloween',
                background: 0x0c0714,
                fogColor: 0x130a21,
                fogNear: 20,
                fogFar: 55,
                ambientColor: 0x5a2d82,
                ambientIntensity: 0.55,
                dirLightColor: 0xff7b00,
                dirLightIntensity: 0.85,
                dirLightPos: [10, 18, 12],
                accentLightColor: 0x76ff03,
                frameColor: 0x240046,
                frameGlow: 0xff6000,
                gridColor: 0x5a189a,
                floorColor: 0x10002b,
                palette: [
                    0x00e676, // I: Radioactive Slime
                    0x7209b7, // J: Witch Robe Purple
                    0xf77f00, // L: Jack-o'-Lantern Orange
                    0xfca311, // O: Autumn Moon Gold
                    0xa7c957, // S: Zombie Green
                    0x9d4edd, // T: Spooky Violet
                    0xba181b  // Z: Vampire Blood
                ]
            },
            summer: {
                name: 'Summer',
                background: 0x70d6ff,
                fogColor: 0xa0e7e5,
                fogNear: 35,
                fogFar: 75,
                ambientColor: 0xffffff,
                ambientIntensity: 0.85,
                dirLightColor: 0xfff3b0,
                dirLightIntensity: 1.1,
                dirLightPos: [15, 25, 20],
                accentLightColor: 0x3a86ff,
                frameColor: 0x0077b6,
                frameGlow: 0x00b4d8,
                gridColor: 0x90e0ef,
                floorColor: 0xe9d8a6,
                palette: [
                    0x00b4d8, // I: Tropical Aqua
                    0x0077b6, // J: Deep Ocean
                    0xfb8500, // L: Mango Sunset
                    0xffd166, // O: Sunshine Yellow
                    0x06d6a0, // S: Palm Lime
                    0xff006e, // T: Hibiscus Pink
                    0xef476f  // Z: Watermelon Coral
                ]
            },
            storm: {
                name: 'Storm',
                background: 0x040814,
                fogColor: 0x090f20,
                fogNear: 18,
                fogFar: 50,
                ambientColor: 0x1d4ed8,
                ambientIntensity: 0.45,
                dirLightColor: 0x38bdf8,
                dirLightIntensity: 0.75,
                dirLightPos: [8, 24, 12],
                accentLightColor: 0x00f5ff,
                frameColor: 0x0f172a,
                frameGlow: 0x00f5ff,
                gridColor: 0x1e293b,
                floorColor: 0x020617,
                palette: [
                    0x00f5ff, // I: Supercharged Electric Cyan
                    0x2563eb, // J: Storm Cobalt
                    0xf59e0b, // L: Ball Lightning Amber
                    0xfacc15, // O: Thunder Spark Gold
                    0x10b981, // S: Plasma Jade
                    0xc026d3, // T: High-Voltage Violet
                    0xef4444  // Z: Arc Discharge Red
                ]
            },
            rainy: {
                name: 'Storm', // Legacy alias
                background: 0x040814,
                fogColor: 0x090f20,
                fogNear: 18,
                fogFar: 50,
                ambientColor: 0x1d4ed8,
                ambientIntensity: 0.45,
                dirLightColor: 0x38bdf8,
                dirLightIntensity: 0.75,
                dirLightPos: [8, 24, 12],
                accentLightColor: 0x00f5ff,
                frameColor: 0x0f172a,
                frameGlow: 0x00f5ff,
                gridColor: 0x1e293b,
                floorColor: 0x020617,
                palette: [
                    0x00f5ff, 0x2563eb, 0xf59e0b, 0xfacc15, 0x10b981, 0xc026d3, 0xef4444
                ]
            },
            spring: {
                name: 'Spring',
                background: 0xffeef2,
                fogColor: 0xfce7f3,
                fogNear: 28,
                fogFar: 68,
                ambientColor: 0xffffff,
                ambientIntensity: 0.9,
                dirLightColor: 0xffedd5,
                dirLightIntensity: 1.05,
                dirLightPos: [12, 22, 16],
                accentLightColor: 0xf472b6,
                frameColor: 0x2d6a4f,
                frameGlow: 0xf472b6,
                gridColor: 0x95d5b2,
                floorColor: 0x40916c,
                palette: [
                    0x38bdf8, // I: Fresh Sky Aqua
                    0x818cf8, // J: Sweet Lilac Iris
                    0xfb923c, // L: Apricot Peach Blossom
                    0xfde047, // O: Buttercup Sunshine
                    0x4ade80, // S: Spring Meadow Green
                    0xf472b6, // T: Sakura Blossom Pink
                    0xfb7185  // Z: Rose Camellia
                ]
            }
        };

        this.materialsCache = {};
        this.initThree();
        this.buildBoardFrame();
        this.applyTheme(this.currentTheme);
        this.setupWindowResize();
        this.animate();
    }

    createBeveledBlockGeometry() {
        // High quality rounded cube with chamfered edges
        const s = 0.94;
        const geom = new THREE.BoxGeometry(s, s, s);
        return geom;
    }

    initThree() {
        // Scene & Fog
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(this.themes.christmas.fogColor, 25, 60);

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 200);
        this.currentPreset = 'default';
        const initialPos = this.getResponsiveCameraPosition('default');
        this.camera.position.set(initialPos.x, initialPos.y, initialPos.z);
        this.camera.lookAt(this.cameraTarget);

        // WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.05;
        this.container.appendChild(this.renderer.domElement);

        // OrbitControls
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.06;
            this.controls.target.copy(this.cameraTarget);
            this.controls.minDistance = 12;
            this.controls.maxDistance = 45;
            this.controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't go too far under floor
        }

        // Lighting
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(this.ambientLight);

        this.dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
        this.dirLight.position.set(10, 20, 15);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 1024;
        this.dirLight.shadow.mapSize.height = 1024;
        this.dirLight.shadow.camera.near = 0.5;
        this.dirLight.shadow.camera.far = 60;
        this.dirLight.shadow.camera.left = -15;
        this.dirLight.shadow.camera.right = 15;
        this.dirLight.shadow.camera.top = 18;
        this.dirLight.shadow.camera.bottom = -15;
        this.dirLight.shadow.bias = -0.0005;
        this.scene.add(this.dirLight);

        this.accentLight = new THREE.PointLight(0x00e5ff, 1.2, 35);
        this.accentLight.position.set(0, -9, 6);
        this.scene.add(this.accentLight);

        // Thunder/Flash light for Rainy theme
        this.lightningLight = new THREE.PointLight(0xffffff, 0, 80);
        this.lightningLight.position.set(0, 15, 10);
        this.scene.add(this.lightningLight);

        // Add Groups to Scene
        this.scene.add(this.themeEnvironmentGroup);
        this.scene.add(this.boardGroup);
        this.boardGroup.add(this.blocksGroup);
        this.boardGroup.add(this.activePieceGroup);
        this.boardGroup.add(this.ghostPieceGroup);
        this.boardGroup.add(this.effectsGroup);
    }

    buildBoardFrame() {
        // Clear previous frame meshes if any
        while (this.boardGroup.children.length > 4) {
            this.boardGroup.remove(this.boardGroup.children[4]);
        }

        const bw = this.boardWidth;
        const bh = this.boardHeight;
        const halfW = bw / 2;
        const halfH = bh / 2;

        // 1. Sleek Glass Backboard
        const backGeom = new THREE.PlaneGeometry(bw + 0.4, bh + 0.4);
        this.backMat = new THREE.MeshPhysicalMaterial({
            color: 0x051020,
            transparent: true,
            opacity: 0.35,
            roughness: 0.2,
            metalness: 0.1,
            reflectivity: 0.8,
            clearcoat: 0.5
        });
        const backMesh = new THREE.Mesh(backGeom, this.backMat);
        backMesh.position.set(0, 0, -0.55);
        backMesh.receiveShadow = true;
        this.boardGroup.add(backMesh);

        // 2. Translucent Floor / Platform
        const floorGeom = new THREE.BoxGeometry(bw + 6, 0.6, 6);
        this.floorMat = new THREE.MeshStandardMaterial({
            color: 0x0e1b2a,
            roughness: 0.4,
            metalness: 0.6
        });
        this.floorMesh = new THREE.Mesh(floorGeom, this.floorMat);
        this.floorMesh.position.set(0, -halfH - 0.3, 0);
        this.floorMesh.receiveShadow = true;
        this.boardGroup.add(this.floorMesh);

        // 3. Grid Lines on Backboard
        const gridHelper = new THREE.GridHelper(bw, bw, 0x00f0ff, 0x1f3a52);
        gridHelper.rotation.x = Math.PI / 2;
        gridHelper.position.set(0, 0, -0.52);
        gridHelper.scale.set(1, 1, bh / bw);
        this.gridMesh = gridHelper;
        this.boardGroup.add(gridHelper);

        // 4. Four Glowing Vertical Pillars & Top/Bottom Framing
        const pillarGeom = new THREE.CylinderGeometry(0.18, 0.18, bh + 0.8, 16);
        this.pillarMat = new THREE.MeshStandardMaterial({
            color: 0x1b354b,
            metalness: 0.85,
            roughness: 0.2
        });

        // Left pillar
        const leftPillar = new THREE.Mesh(pillarGeom, this.pillarMat);
        leftPillar.position.set(-halfW - 0.2, 0, 0);
        this.boardGroup.add(leftPillar);

        // Right pillar
        const rightPillar = new THREE.Mesh(pillarGeom, this.pillarMat);
        rightPillar.position.set(halfW + 0.2, 0, 0);
        this.boardGroup.add(rightPillar);

        // Top Frame Bar
        const topGeom = new THREE.BoxGeometry(bw + 1.2, 0.35, 0.8);
        this.topBarMesh = new THREE.Mesh(topGeom, this.pillarMat);
        this.topBarMesh.position.set(0, halfH + 0.3, 0);
        this.boardGroup.add(this.topBarMesh);

        // Glowing Neon Outlines on Pillars
        const lineMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, linewidth: 2 });
        this.pillarLineMat = lineMat;

        const leftPoints = [
            new THREE.Vector3(-halfW - 0.2, -halfH, 0.5),
            new THREE.Vector3(-halfW - 0.2, halfH, 0.5)
        ];
        const leftLineGeom = new THREE.BufferGeometry().setFromPoints(leftPoints);
        this.boardGroup.add(new THREE.Line(leftLineGeom, lineMat));

        const rightPoints = [
            new THREE.Vector3(halfW + 0.2, -halfH, 0.5),
            new THREE.Vector3(halfW + 0.2, halfH, 0.5)
        ];
        const rightLineGeom = new THREE.BufferGeometry().setFromPoints(rightPoints);
        this.boardGroup.add(new THREE.Line(rightLineGeom, lineMat));
    }

    applyTheme(themeKey) {
        if (!this.themes[themeKey]) return;
        this.currentTheme = themeKey;
        const t = this.themes[themeKey];

        // Background & Fog
        this.scene.background = new THREE.Color(t.background);
        if (this.scene.fog) {
            this.scene.fog.color.setHex(t.fogColor);
            this.scene.fog.near = t.fogNear;
            this.scene.fog.far = t.fogFar;
        }

        // Lights
        this.ambientLight.color.setHex(t.ambientColor);
        this.ambientLight.intensity = t.ambientIntensity;

        this.dirLight.color.setHex(t.dirLightColor);
        this.dirLight.intensity = t.dirLightIntensity;
        this.dirLight.position.set(...t.dirLightPos);

        this.accentLight.color.setHex(t.accentLightColor);

        // Frame and platform materials
        if (this.backMat) {
            this.backMat.color.setHex(t.background);
        }
        if (this.floorMat) {
            this.floorMat.color.setHex(t.floorColor);
        }
        if (this.pillarMat) {
            this.pillarMat.color.setHex(t.frameColor);
        }
        if (this.pillarLineMat) {
            this.pillarLineMat.color.setHex(t.frameGlow);
        }

        // Invalidate material cache so block colors re-render with new theme palette
        this.materialsCache = {};

        // Rebuild 3D Theme Environment Props and Particles
        this.buildThemeEnvironment(themeKey);
    }

    buildThemeEnvironment(themeKey) {
        // Clear old environment
        while (this.themeEnvironmentGroup.children.length > 0) {
            const obj = this.themeEnvironmentGroup.children[0];
            this.themeEnvironmentGroup.remove(obj);
        }
        this.particleSystems = [];
        this.floatingProps = [];
        this.fairyLights = [];

        if (themeKey === 'christmas') {
            this.buildChristmasEnvironment();
        } else if (themeKey === 'halloween') {
            this.buildHalloweenEnvironment();
        } else if (themeKey === 'summer') {
            this.buildSummerEnvironment();
        } else if (themeKey === 'storm' || themeKey === 'rainy') {
            this.buildStormEnvironment();
        } else if (themeKey === 'spring') {
            this.buildSpringEnvironment();
        }
    }

    // --- THEME 1: CHRISTMAS ---
    buildChristmasEnvironment() {
        // 1. Falling Snow Particle System
        const snowCount = 1000;
        const snowGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(snowCount * 3);
        const velocities = [];

        for (let i = 0; i < snowCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 45;
            positions[i * 3 + 1] = Math.random() * 40 - 15;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 35;
            velocities.push({
                y: -(Math.random() * 0.05 + 0.03),
                x: (Math.random() - 0.5) * 0.015,
                z: (Math.random() - 0.5) * 0.015,
                sway: Math.random() * Math.PI * 2
            });
        }
        snowGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const snowMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.28,
            transparent: true,
            opacity: 0.85
        });
        const snowParticles = new THREE.Points(snowGeom, snowMat);
        this.themeEnvironmentGroup.add(snowParticles);

        this.particleSystems.push({
            mesh: snowParticles,
            geom: snowGeom,
            velocities: velocities,
            type: 'snow'
        });

        // 2. Low-Poly 3D Pine Trees on left and right
        const createPineTree = (x, z, scale) => {
            const treeGroup = new THREE.Group();
            
            // Trunk
            const trunkGeom = new THREE.CylinderGeometry(0.3 * scale, 0.45 * scale, 2.5 * scale, 8);
            const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3825, roughness: 0.9 });
            const trunk = new THREE.Mesh(trunkGeom, trunkMat);
            trunk.position.y = 1.25 * scale;
            treeGroup.add(trunk);

            // Foliage Tiers with Snow Caps
            const tiers = [
                { r: 2.2 * scale, h: 2.5 * scale, y: 2.5 * scale },
                { r: 1.7 * scale, h: 2.2 * scale, y: 4.2 * scale },
                { r: 1.2 * scale, h: 1.8 * scale, y: 5.6 * scale }
            ];

            const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1b4332, roughness: 0.6 });
            const snowCapMat = new THREE.MeshStandardMaterial({ color: 0xf8f9fa, roughness: 0.3 });

            tiers.forEach(tier => {
                const coneGeom = new THREE.ConeGeometry(tier.r, tier.h, 7);
                const cone = new THREE.Mesh(coneGeom, foliageMat);
                cone.position.y = tier.y;
                treeGroup.add(cone);

                // Small snow cap on top of cone
                const capGeom = new THREE.ConeGeometry(tier.r * 0.65, tier.h * 0.5, 7);
                const cap = new THREE.Mesh(capGeom, snowCapMat);
                cap.position.y = tier.y + tier.h * 0.28;
                treeGroup.add(cap);
            });

            // Golden star on top
            const starGeom = new THREE.OctahedronGeometry(0.35 * scale);
            const starMat = new THREE.MeshBasicMaterial({ color: 0xffd60a });
            const star = new THREE.Mesh(starGeom, starMat);
            star.position.y = 6.8 * scale;
            treeGroup.add(star);

            treeGroup.position.set(x, -10.3, z);
            return treeGroup;
        };

        this.themeEnvironmentGroup.add(createPineTree(-10, -2, 1.4));
        this.themeEnvironmentGroup.add(createPineTree(-14, 4, 1.1));
        this.themeEnvironmentGroup.add(createPineTree(10, -2, 1.4));
        this.themeEnvironmentGroup.add(createPineTree(14, 4, 1.1));

        // 3. Wrapped 3D Presents at the base
        const createPresent = (x, y, z, size, boxColor, ribbonColor) => {
            const group = new THREE.Group();
            const boxGeom = new THREE.BoxGeometry(size, size, size);
            const boxMat = new THREE.MeshStandardMaterial({ color: boxColor, roughness: 0.4 });
            const box = new THREE.Mesh(boxGeom, boxMat);
            group.add(box);

            // Ribbon bands
            const ribHGeom = new THREE.BoxGeometry(size + 0.04, size * 0.2, size + 0.04);
            const ribVGeom = new THREE.BoxGeometry(size * 0.2, size + 0.04, size + 0.04);
            const ribMat = new THREE.MeshStandardMaterial({ color: ribbonColor, metalness: 0.5, roughness: 0.2 });
            group.add(new THREE.Mesh(ribHGeom, ribMat));
            group.add(new THREE.Mesh(ribVGeom, ribMat));

            group.position.set(x, y, z);
            return group;
        };

        this.themeEnvironmentGroup.add(createPresent(-6.5, -9.8, 1.5, 1.3, 0xd80032, 0xffd700));
        this.themeEnvironmentGroup.add(createPresent(-5.2, -9.9, 2.4, 0.9, 0x0077b6, 0xffffff));
        this.themeEnvironmentGroup.add(createPresent(6.5, -9.8, 1.5, 1.3, 0x2d6a4f, 0xffd700));
        this.themeEnvironmentGroup.add(createPresent(5.2, -9.9, 2.4, 0.9, 0x9d4edd, 0xffd700));

        // 4. Twinkling Fairy Lights along the board pillars
        const lightColors = [0xff0055, 0x00ff88, 0xffea00, 0x00d4ff];
        for (let i = 0; i < 18; i++) {
            const t = (i / 18) * 20 - 10;
            const col = lightColors[i % lightColors.length];
            const bulbGeom = new THREE.SphereGeometry(0.12, 8, 8);
            const bulbMat = new THREE.MeshBasicMaterial({ color: col });
            
            // Left string
            const bulbL = new THREE.Mesh(bulbGeom, bulbMat);
            bulbL.position.set(-5.35, t, 0.2);
            this.themeEnvironmentGroup.add(bulbL);
            this.fairyLights.push({ mesh: bulbL, baseColor: col, offset: i * 0.5 });

            // Right string
            const bulbR = new THREE.Mesh(bulbGeom, bulbMat);
            bulbR.position.set(5.35, t, 0.2);
            this.themeEnvironmentGroup.add(bulbR);
            this.fairyLights.push({ mesh: bulbR, baseColor: col, offset: (i + 2) * 0.5 });
        }
    }

    // --- THEME 2: HALLOWEEN ---
    buildHalloweenEnvironment() {
        // 1. Spooky Mist & Ember Particle System (rising upward)
        const emberCount = 800;
        const emberGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(emberCount * 3);
        const velocities = [];

        for (let i = 0; i < emberCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 1] = Math.random() * 35 - 15;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
            velocities.push({
                y: Math.random() * 0.04 + 0.015, // Rise up
                x: (Math.random() - 0.5) * 0.015,
                z: (Math.random() - 0.5) * 0.015,
                sway: Math.random() * Math.PI * 2
            });
        }
        emberGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const emberMat = new THREE.PointsMaterial({
            color: 0xff6b00,
            size: 0.25,
            transparent: true,
            opacity: 0.75
        });
        const emberParticles = new THREE.Points(emberGeom, emberMat);
        this.themeEnvironmentGroup.add(emberParticles);

        this.particleSystems.push({
            mesh: emberParticles,
            geom: emberGeom,
            velocities: velocities,
            type: 'embers'
        });

        // 2. Carved Jack-o'-Lanterns with glowing eyes & candle flicker
        const createPumpkin = (x, y, z, scale) => {
            const group = new THREE.Group();
            
            // Pumpkin Body (flattened sphere)
            const bodyGeom = new THREE.SphereGeometry(1.0 * scale, 12, 10);
            bodyGeom.scale(1.2, 0.95, 1.2);
            const bodyMat = new THREE.MeshStandardMaterial({
                color: 0xf77f00,
                roughness: 0.65,
                metalness: 0.05
            });
            const body = new THREE.Mesh(bodyGeom, bodyMat);
            group.add(body);

            // Stem
            const stemGeom = new THREE.CylinderGeometry(0.12 * scale, 0.16 * scale, 0.6 * scale, 6);
            const stemMat = new THREE.MeshStandardMaterial({ color: 0x386641 });
            const stem = new THREE.Mesh(stemGeom, stemMat);
            stem.position.y = 1.0 * scale;
            stem.rotation.z = 0.2;
            group.add(stem);

            // Carved Face Glow Eyes (triangles)
            const eyeGeom = new THREE.ConeGeometry(0.22 * scale, 0.15 * scale, 3);
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffff3f });
            
            const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
            leftEye.position.set(-0.35 * scale, 0.2 * scale, 1.15 * scale);
            leftEye.rotation.x = Math.PI / 2;
            group.add(leftEye);

            const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
            rightEye.position.set(0.35 * scale, 0.2 * scale, 1.15 * scale);
            rightEye.rotation.x = Math.PI / 2;
            group.add(rightEye);

            // Flickering Candle Point Light inside
            const candleLight = new THREE.PointLight(0xff7700, 1.5 * scale, 8);
            candleLight.position.set(0, 0.2 * scale, 0.8 * scale);
            group.add(candleLight);

            group.position.set(x, y, z);
            group.userData = { candleLight: candleLight, baseIntensity: 1.5 * scale };
            this.floatingProps.push({ obj: group, type: 'pumpkin' });
            return group;
        };

        this.themeEnvironmentGroup.add(createPumpkin(-7.2, -9.6, 2.0, 1.3));
        this.themeEnvironmentGroup.add(createPumpkin(7.2, -9.6, 2.0, 1.3));
        this.themeEnvironmentGroup.add(createPumpkin(-11.5, -9.7, 4.0, 1.0));
        this.themeEnvironmentGroup.add(createPumpkin(11.5, -9.7, 4.0, 1.0));

        // 3. Spooky Gravestones
        const createTombstone = (x, y, z) => {
            const group = new THREE.Group();
            const stoneGeom = new THREE.BoxGeometry(1.2, 2.0, 0.35);
            const stoneMat = new THREE.MeshStandardMaterial({ color: 0x3d3a45, roughness: 0.9 });
            const stone = new THREE.Mesh(stoneGeom, stoneMat);
            stone.position.y = 1.0;
            group.add(stone);

            // Cross relief on tombstone
            const crossMat = new THREE.MeshStandardMaterial({ color: 0x221f28 });
            const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.9, 0.08), crossMat);
            crossV.position.set(0, 1.2, 0.18);
            group.add(crossV);
            const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.08), crossMat);
            crossH.position.set(0, 1.35, 0.18);
            group.add(crossH);

            group.position.set(x, y, z);
            group.rotation.y = (Math.random() - 0.5) * 0.4;
            return group;
        };

        this.themeEnvironmentGroup.add(createTombstone(-9.5, -10.3, 0));
        this.themeEnvironmentGroup.add(createTombstone(9.5, -10.3, 0));

        // 4. Floating Friendly Ghosts
        const createGhost = (x, y, z) => {
            const ghostGroup = new THREE.Group();
            const headGeom = new THREE.SphereGeometry(0.7, 12, 12);
            const ghostMat = new THREE.MeshStandardMaterial({
                color: 0xeeeeee,
                transparent: true,
                opacity: 0.82,
                roughness: 0.2,
                emissive: 0x8a2be2,
                emissiveIntensity: 0.2
            });
            const head = new THREE.Mesh(headGeom, ghostMat);
            ghostGroup.add(head);

            // Ghost skirt / tail
            const bodyGeom = new THREE.ConeGeometry(0.7, 1.5, 12);
            const body = new THREE.Mesh(bodyGeom, ghostMat);
            body.position.y = -0.7;
            body.rotation.x = Math.PI;
            ghostGroup.add(body);

            // Black eyes
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
            const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeMat);
            eye1.position.set(-0.25, 0.1, 0.65);
            ghostGroup.add(eye1);

            const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeMat);
            eye2.position.set(0.25, 0.1, 0.65);
            ghostGroup.add(eye2);

            ghostGroup.position.set(x, y, z);
            this.floatingProps.push({
                obj: ghostGroup,
                type: 'ghost',
                baseY: y,
                speed: 1.5 + Math.random(),
                offset: Math.random() * Math.PI
            });
            return ghostGroup;
        };

        this.themeEnvironmentGroup.add(createGhost(-9.0, 3.0, 4.0));
        this.themeEnvironmentGroup.add(createGhost(9.0, 5.0, 3.5));
    }

    // --- THEME 3: SUMMER ---
    buildSummerEnvironment() {
        // 1. Floating Sunlight Dust Motes & Tropical Bubbles
        const bubbleCount = 500;
        const bubbleGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(bubbleCount * 3);
        const velocities = [];

        for (let i = 0; i < bubbleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 45;
            positions[i * 3 + 1] = Math.random() * 35 - 12;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
            velocities.push({
                y: Math.random() * 0.02 + 0.008,
                x: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01,
                sway: Math.random() * Math.PI * 2
            });
        }
        bubbleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const bubbleMat = new THREE.PointsMaterial({
            color: 0xfff3b0,
            size: 0.3,
            transparent: true,
            opacity: 0.8
        });
        const bubbles = new THREE.Points(bubbleGeom, bubbleMat);
        this.themeEnvironmentGroup.add(bubbles);

        this.particleSystems.push({
            mesh: bubbles,
            geom: bubbleGeom,
            velocities: velocities,
            type: 'bubbles'
        });

        // 2. 3D Tropical Palm Trees flanking the board
        const createPalmTree = (x, z, scale, tiltAngle) => {
            const treeGroup = new THREE.Group();
            
            // Curved Segmented Trunk
            const segments = 6;
            const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 });
            let currentPos = new THREE.Vector3(0, 0, 0);

            for (let i = 0; i < segments; i++) {
                const segH = 1.3 * scale;
                const segGeom = new THREE.CylinderGeometry(0.28 * scale, 0.35 * scale, segH, 8);
                const segMesh = new THREE.Mesh(segGeom, trunkMat);
                segMesh.position.copy(currentPos);
                segMesh.position.y += segH / 2;
                segMesh.rotation.z = (i / segments) * tiltAngle;
                treeGroup.add(segMesh);

                currentPos.x += Math.sin((i / segments) * tiltAngle) * segH * 0.5;
                currentPos.y += segH * 0.95;
            }

            // Palm Fronds / Leaves radiating out
            const frondMat = new THREE.MeshStandardMaterial({
                color: 0x2d6a4f,
                roughness: 0.5,
                side: THREE.DoubleSide
            });
            const frondCount = 7;
            for (let f = 0; f < frondCount; f++) {
                const angle = (f / frondCount) * Math.PI * 2;
                const frondGeom = new THREE.ConeGeometry(0.8 * scale, 4.5 * scale, 5);
                frondGeom.scale(1, 0.1, 1);
                const frond = new THREE.Mesh(frondGeom, frondMat);
                frond.position.copy(currentPos);
                frond.rotation.y = angle;
                frond.rotation.z = Math.PI / 3;
                treeGroup.add(frond);
            }

            // Coconuts under fronds
            const cocoMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.9 });
            for (let c = 0; c < 3; c++) {
                const coco = new THREE.Mesh(new THREE.SphereGeometry(0.28 * scale, 8, 8), cocoMat);
                coco.position.copy(currentPos);
                coco.position.x += Math.cos(c * 2) * 0.35 * scale;
                coco.position.z += Math.sin(c * 2) * 0.35 * scale;
                coco.position.y -= 0.25 * scale;
                treeGroup.add(coco);
            }

            treeGroup.position.set(x, -10.3, z);
            return treeGroup;
        };

        this.themeEnvironmentGroup.add(createPalmTree(-10.5, -1, 1.3, -0.25));
        this.themeEnvironmentGroup.add(createPalmTree(-14.0, 3, 1.1, -0.3));
        this.themeEnvironmentGroup.add(createPalmTree(10.5, -1, 1.3, 0.25));
        this.themeEnvironmentGroup.add(createPalmTree(14.0, 3, 1.1, 0.3));

        // 3. Colorful Beach Umbrella & Beach Ball
        const createUmbrella = (x, y, z) => {
            const group = new THREE.Group();
            // Pole
            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, 5, 8),
                new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.6 })
            );
            pole.position.y = 2.5;
            pole.rotation.z = 0.15;
            group.add(pole);

            // Canopy
            const canopyGeom = new THREE.ConeGeometry(2.4, 1.0, 10);
            const canopyMat = new THREE.MeshStandardMaterial({ color: 0xff006e, roughness: 0.4 });
            const canopy = new THREE.Mesh(canopyGeom, canopyMat);
            canopy.position.set(0.35, 4.8, 0);
            canopy.rotation.z = 0.15;
            group.add(canopy);

            group.position.set(x, y, z);
            return group;
        };

        this.themeEnvironmentGroup.add(createUmbrella(-6.8, -10.3, 2.5));

        // Beach Ball
        const createBeachBall = (x, y, z) => {
            const ballGeom = new THREE.SphereGeometry(0.85, 16, 16);
            const ballMat = new THREE.MeshStandardMaterial({
                color: 0xffd166,
                roughness: 0.2,
                metalness: 0.1
            });
            const ball = new THREE.Mesh(ballGeom, ballMat);
            ball.position.set(x, y, z);
            this.floatingProps.push({
                obj: ball,
                type: 'ball',
                baseY: y
            });
            return ball;
        };
        this.themeEnvironmentGroup.add(createBeachBall(6.5, -9.5, 2.2));
    }

    // --- THEME 4: STORM (Badai Berpetir) ---
    buildStormEnvironment() {
        // 1. Torrential 3D Storm Rain (heavy downpour with wind slant)
        const rainCount = 2400;
        const rainGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(rainCount * 3);
        const velocities = [];

        for (let i = 0; i < rainCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 55;
            positions[i * 3 + 1] = Math.random() * 45 - 12;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 35;
            velocities.push({
                y: -(Math.random() * 0.45 + 0.45), // Heavy driving speed
                x: -0.12, // Strong storm wind
                z: 0.025
            });
        }
        rainGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const rainMat = new THREE.PointsMaterial({
            color: 0x7dd3fc,
            size: 0.22,
            transparent: true,
            opacity: 0.8
        });
        const rainParticles = new THREE.Points(rainGeom, rainMat);
        this.themeEnvironmentGroup.add(rainParticles);

        this.particleSystems.push({
            mesh: rainParticles,
            geom: rainGeom,
            velocities: velocities,
            type: 'rain'
        });

        // 2. High-Voltage Lightning Rod Towers
        const createLightningTower = (x, z, col) => {
            const group = new THREE.Group();
            // Dark alloy pylon
            const pylonGeom = new THREE.CylinderGeometry(0.14, 0.28, 22, 6);
            const pylonMat = new THREE.MeshStandardMaterial({ color: 0x0a0f1d, metalness: 0.95, roughness: 0.15 });
            const pylon = new THREE.Mesh(pylonGeom, pylonMat);
            group.add(pylon);

            // Glowing Discharge Sphere on top
            const ballGeom = new THREE.SphereGeometry(0.5, 12, 12);
            const ballMat = new THREE.MeshBasicMaterial({ color: col });
            const ball = new THREE.Mesh(ballGeom, ballMat);
            ball.position.y = 11.2;
            group.add(ball);

            // Electric Arc Rings
            for (let k = 0; k < 3; k++) {
                const ringGeom = new THREE.TorusGeometry(0.5 + k * 0.15, 0.04, 8, 16);
                ringGeom.rotateX(Math.PI / 2);
                const ringMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8 });
                const ring = new THREE.Mesh(ringGeom, ringMat);
                ring.position.y = 9.5 - k * 1.5;
                group.add(ring);
            }

            // Glow light
            const pl = new THREE.PointLight(col, 1.5, 20);
            pl.position.set(0, 8, 1);
            group.add(pl);

            group.position.set(x, 0, z);
            return group;
        };

        this.themeEnvironmentGroup.add(createLightningTower(-9.2, 1.0, 0x00f5ff));
        this.themeEnvironmentGroup.add(createLightningTower(9.2, 1.0, 0xc026d3));

        // 3. 3D Branching Lightning Bolt (visible only during thunder strike)
        const boltPoints = [
            new THREE.Vector3(-3.5, 20, -3),
            new THREE.Vector3(-2.8, 16, -2),
            new THREE.Vector3(-4.2, 13, -1.5),
            new THREE.Vector3(-2.0, 9, -1),
            new THREE.Vector3(-3.2, 5, 0),
            new THREE.Vector3(-1.2, 1, 0.5),
            new THREE.Vector3(-2.4, -3, 1),
            new THREE.Vector3(-0.8, -9.5, 1.2)
        ];
        const boltGeom = new THREE.BufferGeometry().setFromPoints(boltPoints);
        const boltMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 });
        this.lightningBoltMesh = new THREE.Line(boltGeom, boltMat);
        this.lightningBoltMesh.visible = false;
        this.themeEnvironmentGroup.add(this.lightningBoltMesh);

        // 4. Low-Poly Dark Storm Cloud Clusters in the sky
        const createCloud = (x, y, z, s) => {
            const cloudGroup = new THREE.Group();
            const cloudMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
            const offsets = [
                [0, 0, 0, 2.2], [1.8, -0.3, 0.4, 1.8], [-1.7, -0.2, 0.2, 1.7],
                [0.8, 0.8, -0.4, 1.5], [-0.8, 0.7, 0.3, 1.6]
            ];
            offsets.forEach(([ox, oy, oz, r]) => {
                const puff = new THREE.Mesh(new THREE.SphereGeometry(r * s, 8, 8), cloudMat);
                puff.position.set(ox * s, oy * s, oz * s);
                cloudGroup.add(puff);
            });
            cloudGroup.position.set(x, y, z);
            return cloudGroup;
        };

        this.themeEnvironmentGroup.add(createCloud(-8, 16, -4, 1.3));
        this.themeEnvironmentGroup.add(createCloud(8, 17, -4, 1.3));
        this.themeEnvironmentGroup.add(createCloud(0, 18, -6, 1.6));

        // 5. Wet ground ripple splash rings
        this.splashRings = [];
        const ringGeom = new THREE.RingGeometry(0.12, 0.5, 12);
        ringGeom.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });

        for (let r = 0; r < 10; r++) {
            const ring = new THREE.Mesh(ringGeom, ringMat.clone());
            ring.position.set((Math.random() - 0.5) * 16, -10.28, (Math.random() - 0.5) * 8);
            this.themeEnvironmentGroup.add(ring);
            this.splashRings.push({
                mesh: ring,
                scale: Math.random() * 0.8 + 0.2,
                speed: 0.04 + Math.random() * 0.03
            });
        }
    }

    // --- THEME 5: SPRING (Bunga Bermekaran) ---
    buildSpringEnvironment() {
        // 1. Swirling Sakura & Flower Petals in Spring Breeze
        const petalCount = 900;
        const petalGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(petalCount * 3);
        const velocities = [];

        for (let i = 0; i < petalCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 45;
            positions[i * 3 + 1] = Math.random() * 40 - 15;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 35;
            velocities.push({
                y: -(Math.random() * 0.035 + 0.018), // Gentle drifting float
                x: Math.random() * 0.02 + 0.015,     // Gentle breeze drift
                z: (Math.random() - 0.5) * 0.015,
                sway: Math.random() * Math.PI * 2
            });
        }
        petalGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const petalMat = new THREE.PointsMaterial({
            color: 0xffb3c6,
            size: 0.32,
            transparent: true,
            opacity: 0.85
        });
        const petalParticles = new THREE.Points(petalGeom, petalMat);
        this.themeEnvironmentGroup.add(petalParticles);

        this.particleSystems.push({
            mesh: petalParticles,
            geom: petalGeom,
            velocities: velocities,
            type: 'petals'
        });

        // 2. Blooming Japanese Cherry Blossom (Sakura) Trees
        const createSakuraTree = (x, z, scale, tiltX) => {
            const treeGroup = new THREE.Group();

            // Woody brown trunk
            const trunkGeom = new THREE.CylinderGeometry(0.32 * scale, 0.48 * scale, 3.2 * scale, 8);
            const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.85 });
            const trunk = new THREE.Mesh(trunkGeom, trunkMat);
            trunk.position.y = 1.6 * scale;
            trunk.rotation.z = tiltX;
            treeGroup.add(trunk);

            // Branched canopy with fluffy pink blossom puff clusters
            const blossomColors = [0xffb7b2, 0xffc6c7, 0xffa8ba, 0xf472b6, 0xffccd5];
            const canopyClusters = [
                { x: 0, y: 3.6, z: 0, r: 1.8 },
                { x: 1.3, y: 4.2, z: 0.6, r: 1.5 },
                { x: -1.2, y: 4.0, z: -0.5, r: 1.5 },
                { x: 0.6, y: 5.2, z: -0.4, r: 1.6 },
                { x: -0.8, y: 4.8, z: 0.7, r: 1.4 },
                { x: 0, y: 6.0, z: 0.2, r: 1.3 }
            ];

            canopyClusters.forEach((c, idx) => {
                const bMat = new THREE.MeshStandardMaterial({
                    color: blossomColors[idx % blossomColors.length],
                    roughness: 0.6
                });
                const sphere = new THREE.Mesh(new THREE.SphereGeometry(c.r * scale, 9, 9), bMat);
                sphere.position.set(c.x * scale, c.y * scale, c.z * scale);
                treeGroup.add(sphere);
            });

            treeGroup.position.set(x, -10.3, z);
            return treeGroup;
        };

        this.themeEnvironmentGroup.add(createSakuraTree(-10.5, -1, 1.35, -0.15));
        this.themeEnvironmentGroup.add(createSakuraTree(-14.2, 3.5, 1.15, -0.2));
        this.themeEnvironmentGroup.add(createSakuraTree(10.5, -1, 1.35, 0.15));
        this.themeEnvironmentGroup.add(createSakuraTree(14.2, 3.5, 1.15, 0.2));

        // 3. Flower Garden Patches at the base of the board
        const createFlower = (x, y, z, petalColor, scale = 1.0) => {
            const flower = new THREE.Group();
            // Stem
            const stem = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04 * scale, 0.04 * scale, 0.5 * scale, 5),
                new THREE.MeshStandardMaterial({ color: 0x2d6a4f })
            );
            stem.position.y = 0.25 * scale;
            flower.add(stem);

            // Center Pistil
            const center = new THREE.Mesh(
                new THREE.SphereGeometry(0.12 * scale, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0xfde047 })
            );
            center.position.y = 0.5 * scale;
            flower.add(center);

            // 5 Petals
            const petalMat = new THREE.MeshStandardMaterial({ color: petalColor, roughness: 0.4 });
            for (let p = 0; p < 5; p++) {
                const angle = (p / 5) * Math.PI * 2;
                const petal = new THREE.Mesh(new THREE.SphereGeometry(0.11 * scale, 6, 6), petalMat);
                petal.scale.set(1.4, 0.4, 1);
                petal.position.set(
                    Math.cos(angle) * 0.18 * scale,
                    0.5 * scale,
                    Math.sin(angle) * 0.18 * scale
                );
                flower.add(petal);
            }

            flower.position.set(x, y, z);
            return flower;
        };

        const flowerPalette = [0xf472b6, 0xffffff, 0xc084fc, 0xfacc15, 0xfb7185];
        for (let i = 0; i < 16; i++) {
            const fx = -5.8 + (i / 15) * 11.6;
            const fz = 1.2 + (i % 3) * 0.5;
            const col = flowerPalette[i % flowerPalette.length];
            const fl = createFlower(fx, -10.25, fz, col, 0.9 + Math.random() * 0.3);
            this.themeEnvironmentGroup.add(fl);
        }
    }

    // --- MATERIAL GENERATOR FOR TETRIS BLOCKS ---
    getBlockMaterial(colorIndex, isGhost = false) {
        const theme = this.themes[this.currentTheme];
        const hexColor = theme.palette[colorIndex % theme.palette.length];
        const key = `${this.currentTheme}_${colorIndex}_${isGhost ? 'g' : 's'}`;

        if (this.materialsCache[key]) {
            return this.materialsCache[key];
        }

        let mat;
        if (isGhost) {
            mat = new THREE.MeshStandardMaterial({
                color: hexColor,
                transparent: true,
                opacity: 0.25,
                wireframe: true,
                roughness: 0.1
            });
        } else {
            // Theme specific finishes
            if (this.currentTheme === 'christmas') {
                mat = new THREE.MeshStandardMaterial({
                    color: hexColor,
                    roughness: 0.25,
                    metalness: 0.2,
                    emissive: hexColor,
                    emissiveIntensity: 0.12
                });
            } else if (this.currentTheme === 'halloween') {
                mat = new THREE.MeshStandardMaterial({
                    color: hexColor,
                    roughness: 0.4,
                    metalness: 0.35,
                    emissive: hexColor,
                    emissiveIntensity: 0.22
                });
            } else if (this.currentTheme === 'summer') {
                mat = new THREE.MeshPhysicalMaterial({
                    color: hexColor,
                    roughness: 0.15,
                    metalness: 0.05,
                    clearcoat: 0.8,
                    clearcoatRoughness: 0.1,
                    reflectivity: 0.8
                });
            } else if (this.currentTheme === 'storm' || this.currentTheme === 'rainy') {
                mat = new THREE.MeshStandardMaterial({
                    color: hexColor,
                    roughness: 0.1,
                    metalness: 0.8,
                    emissive: hexColor,
                    emissiveIntensity: 0.35
                });
            } else if (this.currentTheme === 'spring') {
                mat = new THREE.MeshPhysicalMaterial({
                    color: hexColor,
                    roughness: 0.22,
                    metalness: 0.08,
                    clearcoat: 0.7,
                    clearcoatRoughness: 0.12,
                    emissive: hexColor,
                    emissiveIntensity: 0.1
                });
            } else {
                mat = new THREE.MeshStandardMaterial({
                    color: hexColor,
                    roughness: 0.2,
                    metalness: 0.3
                });
            }
        }

        this.materialsCache[key] = mat;
        return mat;
    }

    // Coordinate conversion: Grid (col 0..9, row 0..19) -> 3D Scene Vector3
    gridToWorld(col, row) {
        const halfW = this.boardWidth / 2;
        const halfH = this.boardHeight / 2;
        const x = (col - halfW + 0.5) * this.blockSize;
        const y = (halfH - row - 0.5) * this.blockSize;
        const z = 0;
        return { x, y, z };
    }

    // Render entire locked board
    renderBoard(boardMatrix, hiddenRows = 4) {
        // Clear old blocks
        while (this.blocksGroup.children.length > 0) {
            const m = this.blocksGroup.children[0];
            this.blocksGroup.remove(m);
        }

        for (let r = hiddenRows; r < boardMatrix.length; r++) {
            const visibleRow = r - hiddenRows;
            for (let c = 0; c < boardMatrix[r].length; c++) {
                const colorVal = boardMatrix[r][c];
                if (colorVal > 0) {
                    const colorIndex = colorVal - 1;
                    const mat = this.getBlockMaterial(colorIndex, false);
                    const mesh = new THREE.Mesh(this.blockGeometry, mat);
                    const pos = this.gridToWorld(c, visibleRow);
                    mesh.position.set(pos.x, pos.y, pos.z);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    this.blocksGroup.add(mesh);
                }
            }
        }
    }

    // Render active piece
    renderActivePiece(piece, hiddenRows = 4) {
        while (this.activePieceGroup.children.length > 0) {
            this.activePieceGroup.remove(this.activePieceGroup.children[0]);
        }
        if (!piece) return;

        const matrix = window.TETROMINOES[piece.type].shapes[piece.shapeIndex];
        const mat = this.getBlockMaterial(piece.colorIndex, false);

        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c]) {
                    const boardCol = piece.x + c;
                    const boardRow = piece.y + r - hiddenRows;
                    if (boardRow >= 0) {
                        const mesh = new THREE.Mesh(this.blockGeometry, mat);
                        const pos = this.gridToWorld(boardCol, boardRow);
                        mesh.position.set(pos.x, pos.y, pos.z);
                        mesh.castShadow = true;
                        this.activePieceGroup.add(mesh);
                    }
                }
            }
        }
    }

    // Render ghost piece
    renderGhostPiece(piece, ghostY, hiddenRows = 4) {
        while (this.ghostPieceGroup.children.length > 0) {
            this.ghostPieceGroup.remove(this.ghostPieceGroup.children[0]);
        }
        if (!piece) return;

        const matrix = window.TETROMINOES[piece.type].shapes[piece.shapeIndex];
        const mat = this.getBlockMaterial(piece.colorIndex, true);

        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c]) {
                    const boardCol = piece.x + c;
                    const boardRow = ghostY + r - hiddenRows;
                    if (boardRow >= 0) {
                        const mesh = new THREE.Mesh(this.ghostGeometry, mat);
                        const pos = this.gridToWorld(boardCol, boardRow);
                        mesh.position.set(pos.x, pos.y, pos.z);
                        this.ghostPieceGroup.add(mesh);
                    }
                }
            }
        }
    }

    // Exploding Voxel Particles on Line Clear
    triggerLineClearExplosion(clearedVisibleRowIndices, colorIndex = 0) {
        const theme = this.themes[this.currentTheme];
        const hex = theme.palette[colorIndex % theme.palette.length];
        const mat = new THREE.MeshBasicMaterial({ color: hex });

        clearedVisibleRowIndices.forEach(rowIdx => {
            for (let c = 0; c < this.boardWidth; c++) {
                const pos = this.gridToWorld(c, rowIdx);
                // Create 4 mini particles per cleared block
                for (let k = 0; k < 4; k++) {
                    const pGeom = new THREE.BoxGeometry(0.35, 0.35, 0.35);
                    const pMesh = new THREE.Mesh(pGeom, mat);
                    pMesh.position.set(
                        pos.x + (Math.random() - 0.5) * 0.5,
                        pos.y + (Math.random() - 0.5) * 0.5,
                        pos.z + (Math.random() - 0.5) * 0.5
                    );
                    this.effectsGroup.add(pMesh);

                    const vx = (Math.random() - 0.5) * 0.25;
                    const vy = Math.random() * 0.15 + 0.08;
                    const vz = (Math.random() - 0.5) * 0.25 + 0.1;
                    const rx = (Math.random() - 0.5) * 0.3;
                    const ry = (Math.random() - 0.5) * 0.3;

                    this.particleSystems.push({
                        mesh: pMesh,
                        vx: vx,
                        vy: vy,
                        vz: vz,
                        rx: rx,
                        ry: ry,
                        life: 1.0,
                        decay: 0.028,
                        type: 'explosion'
                    });
                }
            }
        });

        // Trigger dynamic camera shake
        this.triggerCameraShake(0.35 + clearedVisibleRowIndices.length * 0.15);
    }

    // Impact ripple / dust on Hard Drop
    triggerHardDropImpact(piece, dropDist) {
        if (dropDist > 2) {
            this.triggerCameraShake(Math.min(dropDist * 0.03, 0.4));
        }
    }

    triggerCameraShake(intensity) {
        this.shakeIntensity = Math.min(this.shakeIntensity + intensity, 0.7);
    }

    // Compute camera position with responsive mobile portrait scaling
    getResponsiveCameraPosition(presetName = this.currentPreset || 'default') {
        const aspect = this.width / this.height;
        const isMobilePortrait = aspect < 0.78;
        const isTabletPortrait = aspect >= 0.78 && aspect < 1.05;

        let basePos = { x: 0, y: 1.5, z: 24 };

        if (presetName === 'classic') {
            basePos = { x: 0, y: 0, z: 23 };
        } else if (presetName === 'isometric') {
            basePos = { x: 15, y: 14, z: 18 };
        } else if (presetName === 'top') {
            basePos = { x: 0, y: 20, z: 11 };
        } else { // default 3D
            basePos = { x: 0, y: 1.5, z: 24 };
        }

        if (isMobilePortrait) {
            // In mobile portrait, pull camera back to keep 10x20 board framed between top HUD and bottom controls
            const scale = Math.min(1.45, Math.max(1.18, 0.75 / aspect));
            basePos.z *= scale;
            basePos.x *= 0.65; // reduce lateral angle so board stays centered
            basePos.y = Math.max(0, basePos.y * 0.85); // lower eye level slightly
        } else if (isTabletPortrait) {
            basePos.z *= 1.15;
        }

        return basePos;
    }

    // Camera preset angles
    setCameraPreset(presetName) {
        if (!this.controls) return;
        this.currentPreset = presetName;
        const pos = this.getResponsiveCameraPosition(presetName);
        this.camera.position.set(pos.x, pos.y, pos.z);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    setupWindowResize() {
        window.addEventListener('resize', () => {
            this.width = this.container.clientWidth;
            this.height = this.container.clientHeight;
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.width, this.height);

            // Dynamically adjust camera framing for mobile/desktop
            const pos = this.getResponsiveCameraPosition();
            this.camera.position.set(pos.x, pos.y, pos.z);
            if (this.controls) {
                this.controls.target.set(0, 0, 0);
                this.controls.update();
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const dt = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        // Update OrbitControls
        if (this.controls) {
            this.controls.update();
        }

        // Camera Shake damping
        if (this.shakeIntensity > 0.001) {
            const rx = (Math.random() - 0.5) * this.shakeIntensity;
            const ry = (Math.random() - 0.5) * this.shakeIntensity;
            this.camera.position.x += rx;
            this.camera.position.y += ry;
            this.shakeIntensity = Math.max(0, this.shakeIntensity - this.shakeDecay * dt);
        }

        // Update Theme Specific Dynamic Props
        if (this.currentTheme === 'christmas') {
            // Twinkle fairy lights
            this.fairyLights.forEach(fl => {
                const glow = 0.5 + 0.5 * Math.sin(elapsedTime * 4 + fl.offset);
                fl.mesh.material.opacity = glow;
            });
        } else if (this.currentTheme === 'halloween') {
            // Candle flickers on Jack-o'-lanterns
            this.floatingProps.forEach(fp => {
                if (fp.type === 'pumpkin' && fp.obj.userData.candleLight) {
                    const flicker = fp.obj.userData.baseIntensity + (Math.random() - 0.5) * 0.6;
                    fp.obj.userData.candleLight.intensity = Math.max(0.4, flicker);
                } else if (fp.type === 'ghost') {
                    fp.obj.position.y = fp.baseY + Math.sin(elapsedTime * fp.speed + fp.offset) * 0.8;
                    fp.obj.rotation.y = Math.sin(elapsedTime * 1.2) * 0.3;
                }
            });
        } else if (this.currentTheme === 'summer') {
            // Gentle beach ball bounce
            this.floatingProps.forEach(fp => {
                if (fp.type === 'ball') {
                    fp.obj.position.y = fp.baseY + Math.abs(Math.sin(elapsedTime * 2.5)) * 0.5;
                    fp.obj.rotation.x += 0.01;
                    fp.obj.rotation.y += 0.015;
                }
            });
        } else if (this.currentTheme === 'storm' || this.currentTheme === 'rainy') {
            // Ground ripple splash rings expansion
            if (this.splashRings) {
                this.splashRings.forEach(sr => {
                    sr.scale += sr.speed;
                    if (sr.scale > 2.5) {
                        sr.scale = 0.2;
                        sr.mesh.position.set((Math.random() - 0.5) * 16, -10.28, (Math.random() - 0.5) * 8);
                    }
                    sr.mesh.scale.set(sr.scale, sr.scale, 1);
                    sr.mesh.material.opacity = Math.max(0, 0.6 * (1 - (sr.scale / 2.5)));
                });
            }

            // Periodic dynamic lightning multi-strobe & thunder strike
            this.lightningTimer += dt;
            if (this.lightningTimer > 3.5 + Math.random() * 4.0) {
                this.lightningTimer = 0;
                if (this.lightningLight) {
                    this.lightningLight.intensity = 5.5;
                    if (this.lightningBoltMesh) this.lightningBoltMesh.visible = true;
                    this.triggerCameraShake(0.25);

                    if (window.soundEngine && typeof window.soundEngine.playThunder === 'function') {
                        window.soundEngine.playThunder();
                    }

                    setTimeout(() => {
                        if (this.lightningLight) this.lightningLight.intensity = 1.0;
                    }, 50);
                    setTimeout(() => {
                        if (this.lightningLight) this.lightningLight.intensity = 7.0;
                        if (this.lightningBoltMesh) this.lightningBoltMesh.visible = true;
                    }, 100);
                    setTimeout(() => {
                        if (this.lightningLight) this.lightningLight.intensity = 2.0;
                        if (this.lightningBoltMesh) this.lightningBoltMesh.visible = false;
                    }, 180);
                    setTimeout(() => {
                        if (this.lightningLight) this.lightningLight.intensity = 0;
                    }, 320);
                }
            }
        }

        // Update Particle Systems (Snow, Rain, Embers, Bubbles, Explosions)
        for (let i = this.particleSystems.length - 1; i >= 0; i--) {
            const ps = this.particleSystems[i];

            if (ps.type === 'snow') {
                const pos = ps.geom.attributes.position.array;
                for (let j = 0; j < ps.velocities.length; j++) {
                    const v = ps.velocities[j];
                    v.sway += 0.02;
                    pos[j * 3 + 1] += v.y;
                    pos[j * 3] += Math.sin(v.sway) * 0.025 + v.x;
                    pos[j * 3 + 2] += Math.cos(v.sway) * 0.025 + v.z;

                    if (pos[j * 3 + 1] < -12) {
                        pos[j * 3 + 1] = 25;
                        pos[j * 3] = (Math.random() - 0.5) * 45;
                        pos[j * 3 + 2] = (Math.random() - 0.5) * 35;
                    }
                }
                ps.geom.attributes.position.needsUpdate = true;
            } else if (ps.type === 'rain') {
                const pos = ps.geom.attributes.position.array;
                for (let j = 0; j < ps.velocities.length; j++) {
                    const v = ps.velocities[j];
                    pos[j * 3 + 1] += v.y;
                    pos[j * 3] += v.x;
                    pos[j * 3 + 2] += v.z;

                    if (pos[j * 3 + 1] < -11) {
                        pos[j * 3 + 1] = 28;
                        pos[j * 3] = (Math.random() - 0.5) * 50;
                        pos[j * 3 + 2] = (Math.random() - 0.5) * 35;
                    }
                }
                ps.geom.attributes.position.needsUpdate = true;
            } else if (ps.type === 'embers' || ps.type === 'bubbles') {
                const pos = ps.geom.attributes.position.array;
                for (let j = 0; j < ps.velocities.length; j++) {
                    const v = ps.velocities[j];
                    v.sway += 0.015;
                    pos[j * 3 + 1] += v.y;
                    pos[j * 3] += Math.sin(v.sway) * 0.02 + v.x;
                    pos[j * 3 + 2] += Math.cos(v.sway) * 0.02 + v.z;

                    if (pos[j * 3 + 1] > 22) {
                        pos[j * 3 + 1] = -12;
                        pos[j * 3] = (Math.random() - 0.5) * 40;
                        pos[j * 3 + 2] = (Math.random() - 0.5) * 30;
                    }
                }
                ps.geom.attributes.position.needsUpdate = true;
            } else if (ps.type === 'petals') {
                const pos = ps.geom.attributes.position.array;
                for (let j = 0; j < ps.velocities.length; j++) {
                    const v = ps.velocities[j];
                    v.sway += 0.02;
                    pos[j * 3 + 1] += v.y; // Falling down softly
                    pos[j * 3] += Math.sin(v.sway) * 0.035 + v.x; // Spring breeze drift
                    pos[j * 3 + 2] += Math.cos(v.sway) * 0.025 + v.z;

                    if (pos[j * 3 + 1] < -12) {
                        pos[j * 3 + 1] = 25;
                        pos[j * 3] = (Math.random() - 0.5) * 45;
                        pos[j * 3 + 2] = (Math.random() - 0.5) * 35;
                    }
                }
                ps.geom.attributes.position.needsUpdate = true;
            } else if (ps.type === 'explosion') {
                ps.mesh.position.x += ps.vx;
                ps.mesh.position.y += ps.vy;
                ps.mesh.position.z += ps.vz;
                ps.vy -= 0.008; // Gravity
                ps.mesh.rotation.x += ps.rx;
                ps.mesh.rotation.y += ps.ry;
                ps.life -= ps.decay;
                ps.mesh.scale.setScalar(Math.max(0.01, ps.life));

                if (ps.life <= 0) {
                    this.effectsGroup.remove(ps.mesh);
                    this.particleSystems.splice(i, 1);
                }
            }
        }

        // Render Frame
        this.renderer.render(this.scene, this.camera);
    }
}

window.Tetris3DRenderer = Tetris3DRenderer;
