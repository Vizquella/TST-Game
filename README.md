# 🎮 Tetris 3D — Seasons Edition

<p align="center">
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/Vizquella/TST-Game?style=for-the-badge&logo=opensourceinitiative&logoColor=white&color=blue" alt="License: MIT">
  </a>
  <a href="https://threejs.org/docs/" target="_blank">
    <img src="https://img.shields.io/badge/Three.js-r128-black?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js Documentation">
  </a>
  <a href="https://www.w3.org/TR/webaudio/" target="_blank">
    <img src="https://img.shields.io/badge/Web_Audio_API-W3C_Spec-059669?style=for-the-badge&logo=w3c&logoColor=white" alt="Web Audio API W3C Specification">
  </a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
    <img src="https://img.shields.io/badge/JavaScript-ES2020+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript MDN Docs">
  </a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API" target="_blank">
    <img src="https://img.shields.io/badge/WebGL-2.0-990000?style=for-the-badge&logo=webgl&logoColor=white" alt="WebGL 2.0 API">
  </a>
</p>

A lightweight, zero-dependency 3D Tetris game running purely in the browser. Built from scratch with **Three.js** and **vanilla JavaScript**, featuring 5 reactive seasonal environments, real-time procedural Web Audio soundscapes, standard Super Rotation System (SRS) mechanics, and full mobile touch & haptic controls.

---

## ✨ Features

### 🎨 5 Reactive Environments (Seasons)
Switch themes instantly from the top HUD without reloading:
- 🎄 **Christmas:** Falling 3D snow particles with wind drift, snow-capped low-poly pine trees, wrapped holiday presents, animated fairy lights strung across the pillars, frosty crystal block materials, and winter bell arpeggios.
- 🎃 **Halloween:** Rising embers and purple fog, carved 3D Jack-o'-lanterns with flickering candle point lights, floating ghosts, gravestones, and eerie minor-key theremin synths.
- ☀️ **Summer:** Sparkling sunlight motes, swaying coconut palm trees, sandy platform, beach umbrella, bouncing beach ball, translucent jelly block materials, and upbeat tropical marimba chords.
- ⚡ **Storm:** Driving torrential rain streaks, ground splash ripples, high-voltage lightning towers, 3D branching lightning strikes that illuminate the scene, screen shake, and synthesized deep thunder rumbles.
- 🌸 **Spring:** Blooming Japanese Sakura (Cherry Blossom) trees, 3D flower garden beds, 900 swirling petals tumbling in the spring breeze, pastel porcelain blocks, and relaxing harp melodies with procedural bird chirps.

### 🧱 Authentic Tetris Mechanics
- **Super Rotation System (SRS):** Full guideline-compliant wall kick data for J, L, S, T, Z, and I tetrominoes.
- **7-Bag Randomizer:** Guarantees fair piece distribution without piece droughts.
- **Ghost Piece:** Holographic landing projection for precise placements.
- **Hold Slot:** Swap pieces once per drop with the Hold box or `C`/`Shift`.
- **Lock Delay:** 500ms manipulation grace period with move reset limits.
- **Competitive Scoring:** Single, Double, Triple, Tetris (4-line), Back-to-Back Tetris bonus, drop points, combo multipliers, and persistent high scores via `localStorage`.

### 🔊 100% Procedural Sound & BGM Engine
- Zero external MP3/WAV files — loads instantly and works 100% offline.
- Synthesized entirely in code using the **Web Audio API** (OscillatorNodes, GainNodes, BiquadFilters, and custom pink/brown noise buffers).
- Distinct procedurally sequenced background music and sound effects tailored to each theme, including an algorithmic thunder generator and bird chirp synthesizer.

### 📱 Responsive Mobile & Touch Controls
- **Ergonomic Virtual Gamepad:**
  - Left thumb: `◀` Move Left, `▼` Soft Drop (rapid auto-repeat), `▶` Move Right.
  - Right thumb: Prominent `⚡ Hard Drop`, primary `↻ Rotate CW`, `↺ Rotate CCW`, and `⤾ Hold`.
- **Canvas Touch Gestures:** Swipe left/right/down directly on the 3D board, tap to rotate, and 2-finger drag to orbit camera.
- **Haptic Vibration:** Tactile feedback on moves, rotations, hard drops, and line clears (`navigator.vibrate`).
- **Aspect-Aware 3D Camera:** The camera distance dynamically recalculates based on screen aspect ratio so the 10x20 board never gets cut off on tall phone screens or landscape orientations.

---

## 🕹️ Controls

### Keyboard (Desktop)

| Key | Action |
|---|---|
| `←` / `→` or `A` / `D` | Move Left / Right (DAS & ARR auto-repeat enabled) |
| `↑` or `W` or `X` | Rotate Clockwise |
| `Z` | Rotate Counter-Clockwise |
| `↓` or `S` | Soft Drop |
| `Space` | Hard Drop (Instant drop & lock) |
| `C` or `Shift` | Hold Piece |
| `P` or `Esc` | Pause / Resume |
| `R` | Restart Game |
| `Mouse Drag` | Orbit 3D Camera freely |

### Touch / Mobile

| Gesture / Button | Action |
|---|---|
| Virtual D-Pad (`◀` `▼` `▶`) | Move and soft drop |
| Virtual Actions (`↻` `↺` `⚡` `⤾`) | Rotate, hard drop, and hold |
| Tap Top-Left **HOLD** Card | Instantly swap held piece |
| Tap **📷** Header Icon | Cycle 3D Camera presets (`3D Angled`, `Classic 2D`, `Isometric`, `Top View`) |
| Swipe on Canvas | Swipe Left/Right to move, Swipe Down to soft drop, Tap to rotate |
| 2-Finger Drag on Canvas | Orbit 3D camera angle |

---

## 📂 Project Architecture

```
tetris-3d/
├── index.html         # Main markup, HUD overlays, modals & mobile gamepad
├── style.css          # Glassmorphism styling, theme definitions & responsive media queries
├── tetris.js          # Pure game logic (SRS wall kicks, 7-bag, scoring, ghost calculation)
├── renderer3d.js      # Three.js engine (lighting, materials, particles, camera & 3D theme props)
├── audio.js           # Web Audio API procedural sound effects & seasonal BGM sequencers
├── main.js            # Input orchestration, DAS/ARR keyboard engine, touch gestures & state glue
├── lib/
│   ├── three.min.js   # Three.js r128 (bundled for 100% offline capability)
│   └── OrbitControls.js
├── LICENSE            # MIT License
└── README.md
```

---

## 🚀 Getting Started

No build tools, bundlers, or node packages required. Simply open `index.html` in any modern web browser:

```bash
# Option 1: Direct open
# Double-click index.html or open via browser

# Option 2: Run a local static server
python -m http.server 8080 --directory .

# Then navigate to:
http://localhost:8080
```

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
