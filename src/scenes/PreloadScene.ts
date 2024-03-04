import Phaser from "phaser";
import { PRELOAD_CONFIG } from "..";

class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    this.load.image("ground", "assets/ground.png");
    this.load.image("dino-idle", "assets/dino-idle.png");
    this.load.image("dino-hurt", "assets/dino-hurt.png");

    for (let i = 0; i < PRELOAD_CONFIG.cactusesCount; i++) {
      const num = i + 1;
      this.load.image(`obstacle-${num}`, `assets/cactuses_${num}.png`);
    }

    this.load.spritesheet("dino-run", "assets/dino-run.png", {
      frameWidth: 88,
      frameHeight: 94,
    });
  }

  create() {
    this.scene.start("PlayScene");
  }
}

export default PreloadScene;
