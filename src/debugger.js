const DEBUG_TOGGLED_EVENT = 'debugToggled'

export class Debugger {
  constructor(game) {
    this.game = game;
    this.isInDebugMode = false;
  }

  init(game = this.game, scene = this.game.scene) {
    game.events.on(DEBUG_TOGGLED_EVENT, this._debugToggled, this);

    this.sceneUpdate = game.update.bind(game);
    game.scene.update = (time, delta) => {
      this.sceneUpdate(time, delta);
      if (this.isInDebugMode) {
        this._debugDraw();
      }
    };

    this.sceneCreate = game.create.bind(game);
    game.create = () => {
      scene.graphics = game.add.graphics({
        lineStyle: { width: 2, color: 0x00ff00 },
        fillStyle: { color: 0xff00ff }
      });
      scene.debugCircle = new Phaser.Geom.Circle(
        0,
        0,
        game.options.player.size
      );
      scene.debugRect = new Phaser.Geom.Rectangle(
        0,
        0,
        game.gameWidth,
        game.gameHeight
      );
      this.sceneCreate();
    };

    game.input.keyboard.on("keydown_R", () => this.moveToTop());
    game.input.keyboard.on("keydown_O", () =>
      this.speedUpBy({ increment: 10 })
    );
    game.input.keyboard.on("keydown_L", () =>
      this.speedUpBy({ increment: -10 })
    );
    game.input.keyboard.on("keydown_D", () =>
      game.events.emit(DEBUG_TOGGLED_EVENT)
    );
  }

  moveToTop(game = this.game) {
    game.player.y = 0;
    game.player.x = 0;
    game.currentFloor = 0;
    game.cameras.main.scrollY = 0;
    game.player.body.setVelocityX(game.options.player.speed);
  }

  speedUpBy({ game = this.game, increment = 10 }) {
    if (game.player.body.velocity.x < 0) {
      increment *= -1;
    }
    game.player.body.setVelocityX(game.player.body.velocity.x + increment);
  }

  _debugToggled(game = this.game, scene = this.game.scene) {
    this.isInDebugMode = !this.isInDebugMode;

    if (!this.isInDebugMode) {
      game.cameras.main.zoom = 1;
      scene.graphics.clear();
      return;
    }

    game.cameras.main.zoom = 0.5;
  }

  _debugDraw(
    player = this.game.scene.player,
    cameras = this.game.scene.cameras,
    graphics = this.game.scene.graphics,
    debugCircle = this.game.scene.debugCircle,
    debugRect = this.game.scene.debugRect
  ) {
    graphics.clear();
    debugCircle.setPosition(cameras.main.centerX, player.y);
    graphics.strokeCircleShape(debugCircle);
    debugRect.setPosition(0, cameras.main.scrollY);
    graphics.strokeRectShape(debugRect);
  }
}
