
export class Title extends Phaser.Scene {

  constructor(props) {
    super({
      key: 'Title'
    })
    this.titleText = null
    this.startKey = null
    this.startTimer = null
  }

  preload() {
    console.log(`Title: preload()`)
  }

  create() {
    this.titleText = this.add.text(10, 10, 'title', { fill: '#0f0' })
    this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X)
    this.startTimer = this.time.delayedCall(1000, this.start, [], this);
  }

  start() {
    this.startTimer.destroy()
    this.scene.start('Game')
  }

  update() {
    this.titleText.setText(`title: ${Math.floor(this.startTimer.getProgress() * 100)}%`)

    if (this.startKey.isDown) {
      this.start()
    }
  }
}
