import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import './style.css';

const $ = (selector) => document.querySelector(selector);
const ui = {
  title: $('#title-screen'), hud: $('#hud'), pause: $('#pause-screen'), end: $('#end-screen'),
  transmission: $('#transmission'), transmissionText: $('#transmission-text'), speaker: $('#speaker'),
  health: $('#health-fill'), score: $('#score-value'), phaseLabel: $('#phase-label'), phaseName: $('#phase-name'),
  objective: $('#objective'), glitchValue: $('#glitch-value'), glitchRing: $('#glitch-ring'), combo: $('#combo'),
  bossHud: $('#boss-hud'), bossFill: $('#boss-fill'), endTitle: $('#end-title'), endEyebrow: $('#end-eyebrow'),
  endCopy: $('#end-copy'), finalScore: $('#final-score'), xrNote: $('#xr-note'),
};

const phases = [
  { name: 'MAZE LEAK', objective: 'PURGE 8 MAZE PHANTOMS', quota: 8, color: 0xff3ca6,
    story: 'Those ghosts used to fear corners. Out here, they only fear you.' },
  { name: 'BLOCK STORM', objective: 'SHATTER 10 FALLING BARRIERS', quota: 10, color: 0x54f6ff,
    story: 'The puzzle cabinet is building walls in our world. Make your own opening.' },
  { name: 'CROSS TRAFFIC', objective: 'SURVIVE THE RACEWAY COLLISION', quota: 9, color: 0xffc44d,
    story: 'Lap rules are gone. Traffic can cross any game it wants.' },
  { name: 'PINBALL SIEGE', objective: 'BREAK THE RICOCHET PROTOCOL', quota: 8, color: 0xcaff5c,
    story: 'Tilt the odds. Charge a glitch pulse and rewrite the room.' },
  { name: 'WORLD EATER', objective: 'DEFEAT THE SERPENT BEFORE THE MAP IS GONE', quota: 1, color: 0xa865ff,
    story: 'That snake isn’t chasing a high score. It is eating the machine that keeps us real.' },
];

const state = {
  mode: 'title', time: 0, phase: 0, phaseKills: 0, phaseTime: 0, score: 0, health: 100,
  glitch: 0, combo: 0, comboTimer: 0, shotCooldown: 0, dashCooldown: 0, invulnerable: 0,
  spawnTimer: 0, messageTimer: 0, shake: 0, flash: 0, bossHp: 100, bossMax: 100,
  player: { x: 0, z: 5.5, vx: 0, vz: 0 }, keys: {},
};

let audioCtx;
function startAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}
function tone(frequency, duration = .08, type = 'square', volume = .035, slide = 0) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
  osc.type = type; osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(Math.max(30, frequency + slide), audioCtx.currentTime + duration);
  gain.gain.setValueAtTime(volume, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + duration);
  osc.connect(gain).connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + duration);
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03040d);
scene.fog = new THREE.FogExp2(0x07061a, .026);

const camera = new THREE.PerspectiveCamera(54, innerWidth / innerHeight, .1, 150);
camera.position.set(0, 10.5, 15.5);
camera.lookAt(0, 0, -1.4);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
const automatedCapture = navigator.webdriver === true;
renderer.setPixelRatio(automatedCapture ? 1 : Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.xr.enabled = true;
$('#scene').appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 1.25, .7, .13);
composer.addPass(bloom); composer.addPass(new OutputPass());

const world = new THREE.Group(); scene.add(world);
const arena = new THREE.Group(); world.add(arena);
const entityLayer = new THREE.Group(); world.add(entityLayer);
const projectileLayer = new THREE.Group(); world.add(projectileLayer);
const effectsLayer = new THREE.Group(); world.add(effectsLayer);

scene.add(new THREE.HemisphereLight(0x5050aa, 0x080711, 1.1));
const keyLight = new THREE.DirectionalLight(0xa7e7ff, 2.5); keyLight.position.set(-7, 12, 10); keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024); keyLight.shadow.camera.left = -15; keyLight.shadow.camera.right = 15;
keyLight.shadow.camera.top = 15; keyLight.shadow.camera.bottom = -15; scene.add(keyLight);
const magentaLight = new THREE.PointLight(0xff168f, 55, 28, 2); magentaLight.position.set(-9, 5, -5); scene.add(magentaLight);
const cyanLight = new THREE.PointLight(0x22dfff, 50, 28, 2); cyanLight.position.set(9, 4, 2); scene.add(cyanLight);

function mat(color, emissive = color, intensity = .65, roughness = .35, metalness = .65) {
  return new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: intensity, roughness, metalness });
}
const darkMat = mat(0x090b18, 0x01020b, .1, .4, .8);
const cyanMat = mat(0x1f9aaa, 0x39edff, 1.8, .2, .55);
const pinkMat = mat(0x9c1d68, 0xff2e9d, 2, .22, .5);
const limeMat = mat(0x6d8a27, 0xcaff5c, 1.5, .2, .4);

// Floor, grid, and a circular breach aperture.
const floor = new THREE.Mesh(new THREE.PlaneGeometry(34, 36), darkMat); floor.rotation.x = -Math.PI / 2; floor.position.z = -2;
floor.receiveShadow = true; arena.add(floor);
const grid = new THREE.GridHelper(32, 32, 0x3cefff, 0x28274a); grid.position.y = .015; grid.position.z = -2;
grid.material.transparent = true; grid.material.opacity = .32; arena.add(grid);
for (const x of [-9.7, 9.7]) {
  const rail = new THREE.Mesh(new THREE.BoxGeometry(.12, .13, 27), x < 0 ? pinkMat : cyanMat); rail.position.set(x, .08, -1.4); arena.add(rail);
}
const portalRings = [];
for (let i = 0; i < 4; i++) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.5 + i * .34, .025 + i * .012, 8, 96),
    new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff2e9d : 0x4df5ff, transparent: true, opacity: .58 - i * .08 }));
  ring.rotation.x = Math.PI / 2; ring.position.set(0, .035 + i * .006, -7.4); arena.add(ring); portalRings.push(ring);
}

function textTexture(title, subtitle, color) {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 320; const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, 512, 320);
  ctx.strokeStyle = color; ctx.lineWidth = 7; ctx.strokeRect(12, 12, 488, 296);
  ctx.globalAlpha = .18; for (let y = 20; y < 310; y += 12) { ctx.fillStyle = color; ctx.fillRect(18, y, 476, 2); }
  ctx.globalAlpha = 1; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.font = 'bold 66px monospace'; ctx.fillText(title, 256, 138);
  ctx.fillStyle = '#e8eeff'; ctx.font = '24px monospace'; ctx.fillText(subtitle, 256, 190);
  ctx.fillStyle = color; ctx.font = '16px monospace'; ctx.fillText('SIGNAL UNSTABLE', 256, 253);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}

const cabinetScreens = [];
function cabinet(x, z, side, title, subtitle, color) {
  const g = new THREE.Group(); const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 4, 1.45), darkMat); body.castShadow = true; g.add(body);
  const marquee = new THREE.Mesh(new THREE.BoxGeometry(2.12, .55, .08), mat(color, color, 1.4)); marquee.position.set(0, 1.38, .77); g.add(marquee);
  const screenMat = new THREE.MeshBasicMaterial({ map: textTexture(title, subtitle, `#${new THREE.Color(color).getHexString()}`) });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.86, 1.18), screenMat); screen.position.set(0, .45, .741); g.add(screen); cabinetScreens.push(screen);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(2.15, .18, .7), darkMat); deck.position.set(0, -.35, 1); deck.rotation.x = -.18; g.add(deck);
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .35, 8), pinkMat); stick.position.set(-.5, -.12, 1.18); stick.rotation.x = -.12; g.add(stick);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(.12, 12, 8), mat(color, color, 1.7)); ball.position.set(-.5, .08, 1.22); g.add(ball);
  g.position.set(x, 2.03, z); g.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2; arena.add(g); return g;
}
cabinet(-11.1, -8, -1, 'MAZE', 'CORRIDOR PANIC', 0xff3ca6);
cabinet(-11.1, -1.8, -1, 'DROP', 'STACK ERROR', 0x54f6ff);
cabinet(-11.1, 4.4, -1, 'RACE', 'NO BRAKES', 0xffbf36);
cabinet(11.1, -8, 1, 'SNAKE', 'WORLD EATER', 0xa965ff);
cabinet(11.1, -1.8, 1, 'PIN', 'TILT REALITY', 0xcaff5c);
cabinet(11.1, 4.4, 1, 'VOID', 'INSERT SOUL', 0x54f6ff);

// Floating dust catches the neon and adds depth without external assets.
const dustGeo = new THREE.BufferGeometry(); const dustPositions = [];
for (let i = 0; i < 500; i++) dustPositions.push((Math.random() - .5) * 42, Math.random() * 15, (Math.random() - .5) * 42 - 3);
dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dustPositions, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0x72eaff, size: .045, transparent: true, opacity: .58, blending: THREE.AdditiveBlending })); scene.add(dust);

function createPlayer() {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.ConeGeometry(.55, 1.7, 4), cyanMat); core.rotation.x = -Math.PI / 2; core.rotation.z = Math.PI / 4; core.castShadow = true; g.add(core);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(2.1, .12, .58), darkMat); wing.position.z = .3; wing.castShadow = true; g.add(wing);
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(.28, 16, 10), pinkMat); cockpit.scale.set(.72, .45, 1.2); cockpit.position.set(0, .23, -.1); g.add(cockpit);
  for (const x of [-.72, .72]) { const engine = new THREE.Mesh(new THREE.CylinderGeometry(.11, .19, .55, 10), limeMat); engine.rotation.x = Math.PI / 2; engine.position.set(x, 0, .43); g.add(engine); }
  const light = new THREE.PointLight(0x42edff, 12, 5, 2); light.position.y = .5; g.add(light);
  g.position.y = .48; return g;
}
const playerMesh = createPlayer(); entityLayer.add(playerMesh);

const entities = []; const shots = []; const particles = []; const consumedTiles = [];
function disposeObject(obj) { obj.traverse((child) => { if (child.geometry) child.geometry.dispose(); }); obj.removeFromParent(); }
function clearDynamic() {
  for (const e of entities.splice(0)) disposeObject(e.mesh);
  for (const s of shots.splice(0)) disposeObject(s.mesh);
  for (const p of particles.splice(0)) disposeObject(p.mesh);
  for (const t of consumedTiles.splice(0)) disposeObject(t);
}

function ghostMesh(color = 0xff3ca6) {
  const g = new THREE.Group(); const body = new THREE.Mesh(new THREE.SphereGeometry(.6, 18, 12, 0, Math.PI * 2, 0, Math.PI * .72), mat(color, color, 1.25)); body.scale.y = 1.14; g.add(body);
  const skirt = new THREE.Mesh(new THREE.ConeGeometry(.59, .7, 8, 1, true), mat(color, color, 1.05)); skirt.position.y = -.42; skirt.rotation.y = Math.PI / 8; g.add(skirt);
  for (const x of [-.21, .21]) { const eye = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); eye.position.set(x, .14, -.53); g.add(eye); const pupil = new THREE.Mesh(new THREE.SphereGeometry(.052, 8, 6), new THREE.MeshBasicMaterial({color:0x101029})); pupil.position.set(x, .14, -.635); g.add(pupil); }
  return g;
}
function carMesh() {
  const g = new THREE.Group(); const color = Math.random() > .5 ? 0xffa52b : 0x35e9ff;
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.3, .42, 1.05), mat(color, color, 1.1)); body.position.y = .4; g.add(body);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.05, .48, .82), darkMat); cab.position.set(.05, .78, 0); g.add(cab);
  for (const x of [-.68, .72]) for (const z of [-.55, .55]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.18,10), darkMat); w.rotation.x=Math.PI/2; w.position.set(x,.25,z); g.add(w); }
  return g;
}
function serpentMesh() {
  const g = new THREE.Group(); const head = new THREE.Mesh(new THREE.IcosahedronGeometry(.95, 1), mat(0x7343bd, 0xa865ff, 2)); head.scale.set(1.25,.85,1); head.name='head'; g.add(head);
  for (const x of [-.36,.36]) { const eye = new THREE.Mesh(new THREE.SphereGeometry(.13,10,8), limeMat); eye.position.set(x,.18,-.78); g.add(eye); }
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(1.1,.18,.7), pinkMat); jaw.position.set(0,-.45,-.54); g.add(jaw); return g;
}
function addEntity(type, x, z, options = {}) {
  let mesh; let radius = .7; let hp = 1;
  if (type === 'ghost') mesh = ghostMesh(options.color);
  if (type === 'block') { mesh = new THREE.Mesh(new THREE.BoxGeometry(1.45,1.45,1.45), mat(options.color || 0x2295ac, options.color || 0x45eaff, 1.25)); radius=.82; hp=2; mesh.rotation.set(Math.random(),Math.random(),Math.random()); }
  if (type === 'car') { mesh = carMesh(); radius=1.05; hp=2; }
  if (type === 'pinball') { mesh = new THREE.Mesh(new THREE.SphereGeometry(.54,20,14), mat(0xaec3c9,0xcaff5c,1.2,.1,.9)); radius=.55; hp=2; }
  if (type === 'serpent') { mesh = serpentMesh(); radius=1.15; hp=100; }
  mesh.position.set(x, options.y ?? .72, z); mesh.castShadow = true; entityLayer.add(mesh);
  const entity = { type, mesh, x, z, y:options.y ?? .72, radius, hp, maxHp:hp, vx:options.vx || 0, vz:options.vz || 0, age:0, landed:false, phase:Math.random()*6.28 };
  entities.push(entity); return entity;
}

function burst(x, y, z, color, count = 14, speed = 4) {
  for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(new THREE.TetrahedronGeometry(.055 + Math.random() * .08), new THREE.MeshBasicMaterial({ color, transparent:true, blending:THREE.AdditiveBlending }));
    mesh.position.set(x,y,z); effectsLayer.add(mesh); particles.push({mesh,life:.45+Math.random()*.5,vx:(Math.random()-.5)*speed,vy:Math.random()*speed,vz:(Math.random()-.5)*speed});
  }
}
function shoot() {
  if (state.mode !== 'playing' || state.shotCooldown > 0) return;
  state.shotCooldown = .14; const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(.075,.52,4,8), new THREE.MeshBasicMaterial({color:0x8fffff}));
  mesh.rotation.x = Math.PI/2; mesh.position.set(state.player.x,.55,state.player.z-.75); projectileLayer.add(mesh);
  shots.push({mesh,x:mesh.position.x,z:mesh.position.z,vz:-18,life:1.35,radius:.16}); tone(560,.055,'square',.022,220);
}

function damagePlayer(amount, source) {
  if (state.invulnerable > 0 || state.mode !== 'playing') return;
  state.health = Math.max(0, state.health - amount); state.invulnerable = .75; state.shake = .45; state.combo = 0;
  burst(state.player.x,.6,state.player.z,0xff345f,18,5); tone(110,.22,'sawtooth',.055,-55);
  if (state.health <= 0) finish(false, source);
}
function destroyEntity(e, byPulse = false) {
  const index = entities.indexOf(e); if (index < 0) return;
  entities.splice(index,1); const colors={ghost:0xff3ca6,block:0x54f6ff,car:0xffb43b,pinball:0xcaff5c,serpent:0xa865ff};
  burst(e.x,e.mesh.position.y,e.z,colors[e.type], e.type==='serpent'?50:18, e.type==='serpent'?9:5);
  if (e.tail) e.tail.forEach(disposeObject);
  disposeObject(e.mesh);
  if (e.type === 'serpent') { state.phaseKills=1; state.score += 15000; finish(true); return; }
  state.phaseKills++; state.combo++; state.comboTimer=2.5; state.glitch=Math.min(100,state.glitch+(byPulse?4:13));
  state.score += (100 + state.phase * 75) * Math.max(1,state.combo); tone(250 + state.combo*35,.08,'triangle',.03,150);
  if (state.phaseKills >= phases[state.phase].quota) advancePhase();
}
function glitchPulse() {
  if (state.mode !== 'playing' || state.glitch < 100) return;
  state.glitch=0; state.invulnerable=1.2; state.flash=.8; state.shake=.8; tone(75,.7,'sawtooth',.07,620);
  const ring = new THREE.Mesh(new THREE.RingGeometry(.4,.7,64), new THREE.MeshBasicMaterial({color:0xcaff5c,side:THREE.DoubleSide,transparent:true,opacity:.9,blending:THREE.AdditiveBlending}));
  ring.rotation.x=-Math.PI/2; ring.position.set(state.player.x,.12,state.player.z); effectsLayer.add(ring); particles.push({mesh:ring,life:1.05,ring:true});
  [...entities].filter(e => e.type !== 'serpent' && Math.hypot(e.x-state.player.x,e.z-state.player.z)<8).forEach(e=>destroyEntity(e,true));
  const serpent=entities.find(e=>e.type==='serpent'); if(serpent && Math.hypot(serpent.x-state.player.x,serpent.z-state.player.z)<10){serpent.hp-=22;state.bossHp=serpent.hp;if(serpent.hp<=0)destroyEntity(serpent,true);}
}

function showTransmission(text, duration=4.1) { ui.transmissionText.textContent=text; ui.transmission.classList.remove('hidden'); state.messageTimer=duration; }
function advancePhase() {
  if (state.phase >= phases.length-1) return;
  state.phase++; state.phaseKills=0; state.phaseTime=0; state.spawnTimer=.7; state.flash=.55;
  showTransmission(phases[state.phase].story); tone(180,.4,'sine',.05,460);
  if(state.phase===4){ const boss=addEntity('serpent',0,-8,{y:1.05}); boss.hp=100; boss.maxHp=100; state.bossHp=100; }
  updateUI();
}
function finish(won, source='the breach') {
  state.mode = won?'won':'gameover'; ui.hud.classList.add('hidden'); ui.transmission.classList.add('hidden'); ui.end.classList.remove('hidden');
  ui.endEyebrow.textContent = won?'REALITY STABILIZED':'SIGNAL LOST'; ui.endTitle.textContent=won?'BREACH SEALED':'GAME OVER';
  ui.endCopy.textContent = won?'The cabinets are quiet. For now. Mara leaves the last token on the counter—with your name etched into it.':`Your signal was erased by ${source}. The arcade is still hungry.`;
  ui.finalScore.textContent=String(state.score).padStart(6,'0'); tone(won?520:95,won?.8:.6,won?'sine':'sawtooth',.06,won?300:-50);
}

function resetGame() {
  const params = new URLSearchParams(location.search);
  const requestedPhase = automatedCapture ? THREE.MathUtils.clamp(Number(params.get('phase')) || 0, 0, 4) : 0;
  const requestedGlitch = automatedCapture ? THREE.MathUtils.clamp(Number(params.get('glitch')) || 0, 0, 100) : 0;
  const requestedBossHp = automatedCapture ? THREE.MathUtils.clamp(Number(params.get('bossHp')) || 100, 1, 100) : 100;
  clearDynamic(); Object.assign(state,{mode:'playing',time:0,phase:requestedPhase,phaseKills:0,phaseTime:0,score:0,health:100,glitch:requestedGlitch,combo:0,comboTimer:0,shotCooldown:0,dashCooldown:0,invulnerable:0,spawnTimer:.35,messageTimer:0,shake:0,flash:0,bossHp:requestedBossHp});
  Object.assign(state.player,{x:0,z:5.5,vx:0,vz:0}); playerMesh.position.set(0,.48,5.5); playerMesh.visible=true;
  ui.title.classList.add('hidden'); ui.end.classList.add('hidden'); ui.pause.classList.add('hidden'); ui.hud.classList.remove('hidden');
  if (requestedPhase === 4) { const boss = addEntity('serpent',0,-8,{y:1.05}); boss.hp=requestedBossHp; boss.maxHp=100; }
  showTransmission(requestedPhase === 0 ? 'Mara here. The cabinets are cross-wired. Learn their rules before they learn you.' : phases[requestedPhase].story,4.8); updateUI();
}

function spawnForPhase() {
  if(state.phase===0){addEntity('ghost',(Math.random()-.5)*14,-7+Math.random()*3,{color:Math.random()>.75?0x42eaff:0xff3ca6});state.spawnTimer=.8+Math.random()*.55;}
  else if(state.phase===1){const palette=[0x54f6ff,0xff3ca6,0xcaff5c,0xffae3d];addEntity('block',(Math.floor(Math.random()*8)-4)*1.8,-7+Math.random()*9,{y:8+Math.random()*4,color:palette[Math.floor(Math.random()*palette.length)]});state.spawnTimer=.55+Math.random()*.5;}
  else if(state.phase===2){const left=Math.random()>.5;addEntity('car',left?-11:11,-7+Math.random()*10,{vx:(left?1:-1)*(7+Math.random()*3),y:.15});state.spawnTimer=.7+Math.random()*.55;}
  else if(state.phase===3){addEntity('pinball',(Math.random()-.5)*10,-7+Math.random()*4,{vx:(Math.random()>.5?1:-1)*(5+Math.random()*3),vz:4+Math.random()*3,y:.58});state.spawnTimer=.8+Math.random()*.6;}
}

function updateEntities(dt) {
  state.spawnTimer-=dt;
  if(state.phase<4 && state.spawnTimer<=0 && entities.length<15) spawnForPhase();
  for(const e of [...entities]){
    e.age+=dt;
    if(e.type==='ghost'){
      const dx=state.player.x-e.x,dz=state.player.z-e.z,d=Math.hypot(dx,dz)||1; const speed=1.6+state.phase*.1;
      e.x+=dx/d*speed*dt+Math.sin(e.age*5+e.phase)*.55*dt;e.z+=dz/d*speed*dt;e.mesh.position.y=.75+Math.sin(e.age*7+e.phase)*.16;
    }else if(e.type==='block'){
      if(!e.landed){e.y-=7.5*dt;e.mesh.rotation.x+=dt;e.mesh.rotation.y+=dt*1.4;if(e.y<=.75){e.y=.75;e.landed=true;state.shake=.16;tone(90,.12,'square',.025,-20);}}
      e.mesh.position.y=e.y;
    }else if(e.type==='car'){
      e.x+=e.vx*dt;e.mesh.rotation.y=e.vx>0?-Math.PI/2:Math.PI/2;if(Math.abs(e.x)>12.5){entities.splice(entities.indexOf(e),1);disposeObject(e.mesh);state.phaseKills++;state.score+=75;if(state.phaseKills>=phases[state.phase].quota)advancePhase();continue;}
    }else if(e.type==='pinball'){
      e.x+=e.vx*dt;e.z+=e.vz*dt;e.mesh.rotation.x+=e.vz*dt;e.mesh.rotation.z-=e.vx*dt;
      if(Math.abs(e.x)>8.8){e.x=Math.sign(e.x)*8.8;e.vx*=-1;tone(430,.04,'sine',.015,50);} if(e.z>7.8||e.z<-10){e.z=THREE.MathUtils.clamp(e.z,-10,7.8);e.vz*=-1;}
      const barrier=entities.find(b=>b.type==='block'&&Math.hypot(b.x-e.x,b.z-e.z)<1.2);if(barrier){destroyEntity(barrier);e.vx*=-1;e.vz*=-1;}
    }else if(e.type==='serpent'){
      e.x=Math.sin(e.age*.62)*7.1;e.z=-5.7+Math.sin(e.age*1.25)*2.3;e.mesh.rotation.y=Math.sin(e.age*.62)>0?-1.05:1.05;e.mesh.position.y=1.05+Math.sin(e.age*2)*.25;
      // The physical tail is rebuilt as luminous segments that trail the head.
      if(!e.tail){e.tail=[];for(let i=0;i<12;i++){const s=new THREE.Mesh(new THREE.IcosahedronGeometry(.72-i*.025,1),mat(0x351e66,0x7b42d4,1.2));entityLayer.add(s);e.tail.push(s);}}
      e.tail.forEach((s,i)=>{const t=e.age-i*.16;s.position.set(Math.sin(t*.62)*7.1,.65+Math.sin(t*2+i)*.15,-5.7+Math.sin(t*1.25)*2.3+i*.29);s.scale.setScalar(1-i*.035);});
      if(Math.floor(e.age)%4===0 && Math.floor((e.age-dt))%4!==0) consumeTile(e.x,e.z+1.2);
    }
    e.mesh.position.x=e.x;e.mesh.position.z=e.z;
    if(Math.hypot(e.x-state.player.x,e.z-state.player.z)<e.radius+.48){damagePlayer(e.type==='car'?24:e.type==='serpent'?30:13,e.type);if(e.type==='ghost')destroyEntity(e);if(e.type==='car'){e.vx*=-.6;e.x+=Math.sign(e.vx)*1.1;}if(e.type==='pinball'){e.vz*=-1;e.vx+=(Math.random()-.5)*2;}}
  }
}

function consumeTile(x,z){const tile=new THREE.Mesh(new THREE.BoxGeometry(1.2,.08,1.2),new THREE.MeshBasicMaterial({color:0xa865ff,transparent:true,opacity:.7}));tile.position.set(Math.round(x),.06,Math.round(z));arena.add(tile);consumedTiles.push(tile);burst(tile.position.x,.15,tile.position.z,0xa865ff,8,2);if(Math.hypot(tile.position.x-state.player.x,tile.position.z-state.player.z)<1)damagePlayer(10,'an erased map tile');}

function updateShots(dt){
  for(const shot of [...shots]){
    shot.z+=shot.vz*dt;shot.life-=dt;shot.mesh.position.z=shot.z;
    let hit=null;for(const e of entities){if(Math.hypot(e.x-shot.x,e.z-shot.z)<e.radius+shot.radius){hit=e;break;}}
    if(hit){hit.hp--;if(hit.type==='serpent'){hit.hp-=2;state.bossHp=hit.hp;state.score+=40;}burst(shot.x,.7,shot.z,0x8fffff,5,2);if(hit.hp<=0)destroyEntity(hit);shot.life=0;}
    if(shot.life<=0||shot.z<-13){shots.splice(shots.indexOf(shot),1);disposeObject(shot.mesh);}
  }
}

function updateParticles(dt){for(const p of [...particles]){p.life-=dt;if(p.ring){const s=1+(1.05-p.life)*13;p.mesh.scale.setScalar(s);p.mesh.material.opacity=Math.max(0,p.life*.8);}else{p.mesh.position.x+=p.vx*dt;p.mesh.position.y+=p.vy*dt;p.mesh.position.z+=p.vz*dt;p.vy-=6*dt;p.mesh.rotation.x+=dt*6;p.mesh.material.opacity=Math.max(0,p.life*1.5);}if(p.life<=0){particles.splice(particles.indexOf(p),1);disposeObject(p.mesh);}}}

function updatePlayer(dt){
  let dx=(state.keys.KeyD||state.keys.ArrowRight?1:0)-(state.keys.KeyA||state.keys.ArrowLeft?1:0);let dz=(state.keys.KeyS||state.keys.ArrowDown?1:0)-(state.keys.KeyW||state.keys.ArrowUp?1:0);
  if(dx||dz){const len=Math.hypot(dx,dz);dx/=len;dz/=len;}const speed=state.dashCooldown>.7?12:6;
  state.player.vx=THREE.MathUtils.damp(state.player.vx,dx*speed,10,dt);state.player.vz=THREE.MathUtils.damp(state.player.vz,dz*speed,10,dt);
  state.player.x=THREE.MathUtils.clamp(state.player.x+state.player.vx*dt,-8.7,8.7);state.player.z=THREE.MathUtils.clamp(state.player.z+state.player.vz*dt,-9.7,8);
  for(const b of entities.filter(e=>e.type==='block'&&e.landed)){const ddx=state.player.x-b.x,ddz=state.player.z-b.z,d=Math.hypot(ddx,ddz);if(d<1.2){state.player.x=b.x+ddx/(d||1)*1.2;state.player.z=b.z+ddz/(d||1)*1.2;}}
  playerMesh.position.x=state.player.x;playerMesh.position.z=state.player.z;playerMesh.rotation.z=-state.player.vx*.045;playerMesh.rotation.x=-state.player.vz*.025;
  if(renderer.xr.isPresenting) xrRig.position.set(state.player.x,0,state.player.z);
  if(state.keys.Space)shoot();
}

function updateUI(){
  const p=phases[state.phase];ui.health.style.width=`${state.health}%`;ui.score.textContent=String(Math.floor(state.score)).padStart(6,'0');ui.phaseLabel.textContent=`BREACH ${String(state.phase+1).padStart(2,'0')}`;ui.phaseName.textContent=p.name;
  ui.objective.textContent=`${p.objective} // ${state.phaseKills}/${p.quota}`;ui.glitchValue.textContent=Math.floor(state.glitch);ui.glitchRing.classList.toggle('ready',state.glitch>=100);
  ui.combo.textContent=`CHAIN x${state.combo}`;ui.combo.classList.toggle('hidden',state.combo<2);ui.bossHud.classList.toggle('hidden',state.phase!==4);ui.bossFill.style.width=`${Math.max(0,state.bossHp)}%`;
}

function update(dt){
  dt=Math.min(dt,.05);state.time+=dt;dust.rotation.y+=dt*.006;portalRings.forEach((r,i)=>{r.rotation.z+=dt*(.1+i*.035)*(i%2?1:-1);r.material.opacity=.32+Math.sin(state.time*2+i)*.13;});cabinetScreens.forEach((s,i)=>s.material.opacity=.82+Math.sin(state.time*5+i)*.18);
  updateParticles(dt);
  if(state.mode!=='playing')return;
  state.phaseTime+=dt;state.shotCooldown=Math.max(0,state.shotCooldown-dt);state.dashCooldown=Math.max(0,state.dashCooldown-dt);state.invulnerable=Math.max(0,state.invulnerable-dt);state.flash=Math.max(0,state.flash-dt);state.shake=Math.max(0,state.shake-dt);
  if(state.comboTimer>0){state.comboTimer-=dt;if(state.comboTimer<=0)state.combo=0;}if(state.messageTimer>0){state.messageTimer-=dt;if(state.messageTimer<=0)ui.transmission.classList.add('hidden');}
  updatePlayer(dt);updateEntities(dt);updateShots(dt);updateUI();
}

const baseCamera = new THREE.Vector3(0,10.5,15.5);
function render(){
  if(!renderer.xr.isPresenting){camera.position.copy(baseCamera);if(state.shake>0){camera.position.x+=(Math.random()-.5)*state.shake;camera.position.y+=(Math.random()-.5)*state.shake*.45;}camera.lookAt(state.player.x*.12,0,-1.4);if(automatedCapture)renderer.render(scene,camera);else composer.render();}
  else renderer.render(scene,camera);
  renderer.domElement.style.filter=state.flash>0?`brightness(${1+state.flash*1.2}) saturate(${1+state.flash})`:'';
}

let previous=performance.now();
renderer.setAnimationLoop((now)=>{const dt=Math.min((now-previous)/1000,.05);previous=now;update(dt);render();});
window.advanceTime=(ms)=>{const steps=Math.max(1,Math.round(ms/(1000/60)));for(let i=0;i<steps;i++)update(1/60);render();};
window.render_game_to_text=()=>JSON.stringify({
  coordinateSystem:'arena x: left(-) to right(+); z: enemy end(-) to player end(+); y: up',mode:state.mode,
  phase:{index:state.phase+1,name:phases[state.phase].name,progress:state.phaseKills,quota:phases[state.phase].quota,objective:phases[state.phase].objective},
  player:{x:+state.player.x.toFixed(2),z:+state.player.z.toFixed(2),vx:+state.player.vx.toFixed(2),vz:+state.player.vz.toFixed(2),health:state.health,invulnerable:+state.invulnerable.toFixed(2)},
  resources:{score:state.score,glitch:Math.floor(state.glitch),combo:state.combo,shotCooldown:+state.shotCooldown.toFixed(2),dashCooldown:+state.dashCooldown.toFixed(2)},
  enemies:entities.slice(0,18).map(e=>({type:e.type,x:+e.x.toFixed(2),y:+e.mesh.position.y.toFixed(2),z:+e.z.toFixed(2),hp:e.hp,landed:e.landed||undefined})),
  shots:shots.slice(0,12).map(s=>({x:+s.x.toFixed(2),z:+s.z.toFixed(2)})),boss:state.phase===4?{hp:state.bossHp,maxHp:100}:null,paused:state.mode==='paused'
});

function togglePause(forceResume=false){if(state.mode==='playing'&&!forceResume){state.mode='paused';ui.pause.classList.remove('hidden');ui.hud.classList.add('hidden');}else if(state.mode==='paused'){state.mode='playing';ui.pause.classList.add('hidden');ui.hud.classList.remove('hidden');previous=performance.now();}}
function toggleFullscreen(){if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.();}
window.addEventListener('keydown',(e)=>{state.keys[e.code]=true;if(e.code==='Enter'&&state.mode==='title'){startAudio();resetGame();}if(e.code==='Space'){e.preventDefault();shoot();}if(e.code==='KeyG'||e.code==='KeyB')glitchPulse();if((e.code==='ShiftLeft'||e.code==='ShiftRight')&&state.dashCooldown<=0&&state.mode==='playing'){state.dashCooldown=1.15;state.invulnerable=.28;tone(180,.15,'sawtooth',.025,280);}if(e.code==='KeyP')togglePause();if(e.code==='KeyF')toggleFullscreen();if(e.code==='KeyR'&&(state.mode==='gameover'||state.mode==='won'))resetGame();});
window.addEventListener('keyup',(e)=>state.keys[e.code]=false);renderer.domElement.addEventListener('pointerdown',()=>{startAudio();shoot();});
$('#start-btn').addEventListener('click',()=>{startAudio();resetGame();});$('#restart-btn').addEventListener('click',()=>{startAudio();resetGame();});$('#resume-btn').addEventListener('click',()=>togglePause(true));$('#restart-pause-btn').addEventListener('click',resetGame);

window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);});

// WebXR: the room-scale player rig inherits movement while select fires into the breach.
const xrRig=new THREE.Group();scene.add(xrRig);xrRig.add(camera);camera.position.set(0,1.6,0);
const controller=renderer.xr.getController(0);controller.addEventListener('selectstart',()=>{startAudio();shoot();});xrRig.add(controller);
const ray=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,0,-1)]),new THREE.LineBasicMaterial({color:0x54f6ff}));ray.scale.z=3;controller.add(ray);
renderer.xr.addEventListener('sessionstart',()=>{if(camera.parent!==xrRig)xrRig.add(camera);if(state.mode==='title')resetGame();xrRig.position.set(state.player.x,0,state.player.z);playerMesh.visible=false;ui.title.classList.add('hidden');ui.hud.classList.remove('hidden');});
renderer.xr.addEventListener('sessionend',()=>{camera.removeFromParent();scene.add(camera);camera.position.copy(baseCamera);playerMesh.visible=true;});
if(navigator.xr){navigator.xr.isSessionSupported('immersive-vr').then(ok=>{ui.xrNote.textContent=ok?'WebXR headset detected. Enter VR when ready.':'Desktop simulation ready. WebXR headset not detected.';if(ok){const vrButton=VRButton.createButton(renderer);vrButton.id='vr-entry';document.body.appendChild(vrButton);}});}

updateUI();render();
