import Phaser from "phaser";
import { Player } from "../enteties/Player";
import { GameScene } from "./GameScene";
import { PRELOAD_CONFIG } from "..";

class PlayScene extends GameScene {
  player: Player;
  ground: Phaser.GameObjects.TileSprite;
  obstacles: Phaser.Physics.Arcade.Group;
  clouds: Phaser.GameObjects.Group;
  startTrigger: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  spawnInterval: number = 1500;
  spawnTime: number = 0;
  gameSpeed: number = 5;
  gameOverText: Phaser.GameObjects.Image;
  scoreText: Phaser.GameObjects.Text;
  restartText: Phaser.GameObjects.Image;
  gameOverContainer: Phaser.GameObjects.Container;

  constructor() {
    super("PlayScene");
  }

  create() {
    this.createEnvironment();
    this.createPlayer();
    this.createObstacles();
    this.createGameOverContainer();
    this.createAnimations();
    this.createScore();

    this.handleGameStart();
    this.handleObstacleCollision();
    this.handleGameRestart();
  }

  createScore() {
    this.scoreText = this.add
      .text(this.gameWidth, 0, `00000`, {
        fontSize: 30,
        fontFamily: "Arial",
        color: "#535353",
        resolution: 5,
      })
      .setOrigin(1, 0)
      .setAlpha(0);
  }

  createAnimations() {
    this.anims.create({
      key: "enemy-bird-fly",
      frames: this.anims.generateFrameNumbers("enemy-bird"),
      frameRate: 6,
      repeat: -1,
    });
  }

  handleGameStart() {
    this.startTrigger = this.physics.add
      .sprite(0, 10, null)
      .setOrigin(0, 1)
      .setAlpha(0);

    this.physics.add.overlap(this.startTrigger, this.player, () => {
      if (this.startTrigger.y == 10) {
        this.startTrigger.body.reset(0, this.gameHeight);
        return;
      }
      this.startTrigger.body.reset(9999, 9999);
      const rollOutEvent = this.time.addEvent({
        delay: 1000 / 60,
        loop: true,
        callback: () => {
          this.player.playRunAnimation();
          this.player.setVelocityX(80);
          this.ground.width += 17;

          if (this.ground.width >= this.gameWidth) {
            this.player.setVelocityX(0);
            this.ground.width = this.gameWidth;
            rollOutEvent.remove();
            this.clouds.setAlpha(1);
            this.scoreText.setAlpha(1);
            this.isGameRunning = true;
          }
        },
      });
    });
  }

  handleObstacleCollision() {
    this.physics.add.collider(this.obstacles, this.player, () => {
      this.isGameRunning = false;
      this.physics.pause();
      this.player.die();
      this.gameOverContainer.setAlpha(1);
      this.anims.pauseAll();

      this.spawnTime = 0;
      this.gameSpeed = 5;
    });
  }

  handleGameRestart() {
    this.restartText.on("pointerdown", () => {
      this.physics.resume();
      this.player.setVelocityY(0);

      this.obstacles.clear(true, true);
      this.gameOverContainer.setAlpha(0);
      this.anims.resumeAll();

      this.isGameRunning = true;
    });
  }

  createObstacles() {
    this.obstacles = this.physics.add.group();
  }

  createGameOverContainer() {
    this.gameOverText = this.add.image(0, 0, "game-over");
    this.restartText = this.add.image(0, 80, "restart").setInteractive();

    this.gameOverContainer = this.add
      .container(this.gameWidth / 2, this.gameHeight / 2 - 50)
      .add([this.gameOverText, this.restartText]);

    this.gameOverContainer.setAlpha(0);
  }

  createEnvironment() {
    this.ground = this.add
      .tileSprite(0, this.gameHeight, 88, 26, "ground")
      .setOrigin(0, 1);

    this.clouds = this.add.group();
    this.clouds = this.clouds.addMultiple([
      this.add.image(this.gameWidth / 2, 170, "cloud"),
      this.add.image(this.gameWidth - 80, 80, "cloud"),
      this.add.image(this.gameWidth / 1.3, 100, "cloud"),
    ]);

    this.clouds.setAlpha(0);
  }

  createPlayer() {
    this.player = new Player(this, 0, this.gameHeight);
  }

  spawnObstacle() {
    const obstaclesCount =
      PRELOAD_CONFIG.cactusesCount + PRELOAD_CONFIG.birdsCount;
    const obstacleNum = Math.floor(Math.random() * obstaclesCount) + 1;

    const distance = Phaser.Math.Between(150, 300);
    let obstacle;

    if (obstacleNum > PRELOAD_CONFIG.cactusesCount) {
      const possibleHeight = [20, 70];
      const enemyHeight = possibleHeight[Math.floor(Math.random() * 2)];

      obstacle = this.obstacles.create(
        this.gameWidth + distance,
        this.gameHeight - enemyHeight,
        `enemy-bird`
      );
      obstacle.play("enemy-bird-fly", true);
    } else {
      obstacle = this.obstacles.create(
        this.gameWidth + distance,
        this.gameHeight,
        `obstacle-${obstacleNum}`
      );
    }

    obstacle.setOrigin(0, 1).setImmovable();
  }

  update(_: number, delta: number): void {
    if (!this.isGameRunning) return;

    this.spawnTime += delta;

    if (this.spawnTime >= this.spawnInterval) {
      this.spawnObstacle();
      this.spawnTime = 0;
    }

    Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed);
    Phaser.Actions.IncX(this.clouds.getChildren(), -0.5);

    this.clouds
      .getChildren()
      .forEach((cloud: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => {
        if (cloud.getBounds().right < 0) {
          cloud.x = this.gameWidth + 30;
        }
      });

    this.obstacles
      .getChildren()
      .forEach(
        (obstacle: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => {
          if (obstacle.getBounds().right < 0) {
            this.obstacles.remove(obstacle);
          }
        }
      );

    this.ground.tilePositionX += this.gameSpeed;
  }
}

export default PlayScene;
