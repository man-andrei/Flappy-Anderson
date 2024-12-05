// Get the canvas element and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions to cover a 9-inch display (typically 1280x720 resolution)
canvas.width = 1280;
canvas.height = 720;

// Load images
const images = {
  anderson: loadImage("images/anderson.png"),
  bg: loadImage("images/bg.png"),
  pipeNorth: loadImage("images/pipeNorth.png"),
  pipeSouth: loadImage("images/pipeSouth.png"),
};

// Load sounds
const sounds = {
  fly: new Audio("sounds/fly.mp3"),
  score: new Audio("sounds/score.mp3"),
  death: new Audio("sounds/death.mp3"), // Load death sound
  start: new Audio("sounds/start.mp3"), // Load start sound
};

// Game variables
const gap = 300; // Increase gap between pipes
let constant = 0;
let bgX = 0;
let anderson = { x: 100, y: 150, width: 82.5, height: 54, gravity: 3.5, lift: -70 }; // Adjust gravity and jump height
let score = 0;
let pipes = [];
let gameOver = false;

// Function to initialize the first pipe pair
function initFirstPipe() {
  const pipeNorthHeight = images.pipeNorth.height;
  constant = pipeNorthHeight + gap;

  const minPipeNorthY = -pipeNorthHeight + 50;
  const maxPipeNorthY = canvas.height - constant - 100; // Ensure pipes are above killzone
  const randomY = Math.floor(Math.random() * (maxPipeNorthY - minPipeNorthY + 1) + minPipeNorthY);

  pipes.push({
    x: canvas.width,
    y: randomY,
  });
}

// Event listeners for Anderson movement
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    anderson.y += anderson.lift;
    sounds.fly.play();
  }
});

canvas.addEventListener("click", () => {
  anderson.y += anderson.lift;
  sounds.fly.play();
});

// Utility function to load images
function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

// Draw everything on the canvas
function draw() {
  // Clear canvas and set background color for excess space
  ctx.fillStyle = "#70c5ce";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw and scroll background
  ctx.drawImage(images.bg, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(images.bg, bgX + canvas.width, 0, canvas.width, canvas.height);
  bgX -= 4; // Maintain increased speed
  if (bgX <= -canvas.width) bgX = 0;

  // Draw and update pipes
  pipes.forEach((pipe, index) => {
    const pipeNorthHeight = images.pipeNorth.height;
    constant = pipeNorthHeight + gap;

    ctx.drawImage(images.pipeNorth, pipe.x, pipe.y, images.pipeNorth.width * 1.5, images.pipeNorth.height * 1.5); // Enlarge pipes
    ctx.drawImage(images.pipeSouth, pipe.x, pipe.y + constant, images.pipeSouth.width * 1.5, images.pipeSouth.height * 1.5); // Enlarge pipes

    pipe.x -= 4; // Maintain increased speed

    if (pipe.x === 600) { // Adjust for continuous pipe generation
      const minPipeNorthY = -pipeNorthHeight + 50;
      const maxPipeNorthY = canvas.height - constant - 100; // Ensure pipes are above killzone
      const randomY = Math.floor(Math.random() * (maxPipeNorthY - minPipeNorthY + 1) + minPipeNorthY);

      pipes.push({
        x: canvas.width,
        y: randomY,
      });
    }

    if (pipe.x + images.pipeNorth.width * 1.5 < 0) {
      pipes.splice(index, 1);
    }

    if (
      anderson.x < pipe.x + images.pipeNorth.width * 1.5 &&
      anderson.x + anderson.width > pipe.x &&
      (
        anderson.y < pipe.y + pipeNorthHeight * 1.5 || // Collision with pipeNorth
        anderson.y + anderson.height > pipe.y + constant // Collision with pipeSouth
      )
    ) {
      gameOver = true;
    }
  });

  // Draw Anderson
  ctx.drawImage(images.anderson, anderson.x, anderson.y, anderson.width, anderson.height);

  // Apply gravity
  anderson.y += anderson.gravity;

  // Prevent Anderson from going off-screen
  if (anderson.y < 0) anderson.y = 0;
  if (anderson.y + anderson.height >= canvas.height * 0.925) { // Lower the kill zone further down
    gameOver = true;
  }

  // Update score
  pipes.forEach((pipe) => {
    if (pipe.x === anderson.x) {
      score++;
      sounds.score.play();
    }
  });

  // Draw score
  ctx.fillStyle = "#000";
  ctx.font = "40px Verdana";
  ctx.fillText(`Score: ${score}`, 10, 50);

  // End game if collision occurs
  if (!gameOver) {
    requestAnimationFrame(draw);
  } else {
    // Play death sound
    sounds.death.play();

    // Show the start menu
    document.getElementById("start-menu").style.display = "flex";
  }
}

// Function to play the start sound and start the game
function playStartSound() {
  sounds.start.play();
  startGame();
}

function startGame() {
  // Hide the start menu
  document.getElementById("start-menu").style.display = "none";
  resetGame();
  draw();
}

function resetGame() {
  score = 0;
  bgX = 0;
  anderson = { x: 100, y: 150, width: 82.5, height: 54, gravity: 3.5, lift: -70 }; // Adjust gravity and jump height
  pipes = [];
  gameOver = false;
  initFirstPipe();
}

// Load images and start the game
Promise.all(Object.values(images).map((img) => new Promise((resolve) => (img.onload = resolve)))).then(() => {
  constant = images.pipeNorth.height + gap;
  // Show the start menu initially
  document.getElementById("start-menu").style.display = "flex";
});
