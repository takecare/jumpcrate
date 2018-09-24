const DEBUG_TOGGLED_EVENT = 'debugToggled'

const LERP_Y = 0.04
const NO_LERP = 0

class Debugger {

  constructor(game) {
    this.game = game
    this.isInDebugMode = false
  }

  init(game = this.game, scene = this.game.scene) {
    game.events.on(DEBUG_TOGGLED_EVENT, this._debugToggled, this)

    this.sceneUpdate = game.update.bind(game)
    game.scene.update = (time, delta) => {
      this.sceneUpdate(time, delta)
      if (this.isInDebugMode) {
        this._debugDraw()
      }
    }

    this.sceneCreate = game.create.bind(game)
    game.create = () => {
      scene.graphics = game.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 }, fillStyle: { color: 0xff00ff } });
      scene.debugCircle = new Phaser.Geom.Circle(0, 0, game.options.player.size)
      scene.debugRect = new Phaser.Geom.Rectangle(0, 0, game.gameWidth, game.gameHeight)
      this.sceneCreate()
    }

    game.input.keyboard.on('keydown_R', () => this.moveToTop())
    game.input.keyboard.on('keydown_O', () => this.speedUpBy({ increment: 10 }))
    game.input.keyboard.on('keydown_L', () => this.speedUpBy({ increment: -10 }))
    game.input.keyboard.on('keydown_D', () => game.events.emit(DEBUG_TOGGLED_EVENT))
  }

  moveToTop(game = this.game) {
    game.player.y = 0
    game.player.x = 0
    game.currentFloor = 0
    game.cameras.main.scrollY = 0
    game.player.body.setVelocityX(game.options.player.speed)
  }

  speedUpBy({game = this.game, increment = 10}) {
    if (game.player.body.velocity.x < 0) {
      increment *= -1
    }
    game.player.body.setVelocityX(game.player.body.velocity.x + increment)
  }

  _debugToggled(game = this.game, scene = this.game.scene) {
    this.isInDebugMode = !this.isInDebugMode

    if (!this.isInDebugMode) {
      game.cameras.main.zoom = 1
      scene.graphics.clear()
      return
    }

    game.cameras.main.zoom = 0.5
  }

  _debugDraw(
    player = this.game.scene.player,
    cameras = this.game.scene.cameras,
    graphics = this.game.scene.graphics,
    debugCircle = this.game.scene.debugCircle,
    debugRect = this.game.scene.debugRect
  ) {
    graphics.clear()
    debugCircle.setPosition(cameras.main.centerX, player.y)
    graphics.strokeCircleShape(debugCircle)
    debugRect.setPosition(0, cameras.main.scrollY)
    graphics.strokeRectShape(debugRect)
  }
}

class FloorPool {

  constructor(scene, capacity) {
    this.scene = scene
    this.capacity = capacity
    this.visibleFloors = scene.physics.add.staticGroup()
    this.freeFloors = sc
    for (let i = 0; i < capacity; i++) {
      const floor = new Floor(scene) //scene.add.tileSprite(0, 0, 0, 0, 'floor')

      floor.setActive(false)
      this.visibleFloors.add(floor) //this.visibleFloors.push(f)
    }
  }

  update(time, delta) {
    this.visibleFloors.getChildren().forEach(floor => floor.update(time, delta))

    if (this.scene.cameras.main.scrollY)

  }

  get() {
    let freedFloor = this.floors.getFirstDead()
    if (freedFloor) {
      console.log('got free floor')
      return freedFloor
    } else {
      console.error('BOOM')
    }
  }
}

class Floor extends Phaser.GameObjects.TileSprite {

  constructor(...args) {
    super(...args)
  }

  // TODO what methods make sense here?

  update(time, delta) {
    // console.log(`floor update: ${time}, ${delta}`)
    // console.log(this.y, this.scene.cameras.main.scrollY)
    if (this.y < this.scene.cameras.main.scrollY) {
      this.setActive(false)
      this.setVisible(false)
    }
  }
}

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
    // this.debugger.init()
    this.input.on('pointerdown', () => this._jumpOrDash())
  }

  create() {
    // this.teste = this.add.group({
    //   classType: Floor,
    //   maxSize: this.options.floor.count, // TODO change to smaller limit
    //   runChildUpdate: true,
    //   createCallback: (item) => {
    //     //console.log('log', item)
    //     // item.setTexture('floor')
    //   }
    // })

    this.player = this._createPlayer(this.options.player)
    this.floors = this._createFloors(this.options.floor)
    this.obstacles = this.add.group() // TODO obstacles/enemies...
    this.physics.add.collider(this.player, this.floors.floors, () => this._playerHitsFloor())

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
    const pool = new FloorPool(this, 20)
    const floors = pool.floors.getChildren()

    for (let position = 0; position < floors.length; position++) {
      const floor = floors[position]
      const floorWidth = options.width + (this.options.player.size * 4)

      floor.setPosition(-this.options.player.size * 2, options.spacing * (position + 1))
      floor.setSize(floorWidth, options.height)
      floor.setDisplayOrigin(0, 0)
      floor.setTexture('floor')

      this.physics.add.existing(floor, true)
      floor.body.immovable = true
      floor.body.moves = false

      this.add.text(2, options.spacing * (position + 1) - 2, `floor ${position}`, { fill: '#0f0' }) // DEBUG
    }

    return pool
  }

  update(time, delta) {
    this.floors.update(time, delta)

    const playerWidth = this.player.body.width
    if (this.player.x > this.sys.game.config.width + playerWidth) {
      this._moveDownFromRightSide()
    } else if (this.player.x < -this.player.body.width) {
      this._moveDownFromLeftSide()
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
