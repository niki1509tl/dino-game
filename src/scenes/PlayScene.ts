import Phaser from "phaser";

class PlayScene extends Phaser.Scene {
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  startTrigger: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  get gameHeight() {
    return this.game.config.height as number;
  }

  constructor() {
    super("PlayScene");
  }

  create() {
    this.createEnvironment();
    this.createPlayer();

    this.startTrigger = this.physics.add
      .sprite(0, 10, null)
      .setOrigin(0, 1)
      .setAlpha(0);
    this.registerPlayerControl();

    this.physics.add.overlap(this.startTrigger, this.player, () => {
      console.log('colide')
    });
  }

  createEnvironment() {
    this.add.tileSprite(0, this.gameHeight, 88, 26, "ground").setOrigin(0, 1);
  }

  createPlayer() {
    this.player = this.physics.add
      .sprite(0, this.gameHeight, "dino-idle")
      .setOrigin(0, 1);

    this.player
      .setGravityY(5000)
      .setCollideWorldBounds(true)
      .setBodySize(44, 92);
  }

  registerPlayerControl() {
    const spacebar = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    spacebar.on("down", () => {
      this.player.setVelocityY(-1600);
    });
  }
}

export default PlayScene;
