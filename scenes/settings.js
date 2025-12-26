export class SettingsScene {
  constructor(game) {
    this.game = game;
    this.name = "settings";
  }

  enter() {
    const { ui, titleMenu, settingsMenu } = this.game.dom;
    ui.classList.remove("hidden");
    titleMenu.classList.add("hidden");
    settingsMenu.classList.remove("hidden");
  }

  exit() {}

  update() {
    if (this.game.input.wasPressed("enter")) this.game.changeScene("title");
  }

  render(ctx) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 320, 240);
  }
}

