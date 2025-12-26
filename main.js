import { Input } from "./systems/input.js";
import { AudioSystem } from "./systems/audio.js";
import { TitleScene } from "./scenes/title.js";
import { SettingsScene } from "./scenes/settings.js";
import { BattleScene } from "./scenes/battle.js";

// Fixed internal resolution for pixel-art scaling.
const INTERNAL_WIDTH = 320;
const INTERNAL_HEIGHT = 240;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function disableSmoothing(ctx) {
  ctx.imageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
}

function loadImage(url) {
  const img = new Image();
  img.src = url;
  return img;
}

class Game {
  constructor({ canvas, ctx, dom }) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.dom = dom;

    this.input = new Input(window);
    this.audio = new AudioSystem();

    this.images = {
      soul: loadImage("assets/images/soul.png"),
      enemy6: loadImage("assets/images/enemy_6.png"),
      enemy7: loadImage("assets/images/enemy_7.png"),
    };

    this.scenes = {
      title: new TitleScene(this),
      settings: new SettingsScene(this),
      battle: new BattleScene(this),
      death: {
        name: "death",
        enter: () => {
          this.dom.ui.classList.add("hidden");
          this.dom.titleMenu.classList.add("hidden");
          this.dom.settingsMenu.classList.add("hidden");
        },
        exit: () => {},
        update: () => {},
        render: (ctx) => {
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
          ctx.fillStyle = "#fff";
          ctx.font = "20px Pixel, monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("You died.", INTERNAL_WIDTH / 2, INTERNAL_HEIGHT / 2);
          ctx.textAlign = "left";
          ctx.textBaseline = "alphabetic";
        },
      },
    };

    this.sceneName = "title";
    this.scene = this.scenes.title;

    this.transition = null;
    this.time = 0;

    this._setupUi();
    this._setupResize();
  }

  _setupUi() {
    const unlock = () => this.audio.unlock();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
  }

  _setupResize() {
    const resize = () => {
      const scaleX = Math.floor(window.innerWidth / INTERNAL_WIDTH);
      const scaleY = Math.floor(window.innerHeight / INTERNAL_HEIGHT);
      const scale = clamp(Math.min(scaleX, scaleY), 1, 12);
      this.canvas.style.width = `${INTERNAL_WIDTH * scale}px`;
      this.canvas.style.height = `${INTERNAL_HEIGHT * scale}px`;
    };
    window.addEventListener("resize", resize);
    resize();
  }

  changeScene(nextName) {
    if (!this.scenes[nextName]) return;
    if (this.scene && this.scene.exit) this.scene.exit(nextName);
    this.sceneName = nextName;
    this.scene = this.scenes[nextName];
    if (this.scene && this.scene.enter) this.scene.enter(nextName);
  }

  transitionTo(nextName, { holdBlack = false } = {}) {
    // Fade out; optionally do not fade back in (used for death).
    this.transition = {
      nextName,
      holdBlack,
      phase: "out",
      t: 0,
      dur: 0.25,
      currentName: this.sceneName,
      switched: false,
    };
  }

  update(dt) {
    this.time += dt;

    if (this.transition) {
      this.transition.t += dt;
      if (this.transition.phase === "out" && this.transition.t >= this.transition.dur && !this.transition.switched) {
        this.transition.switched = true;
        this.changeScene(this.transition.nextName);
        if (this.transition.holdBlack) {
          this.transition = null;
        } else {
          this.transition.phase = "in";
          this.transition.t = 0;
        }
      } else if (this.transition.phase === "in" && this.transition.t >= this.transition.dur) {
        this.transition = null;
      }
    }

    if (!this.transition || this.transition.phase !== "out") {
      if (this.scene && this.scene.update) this.scene.update(dt);
    }

    this.input.nextFrame();
  }

  render() {
    disableSmoothing(this.ctx);
    if (this.scene && this.scene.render) this.scene.render(this.ctx);

    if (this.transition) {
      let alpha = 0;
      if (this.transition.phase === "out") alpha = clamp(this.transition.t / this.transition.dur, 0, 1);
      if (this.transition.phase === "in") alpha = 1 - clamp(this.transition.t / this.transition.dur, 0, 1);

      if (alpha > 0) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
        this.ctx.restore();
      }
    }
  }
}

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: false });
canvas.width = INTERNAL_WIDTH;
canvas.height = INTERNAL_HEIGHT;
disableSmoothing(ctx);

const dom = {
  ui: document.getElementById("ui"),
  titleMenu: document.getElementById("titleMenu"),
  settingsMenu: document.getElementById("settingsMenu"),
  playBtn: document.getElementById("playBtn"),
  settingsBtn: document.getElementById("settingsBtn"),
};

const game = new Game({ canvas, ctx, dom });
game.changeScene("title");

let last = performance.now();
function frame(now) {
  const rawDt = (now - last) / 1000;
  last = now;
  const dt = clamp(rawDt, 0, 1 / 20);

  game.update(dt);
  game.render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
