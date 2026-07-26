Original prompt: Build a new virtual reality WebXR game called “Glitch Invaders,” a classic arcade multi-game mashup where enemies escape their original rules and cabinets corrupt one another, with award-winning graphics, story, gameplay, and an immersive Three.js experience.

## Progress
- Initialized a Vite + Three.js project with a cinematic arcade interface and desktop/WebXR presentation.
- Implemented a complete five-breach vertical slice: maze ghosts, falling physical blocks, crossing race cars, ricocheting pinballs, and a map-consuming serpent boss.
- Added movement, firing, dash/invulnerability, glitch pulse, collisions, health, score/combo, boss health, synthesized audio, transmissions, pause/restart/fullscreen, WebXR controller input, `render_game_to_text`, and deterministic `advanceTime`.
- Production build passes. Initial Playwright capture confirmed the title/lobby presentation; the first gameplay run exposed slow software-WebGL bloom, so automated capture now uses the same scene without postprocessing while real play retains bloom.
- Confirmed the gameplay chain from movement and firing through hit detection, enemy removal, score increment, combo, and glitch charge. Removed the unsupported-WebXR button that overlapped the objective in non-XR browsers.
- Playwright phase captures verified falling blocks, race traffic, pinball ricochets, glitch-pulse visuals, the animated serpent body/boss HUD, boss damage, the victory screen, game-over, and pause/resume state. No console/page errors were emitted.
- Direct browser control checks verified Shift dash, G pulse, P pause/resume, and F fullscreen. Final death-state and pause regressions are clean.
- Iteration 2: hardened input focus and document-level key capture, added XR thumbstick locomotion and XR dash-button polling, visible engine thrust/shield feedback, and a two-step movement/fire calibration that blocks spawns until controls are proven.
- Added an always-available gameplay control ribbon and H-key field manual.
- Visual upgrade pass: animated signal-floor shader, dimensional reactor with kinetic rings/shards, architectural cabinet bays, animated corruption conduits, higher-detail cabinets, engine flames/shield, richer ghosts/cars/blocks/pinballs/serpent geometry, and a vignette/chromatic/grain cinema pass.
- Added a headset-visible 3D calibration panel and two-controller trigger rays so instructions are not limited to desktop DOM overlays.
- Final visual reviews covered the title, tutorial, field manual, every genre phase, pause, game-over, and victory screens. WASD movement reached `x=-6.96`; pointer-start + focused movement reached `x=-2.45`; firing damaged the boss; the tutorial completed into live combat; no console/page errors were produced.
- Iteration 3: added body-relative left-stick/WASD walking, smooth right-stick body rotation with Q/E desktop parity, rig-relative XR orientation, and body/controller-directed projectile vectors.
- Generated an original high-resolution obsidian circuit-maze texture with the built-in image generation path, saved it as `public/assets/corruption-circuit-v1.png`, and applied it to PBR reactor walls, side walls, and arcade cabinet cladding.
- Rebuilt player, vehicle, falling-block, and cabinet forms with rounded geometry, clearcoat/transmission materials, and more detailed silhouettes.
- Rebuilt the serpent boss as a layered biomechanical creature with circuit-mapped armor, inset eye sockets, snout/jaw/teeth, a five-spike crown, fourteen articulated armored segments, emissive segment rings, and a live energy spine.

## TODO
- Hardware-only follow-up: check comfort, scale, and controller feel in the intended WebXR headset; immersive sessions are not available in the headless test environment.
