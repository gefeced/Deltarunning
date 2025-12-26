export class TitleScene {
  constructor(game) {
    this.game = game;
    this.name = "title";

    this._wired = false;
  }

  enter() {
    const { ui, titleMenu, settingsMenu, playBtn, settingsBtn } = this.game.dom;
    ui.classList.remove("hidden");
    titleMenu.classList.remove("hidden");
    settingsMenu.classList.add("hidden");

    if (!this._wired) {
      this._wired = true;
      playBtn.addEventListener("click", () => {
        this.game.audio.unlock();
        this.game.transitionTo("battle");
      });
      settingsBtn.addEventListener("click", () => {
        this.game.audio.unlock();
        this.game.changeScene("settings");
      });
    }
  }

  exit() {}

  update() {
    if (this.game.input.wasPressed("enter")) this.game.transitionTo("battle");
  }

  render(ctx) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 320, 240);

    ctx.fillStyle = "rgba(255,255,255,0.06)";
    for (let i = 0; i < 48; i++) {
      const x = ((i * 53) % 320) | 0;
      const y = ((i * 31) % 240) | 0;
      ctx.fillRect(x, y, 2, 2);
    }
  }
}

