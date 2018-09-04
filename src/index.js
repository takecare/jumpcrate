import 'phaser'
import { Boot } from './scenes/boot'
import { Preload } from './scenes/preload'
import { Title } from './scenes/title'
import { Game } from './scenes/game'
import { GameOver } from './scenes/gameover'

const width = 400
const height = 680

const phaserConfig = {
  width: width,
  height: height,
  backgroundColor: '#888'
}

const gameConfig = {
  player: {
    size: width / 25,
    speed: 250,
    gravity: 550
  },
  floor: {
    width: width,
    height: height / 24,
    spacing: height / 24 * 4,
    count: 100
  }
}

const gameScene = new Game({
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 550 },
      debug: false
    }
  }
})
const game = new Phaser.Game(phaserConfig)

game.scene.add('Boot', Boot, false)
game.scene.add('Preload', Preload, false)
game.scene.add('Title', Title, false)
game.scene.add('Game', gameScene, false, gameConfig)
game.scene.add('GameOver', GameOver, false)

game.scene.start('Boot')
