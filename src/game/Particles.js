import * as THREE from 'three';

export class Particles {
    constructor(game) {
        this.game = game;
        this.particles = [];

        // geometry for a single particle
        this.geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([0, 0, 0]);
        this.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    }

    createExplosion(position, color = 0xffff00, count = 10) {
        for (let i = 0; i < count; i++) {
            const material = new THREE.PointsMaterial({
                color: color,
                size: 0.5,
                transparent: true,
                opacity: 1
            });

            const particle = new THREE.Points(this.geometry, material);
            particle.position.copy(position);

            // Random velocity
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );

            this.game.scene.add(particle);
            this.particles.push({ mesh: particle, velocity, life: 1.0 });
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.life -= dt;

            if (p.life <= 0) {
                this.game.scene.remove(p.mesh);
                this.particles.splice(i, 1);
                continue;
            }

            p.mesh.position.addScaledVector(p.velocity, dt);
            p.mesh.material.opacity = p.life;
        }
    }
}
