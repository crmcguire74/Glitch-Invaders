Original prompt: Build a new virtual reality WebXR game called “Glitch Invaders,” a classic arcade multi-game mashup where enemies escape their original rules and cabinets corrupt one another, with award-winning graphics, story, gameplay, and an immersive Three.js experience.

## Progress
- Initialized a Vite + Three.js project with a cinematic arcade interface and desktop/WebXR presentation.
- Implemented a complete five-breach vertical slice: maze ghosts, falling physical blocks, crossing race cars, ricocheting pinballs, and a map-consuming serpent boss.
- Added movement, firing, dash/invulnerability, glitch pulse, collisions, health, score/combo, boss health, synthesized audio, transmissions, pause/restart/fullscreen, WebXR controller input, `render_game_to_text`, and deterministic `advanceTime`.
- Production build passes. Initial Playwright capture confirmed the title/lobby presentation; the first gameplay run exposed slow software-WebGL bloom, so automated capture now uses the same scene without postprocessing while real play retains bloom.
- Confirmed the gameplay chain from movement and firing through hit detection, enemy removal, score increment, combo, and glitch charge. Removed the unsupported-WebXR button that overlapped the objective in non-XR browsers.
- Playwright phase captures verified falling blocks, race traffic, pinball ricochets, glitch-pulse visuals, the animated serpent body/boss HUD, boss damage, the victory screen, game-over, and pause/resume state. No console/page errors were emitted.
- Direct browser control checks verified Shift dash, G pulse, P pause/resume, and F fullscreen. Final death-state and pause regressions are clean.

## TODO
- Hardware-only follow-up: check comfort, scale, and controller feel in the intended WebXR headset; immersive sessions are not available in the headless test environment.
