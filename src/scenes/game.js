export class Game extends Phaser.Scene {

  constructor(props) {
    super({
      key: 'Game'
    })

    this.square = null
    this.groundGroup = null
    this.obstacleGroup = null

    this.options = {
      square: {
        size: 16,
        speed: 250,
        gravity: 550
      },
      floor: {
        width: 400,
        height: 20,
        spacing: 92,
        count: 5
      }
    }
  }

  preload() {
    console.log('Game: preload()')
    // TODO setup input
  }

  create() {
    this.add.text(10, 10, 'game', {
      fill: '#0f0'
    })

    this.square = this.physics.add.sprite(0, 0, 'square')
    this.square.setSize(this.options.squareSize, this.options.size)
    this.square.body.setVelocityX(this.options.speed)

    this.groundGroup = this.add.group()
    this.obstacleGroup = this.add.group()

    for (let i = 0; i < this.options.floor.count; i++) {
      // TODO create floor
      this.groundGroup.add(this._createFloor(i))
    }
  }

  _createFloor(position) {
    const floor = this.add.tileSprite(
      0,
      this.options.floor.spacing * (position + 1),
      this.options.floor.width * 2,
      this.options.floor.height,
      'floor'
    )

    // const floors = this.physics.add.staticGroup()
    this.physics.add.existing(floor)
    floor.body.immovable = true
    floor.body.moves = false

    // const floor = floors.create(
    //   0,
    //   this.options.floor.spacing * (position + 1),
    //   'floor'
    // )
    // floor.setScale(this.options.floor.width, 1)
    //floor.refreshBody()

    return floor
  }

  update() {
    // TODO 1. move to next floor
    // TODO 2. collide square with floor group
    // TODO 3. collide square with obstacles
  }
}
