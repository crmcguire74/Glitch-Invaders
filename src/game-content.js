import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const CHAPTERS = [
  { key:'invaders', name:'VOID INVADERS', cabinet:'STAR LEGION', legacy:'FORMATION ASSAULT', texture:'/assets/world-space-v1.png', color:0x63efff, accent:0xff3dba, mechanic:'formation', rule:'Break the descending alien fleet before it reaches the arcade floor.', objective:'DESTROY THE FORMATION' },
  { key:'asteroids', name:'ASTEROID RIFT', cabinet:'ROCK RIFT', legacy:'ZERO-G SURVIVAL', texture:'/assets/world-asteroid-v1.png', color:0xffb65c, accent:0x72ddff, mechanic:'asteroids', rule:'Turn through 360 degrees. Large rocks fracture into fast lethal shards.', objective:'CLEAR THE ASTEROID FIELD' },
  { key:'crossing', name:'CROSSLIGHT RIVER', cabinet:'NIGHT CROSSING', legacy:'TRAFFIC + RIVER', texture:'/assets/world-river-v1.png', color:0x5cf5de, accent:0xff684a, mechanic:'crossing', rule:'Cross every live lane. Read traffic, use moving logs, and reach the far bank.', objective:'REACH THE FAR BANK' },
  { key:'centipede', name:'BIOHIVE DESCENT', cabinet:'HIVE CRAWLER', legacy:'SEGMENT HUNT', texture:'/assets/world-biohive-v1.png', color:0xb7ff5c, accent:0xb665ff, mechanic:'centipede', rule:'Sever the armored brood as it coils through the fungal barricades.', objective:'ERADICATE THE BROOD' },
  { key:'tapper', name:'LAST CALL', cabinet:'NIGHT SHIFT', legacy:'SERVICE PANIC', texture:'/assets/world-tavern-v1.png', color:0xffc268, accent:0x64eaff, mechanic:'tapper', rule:'Serve each charging lane before a patron reaches the counter.', objective:'CLEAR THE BAR LANES' },
  { key:'dig', name:'FAULTLINE MINES', cabinet:'DEEP SIGNAL', legacy:'TUNNEL HUNT', texture:'/assets/world-cavern-v1.png', color:0xff9b54, accent:0x62ffd0, mechanic:'dig', rule:'Hunt tunneling predators and dodge unstable falling stone.', objective:'PURGE THE DEEP TUNNELS' },
  { key:'jungle', name:'RUIN RUNNER', cabinet:'LOST CIRCUIT', legacy:'JUNGLE ESCAPE', texture:'/assets/world-jungle-v1.png', color:0x8cff62, accent:0xffd05b, mechanic:'jungle', rule:'Dash through rolling timber and predators to breach the temple gate.', objective:'REACH THE RUIN GATE' },
  { key:'brawler', name:'NEON CHALLENGER', cabinet:'FINAL ROUND', legacy:'STREET DUEL', texture:'/assets/world-city-v1.png', color:0xff4d62, accent:0x5cdcff, mechanic:'brawler', rule:'Read each champion’s attack tell, strafe, and break their guard.', objective:'DEFEAT THE CHAMPIONS' },
  { key:'cube', name:'CUBE PARADOX', cabinet:'ISO TEMPLE', legacy:'GRAVITY HOP', texture:'/assets/world-cube-v1.png', color:0xc08cff, accent:0x63ffe2, mechanic:'cube', rule:'Claim every luminous step while void hoppers corrupt the pyramid.', objective:'STABILIZE THE CUBE TEMPLE' },
];

const MAT = {
  black: new THREE.MeshPhysicalMaterial({color:0x090b10,metalness:.78,roughness:.22,clearcoat:1,clearcoatRoughness:.12}),
  rubber: new THREE.MeshStandardMaterial({color:0x08090c,roughness:.84,metalness:.08}),
  chrome: new THREE.MeshPhysicalMaterial({color:0xb9c8d3,metalness:1,roughness:.11,clearcoat:1}),
  glass: new THREE.MeshPhysicalMaterial({color:0x8fdfff,transmission:.36,transparent:true,opacity:.48,roughness:.05,metalness:.1,clearcoat:1,side:THREE.DoubleSide}),
  bone: new THREE.MeshStandardMaterial({color:0xe8d7ae,roughness:.57,metalness:.04}),
  earth: new THREE.MeshStandardMaterial({color:0x352318,roughness:.96,metalness:0}),
};

function physical(color, emissive=0x000000, emissiveIntensity=0, roughness=.34, metalness=.62) {
  return new THREE.MeshPhysicalMaterial({color,emissive,emissiveIntensity,roughness,metalness,clearcoat:.85,clearcoatRoughness:.12});
}
function mesh(geometry, material, parent, position=[0,0,0], rotation=[0,0,0], scale=[1,1,1]) {
  const m=new THREE.Mesh(geometry,material);m.position.set(...position);m.rotation.set(...rotation);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function glow(color, intensity=2) { return physical(new THREE.Color(color).multiplyScalar(.26),color,intensity,.18,.48); }
function tube(points, radius, material, parent) {
  const curve=new THREE.CatmullRomCurve3(points);return mesh(new THREE.TubeGeometry(curve,32,radius,7,false),material,parent);
}
function textTexture(chapter) {
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=512;const ctx=canvas.getContext('2d');
  const color=`#${new THREE.Color(chapter.color).getHexString()}`;const accent=`#${new THREE.Color(chapter.accent).getHexString()}`;
  const grad=ctx.createRadialGradient(384,250,8,384,250,420);grad.addColorStop(0,'#17263b');grad.addColorStop(.45,'#080b14');grad.addColorStop(1,'#010204');ctx.fillStyle=grad;ctx.fillRect(0,0,768,512);
  ctx.globalAlpha=.15;for(let y=0;y<512;y+=8){ctx.fillStyle=color;ctx.fillRect(0,y,768,1);}ctx.globalAlpha=1;
  ctx.strokeStyle=color;ctx.lineWidth=8;ctx.strokeRect(22,22,724,468);ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.strokeRect(38,38,692,436);
  ctx.shadowBlur=28;ctx.shadowColor=color;ctx.fillStyle=color;ctx.textAlign='center';ctx.font='900 74px Arial Narrow, sans-serif';ctx.fillText(chapter.cabinet,384,188);
  ctx.shadowBlur=10;ctx.fillStyle='#f7fbff';ctx.font='700 28px monospace';ctx.fillText(chapter.legacy,384,242);
  ctx.strokeStyle=accent;ctx.lineWidth=5;for(let i=0;i<8;i++){const x=164+i*63,y=350+Math.sin(i*2.1)*22;ctx.beginPath();ctx.moveTo(x,y-18);ctx.lineTo(x+18,y);ctx.lineTo(x,y+18);ctx.lineTo(x-18,y);ctx.closePath();ctx.stroke();}
  ctx.fillStyle=accent;ctx.font='700 17px monospace';ctx.fillText('CABINET LINK // ARMED',384,448);
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;
}

export function createArcadeCabinet(chapter, index) {
  const g=new THREE.Group();g.name=`cabinet-${chapter.key}`;
  const sideShape=new THREE.Shape();sideShape.moveTo(-.78,-2.25);sideShape.lineTo(.78,-2.25);sideShape.lineTo(.78,1.34);sideShape.quadraticCurveTo(.76,1.9,.42,2.2);sideShape.lineTo(-.64,2.2);sideShape.quadraticCurveTo(-.86,1.75,-.74,1.12);sideShape.lineTo(-.45,.38);sideShape.lineTo(-.72,-.05);sideShape.closePath();
  const sideGeo=new THREE.ExtrudeGeometry(sideShape,{depth:.095,bevelEnabled:true,bevelSegments:3,bevelSize:.035,bevelThickness:.035});
  const laminate=physical(index%2?0x121721:0x16111b,0x08020c,.22,.28,.72);
  for(const side of [-1,1]){const panel=mesh(sideGeo,laminate,g,[side*1.14,0,0],[0,side*Math.PI/2,0]);panel.geometry.computeVertexNormals();const art=mesh(new RoundedBoxGeometry(1.22,3.42,.035,4,.04),physical(0x121421,chapter.color,.48,.3,.65),g,[side*1.195,-.06,.02],[0,side*Math.PI/2,0]);art.scale.set(.92,1,.92);}
  mesh(new RoundedBoxGeometry(2.26,3.65,1.35,6,.08),MAT.black,g,[0,-.18,-.03]);
  const marquee=mesh(new RoundedBoxGeometry(2.48,.62,1.18,5,.09),glow(chapter.color,1.7),g,[0,1.78,.02],[-.05,0,0]);
  mesh(new THREE.PlaneGeometry(2.12,.42),new THREE.MeshBasicMaterial({map:textTexture(chapter),toneMapped:false}),marquee,[0,0,.6]);
  const screenFrame=mesh(new RoundedBoxGeometry(2.08,1.42,.28,5,.09),physical(0x050608,0x000000,0,.5,.78),g,[0,.67,.46],[-.11,0,0]);
  const screenMat=new THREE.MeshStandardMaterial({map:textTexture(chapter),emissiveMap:textTexture(chapter),emissive:chapter.color,emissiveIntensity:.62,roughness:.2});
  const screen=mesh(new RoundedBoxGeometry(1.76,1.13,.08,10,.16),screenMat,screenFrame,[0,0,.175]);screen.name='screen';
  mesh(new RoundedBoxGeometry(1.82,1.18,.035,10,.17),MAT.glass,screenFrame,[0,0,.225]);
  const deck=mesh(new RoundedBoxGeometry(2.22,.22,.9,5,.08),physical(0x191b25,0x030409,.15,.25,.78),g,[0,-.25,.72],[-.12,0,0]);
  mesh(new THREE.CylinderGeometry(.055,.07,.35,14),MAT.chrome,deck,[-.52,.2,.03],[0,0,-.06]);
  mesh(new THREE.SphereGeometry(.14,20,14),glow(chapter.accent,1.3),deck,[-.54,.39,.01]);
  for(let i=0;i<4;i++)mesh(new THREE.CylinderGeometry(.09,.09,.045,20),glow(i%2?chapter.color:chapter.accent,1.4),deck,[.12+i*.27,.17,.04],[Math.PI/2,0,0]);
  const speaker=mesh(new RoundedBoxGeometry(1.9,.32,.06,3,.04),MAT.rubber,g,[0,-.73,.68]);
  for(let x=-.72;x<=.72;x+=.18)for(let y=-.08;y<=.08;y+=.16)mesh(new THREE.CylinderGeometry(.018,.018,.03,8),MAT.chrome,speaker,[x,y,.04],[Math.PI/2,0,0]);
  const coinDoor=mesh(new RoundedBoxGeometry(1.16,1.18,.08,5,.04),physical(0x101216,0x000000,0,.38,.9),g,[0,-1.48,.66]);
  for(const x of [-.27,.27]){mesh(new RoundedBoxGeometry(.22,.34,.08,4,.03),MAT.chrome,coinDoor,[x,.2,.07]);mesh(new RoundedBoxGeometry(.085,.18,.025,3,.02),glow(0xff442f,1),coinDoor,[x,.2,.125]);}
  mesh(new RoundedBoxGeometry(.7,.2,.04,3,.025),physical(0x1c2028,chapter.color,.38,.3,.85),coinDoor,[0,-.28,.08]);
  for(const x of [-1.04,1.04])for(const y of [-1.96,1.96])mesh(new THREE.CylinderGeometry(.035,.035,.028,12),MAT.chrome,g,[x,y,.73],[Math.PI/2,0,0]);
  const portal=mesh(new THREE.TorusGeometry(1.23,.035,10,72),new THREE.MeshBasicMaterial({color:chapter.color,transparent:true,opacity:0,blending:THREE.AdditiveBlending}),g,[0,.68,.92],[-.11,0,0]);
  const light=new THREE.PointLight(chapter.color,0,9,2);light.position.set(0,.7,1.8);g.add(light);
  g.userData={chapter,index,screen,screenMat,portal,light,baseY:2.28,active:false};
  return g;
}

export function createPlayerCraft() {
  const g=new THREE.Group();const hull=physical(0x172638,0x0b6e92,.8,.17,.88);const accent=glow(0x5cf5ff,2.3);
  mesh(new THREE.CapsuleGeometry(.36,1.25,10,24),hull,g,[0,.1,0],[-Math.PI/2,0,0],[1,1,1.25]);
  const wingShape=new THREE.Shape();wingShape.moveTo(0,-.15);wingShape.lineTo(1.3,.05);wingShape.lineTo(.65,.42);wingShape.lineTo(.18,.28);wingShape.closePath();const wingGeo=new THREE.ExtrudeGeometry(wingShape,{depth:.08,bevelEnabled:true,bevelSegments:2,bevelSize:.04,bevelThickness:.03});
  for(const s of [-1,1]){const wing=mesh(wingGeo,hull,g,[0,.04,.08],[Math.PI/2,0,s<0?Math.PI:0],[s,1,1]);mesh(new THREE.CapsuleGeometry(.11,.58,6,12),accent,wing,[.68,.02,.03],[0,0,Math.PI/2]);}
  const canopy=mesh(new THREE.SphereGeometry(.34,28,18),new THREE.MeshPhysicalMaterial({color:0xff4fa8,emissive:0x8b175f,emissiveIntensity:1.2,transmission:.45,transparent:true,opacity:.88,roughness:.05,clearcoat:1}),g,[0,.3,-.22],[0,0,0],[.72,.52,1.22]);
  mesh(new THREE.TorusGeometry(.32,.025,8,32),MAT.chrome,canopy,[0,0,0],[Math.PI/2,0,0],[.72,1,1.2]);
  const shield=mesh(new THREE.SphereGeometry(1.28,28,18),new THREE.MeshBasicMaterial({color:0x57f6ff,wireframe:true,transparent:true,opacity:.12,blending:THREE.AdditiveBlending}),g);shield.name='shield';
  const flames=[];for(const x of [-.55,.55]){const f=mesh(new THREE.ConeGeometry(.12,.75,16),new THREE.MeshBasicMaterial({color:x<0?0xff4dba:0x5cf5ff,transparent:true,opacity:.76,blending:THREE.AdditiveBlending}),g,[x,.03,.92],[Math.PI/2,0,0]);flames.push(f);}g.userData={shield,flames};return g;
}

function alienDrone(color) {
  const g=new THREE.Group();const armor=physical(0x2c3240,color,.75,.18,.86),bio=physical(0x2d1737,color,1.2,.3,.35),eye=glow(0xff315d,2.8);
  mesh(new THREE.DodecahedronGeometry(.58,1),armor,g,[0,0,0],[0,0,Math.PI/4],[1.25,.6,.92]);
  mesh(new THREE.SphereGeometry(.34,24,16),MAT.glass,g,[0,.12,-.28],[0,0,0],[1.25,.55,.6]);
  for(const x of [-.78,.78]){mesh(new THREE.SphereGeometry(.42,18,12),bio,g,[x,.02,.06],[0,0,0],[1.2,.28,.78]);mesh(new THREE.ConeGeometry(.12,.55,8),armor,g,[x*1.3,-.08,.1],[0,0,x>0?-1.1:1.1]);}
  for(const x of [-.2,.2])mesh(new THREE.SphereGeometry(.075,16,10),eye,g,[x,.1,-.55]);
  for(const x of [-.62,-.2,.2,.62])tube([new THREE.Vector3(x,-.12,.15),new THREE.Vector3(x*1.12,-.5,.18),new THREE.Vector3(x*.8,-.82,-.03)],.035,bio,g);
  return g;
}
function asteroid(size=1,color=0xffb65c) {
  const geo=new THREE.IcosahedronGeometry(.72*size,2);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const v=new THREE.Vector3().fromBufferAttribute(pos,i);const n=.72+Math.sin(v.x*11+v.z*7)*.12+Math.cos(v.y*13)*.08;v.normalize().multiplyScalar(n*size);pos.setXYZ(i,v.x,v.y,v.z);}geo.computeVertexNormals();
  const g=new THREE.Group();mesh(geo,new THREE.MeshStandardMaterial({color:0x514b48,roughness:.92,metalness:.18,flatShading:false}),g);for(let i=0;i<4;i++){const a=i*1.8;mesh(new THREE.OctahedronGeometry(.12*size,1),glow(color,1.8),g,[Math.cos(a)*.6*size,Math.sin(a*.7)*.45*size,Math.sin(a)*.5*size]);}return g;
}
function roadMachine(color) {
  const g=new THREE.Group();const paint=physical(color,0x110000,.2,.15,.76);
  mesh(new RoundedBoxGeometry(1.8,.38,3.2,6,.15),paint,g,[0,.38,0]);mesh(new RoundedBoxGeometry(1.3,.52,1.55,6,.18),MAT.glass,g,[0,.72,-.28]);
  for(const x of [-.78,.78])for(const z of [-1.02,1.02]){mesh(new THREE.CylinderGeometry(.29,.29,.22,18),MAT.rubber,g,[x,.25,z],[0,0,Math.PI/2]);mesh(new THREE.CylinderGeometry(.12,.12,.235,12),MAT.chrome,g,[x,.25,z],[0,0,Math.PI/2]);}
  for(const x of [-.55,.55])mesh(new THREE.CircleGeometry(.13,18),glow(0xfff2b8,3),g,[x,.43,-1.62],[-Math.PI/2,0,0]);return g;
}
function centipede(color) {
  const g=new THREE.Group();const armor=physical(0x24351e,color,1.35,.22,.46);const eye=glow(0xff2f6a,3);
  for(let i=0;i<11;i++){const s=mesh(new THREE.DodecahedronGeometry(i? .34:.5,1),armor,g,[0,0,i*.56]);s.name='segment';mesh(new THREE.TorusGeometry(i?.35:.5,.035,8,22),glow(color,1.6),s,[0,0,0],[Math.PI/2,0,0]);if(i)for(const side of [-1,1]){mesh(new THREE.ConeGeometry(.035,.34,7),MAT.bone,s,[side*.31,-.15,0],[0,0,side*1.05]);}}
  for(const x of [-.18,.18])mesh(new THREE.SphereGeometry(.075,16,10),eye,g,[x,.18,-.43]);for(const x of [-.28,.28])tube([new THREE.Vector3(x,.18,-.35),new THREE.Vector3(x*1.4,.48,-.62),new THREE.Vector3(x*1.8,.3,-.82)],.025,armor,g);return g;
}
function patron(color) {
  const g=new THREE.Group();const cloth=physical(color,0x050505,.1,.55,.12);mesh(new THREE.CapsuleGeometry(.36,.85,8,16),cloth,g,[0,.72,0]);mesh(new THREE.SphereGeometry(.3,24,16),new THREE.MeshStandardMaterial({color:0xa97055,roughness:.7}),g,[0,1.55,0]);
  for(const x of [-.34,.34])tube([new THREE.Vector3(x*.7,1.08,0),new THREE.Vector3(x,.72,-.18),new THREE.Vector3(x*.88,.44,-.4)],.09,cloth,g);
  const mug=mesh(new THREE.CylinderGeometry(.16,.18,.35,18),MAT.chrome,g,[.5,.68,-.4]);mesh(new THREE.TorusGeometry(.14,.035,8,18,Math.PI*1.5),MAT.chrome,mug,[.14,0,0],[Math.PI/2,0,0]);return g;
}
function burrower(color) {
  const g=new THREE.Group();const shell=physical(0x443025,color,.65,.52,.34);mesh(new THREE.CapsuleGeometry(.38,.72,8,18),shell,g,[0,.3,0],[-Math.PI/2,0,0]);
  for(let i=0;i<4;i++)mesh(new THREE.ConeGeometry(.29,.65,10),i%2?MAT.chrome:shell,g,[0,.28,-.62-i*.28],[Math.PI/2,0,i*.38],[1-i*.12,1-i*.12,1-i*.12]);for(const side of [-1,1])for(let i=0;i<3;i++)tube([new THREE.Vector3(side*.25,.2,-.1+i*.28),new THREE.Vector3(side*.58,.05,-.18+i*.3),new THREE.Vector3(side*.7,-.16,-.08+i*.34)],.035,shell,g);return g;
}
function jungleBeast(color) {
  const g=new THREE.Group();const hide=new THREE.MeshStandardMaterial({color,roughness:.78,metalness:.05});mesh(new THREE.CapsuleGeometry(.42,.9,8,18),hide,g,[0,.5,0],[Math.PI/2,0,0],[1,1,1.35]);mesh(new THREE.SphereGeometry(.38,22,16),hide,g,[0,.72,-.72],[0,0,0],[1.1,.85,1.15]);
  for(const x of [-.3,.3])mesh(new THREE.ConeGeometry(.12,.38,10),hide,g,[x,.98,-.76]);for(const x of [-.4,.4])for(const z of [-.35,.35])tube([new THREE.Vector3(x,.38,z),new THREE.Vector3(x*1.18,.08,z+.12),new THREE.Vector3(x*1.22,-.18,z-.05)],.09,hide,g);return g;
}
function fighter(color) {
  const g=new THREE.Group();const cloth=physical(color,0x120408,.18,.5,.18),skin=new THREE.MeshStandardMaterial({color:0xb97956,roughness:.7});mesh(new THREE.CapsuleGeometry(.34,.8,10,18),cloth,g,[0,1.03,0]);mesh(new THREE.SphereGeometry(.28,24,18),skin,g,[0,1.78,0]);
  for(const side of [-1,1]){tube([new THREE.Vector3(side*.28,1.32,0),new THREE.Vector3(side*.58,1.02,-.18),new THREE.Vector3(side*.7,1.3,-.42)],.12,skin,g);tube([new THREE.Vector3(side*.2,.68,0),new THREE.Vector3(side*.32,.24,.12),new THREE.Vector3(side*.42,-.17,-.12)],.14,cloth,g);mesh(new THREE.SphereGeometry(.16,16,10),glow(0xffd25c,1.2),g,[side*.72,1.32,-.44]);}return g;
}
function hopper(color) {
  const g=new THREE.Group();const shell=physical(color,color,.7,.28,.45);mesh(new THREE.DodecahedronGeometry(.52,1),shell,g,[0,.55,0],[0,0,Math.PI/4],[1,.9,.82]);for(const x of [-.23,.23])mesh(new THREE.SphereGeometry(.08,14,10),glow(0xffffb2,2.4),g,[x,.73,-.43]);for(const side of [-1,1]){tube([new THREE.Vector3(side*.28,.35,0),new THREE.Vector3(side*.55,.05,.08),new THREE.Vector3(side*.65,-.15,-.18)],.075,shell,g);mesh(new RoundedBoxGeometry(.38,.12,.5,3,.05),MAT.rubber,g,[side*.7,-.2,-.28]);}return g;
}

export function createEnemyModel(type, color, size=1) {
  const models={invader:()=>alienDrone(color),asteroid:()=>asteroid(size,color),car:()=>roadMachine(color),centipede:()=>centipede(color),patron:()=>patron(color),burrower:()=>burrower(color),beast:()=>jungleBeast(color),fighter:()=>fighter(color),hopper:()=>hopper(color)};
  return (models[type]||models.invader)();
}

function mushroom(parent,x,z,color,scale=1) { const stem=mesh(new THREE.CylinderGeometry(.12,.2,.7,14),MAT.bone,parent,[x,.35,z],[0,0,0],[scale,scale,scale]);mesh(new THREE.SphereGeometry(.42,20,12,0,Math.PI*2,0,Math.PI/2),glow(color,.8),stem,[0,.36,0],[0,0,0],[1.25,.5,1.25]); }
function lamp(parent,x,z,color) { const pole=mesh(new THREE.CylinderGeometry(.055,.08,3.5,12),MAT.chrome,parent,[x,1.75,z]);mesh(new THREE.SphereGeometry(.25,18,12),glow(color,3),pole,[0,1.75,0]);const light=new THREE.PointLight(color,12,8,2);light.position.set(0,1.6,0);pole.add(light); }

export function createEnvironment(chapter, texture, renderer) {
  const g=new THREE.Group();g.name=`world-${chapter.key}`;const animated=[];
  texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=THREE.RepeatWrapping;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const skyMat=new THREE.MeshBasicMaterial({map:texture,side:THREE.BackSide,transparent:true,opacity:0,fog:false,toneMapped:false});const sky=mesh(new THREE.SphereGeometry(38,64,32),skyMat,g,[0,6,-2],[0,Math.PI/2,0],[-1,1,1]);sky.name='world-sky';
  const baseColor={space:0x030710,asteroids:0x151311,crossing:0x07191d,centipede:0x10170b,tapper:0x2a170e,dig:0x27190f,jungle:0x12200c,brawler:0x151017,cube:0x0e0b1d}[chapter.key]||0x080b12;
  const ground=mesh(new THREE.CircleGeometry(18,72),new THREE.MeshPhysicalMaterial({color:baseColor,roughness:chapter.key==='crossing'?.18:.68,metalness:chapter.key==='space'||chapter.key==='cube'?.64:.14,clearcoat:chapter.key==='crossing'?1:.3,transparent:true,opacity:.94}),g,[0,-.035,-2],[-Math.PI/2,0,0]);ground.receiveShadow=true;
  const rim=mesh(new THREE.TorusGeometry(12,.08,10,96),glow(chapter.color,1.2),g,[0,.02,-2],[-Math.PI/2,0,0]);animated.push({mesh:rim,type:'spin',speed:.08});
  if(chapter.key==='space'){for(let i=0;i<22;i++){const p=mesh(new THREE.TetrahedronGeometry(.2+Math.random()*.55),i%3?MAT.chrome:glow(chapter.accent,.8),g,[(Math.random()-.5)*24,1+Math.random()*8,-14+Math.random()*23]);p.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);animated.push({mesh:p,type:'float',base:p.position.y,phase:Math.random()*6,speed:.5+Math.random()});}for(const x of [-5.4,5.4])mesh(new RoundedBoxGeometry(3.4,.8,1.2,6,.18),physical(0x172238,chapter.color,.3,.22,.86),g,[x,.42,-4]);}
  if(chapter.key==='asteroids'){for(let i=0;i<20;i++){const p=asteroid(.35+Math.random()*.8,chapter.color);p.position.set((Math.random()-.5)*25,.3+Math.random()*8,-14+Math.random()*25);p.rotation.set(Math.random()*4,Math.random()*4,Math.random()*4);g.add(p);animated.push({mesh:p,type:'tumble',speed:.08+Math.random()*.24});}for(const x of [-7,7]){const tower=mesh(new THREE.CylinderGeometry(.5,.85,5,16),physical(0x343943,0xff9a3f,.18,.7,.55),g,[x,2.5,-5]);mesh(new THREE.TorusGeometry(1.2,.08,8,36),glow(chapter.color,1),tower,[0,1.8,0],[Math.PI/2,0,0]);}}
  if(chapter.key==='crossing'){for(let lane=0;lane<5;lane++){const z=5-lane*2.6;mesh(new RoundedBoxGeometry(22,.08,1.7,4,.04),physical(lane<2?0x20252a:0x061d24,0x000000,0,lane<2?.48:.16,lane<2?.3:.65),g,[0,.01,z]);for(const x of [-10.5,10.5])lamp(g,x,z,lane<2?0xff9b4a:0x5cf5ff);}for(const z of [-2.8,-5.4,-8]){const log=mesh(new THREE.CylinderGeometry(.32,.42,3.2,14),new THREE.MeshStandardMaterial({color:0x4a2b18,roughness:.95}),g,[(Math.random()-.5)*8,.25,z],[0,0,Math.PI/2]);animated.push({mesh:log,type:'lane',speed:(Math.random()>.5?1:-1)*(1.2+Math.random()),limit:11});}}
  if(chapter.key==='centipede'){for(let i=0;i<34;i++)mushroom(g,(Math.random()-.5)*19,-10+Math.random()*18,i%3?chapter.color:chapter.accent,.55+Math.random()*.8);for(const x of [-8,8])tube([new THREE.Vector3(x,0,-10),new THREE.Vector3(x*.7,4,-2),new THREE.Vector3(x,7,7)],.25,new THREE.MeshStandardMaterial({color:0x28371b,roughness:.95}),g);}
  if(chapter.key==='tapper'){for(const x of [-7,-2.3,2.3,7]){const bar=mesh(new RoundedBoxGeometry(3.5,.85,8,6,.14),physical(0x4c2612,0x5a2104,.12,.25,.25),g,[x,.42,-2]);mesh(new RoundedBoxGeometry(3.65,.12,8.2,5,.05),physical(0x7b481f,0xffa53d,.18,.15,.24),bar,[0,.47,0]);for(let z=-3;z<3;z+=1.1)mesh(new THREE.CylinderGeometry(.08,.12,.45,12),glow(z%2?chapter.color:chapter.accent,.6),bar,[x>0?-.8:.8,.66,z]);}}
  if(chapter.key==='dig'){for(let i=0;i<28;i++){const rock=asteroid(.25+Math.random()*.6,chapter.accent);rock.position.set((Math.random()-.5)*20,.15,-10+Math.random()*19);rock.scale.y=.6;g.add(rock);}for(const x of [-8,8]){tube([new THREE.Vector3(x,0,7),new THREE.Vector3(x*.8,2,-2),new THREE.Vector3(x,5,-11)],.18,physical(0x4e2c18,0xffa14d,.25,.9,.05),g);lamp(g,x*.82,-4,0xffb45c);}}
  if(chapter.key==='jungle'){for(let i=0;i<18;i++){const x=(i%2?-1:1)*(7+Math.random()*4),z=-11+Math.random()*22;const trunk=mesh(new THREE.CylinderGeometry(.28,.5,4+Math.random()*3,14),new THREE.MeshStandardMaterial({color:0x382617,roughness:1}),g,[x,2,z]);for(let j=0;j<4;j++)mesh(new THREE.IcosahedronGeometry(.8+Math.random()*.7,1),new THREE.MeshStandardMaterial({color:j%2?0x244e1c:0x183a17,roughness:.9}),trunk,[(Math.random()-.5)*1.8,2+(Math.random()-.5)*1.3,(Math.random()-.5)*1.8]);}for(let i=0;i<7;i++)tube([new THREE.Vector3(-10+i*3.2,5,-9),new THREE.Vector3(-8+i*2.7,2,-1),new THREE.Vector3(-9+i*3,4,8)],.04,physical(0x456426,0x000000,0,.95,0),g);}
  if(chapter.key==='brawler'){for(const x of [-9,9])for(const z of [-8,-1,6])lamp(g,x,z,x<0?0xff3c59:0x4de6ff);for(const side of [-1,1]){const fence=mesh(new THREE.BoxGeometry(.12,2.2,17),physical(0x252931,0x000000,0,.6,.85),g,[side*7.6,1.1,-2]);for(let z=-8;z<7;z+=.55)mesh(new THREE.CylinderGeometry(.012,.012,2.2,5),MAT.chrome,fence,[0,0,z],[0,0,z%1]);}}
  if(chapter.key==='cube'){for(let y=0;y<5;y++)for(let x=-4+y;x<=4-y;x+=2){const cube=mesh(new RoundedBoxGeometry(1.75,.5,1.75,4,.06),physical((x+y)%4?0x241b38:0x3c2859,chapter.color,.28,.4,.6),g,[x,y*.48,-7+y*1.15]);cube.userData.baseY=cube.position.y;animated.push({mesh:cube,type:'float',base:cube.position.y,phase:x+y,speed:.5});}}
  const particles=[];for(let i=0;i<520;i++)particles.push((Math.random()-.5)*34,Math.random()*13-1,-16+Math.random()*30);const pGeo=new THREE.BufferGeometry();pGeo.setAttribute('position',new THREE.Float32BufferAttribute(particles,3));const points=new THREE.Points(pGeo,new THREE.PointsMaterial({color:chapter.color,size:.055,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));g.add(points);animated.push({mesh:points,type:'spin',speed:.018});
  g.userData={skyMat,animated,ground};return g;
}

export function createCabinetShard(color, position) {
  const size=.08+Math.random()*.22;const m=mesh(new THREE.TetrahedronGeometry(size),Math.random()>.45?glow(color,2):MAT.chrome,new THREE.Group());m.position.copy(position);return m;
}
