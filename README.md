# Neon Runner

Neon Runner is a high-octane, 3D infinite runner game set in a futuristic cyberpunk world. Built with performance and aesthetics in mind, it provides a seamless and challenging gaming experience directly in your browser.

---

## Key Features

- **Fast-paced Gameplay**: Navigate through a procedurally generated 3D world.
- **Cyberpunk Aesthetics**: Vibrant neon visuals with dynamic lighting and particle effects.
- **Procedural Generation**: Every run is unique with randomized tracks and obstacles.
- **Immersive Audio**: Integrated sound effects and background music that adapts to the game state.
- **Responsive UI**: Sleek, modern interface designed with custom CSS animations.

---

## Tech Stack

The project leverages modern web technologies to ensure a smooth 60 FPS experience:

| Technology | Purpose |
| :--- | :--- |
| **Three.js** | Core 3D engine for rendering the world, player, and effects. |
| **Vite** | Lightning-fast build tool and development server. |
| **JavaScript (ES6+)** | Logic, physics, and state management. |
| **CSS3** | Premium UI design, glassmorphism, and animations. |
| **HTML5** | Semantic structure and Canvas integration. |

---

## Project Structure

The codebase is modularized to maintain a clean separation of concerns:

```text
neon_run/
├── node_modules/       # Project dependencies
├── src/
│   ├── game/           # Core Game Logic
│   │   ├── Audio.js     # Sound management & background music
│   │   ├── Game.js      # Main game loop & state controller
│   │   ├── Particles.js # Special effects & visual flair
│   │   ├── Player.js    # Character physics & input handling
│   │   └── World.js     # Track & obstacle generation logic
│   └── main.js         # Entry point for initialization
├── index.html          # Main application structure & UI overlays
├── style.css           # Global styles and UI animations
├── package.json        # Project metadata and scripts
└── README.md           # Documentation
```

---

## Getting Started

### Prerequisites

Ensure you have **Node.js** and **npm** installed on your system.

### Installation

1. Clone the repository or extract the files.
2. Navigate to the project directory:
   ```bash
   cd neon_run
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the development server and play the game:
```bash
npm run dev
```
Follow the local link (usually `http://localhost:5173`) in your browser.

---

## Controls

- **Arrow Left / Right**: Lane switching
- **Arrow Up / Space**: Jump
- **Settings Menu**: Adjust difficulty and audio levels

---

## Credits

**Designed & Developed by Srinivas**

*Pushing the limits of web-based 3D gaming.*