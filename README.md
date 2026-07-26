# Glitch Invaders

A cinematic WebXR arcade breach built with Three.js and Vite. Each cabinet physically ruptures and expands its rules and environment into the room while the rest of the arcade remains visible at the edges of reality.

The current campaign contains nine original arcade-homage worlds with three escalating levels each: formation invasion, asteroid survival, river and traffic crossing, a centipede bio-hive, supernatural tavern service, underground tunnel hunting, jungle traversal, neon champion duels, and an impossible cube temple.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL. When an immersive WebXR headset is available, an **Enter VR** button appears automatically.

## Controls

- `WASD` / arrow keys — move
- `Q` / `E` — rotate body and weapon heading
- `Space` / click / XR trigger — fire
- `Shift` — dash
- `G` — release a fully charged glitch pulse
- `H` — open the in-game field manual
- `P` / `Enter` — pause or resume
- `F` — toggle fullscreen
- `R` — restart after a completed run

In WebXR, walk physically within your guardian or use the left thumbstick for body-relative locomotion. The right thumbstick rotates your body, either trigger fires along its aim, and a face button dashes. The first world begins with calibration instructions; every later cabinet takeover presents that world’s distinct rules before play resumes.

Combat worlds use aim and fire. Crossing worlds reward movement and traffic reading. The cube temple is captured by physically reaching its luminous steps. Clearing a level increases speed, armor, attack density, and objective count; clearing level three ruptures the next cabinet.

## Build

```bash
npm run build
```
