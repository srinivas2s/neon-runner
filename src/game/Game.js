import * as THREE from 'three';
import { Player } from './Player.js';
import { World } from './World.js';
import { Particles } from './Particles.js';
import { Audio } from './Audio.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 6, 10);
        this.camera.lookAt(0, 0, -5);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        // Lighting
        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        this.scene.add(this.hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(20, 50, 20);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 500;
        dirLight.shadow.camera.top = 50;
        dirLight.shadow.camera.bottom = -50;
        dirLight.shadow.camera.left = -50;
        dirLight.shadow.camera.right = 50;
        this.scene.add(dirLight);

        // Fog & Background
        this.scene.fog = new THREE.Fog(0xFF00FF, 30, 90); // Neon purple fog
        this.scene.background = new THREE.Color(0x220033); // Dark purple background

        this.clock = new THREE.Clock();
        this.isPlaying = false;
        this.hasSpeedAbility = false;
        this.isSpeedBoosting = false;
        this.hasMagnet = false;
        this.hasShield = false;

        this.audio = new Audio();
        this.particles = new Particles(this);
        this.world = new World(this);
        this.player = new Player(this);

        this.shakeIntensity = 0;


        // UI
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highscore')) || 0;
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.highScoreElement.innerText = `High Score: ${this.highScore}`;

        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.finalScoreElement = document.getElementById('final-score');

        this.setupUI();
        this.animate();

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    setupUI() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
    }

    startGame() {
        this.isPlaying = true;
        this.score = 0;
        this.updateScore(0);
        this.hasSpeedAbility = false;
        this.isSpeedBoosting = false;
        this.hasMagnet = false;
        this.hasShield = false;

        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');

        this.world.reset();
        this.player.reset();
    }

    gameOver() {
        if (this.hasShield) {
            this.hasShield = false;
            this.shakeIntensity = 10;
            this.audio.playCrash();
            this.particles.createExplosion(this.player.mesh.position, 0x00ff00, 30);

            // Push player back slightly or clear nearby obstacles?
            // For now just shield break effect
            return;
        }

        this.isPlaying = false;

        // Check High Score
        if (this.score > this.highScore) {
            this.highScore = Math.floor(this.score);
            localStorage.setItem('highscore', this.highScore);
            this.highScoreElement.innerText = `High Score: ${this.highScore}`;
            this.highScoreElement.style.color = '#00ff00'; // Highlight new record
            this.highScoreElement.style.transform = 'scale(1.5)';
            setTimeout(() => {
                this.highScoreElement.style.color = '#ffff00';
                this.highScoreElement.style.transform = 'scale(1)';
            }, 1000);
        }

        this.finalScoreElement.innerText = `Score: ${Math.floor(this.score)}`;
        this.gameOverScreen.classList.remove('hidden');
        this.audio.playCrash();
        this.particles.createExplosion(this.player.mesh.position, 0xff0000, 20); // Boom
    }

    updateScore(amount) {
        this.score += amount;
        this.scoreElement.innerText = `Score: ${Math.floor(this.score)}`;

        // Visual pop for update
        if (amount > 0) {
            this.scoreElement.style.transform = 'scale(1.2)';
            setTimeout(() => this.scoreElement.style.transform = 'scale(1)', 100);
        }
    }

    activateSpeedAbility() {
        if (this.hasSpeedAbility) return;
        this.hasSpeedAbility = true;

        // Visual notification
        const msg = document.createElement('div');
        msg.innerText = "SPEED BOOST UNLOCKED! HOLD SPACE!";
        msg.style.position = 'absolute';
        msg.style.top = '20%';
        msg.style.width = '100%';
        msg.style.textAlign = 'center';
        msg.style.color = '#00ffff';
        msg.style.fontSize = '30px';
        msg.style.fontWeight = 'bold';
        msg.style.textShadow = '0 0 10px #00ffff';
        msg.style.zIndex = '100'; // Ensure it's on top
        document.body.appendChild(msg);

        setTimeout(() => {
            msg.remove();
        }, 3000);
    }

    activateMagnet() {
        this.hasMagnet = true;
        setTimeout(() => this.hasMagnet = false, 10000); // 10s duration
    }

    activateShield() {
        this.hasShield = true;
        this.player.mesh.material.emissive.setHex(0x00ff00); // Visual indicator
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const dt = this.clock.getDelta();

        this.particles.update(dt); // Always update particles even if game over for effect

        if (this.isPlaying) {
            this.world.update(dt);
            this.player.update(dt);
            this.score += dt * 5;
            this.updateScore(0);

            // Camera follow with slight lag
            this.camera.position.x += (this.player.mesh.position.x * 0.5 - this.camera.position.x) * 5 * dt;

            // Camera Shake
            if (this.shakeIntensity > 0) {
                const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
                const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
                this.camera.position.x += shakeX;
                this.camera.position.y += shakeY;
                this.shakeIntensity -= dt * 30; // Decay
                if (this.shakeIntensity < 0) this.shakeIntensity = 0;
            }

            if (this.isSpeedBoosting) {
                this.shakeIntensity += 0.2; // Continuous small shake
                if (this.shakeIntensity > 0.5) this.shakeIntensity = 0.5;
            }

            // Dynamic Lighting
            const time = Date.now() * 0.001;
            const hue = (time * 0.1) % 1;
            this.hemiLight.color.setHSL(hue, 0.5, 0.5);
            this.scene.fog.color.setHSL(hue, 0.6, 0.2);
            this.scene.background.setHSL(hue, 0.6, 0.1);
        }

        this.renderer.render(this.scene, this.camera);
    }
}
