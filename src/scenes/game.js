export class Game extends Phaser.Scene {

  constructor(props) {
    super(Object.assign(props, { key: 'Game' }))

    this.player = null
    this.floors = null
    this.currentFloor = 0
    this.obstacles = null
  }

  init(options) {
    this.options = options
  }

  preload() {
    console.log('Game: preload()')
    // TODO setup input
    this.input.on('pointerdown', () => this._jumpOrDash())
  }

  create() {
    this.add.text(10, 10, 'game', { fill: '#0f0' })

    this.player = this._createPlayer(this.options.player)
    this.floors = this._createFloors(this.options.floor)
    this.obstacles = this.add.group() // TODO...
    this.physics.add.collider(this.player, this.floors, () => this._playerHitsFloor())
  }

  _createPlayer(options = this.options.player) {
    const square = this.physics.add.sprite(40, 0, 'square')
    square.setSize(options.size, options.size)
    square.body.setVelocityX(options.speed)
    square.isDashing = false
    return square
  }

  _createFloors(options = this.options.floor) {
    const group = this.physics.add.staticGroup()
    for (let floorNum = 0; floorNum < options.count; floorNum++) {
      group.add(this._createFloor(floorNum, options), true)
    }
    return group
  }

  _createFloor(position, options = this.options.floor) {
    // FIXME why (options.width * 2)? it fails w/o *2 idk why
    // adding playerWidth*2 to make sure the player does not fall
    const floorWidth = options.width * 2 + (this.options.player.size * 2)

    const floor = this.add.tileSprite(
      -this.options.player.size,
      options.spacing * (position + 1),
      floorWidth,
      options.height,
      'floor'
    )

    this.physics.add.existing(floor, true)
    floor.body.immovable = true
    floor.body.moves = false

    return floor
  }

  update() {
    const playerWidth = this.player.body.width
    if (this.player.x > this.sys.game.config.width + playerWidth) {
      this._moveDownFromRightSide()
    } else if (this.player.x < -this.player.body.width) {
      this._moveDownFromLeftSide()
    }

    // DEBUG:
    if (this.player.y >= this.sys.game.config.height) {
      this.player.y = 0
    }

    // TODO collide square with obstacles
  }

  _moveDownFromRightSide(options = this.options, player = this.player) {
    this.currentFloor += 1
    this.player.y += options.floor.spacing
    this.player.x = this.sys.game.config.width
    this.player.body.setVelocityX(player.body.velocity.x * -1)
  }

  _moveDownFromLeftSide(options = this.options, player = this.player) {
    this.currentFloor += 1
    this.player.y += options.floor.spacing
    this.player.x = 0
    this.player.body.setVelocityX(player.body.velocity.x * -1)
  }

  _jumpOrDash(player = this.player, options = this.options.player) {
    if (this._inTheAir() && !player.isDashing) {
      this._dash()
    } else if (player.body.touching.down) {
      player.setVelocityY(-250)
    }
  }

  _inTheAir(player = this.player) {
    return !player.body.wasTouching.down
      && !player.body.touching.up
      && !player.body.touching.left
      && !player.body.touching.right
  }

  _dash(player = this.player) {
    // TODO should only be able to dash if on ascending part of jump [not sure yet]
    // IDEA if pressing when descending then dash downwards
    player.isDashing = true
    player.setVelocityX(player.body.velocity.x * 3)
    this.dashEvent = this.time.delayedCall(100, () => {
      player.setVelocityX(player.body.velocity.x / 3)
    }, [], this);
  }

  _playerHitsFloor(player = this.player) {
    player.isDashing = false
  }
}
