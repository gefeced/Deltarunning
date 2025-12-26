export class Dialogue {
  constructor({ cps = 34 } = {}) {
    this.cps = cps;
    this.active = false;
    this._lines = [];
    this._lineIndex = 0;
    this._shown = 0;
    this._acc = 0;
  }

  start(lines) {
    this._lines = Array.isArray(lines) ? lines.slice() : [];
    this._lineIndex = 0;
    this._shown = 0;
    this._acc = 0;
    this.active = this._lines.length > 0;
  }

  get done() {
    return !this.active;
  }

  _currentLine() {
    return this._lines[this._lineIndex] ?? "";
  }

  update(dt) {
    if (!this.active) return;
    const line = this._currentLine();
    if (this._shown >= line.length) return;

    this._acc += dt;
    const chars = Math.floor(this._acc * this.cps);
    if (chars <= 0) return;
    this._acc -= chars / this.cps;
    this._shown = Math.min(line.length, this._shown + chars);
  }

  advance() {
    if (!this.active) return;

    const line = this._currentLine();
    if (this._shown < line.length) {
      this._shown = line.length;
      return;
    }

    this._lineIndex += 1;
    this._shown = 0;
    this._acc = 0;
    if (this._lineIndex >= this._lines.length) this.active = false;
  }

  render(ctx, rect) {
    if (!this.active) return;

    const line = this._currentLine();
    const shown = line.slice(0, this._shown);

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1);

    ctx.fillStyle = "#fff";
    ctx.font = "12px Pixel, monospace";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";

    const padding = 8;
    const maxWidth = rect.w - padding * 2;
    const x = rect.x + padding;
    const y = rect.y + padding;
    drawWrappedText(ctx, shown, x, y, maxWidth, 14);

    if (this._shown >= line.length) {
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.textAlign = "right";
      ctx.fillText("Enter", rect.x + rect.w - padding, rect.y + rect.h - padding - 12);
    }

    ctx.restore();
  }
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let cy = y;
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
      continue;
    }
    ctx.fillText(line, x, cy);
    cy += lineHeight;
    line = words[i];
  }
  ctx.fillText(line, x, cy);
}

