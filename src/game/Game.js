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

        // Target Camera settings for interpolation
        this.targetCameraPos = new THREE.Vector3(0, 6, 10);
        this.targetFOV = 60;
        this.currentFOV = 60;

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

        // UI Elements
        this.mainMenu = document.getElementById('main-menu');
        this.settingsMenu = document.getElementById('settings-menu');
        this.gameUI = document.getElementById('game-ui');
        this.startScreen = document.getElementById('start-screen');
        this.pauseMenu = document.getElementById('pause-menu');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.pauseBtn = document.getElementById('pause-btn');

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
        this.clock = new THREE.Clock();
        this.isPlaying = false;
        this.isPaused = false;
        this.hasSpeedAbility = false;
        this.isSpeedBoosting = false;
        this.hasMagnet = false;
        this.hasShield = false;
        this.shakeIntensity = 0;

        this.audio = new Audio();
        this.particles = new Particles(this);
        this.world = new World(this);
        this.player = new Player(this);

        this.setupUI();
        this.animate();

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }



    updateHighScoreUI() {
        if (this.highScoreElement) {
            this.highScoreElement.innerText = `High Score: ${this.highScore}`;
        }
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

        // Pause Logic
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        document.getElementById('resume-btn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restart-pause-btn').addEventListener('click', () => this.startGame());
        document.getElementById('exit-pause-btn').addEventListener('click', () => this.showHome());

        // Keyboard Pause (Escape or P)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
                if (this.isPlaying && !this.gameOverScreen.classList.contains('hidden')) return;
                if (this.isPlaying) this.togglePause();
            }
        });
    }

    showHome() {
        this.isPlaying = false;
        this.isPaused = false;
        this.mainMenu.classList.remove('hidden');
        this.settingsMenu.classList.add('hidden');
        this.gameUI.classList.add('hidden');
        this.pauseMenu.classList.add('hidden');
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

        // Update instruction text for mobile
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        const instruction = document.getElementById('start-instruction');
        if (isTouch && instruction) {
            instruction.innerText = 'Swipe to Move & Jump\nDouble Tap for Speed';
        }
        this.pauseBtn.classList.add('hidden'); // Hide pause button on start screen
    }

    startGame() {
        this.isPlaying = true;
        this.score = 0;
        this.updateScore(0);
        this.hasSpeedAbility = false;
        this.isSpeedBoosting = false;
        this.hasMagnet = false;
        this.hasShield = false;

        if (this.speedTimeout) clearTimeout(this.speedTimeout);
        if (this.magnetTimeout) clearTimeout(this.magnetTimeout);
        if (this.shieldTimeout) clearTimeout(this.shieldTimeout);

        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.pauseMenu.classList.add('hidden');
        this.pauseBtn.classList.remove('hidden');
        this.isPaused = false;

        // Apply Difficulty
        let baseSpeed = 10;
        if (this.difficulty === 'easy') baseSpeed = 7;
        if (this.difficulty === 'hard') baseSpeed = 15;
        this.world.baseSpeed = baseSpeed;

        this.world.reset();
        this.player.reset();
    }

    gameOver() {
        this.isPlaying = false;

        // Check High Score
        if (this.score > this.highScore) {
            this.highScore = Math.floor(this.score);
            localStorage.setItem('highscore', this.highScore);
            this.updateHighScoreUI();
            this.highScoreElement.style.color = '#00ff00'; // Highlight new record
            this.highScoreElement.style.transform = 'scale(1.5)';
            setTimeout(() => {
                this.highScoreElement.style.color = '#ffff00';
                this.highScoreElement.style.transform = 'scale(1)';
            }, 1000);
        }

        this.finalScoreElement.innerText = `Score: ${Math.floor(this.score)}`;
        this.gameOverScreen.classList.remove('hidden');
        this.pauseBtn.classList.add('hidden');
        this.audio.playCrash();
        this.particles.createExplosion(this.player.mesh.position, 0xff0000, 20); // Boom
    }

    togglePause() {
        if (!this.isPlaying) return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.pauseMenu.classList.remove('hidden');
            this.pauseBtn.innerText = '▶';
        } else {
            this.resumeGame();
        }
    }

    resumeGame() {
        this.isPaused = false;
        this.pauseMenu.classList.add('hidden');
        this.pauseBtn.innerText = 'II';
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
        if (this.speedTimeout) clearTimeout(this.speedTimeout);
        this.hasSpeedAbility = true;

        // Visual notification
        const msg = document.createElement('div');
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        msg.innerText = isTouch ? "SPEED BOOST UNLOCKED! DOUBLE TAP!" : "SPEED BOOST UNLOCKED! HOLD SPACE!";
        msg.style.position = 'absolute';
        msg.style.top = '20%';
        msg.style.width = '100%';
        msg.style.textAlign = 'center';
        msg.style.color = '#00ffff';
        msg.style.fontSize = '30px';
        msg.style.fontWeight = 'bold';
        msg.style.textShadow = '0 0 10px #00ffff';
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

        if (this.isPlaying && !this.isPaused) {
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

                // Create Speed Lines
                if (Math.random() > 0.3) {
                    this.particles.createSpeedLine();
                }
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
