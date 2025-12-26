export class Input {
  constructor(target = window) {
    this._down = new Set();
    this._pressed = new Set();

    this._keyToAction = new Map([
      ["w", "up"],
      ["a", "left"],
      ["s", "down"],
      ["d", "right"],
      ["Enter", "enter"],
    ]);

    this._keydown = (e) => {
      const action = this._keyToAction.get(e.key);
      if (!action) return;
      e.preventDefault();

      if (!this._down.has(action)) this._pressed.add(action);
      this._down.add(action);
    };

    this._keyup = (e) => {
      const action = this._keyToAction.get(e.key);
      if (!action) return;
      e.preventDefault();
      this._down.delete(action);
    };

    target.addEventListener("keydown", this._keydown);
    target.addEventListener("keyup", this._keyup);
  }

  isDown(action) {
    return this._down.has(action);
  }

  wasPressed(action) {
    return this._pressed.has(action);
  }

  nextFrame() {
    this._pressed.clear();
  }
}

