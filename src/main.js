import { Game } from './game/Game.js';

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();

    // global access for debugging
    window.game = game;
});
