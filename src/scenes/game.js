const DEBUG_TOGGLED_EVENT = 'debugToggled'

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
    this.input.on('pointerdown', () => this._jumpOrDash())

    this.input.keyboard.on('keydown_R', () => this._DEBUG_moveToTop())
    this.input.keyboard.on('keydown_O', () => this._DEBUG_speedUpBy(10))
    this.input.keyboard.on('keydown_L', () => this._DEBUG_speedUpBy(-10))
    this.input.keyboard.on('keydown_D', () => this.events.emit(DEBUG_TOGGLED_EVENT))
  }

  _DEBUG_moveToTop() {
    this.player.y = 0
    this.player.x = 0
    this.currentFloor = 0
    this.cameras.main.scrollY = 0
  }

  _DEBUG_speedUpBy(increment = 10) {
    if (this.player.body.velocity.x < 0) {
      increment *= -1
    }
    this.player.body.setVelocityX(this.player.body.velocity.x + increment)
  }

  create() {
    this.events.on(DEBUG_TOGGLED_EVENT, this._debugToggled, this);

    this.graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 }, fillStyle: { color: 0xff00ff } });
    this.debugCircle = new Phaser.Geom.Circle(0, 0, this.sys.game.config.width / 10)
    this.debugRect = new Phaser.Geom.Rectangle(0, 0, this.sys.game.config.width, this.sys.game.config.height)

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

  // TODO 1. decide when floor is out of the upper screen bound and put it into the pool
  // TODO 2.

  _createFloors(options = this.options.floor) {
    const group = this.physics.add.staticGroup()
    for (let floorNum = 0; floorNum < options.count; floorNum++) {
      group.add(this._createFloor(floorNum, options), true)
    }
    return group
  }

  _createFloor(position, options = this.options.floor) {
    // adding playerWidth*2 to make sure the player does not fall
    const floorWidth = options.width * 1 + (this.options.player.size * 2)

    // FIXME tile sprite is being placed outside of the screen! why?
    const floor = this.add.tileSprite(
      0, // this.sys.game.config.width
      options.spacing * (position + 1),
      floorWidth,
      options.height,
      'floor'
    )
    floor.setDisplayOrigin()

    this.physics.add.existing(floor, true)
    floor.body.immovable = true
    floor.body.moves = false

    this.add.text(2, options.spacing * (position + 1) - 2, 'floor ' + position, { fill: '#0f0' }) // DEBUG

    return floor
  }

  update() {
    const playerWidth = this.player.body.width
    if (this.player.x > this.sys.game.config.width + playerWidth) {
      this._moveDownFromRightSide()
    } else if (this.player.x < -this.player.body.width) {
      this._moveDownFromLeftSide()
    }

    this._updateCamera()

    if (this._inTheAir()) {
      //console.log(`${this.player.body.speed}`)
    }

    // TODO collide square with obstacles
  }

  _moveDownFromRightSide(options = this.options, player = this.player) {
    // console.log(`left floor ${this.currentFloor}`, this.cameras.main.scrollY - this.floors.getChildren()[this.currentFloor].y)

    this.currentFloor += 1
    this.player.y += options.floor.spacing
    this.player.x = this.sys.game.config.width
    this.player.body.setVelocityX(player.body.velocity.x * -1)
  }

  _moveDownFromLeftSide(options = this.options, player = this.player) {
    // console.log(`left floor ${this.currentFloor}`, this.cameras.main.scrollY - this.floors.getChildren()[this.currentFloor].y)

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

  _updateCamera(player = this.player, cameras = this.cameras) {
    // 1. define area in which if the player is in, the camera needs to scroll
    // TODO need player's position RELATIVE to camera

    let playerPosY = cameras.main.scrollY - player.y
    if (playerPosY < 0) {
      playerPosY *= -1
    }

    if (playerPosY < cameras.main.centerY) {
      cameras.main.scrollY += 0.5
    } else if (playerPosY >= cameras.main.centerY && playerPosY <= cameras.main.centerY + (cameras.main.height / 3)) {
      cameras.main.scrollY += 1
    } else {
      cameras.main.scrollY += 2
    }

    if (this._DEBUG_mode) {
      this._debugDraw()
    }
  }

  _debugToggled() {
    this._DEBUG_mode = !this._DEBUG_mode

    if (!this._DEBUG_mode) {
      this.cameras.main.zoom = 1
      this.graphics.clear()
      return
    }

    this.cameras.main.zoom = 0.5
  }

  _debugDraw(
    player = this.player,
    cameras = this.cameras,
    graphics = this.graphics,
    debugCircle = this.debugCircle,
    debugRect = this.debugRect
  ) {
    graphics.clear()
    debugCircle.setPosition(cameras.main.centerX, player.y - 100)
    graphics.strokeCircleShape(debugCircle)
    debugRect.setPosition(0, cameras.main.scrollY)
    graphics.strokeRectShape(debugRect)
  }
}
