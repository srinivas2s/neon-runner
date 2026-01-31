import * as THREE from 'three';

export class Player {
    constructor(game) {
        this.game = game;

        // Config
        this.laneWidth = 2.5;
        this.currentLane = 0; // -1, 0, 1
        this.jumpForce = 0;
        this.gravity = -20;
        this.groundY = 0.5; // Half height of player if pivot is center
        this.isJumping = false;

        // Mesh - Neon Cube
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x003300,
            metalness: 0.1,
            roughness: 0
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.y = this.groundY;
        this.mesh.castShadow = true;

        // Inner Glow
        const glowGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const glowMat = new THREE.MeshStandardMaterial({
            color: 0xccffcc,
            emissive: 0xccffcc,
            emissiveIntensity: 0.2
        });
        this.glowElement = new THREE.Mesh(glowGeo, glowMat);
        this.mesh.add(this.glowElement);

        // Shield Bubble (Hidden by default)
        const shieldGeo = new THREE.SphereGeometry(1.2, 32, 32);
        const shieldMat = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
        this.shieldMesh.visible = false;
        this.mesh.add(this.shieldMesh);

        this.game.scene.add(this.mesh);

        // Input
        this.handleInput();
        this.handleTouchInput();
    }

    handleTouchInput() {
        let touchStartX = 0;
        let touchStartY = 0;

        window.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > 30) {
                    this.changeLane(dx > 0 ? 1 : -1);
                }
            } else {
                if (dy < -30) {
                    this.jump();
                }
            }
        }, { passive: true });
    }

    reset() {
        this.currentLane = 0;
        this.mesh.position.set(0, this.groundY, 0);
        this.mesh.scale.set(1, 1, 1);
        this.jumpForce = 0;
        this.isJumping = false;
        this.mesh.rotation.x = 0;
        this.mesh.rotation.y = 0;
    }

    handleInput() {
        window.addEventListener('keydown', (event) => {
            if (!this.game.isPlaying) return;

            switch (event.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.changeLane(-1);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.changeLane(1);
                    break;
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.jump();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.isJumping) {
                        this.jumpForce -= 10;
                    }
                    break;
            }
        });

        window.addEventListener('keydown', (event) => {
            if (!this.game.isPlaying) return;
            if (event.key === ' ' && this.game.hasSpeedAbility) {
                this.game.isSpeedBoosting = true;
            }
        });

        window.addEventListener('keyup', (event) => {
            if (event.key === ' ') {
                this.game.isSpeedBoosting = false;
            }
        });
    }

    changeLane(direction) {
        const targetLane = this.currentLane + direction;
        if (targetLane >= -1 && targetLane <= 1) {
            this.currentLane = targetLane;
            // Slight tilt effect
            this.mesh.rotation.z = -direction * 0.2;
            setTimeout(() => this.mesh.rotation.z = 0, 200);
        }
    }

    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.jumpForce = 8;
            this.game.audio.playJump();

            // Squash and Stretch Animation (Scale)
            this.mesh.scale.set(0.8, 1.2, 0.8);
            setTimeout(() => this.mesh.scale.set(1, 1, 1), 200);
        }
    }

    update(dt) {
        // Horizontal Movement (Lerp for smoothness)
        const targetX = this.currentLane * this.laneWidth;
        this.mesh.position.x += (targetX - this.mesh.position.x) * 15 * dt;

        // Vertical Movement (Physics)
        if (this.isJumping) {
            this.mesh.position.y += this.jumpForce * dt;
            this.jumpForce += this.gravity * dt;

            // Spin animation while jumping
            this.mesh.rotation.x -= dt * 5;

            if (this.mesh.position.y <= this.groundY) {
                this.mesh.position.y = this.groundY;
                this.isJumping = false;
                this.jumpForce = 0;

                // Landing Squash
                this.mesh.scale.set(1.2, 0.8, 1.2);
                setTimeout(() => this.mesh.scale.set(1, 1, 1), 150);
                this.mesh.rotation.x = 0;
            }
        }

        // Idle animation
        if (!this.isJumping) {
            this.glowElement.scale.setScalar(0.8 + Math.sin(Date.now() * 0.005) * 0.1);
        }

        // Color Cycle Effect while moving
        const time = Date.now() * 0.002;
        const color = new THREE.Color().setHSL((time % 1), 1, 0.5);
        this.mesh.material.color.copy(color);
        this.mesh.material.emissive.copy(color).multiplyScalar(0.2); // Lower for non-bloom look

        // Shield Visual
        this.shieldMesh.visible = this.game.hasShield;
        if (this.game.hasShield) {
            this.shieldMesh.rotation.y += dt * 2;
            this.shieldMesh.rotation.z += dt;
        }

        // Speed Trails
        if (this.game.isSpeedBoosting || Math.random() < 0.3) { // Occasional trail even when normal
            const trailMesh = this.mesh.clone();
            trailMesh.material = this.mesh.material.clone();
            trailMesh.material.transparent = true;
            trailMesh.material.opacity = this.game.isSpeedBoosting ? 0.6 : 0.2;
            trailMesh.position.copy(this.mesh.position);
            trailMesh.rotation.copy(this.mesh.rotation);
            trailMesh.scale.copy(this.mesh.scale);
            this.game.scene.add(trailMesh);

            const trailLife = this.game.isSpeedBoosting ? 0.5 : 0.2;
            let age = 0;

            const fadeOut = (t) => {
                age += 0.05;
                trailMesh.material.opacity -= 0.05;
                trailMesh.scale.multiplyScalar(0.95);
                if (trailMesh.material.opacity <= 0) {
                    this.game.scene.remove(trailMesh);
                    trailMesh.geometry.dispose();
                    trailMesh.material.dispose();
                } else {
                    setTimeout(() => fadeOut(), 32); // ~30fps for trail fade
                }
            };
            fadeOut();
        }
    }
}
