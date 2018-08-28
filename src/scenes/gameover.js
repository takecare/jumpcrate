export class GameOver extends Phaser.Scene {

  constructor(params) {
    super(params)
  }

  preload() {
    //
  }

  create() {
    this.add.text(10, 10, 'game over', { fill: '#0f0' })
  }

  update() {
    //
  }
}
