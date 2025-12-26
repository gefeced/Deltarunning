import { Dialogue } from "../systems/dialogue.js";
import { ProjectileSystem } from "../systems/projectiles.js";
import { aabbIntersects } from "../systems/collision.js";
import { Player } from "../entities/player.js";
import { Enemy } from "../entities/enemy.js";

const DIALOGUE_LINES = [
  "67: Oh well well well.",
  "If it isn't Kris. Look at wh-",
  "Wait!!",
  "You're not Kris!",
  "It's Drew!",
  "Bro I haven't seen you in so long",
  "Well your time is up",
  "Hope you enjoyed your stay",
  "",
];

export class BattleScene {
  constructor(game) {
    this.game = game;
    this.name = "battle";

    this._uiHeight = 56;
    this._arena = null;

    this.player = null;
    this.enemy = null;
    this.dialogue = new Dialogue({ cps: 36 });
    this.projectiles = null;
    this._combat = false;
    this._hitInvuln = 0;
  }

  enter() {
    const { ui, titleMenu, settingsMenu } = this.game.dom;
    ui.classList.add("hidden");
    titleMenu.classList.add("hidden");
    settingsMenu.classList.add("hidden");

    const w = 200;
    const h = 140;
    const playableH = 240 - this._uiHeight;
    const x = Math.floor((320 - w) / 2);
    const y = Math.floor((playableH - h) / 2) + 10;
    this._arena = { x, y, w, h };

    this.player = new Player({
      x: x + 36,
      y: y + h / 2,
      size: 8,
      speed: 92,
      images: this.game.images,
    });

    this.enemy = new Enemy({
      x: x + w - 24,
      y: y + Math.floor(h / 2),
    });

    this.projectiles = new ProjectileSystem({ arena: this._arena, images: this.game.images });
    this.projectiles.reset();

    this._combat = false;
    this._hitInvuln = 0;

    // Dialogue pauses gameplay until it finishes.
    this.dialogue.start(DIALOGUE_LINES);
    this.game.audio.stopMusic();
  }

  exit() {
    this.game.audio.stopMusic();
  }

  _startCombat() {
    this._combat = true;
    this.projectiles.reset();
    this.game.audio.playBattleMusic();
  }

  update(dt) {
    if (this.player.hp <= 0) return;

    if (this.dialogue.active) {
      this.dialogue.update(dt);
      if (this.game.input.wasPressed("enter")) this.dialogue.advance();
      if (!this.dialogue.active && !this._combat) this._startCombat();
      return;
    }

    if (!this._combat) this._startCombat();

    if (this._hitInvuln > 0) this._hitInvuln = Math.max(0, this._hitInvuln - dt);

    this.player.update(dt, this.game.input, this._arena);
    this.projectiles.update(dt);

    if (this._hitInvuln <= 0) {
      const hb = this.player.hitbox;
      for (let i = this.projectiles.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles.projectiles[i];
        if (aabbIntersects(hb.x, hb.y, hb.w, hb.h, p.x, p.y, p.size, p.size)) {
          this.projectiles.removeAt(i);
          this.player.hurt(p.damage);
          this._hitInvuln = 0.12;
          this.game.audio.playHit();
          break;
        }
      }
    }

    if (this.player.hp <= 0) {
      this.game.audio.stopMusic();
      this.game.transitionTo("death", { holdBlack: true });
    }
  }

  render(ctx) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 320, 240);

    const a = this._arena;
    ctx.fillStyle = "#07070a";
    ctx.fillRect(a.x, a.y, a.w, a.h);
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.strokeRect(a.x + 0.5, a.y + 0.5, a.w - 1, a.h - 1);

    this.enemy.render(ctx);
    this.projectiles.render(ctx);

    if (this._hitInvuln > 0 && this.player.hp > 0) {
      if (((Math.floor(this.game.time * 40) % 2) | 0) === 0) this.player.render(ctx);
    } else {
      this.player.render(ctx);
    }

    this._renderUi(ctx);

    if (this.dialogue.active) {
      this.dialogue.render(ctx, { x: 10, y: 240 - this._uiHeight - 52, w: 300, h: 52 });
    }
  }

  _renderUi(ctx) {
    const y = 240 - this._uiHeight;
    ctx.fillStyle = "rgba(0,0,0,0.9)";
    ctx.fillRect(0, y, 320, this._uiHeight);

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(0, y, 320, 1);

    ctx.fillStyle = "#fff";
    ctx.font = "12px Pixel, monospace";
    ctx.textBaseline = "top";
    ctx.fillText(this.player.name, 12, y + 10);
    ctx.fillText(`HP ${this.player.hp}`, 12, y + 28);

    const barX = 88;
    const barY = y + 30;
    const barW = 220;
    const barH = 10;
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(barX, barY, barW, barH);
    const pct = Math.max(0, this.player.hp / this.player.maxHp);
    ctx.fillStyle = "#f33";
    ctx.fillRect(barX, barY, Math.round(barW * pct), barH);
  }
}
