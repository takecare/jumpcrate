import { runInThisContext } from "vm"
import { Debugger } from '../debugger'

const LERP_Y = 0.04
const NO_LERP = 0

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
    this.gameWidth = this.sys.game.config.width
    this.gameHeight = this.sys.game.config.height

    this.debugger = new Debugger(this)
  }

  preload() {
    this.debugger.init()
    this.input.on('pointerdown', () => this._jumpOrDash())
  }

  create() {
    this.player = this._createPlayer(this.options.player)
    this.floors = this._createFloors(this.options.floor)
    this.obstacles = this.add.group() // TODO obstacles/enemies...
    this.physics.add.collider(this.player, this.floors, () => this._playerHitsFloor())

    this.cameras.main.setBounds(0, 0, this.gameWidth) // no y bounds because we move infinitely towards the bottom
    this.cameras.main.startFollow(this.player, true, NO_LERP, LERP_Y, 0, this.options.floor.height + this.options.floor.spacing * -1)
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
    const floorWidth = options.width + (this.options.player.size * 4)
    const floor = this.add.tileSprite(
      -this.options.player.size * 2,
      options.spacing * (position + 1),
      floorWidth,
      options.height,
      'floor'
    )
    floor.setDisplayOrigin(0, 0)

    this.physics.add.existing(floor, true)
    floor.body.immovable = true
    floor.body.moves = false

    this.add.text(2, options.spacing * (position + 1) - 2, 'floor ' + position, { fill: '#0f0' }) // DEBUG

    return floor
  }

  update(time, delta) {
    const playerWidth = this.player.body.width
    if (this.player.x > this.sys.game.config.width + playerWidth) {
      this._moveDownFromRightSide()
    } else if (this.player.x < -this.player.body.width) {
      this._moveDownFromLeftSide()
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
    this.cameras.main.setLerp(0, 0)
    if (this._inTheAir() && !player.isDashing) {
      this._dash()
    } else if (player.body.touching.down) { // jump
      player.setVelocityY(-250) // TODO pass via opts
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
    this.cameras.main.setLerp(0, LERP_Y)
    player.isDashing = false
  }
}
