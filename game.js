const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const GRAVITY = 0.4;
const GROUND_HEIGHT = 120;

// GAME STATE
let gameState = "start";
let score = 0;
let worldSpeed = 3;
let difficultyTimer = 0;

// INPUT
let keys = {};
window.addEventListener("keydown", e => {
  keys[e.key] = true;

  if (gameState === "start" && e.key === " ") startGame();
  else if (gameState === "gameover" && e.key === " ") restartGame();
});
window.addEventListener("keyup", e => keys[e.key] = false);

// START / RESTART
function startGame() {
  gameState = "play";
  score = 0;
  worldSpeed = 3;
  difficultyTimer = 0;
}

function restartGame() {
  player.x = spawnPoint.x;
  player.y = spawnPoint.y;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  obstacles = [];
  creatures = [];
  guardians = [];
  spawnCreatures();
  spawnGuardian();
  startGame();
}

// PLAYER
let spawnPoint = {
  x: canvas.width / 2,
  y: canvas.height - GROUND_HEIGHT - 50
};

let player = {
  x: spawnPoint.x,
  y: spawnPoint.y,
  vx: 0,
  vy: 0,
  speed: 0.2,
  friction: 0.90,
  size: 20,
  onGround: false,
  hitbox: { w: 50, h: 40 }
};

// REALMS
let realms = [
  {
    name: "Neon Horizon",
    top: "#0f1c33",
    bottom: "#1a2a4a",
    fog: "rgba(255,255,255,0.05)",
    creatureType: "jellyfish",
    guardianType: "neonFox"
  },
  {
    name: "Nature Realms",
    top: "#1a4a2a",
    bottom: "#2e6f3a",
    fog: "rgba(255,255,255,0.08)",
    creatureType: "birds",
    guardianType: "treeSpirit"
  },
  {
    name: "Cosmic Drift",
    top: "#12001a",
    bottom: "#2a003f",
    fog: "rgba(200,150,255,0.08)",
    creatureType: "stars",
    guardianType: "cosmicWhale"
  },
  {
    name: "Dark Fantasy",
    top: "#0a0a0a",
    bottom: "#1a0f1a",
    fog: "rgba(50,0,50,0.08)",
    creatureType: "wisps",
    guardianType: "shadowSentinel"
  }
];

let currentRealm = 0;

// BACKGROUND OBJECTS
let stars = [];
for (let i = 0; i < 80; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 1,
    speed: 0.01
  });
}

let clouds = [];
for (let i = 0; i < 6; i++) {
  clouds.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    w: 120 + Math.random() * 100,
    h: 40 + Math.random() * 20,
    speed: 0.2 + Math.random() * 0.3,
    opacity: 0.2 + Math.random() * 0.3
  });
}

let islands = [
  { x: 300, y: 200, w: 200, h: 120 },
  { x: 800, y: 400, w: 250, h: 150 },
  { x: 1200, y: 250, w: 180, h: 100 }
];

// OBSTACLES
let obstacles = [];

function spawnObstacle() {
  const groundY = canvas.height - GROUND_HEIGHT;
  const w = 40 + Math.random() * 40;
  const h = 40 + Math.random() * 30;

  const moving = Math.random() < 0.4;

  obstacles.push({
    x: canvas.width + w,
    y: groundY - h,
    w,
    h,
    vx: moving ? (Math.random() * 2 + 1) : 0,
    type: moving ? "moving" : "static"
  });
}

// PARTICLES (misty dust)
let particles = [];

function spawnParticle() {
  particles.push({
    x: player.x - 10,
    y: player.y + 10,
    vx: (Math.random() - 0.5) * 0.5,
    vy: Math.random() * -0.5,
    size: Math.random() * 3 + 1,
    alpha: 1
  });
}

// CREATURES (ambient)
let creatures = [];

function spawnCreatures() {
  creatures = [];
  let realm = realms[currentRealm];

  let count = 8; // medium amount

  for (let i = 0; i < count; i++) {
    creatures.push({
      type: realm.creatureType,
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height - 200),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: 20 + Math.random() * 20
    });
  }
}

// GUARDIANS (peaceful bosses)
let guardians = [];

function spawnGuardian() {
  guardians = [];
  let realm = realms[currentRealm];

  guardians.push({
    type: realm.guardianType,
    x: canvas.width / 2,
    y: canvas.height / 2 - 100,
    size: 80, // medium guardian
    floatOffset: Math.random() * 100
  });
}
// DRAW CREATURES (ambient)
function drawCreature(c) {
  ctx.save();
  ctx.translate(c.x, c.y);

  if (c.type === "jellyfish") {
    ctx.fillStyle = "rgba(255,150,255,0.7)";
    ctx.beginPath();
    ctx.ellipse(0, 0, c.size, c.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (c.type === "birds") {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.moveTo(-c.size * 0.5, 0);
    ctx.lineTo(0, -c.size * 0.3);
    ctx.lineTo(c.size * 0.5, 0);
    ctx.stroke();
  }

  if (c.type === "stars") {
    ctx.fillStyle = "rgba(200,150,255,0.9)";
    ctx.beginPath();
    ctx.arc(0, 0, c.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  if (c.type === "wisps") {
    ctx.fillStyle = "rgba(80,0,80,0.5)";
    ctx.beginPath();
    ctx.ellipse(0, 0, c.size * 0.4, c.size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// DRAW GUARDIANS (peaceful bosses)
function drawGuardian(g) {
  ctx.save();
  ctx.translate(g.x, g.y + Math.sin(Date.now() / 1000 + g.floatOffset) * 10);

  if (g.type === "neonFox") {
    ctx.fillStyle = "rgba(255,150,80,0.8)";
    ctx.beginPath();
    ctx.ellipse(0, 0, g.size, g.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (g.type === "treeSpirit") {
    ctx.fillStyle = "rgba(80,150,80,0.8)";
    ctx.beginPath();
    ctx.ellipse(0, 0, g.size * 0.8, g.size, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (g.type === "cosmicWhale") {
    ctx.fillStyle = "rgba(150,80,255,0.7)";
    ctx.beginPath();
    ctx.ellipse(0, 0, g.size * 1.5, g.size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (g.type === "shadowSentinel") {
    ctx.fillStyle = "rgba(40,0,40,0.7)";
    ctx.beginPath();
    ctx.ellipse(0, 0, g.size * 0.5, g.size * 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// UPDATE CREATURES
function updateCreatures() {
  for (let c of creatures) {
    c.x += c.vx;
    c.y += c.vy;

    if (c.x < -50) c.x = canvas.width + 50;
    if (c.x > canvas.width + 50) c.x = -50;
    if (c.y < 50) c.y = canvas.height - 200;
    if (c.y > canvas.height - 200) c.y = 50;
  }
}

// UPDATE PARTICLES
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.02;

    if (p.alpha <= 0) particles.splice(i, 1);
  }
}

// DRAW PARTICLES
function drawParticles() {
  for (let p of particles) {
    ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// DRAW FOG LAYER
function drawFog() {
  let realm = realms[currentRealm];
  ctx.fillStyle = realm.fog;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// UPDATE OBSTACLES + REALM SWITCHING (already in PART 1)

// DRAW EVERYTHING
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let realm = realms[currentRealm];

  // background gradient
  let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, realm.top);
  gradient.addColorStop(1, realm.bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // clouds
  for (let cloud of clouds) {
    ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
    ctx.beginPath();
    ctx.ellipse(cloud.x, cloud.y, cloud.w, cloud.h, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // islands
  for (let island of islands) {
    ctx.fillStyle = "#ffffff22";
    let depthScale = island.y / canvas.height;
    let scale = 0.6 + depthScale * 0.4;

    ctx.beginPath();
    ctx.ellipse(
      island.x,
      island.y,
      island.w * scale,
      island.h * scale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // stars
  for (let s of stars) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // fog layer
  drawFog();

  // ambient creatures
  for (let c of creatures) drawCreature(c);

  // guardian
  for (let g of guardians) drawGuardian(g);

  // ground
  ctx.fillStyle = "#2e3b55";
  ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);

  // obstacles
  for (let o of obstacles) drawObstacle(o);

  // particles
  drawParticles();

  // player
  drawPlayer();

  // UI
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "20px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + Math.floor(score), 30, 40);

  ctx.textAlign = "center";
  ctx.font = "28px system-ui, sans-serif";

  if (gameState === "start") {
    ctx.fillText("DRIFTER: REALMS OF HORIZON", canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = "20px system-ui, sans-serif";
    ctx.fillText("Press SPACE to begin", canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText("W to jump, A/D to move", canvas.width / 2, canvas.height / 2 + 40);
  } else if (gameState === "gameover") {
    ctx.fillText("You drifted: " + Math.floor(score) + " m", canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = "20px system-ui, sans-serif";
    ctx.fillText("Press SPACE to try again", canvas.width / 2, canvas.height / 2 + 30);
  }
}

// UPDATE EVERYTHING
function update() {
  updateBackground();

  if (gameState !== "play") return;

  // movement
  player.vy += GRAVITY;

  if (keys["a"]) player.vx -= player.speed;
  if (keys["d"]) player.vx += player.speed;

  if (keys["w"] && player.onGround) {
    player.vy = -10;
    player.onGround = false;
  }

  player.vx *= player.friction;
  player.x += player.vx;
  player.y += player.vy;

  let groundY = canvas.height - GROUND_HEIGHT;
  if (player.y + player.size > groundY) {
    player.y = groundY - player.size;
    player.vy = 0;
    player.onGround = true;
  }

  // realm switching
  if (player.x > canvas.width - 50) {
    currentRealm = (currentRealm + 1) % realms.length;
    player.x = 60;
    obstacles = [];
    spawnCreatures();
    spawnGuardian();
  }

  if (player.x < 50) {
    currentRealm = (currentRealm - 1 + realms.length) % realms.length;
    player.x = canvas.width - 60;
    obstacles = [];
    spawnCreatures();
    spawnGuardian();
  }

  // difficulty
  difficultyTimer += 1;
  if (difficultyTimer % 180 === 0) worldSpeed += 0.4;

  // spawn obstacles
  if (Math.random() < 0.02) spawnObstacle();

  updateObstacles();
  updateCreatures();
  updateParticles();

  // spawn particle trail
  spawnParticle();

  score += 0.1;
}

// GAME LOOP
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

spawnCreatures();
spawnGuardian();
gameLoop();
