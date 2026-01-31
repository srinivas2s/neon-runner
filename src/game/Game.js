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

<<<<<<< HEAD
=======
        // Target Camera settings for interpolation
        this.targetCameraPos = new THREE.Vector3(0, 6, 10);
        this.targetFOV = 60;
        this.currentFOV = 60;

>>>>>>> master
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

<<<<<<< HEAD
=======
        // UI Elements
        this.mainMenu = document.getElementById('main-menu');
        this.settingsMenu = document.getElementById('settings-menu');
        this.gameUI = document.getElementById('game-ui');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');

        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.finalScoreElement = document.getElementById('final-score');

        // Settings State
        this.difficulty = 'normal';
        this.isMuted = false;

        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highscore')) || 0;
        this.updateHighScoreUI();

        // Core Components
>>>>>>> master
        this.clock = new THREE.Clock();
        this.isPlaying = false;
        this.hasSpeedAbility = false;
        this.isSpeedBoosting = false;
        this.hasMagnet = false;
        this.hasShield = false;
<<<<<<< HEAD
=======
        this.shakeIntensity = 0;
>>>>>>> master

        this.audio = new Audio();
        this.particles = new Particles(this);
        this.world = new World(this);
        this.player = new Player(this);

<<<<<<< HEAD
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
=======
        this.setupUI();
        this.setupCursor();
>>>>>>> master
        this.animate();

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

<<<<<<< HEAD
    setupUI() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
=======
    setupCursor() {
        this.cursor = document.createElement('div');
        this.cursor.id = 'custom-cursor';
        document.body.appendChild(this.cursor);

        document.addEventListener('mousemove', (e) => {
            this.cursor.style.left = e.clientX + 'px';
            this.cursor.style.top = e.clientY + 'px';
        });

        // Hover Effect on Buttons
        const buttons = document.querySelectorAll('button, select, .credits');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => this.cursor.classList.add('cursor-hover'));
            btn.addEventListener('mouseleave', () => this.cursor.classList.remove('cursor-hover'));
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => this.cursor.style.display = 'none');
        document.addEventListener('mouseenter', () => this.cursor.style.display = 'block');
    }

    updateHighScoreUI() {
        this.highScoreElement.innerText = `High Score: ${this.highScore}`;
    }

    setupUI() {
        // Navigation
        document.getElementById('play-nav-btn').addEventListener('click', () => this.showGameStart());
        document.getElementById('settings-nav-btn').addEventListener('click', () => this.showSettings());
        document.getElementById('back-to-menu-btn').addEventListener('click', () => this.showHome());
        document.getElementById('exit-to-menu-btn').addEventListener('click', () => this.showHome());

        // Game Start/Restart
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());

        // Settings Logic
        document.getElementById('toggle-audio').addEventListener('click', (e) => {
            this.isMuted = !this.isMuted;
            this.audio.setVolume(this.isMuted ? 0 : 0.5);
            e.target.innerText = this.isMuted ? 'UNMUTE' : 'MUTE';
            e.target.style.borderColor = this.isMuted ? '#00ff00' : '#00ffff';
        });

        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });
    }

    showHome() {
        this.isPlaying = false;
        this.mainMenu.classList.remove('hidden');
        this.settingsMenu.classList.add('hidden');
        this.gameUI.classList.add('hidden');
    }

    showSettings() {
        this.mainMenu.classList.add('hidden');
        this.settingsMenu.classList.remove('hidden');
    }

    showGameStart() {
        this.mainMenu.classList.add('hidden');
        this.gameUI.classList.remove('hidden');
        this.startScreen.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
>>>>>>> master
    }

    startGame() {
        this.isPlaying = true;
        this.score = 0;
        this.updateScore(0);
        this.hasSpeedAbility = false;
        this.isSpeedBoosting = false;
        this.hasMagnet = false;
        this.hasShield = false;

<<<<<<< HEAD
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');

=======
        if (this.speedTimeout) clearTimeout(this.speedTimeout);
        if (this.magnetTimeout) clearTimeout(this.magnetTimeout);
        if (this.shieldTimeout) clearTimeout(this.shieldTimeout);

        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');

        // Apply Difficulty
        let baseSpeed = 10;
        if (this.difficulty === 'easy') baseSpeed = 7;
        if (this.difficulty === 'hard') baseSpeed = 15;
        this.world.baseSpeed = baseSpeed;

>>>>>>> master
        this.world.reset();
        this.player.reset();
    }

    gameOver() {
<<<<<<< HEAD
        if (this.hasShield) {
            this.hasShield = false;
            this.shakeIntensity = 10;
            this.audio.playCrash();
            this.particles.createExplosion(this.player.mesh.position, 0x00ff00, 30);

            // Push player back slightly or clear nearby obstacles?
            // For now just shield break effect
            return;
        }

=======
>>>>>>> master
        this.isPlaying = false;

        // Check High Score
        if (this.score > this.highScore) {
            this.highScore = Math.floor(this.score);
            localStorage.setItem('highscore', this.highScore);
<<<<<<< HEAD
            this.highScoreElement.innerText = `High Score: ${this.highScore}`;
=======
            this.updateHighScoreUI();
>>>>>>> master
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
<<<<<<< HEAD
        if (this.hasSpeedAbility) return;
=======
        if (this.speedTimeout) clearTimeout(this.speedTimeout);
>>>>>>> master
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
<<<<<<< HEAD
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
=======
        msg.style.zIndex = '100';
        document.body.appendChild(msg);

        setTimeout(() => msg.remove(), 3000);

        this.speedTimeout = setTimeout(() => {
            this.hasSpeedAbility = false;
            this.isSpeedBoosting = false; // Force stop boost
        }, 10000);
    }

    activateMagnet() {
        if (this.magnetTimeout) clearTimeout(this.magnetTimeout);
        this.hasMagnet = true;
        this.magnetTimeout = setTimeout(() => this.hasMagnet = false, 10000);
    }

    activateShield() {
        if (this.shieldTimeout) clearTimeout(this.shieldTimeout);
        this.hasShield = true;
        this.shieldTimeout = setTimeout(() => {
            this.hasShield = false;
        }, 10000);
>>>>>>> master
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
<<<<<<< HEAD
            this.world.update(dt);
            this.player.update(dt);
            this.score += dt * 5;
            this.updateScore(0);

            // Camera follow with slight lag
            this.camera.position.x += (this.player.mesh.position.x * 0.5 - this.camera.position.x) * 5 * dt;
=======
            this.player.update(dt);
            this.world.update(dt);
            this.score += dt * 5;
            this.updateScore(0);

            // Camera Follow & Dynamic Perspective
            const lerpSpeed = this.isSpeedBoosting ? 3 : 5;

            // Camera position shift during boost (lower and further back)
            if (this.isSpeedBoosting) {
                this.targetCameraPos.set(this.player.mesh.position.x * 0.5, 3.5, 13);
                this.targetFOV = 90;
            } else {
                this.targetCameraPos.set(this.player.mesh.position.x * 0.5, 6, 10);
                this.targetFOV = 60;
            }

            // Smoothly move camera
            this.camera.position.x += (this.targetCameraPos.x - this.camera.position.x) * lerpSpeed * dt;
            this.camera.position.y += (this.targetCameraPos.y - this.camera.position.y) * lerpSpeed * dt;
            this.camera.position.z += (this.targetCameraPos.z - this.camera.position.z) * lerpSpeed * dt;

            // FOV shift
            this.currentFOV += (this.targetFOV - this.currentFOV) * lerpSpeed * dt;
            this.camera.fov = this.currentFOV;
            this.camera.updateProjectionMatrix();
            this.camera.lookAt(0, 0, -5);
>>>>>>> master

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
<<<<<<< HEAD
=======

                // Create Speed Lines
                if (Math.random() > 0.3) {
                    this.particles.createSpeedLine();
                }
>>>>>>> master
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
