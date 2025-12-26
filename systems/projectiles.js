const MAX_SPAWNS_PER_FRAME = 200;

export class ProjectileSystem {
  constructor({ arena, images }) {
    this.arena = arena;
    this.images = images;
    this.projectiles = [];

    this._t = 0;
    this._acc = 0;
    this._baseRate = 5;
    this._ramp = 0.4;
  }

  reset() {
    this.projectiles.length = 0;
    this._t = 0;
    this._acc = 0;
  }

  update(dt) {
    this._t += dt;
    const rate = this._baseRate + this._t * this._ramp;
    const interval = 1 / Math.max(0.0001, rate);
    this._acc += dt;

    let spawns = 0;
    while (this._acc >= interval && spawns < MAX_SPAWNS_PER_FRAME) {
      this._acc -= interval;
      this.spawnInward();
      spawns += 1;
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (
        p.x + p.size < this.arena.x ||
        p.y + p.size < this.arena.y ||
        p.x > this.arena.x + this.arena.w ||
        p.y > this.arena.y + this.arena.h
      ) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  spawnInward() {
    const { x, y, w, h } = this.arena;
    const edge = Math.floor(Math.random() * 4);

    let sx = 0;
    let sy = 0;
    if (edge === 0) {
      sx = x + Math.random() * w;
      sy = y - 8;
    } else if (edge === 1) {
      sx = x + w + 8;
      sy = y + Math.random() * h;
    } else if (edge === 2) {
      sx = x + Math.random() * w;
      sy = y + h + 8;
    } else {
      sx = x - 8;
      sy = y + Math.random() * h;
    }

    const tx = x + w / 2 + (Math.random() * 40 - 20);
    const ty = y + h / 2 + (Math.random() * 40 - 20);
    let dx = tx - sx;
    let dy = ty - sy;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;

    const speed = 70 + Math.random() * 55 + this._t * 0.9;
    const size = 8;
    const imgKey = Math.random() < 0.5 ? "enemy6" : "enemy7";

    this.projectiles.push({
      x: sx,
      y: sy,
      vx: dx * speed,
      vy: dy * speed,
      size,
      imgKey,
      damage: 10,
    });
  }

  removeAt(index) {
    this.projectiles.splice(index, 1);
  }

  render(ctx) {
    for (const p of this.projectiles) {
      const img = this.images[p.imgKey];
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, Math.round(p.x), Math.round(p.y), p.size, p.size);
      } else {
        ctx.fillStyle = "#7bf";
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
    }
  }
}
