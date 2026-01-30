import * as THREE from 'three';

export class World {
    constructor(game) {
        this.game = game;
        this.speed = 10;
        this.baseSpeed = 10;
        this.objects = [];
        this.scenery = []; // Buildings etc

        // Ground - Neon Grid
        const groundGeo = new THREE.PlaneGeometry(100, 1000);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.8
        });
        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.game.scene.add(this.ground);

        // Grid helper for the floor
        const gridHelper = new THREE.GridHelper(100, 50, 0xff00ff, 0x222222);
        gridHelper.position.y = 0.01;
        gridHelper.position.z = -400;
        gridHelper.scale.z = 5;
        this.game.scene.add(gridHelper);
        this.gridHelper = gridHelper;

        // Track markers (Neon Lines)
        this.createTrack();

        this.spawnTimer = 0;
        this.spawnInterval = 1.5;
        this.sceneryTimer = 0;
    }

    createTrack() {
        const lineGeo = new THREE.PlaneGeometry(0.1, 1000);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0x00ffff }); // Cyan lines

        const line1 = new THREE.Mesh(lineGeo, lineMat);
        line1.rotation.x = -Math.PI / 2;
        line1.position.set(-1.25, 0.02, 0);

        const line2 = new THREE.Mesh(lineGeo, lineMat);
        line2.rotation.x = -Math.PI / 2;
        line2.position.set(1.25, 0.02, 0);

        this.game.scene.add(line1);
        this.game.scene.add(line2);
    }

    reset() {
        this.speed = this.baseSpeed;

        // Clear obstacles
        this.objects.forEach(obj => this.game.scene.remove(obj.mesh));
        this.objects = [];

        // Clear scenery
        this.scenery.forEach(mesh => this.game.scene.remove(mesh));
        this.scenery = [];

        this.spawnTimer = 0;
        this.sceneryTimer = 0;
    }

    spawnObstacle() {
        const lane = Math.floor(Math.random() * 3) - 1;
        const xPos = lane * 2.5;

        const rand = Math.random();

        if (rand < 0.7) {
            // Neon Obstacle
            const geo = new THREE.BoxGeometry(2, 2, 1);
            const mat = new THREE.MeshStandardMaterial({
                color: 0xff0055, // Hot pink
                emissive: 0x550011,
                roughness: 0.1,
                metalness: 0.5
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(xPos, 1, -60);
            mesh.castShadow = true;
            this.game.scene.add(mesh);

            this.objects.push({ mesh, type: 'obstacle', active: true });
        } else if (rand < 0.9) {
            // Neon Coin
            const geo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
            const mat = new THREE.MeshStandardMaterial({
                color: 0xffff00,
                emissive: 0xaa5500,
                metalness: 1,
                roughness: 0.1
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.z = Math.PI / 2;
            mesh.position.set(xPos, 1, -60);
            this.game.scene.add(mesh);

            this.objects.push({ mesh, type: 'coin', active: true });
        } else if (rand < 0.95) {
            // Fast Symbol (Icosahedron)
            const geo = new THREE.IcosahedronGeometry(0.5, 0);
            const mat = new THREE.MeshStandardMaterial({
                color: 0x00ffff, // Cyan
                emissive: 0x005555,
                metalness: 1,
                roughness: 0.1
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(xPos, 1, -60);
            this.game.scene.add(mesh);

            this.objects.push({ mesh, type: 'fast', active: true });
        } else if (rand < 0.97) {
            // Magnet (Red Sphere)
            const geo = new THREE.SphereGeometry(0.5, 16, 16);
            const mat = new THREE.MeshStandardMaterial({
                color: 0xff0000,
                emissive: 0x550000,
                metalness: 1,
                roughness: 0
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(xPos, 1, -60);
            this.game.scene.add(mesh);
            this.objects.push({ mesh, type: 'magnet', active: true });
        } else {
            // Shield (Green Box for now - simplified)
            const geo = new THREE.BoxGeometry(0.7, 0.7, 0.1);
            const mat = new THREE.MeshStandardMaterial({
                color: 0x00ff00,
                emissive: 0x005500,
                metalness: 1,
                roughness: 0
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(xPos, 1, -60);
            this.game.scene.add(mesh);
            this.objects.push({ mesh, type: 'shield', active: true });
        }
    }

    spawnScenery() {
        // Spawn buildings on left and right
        const side = Math.random() > 0.5 ? 1 : -1;
        const xPos = side * (5 + Math.random() * 5); // 5 to 10 units away
        const height = 5 + Math.random() * 15;

        const geo = new THREE.BoxGeometry(3, height, 3);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x001133,
            emissive: 0x000510,
            roughness: 0.2
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(xPos, height / 2, -70);
        this.game.scene.add(mesh);

        this.scenery.push(mesh);
    }

    update(dt) {
        // defined target speed based on boost status
        let targetSpeed = this.baseSpeed + (this.game.score / 500); // progressive difficulty
        if (this.game.isSpeedBoosting) {
            targetSpeed *= 3; // 3x speed boost
        }

        // Smoothly interpolate current speed to target speed
        this.speed += (targetSpeed - this.speed) * dt * 2;

        // Spawning
        this.spawnTimer += dt;
        if (this.spawnTimer > this.spawnInterval) {
            this.spawnObstacle();
            this.spawnTimer = 0;
            // Adjust spawning to speed
            this.spawnInterval = Math.max(0.4, 1.5 - (this.speed - 10) * 0.04);
        }

        this.sceneryTimer += dt;
        if (this.sceneryTimer > 0.2) { // Frequent scenery
            this.spawnScenery();
            this.sceneryTimer = 0;
        }

        // Move Grid Effect (Fake movement)
        // this.gridHelper.position.z += this.speed * dt;
        // if (this.gridHelper.position.z > 0) this.gridHelper.position.z = -100;

        // Move Objects
        const playerBox = new THREE.Box3().setFromObject(this.game.player.mesh);
        playerBox.expandByScalar(-0.3);

        // Game Objects
        for (let i = this.objects.length - 1; i >= 0; i--) {
            const obj = this.objects[i];
            obj.mesh.position.z += this.speed * dt;

            if (obj.type === 'coin') {
                obj.mesh.rotation.x += dt * 5;
                obj.mesh.rotation.z += dt * 2;

                // Magnet Logic
                if (this.game.hasMagnet && obj.active) {
                    const dist = obj.mesh.position.distanceTo(this.game.player.mesh.position);
                    if (dist < 15) { // Attraction range
                        obj.mesh.position.lerp(this.game.player.mesh.position, dt * 5);
                    }
                }
            }

            if (obj.mesh.position.z > 10) {
                this.game.scene.remove(obj.mesh);
                this.objects.splice(i, 1);
                continue;
            }

            if (obj.active) {
                const box = new THREE.Box3().setFromObject(obj.mesh);
                if (box.intersectsBox(playerBox)) {
                    if (obj.type === 'obstacle') {
                        this.game.gameOver();
                    } else if (obj.type === 'coin') {
                        this.game.updateScore(100);
                        this.game.audio.playCoin();
                        this.game.particles.createExplosion(obj.mesh.position, 0xffff00, 10);
                        this.game.scene.remove(obj.mesh);
                        obj.active = false;
                    } else if (obj.type === 'fast') {
                        this.game.activateSpeedAbility();
                        this.game.audio.playPowerup();
                        this.game.particles.createExplosion(obj.mesh.position, 0x00ffff, 15);
                        this.game.scene.remove(obj.mesh); // Remove symbol
                        obj.active = false;
                    } else if (obj.type === 'magnet') {
                        this.game.activateMagnet();
                        this.game.audio.playPowerup();
                        this.game.particles.createExplosion(obj.mesh.position, 0xff0000, 15);
                        this.game.scene.remove(obj.mesh);
                        obj.active = false;
                    } else if (obj.type === 'shield') {
                        this.game.activateShield();
                        this.game.audio.playPowerup();
                        this.game.particles.createExplosion(obj.mesh.position, 0x00ff00, 15);
                        this.game.scene.remove(obj.mesh);
                        obj.active = false;
                    }
                }
            }
        }

        // Scenery Objects
        for (let i = this.scenery.length - 1; i >= 0; i--) {
            const mesh = this.scenery[i];
            mesh.position.z += this.speed * dt; // Move at same speed
            if (mesh.position.z > 20) {
                this.game.scene.remove(mesh);
                this.scenery.splice(i, 1);
            }
        }
    }
}
