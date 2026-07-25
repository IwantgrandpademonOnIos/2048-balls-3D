const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const width = canvas.width;
const height = canvas.height;

const gravity = 0.3;
const friction = 0.99;
const ballRadius = 20;

const colors = [
  '#f2e24b', // 2
  '#f28c4b', // 4
  '#f25c4b', // 8
  '#f24b7a', // 16
  '#c84bf2', // 32
  '#4b7af2', // 64
  '#4bf2c8', // 128
  '#4bf24b', // 256
  '#f2c84b', // 512
  '#f24b4b', // 1024
  '#8c4bf2'  // 2048+
];

class Ball {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.value = value; // BigInt for infinite numbers
  }

  update() {
    this.vy += gravity;
    this.vx *= friction;
    this.vy *= friction;

    this.x += this.vx;
    this.y += this.vy;

    // walls
    if (this.x - ballRadius < 0) {
      this.x = ballRadius;
      this.vx *= -0.5;
    }
    if (this.x + ballRadius > width) {
      this.x = width - ballRadius;
      this.vx *= -0.5;
    }
    if (this.y + ballRadius > height) {
      this.y = height - ballRadius;
      this.vy *= -0.5;
    }
  }

  draw() {
    let exponent = Math.log2(Number(this.value));
    let colorIndex = Math.min(colors.length - 1, Math.floor(exponent));
    ctx.fillStyle = colors[colorIndex];

    ctx.beginPath();
    ctx.arc(this.x, this.y, ballRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.value.toString(), this.x, this.y);
  }
}

let balls = [];
let currentValue = 2n; // infinite progression

function spawnBall() {
  const x = width / 2;
  const y = ballRadius + 5;
  const ball = new Ball(x, y, currentValue);
  balls.push(ball);

  currentValue *= 2n; // next ball doubles
}

canvas.addEventListener('click', () => {
  spawnBall();
});

function mergeBalls() {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i];
      const b = balls[j];

      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < ballRadius * 2 && a.value === b.value) {
        const newValue = a.value * 2n;

        const mergedBall = new Ball(
          (a.x + b.x) / 2,
          (a.y + b.y) / 2,
          newValue
        );

        balls.splice(j, 1);
        balls.splice(i, 1);
        balls.push(mergedBall);

        return; // restart merging loop
      }
    }
  }
}

function update() {
  ctx.clearRect(0, 0, width, height);

  balls.forEach(ball => {
    ball.update();
    ball.draw();
  });

  mergeBalls();

  requestAnimationFrame(update);
}

update();
