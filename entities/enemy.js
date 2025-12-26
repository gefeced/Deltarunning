export class Enemy {
  constructor({ name = "67", x, y }) {
    this.name = name;
    this.x = x;
    this.y = y;
  }

  render(ctx) {
    const x = Math.round(this.x);
    const y = Math.round(this.y);

    ctx.fillStyle = "#111";
    ctx.fillRect(x - 12, y - 10, 24, 20);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.strokeRect(x - 12 + 0.5, y - 10 + 0.5, 24 - 1, 20 - 1);
    ctx.fillStyle = "#fff";
    ctx.font = "10px Pixel, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.name, x, y);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }
}

