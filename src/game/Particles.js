import * as THREE from 'three';

export class Particles {
    constructor(game) {
        this.game = game;
        this.particles = [];

        // geometry for a single particle
<<<<<<< HEAD
        this.geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([0, 0, 0]);
        this.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
=======
        this.particleGeo = new THREE.BufferGeometry();
        const vertices = new Float32Array([0, 0, 0]);
        this.particleGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // Geometry for speed lines
        this.lineGeo = new THREE.BoxGeometry(0.05, 0.05, 4);
>>>>>>> master
    }

    createExplosion(position, color = 0xffff00, count = 10) {
        for (let i = 0; i < count; i++) {
            const material = new THREE.PointsMaterial({
                color: color,
                size: 0.5,
                transparent: true,
                opacity: 1
            });

<<<<<<< HEAD
            const particle = new THREE.Points(this.geometry, material);
=======
            const particle = new THREE.Points(this.particleGeo, material);
>>>>>>> master
            particle.position.copy(position);

            // Random velocity
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );

            this.game.scene.add(particle);
<<<<<<< HEAD
            this.particles.push({ mesh: particle, velocity, life: 1.0 });
        }
    }

=======
            this.particles.push({ mesh: particle, velocity, life: 1.0, type: 'explosion' });
        }
    }

    createSpeedLine() {
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.4
        });

        const line = new THREE.Mesh(this.lineGeo, material);

        // Random position around the player/camera path
        const x = (Math.random() - 0.5) * 40;
        const y = (Math.random() * 10);
        const z = -100; // Start far away

        line.position.set(x, y, z);

        // Very fast movement towards camera
        const velocity = new THREE.Vector3(0, 0, 150 + Math.random() * 100);

        this.game.scene.add(line);
        this.particles.push({ mesh: line, velocity, life: 1.5, type: 'speedline' });
    }

>>>>>>> master
    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.life -= dt;

<<<<<<< HEAD
            if (p.life <= 0) {
=======
            // Remove if life is out or if speedline is far past camera
            if (p.life <= 0 || (p.type === 'speedline' && p.mesh.position.z > 20)) {
>>>>>>> master
                this.game.scene.remove(p.mesh);
                this.particles.splice(i, 1);
                continue;
            }

            p.mesh.position.addScaledVector(p.velocity, dt);
<<<<<<< HEAD
            p.mesh.material.opacity = p.life;
=======

            if (p.type === 'explosion') {
                p.mesh.material.opacity = p.life;
            } else if (p.type === 'speedline') {
                // Fade in/out for speedlines
                if (p.life > 1.3) {
                    p.mesh.material.opacity = (1.5 - p.life) * 2;
                } else {
                    p.mesh.material.opacity = p.life / 1.3 * 0.4;
                }
            }
>>>>>>> master
        }
    }
}
