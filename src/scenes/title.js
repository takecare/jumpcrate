export class Title extends Phaser.Scene {

  constructor(props) {
    super({
      key: 'Title'
    })
    this.startKey = null
  }

  preload() {
    console.log(`Title: preload()`)
  }

  create() {
    this.add.text(10, 10, 'title', { fill: '#0f0' })
    this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X)
  }

  update() {
    if (this.startKey.isDown) {
      this.scene.start('Game')
    }
  }
}
