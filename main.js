const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreText = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

// Game settings
canvas.width = 800;
canvas.height = 600;

let score = 0;
let isGameOver = false;
let bullets = [];
let spawnRate = 200; // milliseconds
let lastSpawnTime = 0;
let gameStartTime = 0;

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  color: '#3498db',
  targetX: canvas.width / 2,
  targetY: canvas.height / 2
};

class Bullet {
  constructor() {
    this.radius = 4 + Math.random() * 4;
    this.color = '#e74c3c';
    
    // Random spawn location from edges
    const side = Math.floor(Math.random() * 4);
    if (side === 0) { // Top
      this.x = Math.random() * canvas.width;
      this.y = -this.radius;
    } else if (side === 1) { // Right
      this.x = canvas.width + this.radius;
      this.y = Math.random() * canvas.height;
    } else if (side === 2) { // Bottom
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + this.radius;
    } else { // Left
      this.x = -this.radius;
      this.y = Math.random() * canvas.height;
    }

    // Velocity towards player with some randomness
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    const speed = 2 + Math.random() * 3 + (score / 1000); // Speed increases with score
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  isOffScreen() {
    return (
      this.x < -this.radius * 2 ||
      this.x > canvas.width + this.radius * 2 ||
      this.y < -this.radius * 2 ||
      this.y > canvas.height + this.radius * 2
    );
  }
}

function init() {
  score = 0;
  isGameOver = false;
  bullets = [];
  gameStartTime = Date.now();
  lastSpawnTime = 0;
  spawnRate = 200;
  
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  
  gameOverScreen.classList.add('hidden');
  scoreDisplay.textContent = `Score: 0`;
  canvas.style.cursor = 'none';
  
  requestAnimationFrame(gameLoop);
}

function update(timestamp) {
  if (isGameOver) return;

  // Update score based on survival time
  score = Math.floor((Date.now() - gameStartTime) / 100);
  scoreDisplay.textContent = `Score: ${score}`;

  // Smooth player movement towards mouse
  player.x += (player.targetX - player.x) * 0.2;
  player.y += (player.targetY - player.y) * 0.2;

  // Boundary check
  player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

  // Spawn bullets
  const difficultyAdjustedSpawnRate = Math.max(50, spawnRate - Math.floor(score / 50));
  if (timestamp - lastSpawnTime > difficultyAdjustedSpawnRate) {
    bullets.push(new Bullet());
    lastSpawnTime = timestamp;
  }

  // Update bullets and check collisions
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.update();

    // Collision detection (Circle-Circle)
    const dx = player.x - b.x;
    const dy = player.y - b.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.radius + b.radius) {
      endGame();
    }

    if (b.isOffScreen()) {
      bullets.splice(i, 1);
    }
  }
}

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.fill();
  ctx.shadowBlur = 10;
  ctx.shadowColor = player.color;
  ctx.closePath();
  ctx.shadowBlur = 0; // Reset shadow

  // Draw bullets
  bullets.forEach(b => b.draw());
}

function gameLoop(timestamp) {
  update(timestamp);
  draw();

  if (!isGameOver) {
    requestAnimationFrame(gameLoop);
  }
}

function endGame() {
  isGameOver = true;
  canvas.style.cursor = 'default';
  gameOverScreen.classList.remove('hidden');
  finalScoreText.textContent = `Final Score: ${score}`;
}

// Event Listeners
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  player.targetX = e.clientX - rect.left;
  player.targetY = e.clientY - rect.top;
});

restartButton.addEventListener('click', init);

// Start the game
init();
