export class Boot extends Phaser.Scene {

  constructor() {
    super({ key: 'Boot' });
  }

  preload() {
    const progress = this.add.graphics()

    this.load.on('progress', (value) => {
      progress.clear()
      progress.fillStyle(0xffffff, 1)
      progress.fillRect(0, this.sys.game.config.height / 2, this.sys.game.config.width * value, 60)
    })

    this.load.on('complete', () => {
        // TODO
        progress.destroy()
        this.scene.start('Title')
    })

    this.load.image('floor', 'assets/floor.png')
    this.load.image('square', 'assets/square.png')
  }

  create() {
    // this.add.text(10, 10, 'boot!', { fill: '#0f0' })
  }
}
