import { clamp } from "../systems/collision.js";

export class Player {
  constructor({ name = "Drew", x, y, size = 8, speed = 90, images }) {
    this.name = name;
    this.maxHp = 100;
    this.hp = 100;

    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.images = images;
  }

  get hitbox() {
    return { x: this.x, y: this.y, w: this.size, h: this.size };
  }

  hurt(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }

  update(dt, input, arena) {
    let dx = 0;
    let dy = 0;
    if (input.isDown("left")) dx -= 1;
    if (input.isDown("right")) dx += 1;
    if (input.isDown("up")) dy -= 1;
    if (input.isDown("down")) dy += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
    }

    this.x += dx * this.speed * dt;
    this.y += dy * this.speed * dt;

    this.x = clamp(this.x, arena.x, arena.x + arena.w - this.size);
    this.y = clamp(this.y, arena.y, arena.y + arena.h - this.size);
  }

  render(ctx) {
    const img = this.images?.soul;
    const px = Math.round(this.x);
    const py = Math.round(this.y);

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, px, py, this.size, this.size);
      return;
    }

    ctx.fillStyle = "#f33";
    drawPixelHeart(ctx, px, py, this.size);
  }
}

function drawPixelHeart(ctx, x, y, size) {
  const s = Math.max(1, Math.floor(size / 8));
  const pixels = [
    "01100110",
    "11111111",
    "11111111",
    "11111111",
    "01111110",
    "00111100",
    "00011000",
    "00000000",
  ];

  for (let py = 0; py < 8; py++) {
    for (let px = 0; px < 8; px++) {
      if (pixels[py][px] === "1") ctx.fillRect(x + px * s, y + py * s, s, s);
    }
  }
}

