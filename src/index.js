import 'phaser'
import { Boot } from './scenes/boot'
import { Preload } from './scenes/preload'
import { Title } from './scenes/title'
import { Game } from './scenes/game'
import { GameOver } from './scenes/gameover'

const gameConfig = {
  width: 400,
  height: 680,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 550 },
      debug: true
    }
  }
}

const game = new Phaser.Game(gameConfig)

game.scene.add('Boot', Boot, false)
game.scene.add('Preload', Preload, false)
game.scene.add('Title', Title, false)
game.scene.add('Game', Game, false)
game.scene.add('GameOver', GameOver, false)

game.scene.start('Boot')
