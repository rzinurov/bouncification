import Fonts from "client/consts/Fonts";
import Scenes from "client/consts/Scenes";
import Sprites from "client/consts/Sprites";
import Phaser from "phaser";

export enum PreloaderSceneEvents {
  Loaded = "loaded",
}

export default class PreloaderScene extends Phaser.Scene {
  private progressContainer!: Phaser.GameObjects.Graphics;
  private progressBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super(Scenes.Preloader);
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const preloaderHeight = 128;
    this.progressBar = this.add.graphics();
    this.progressContainer = this.add.graphics();
    this.progressContainer.fillStyle(0x222222, 0.8);
    this.progressContainer.fillRect(
      width * 0.25,
      height / 2 - preloaderHeight / 2,
      width * 0.5,
      preloaderHeight
    );

    this.load.on("progress", (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0xffffff, 1);
      this.progressBar.fillRect(
        width * 0.25 + 8,
        height / 2 - preloaderHeight / 2 + 8,
        (width * 0.5 - 16) * value,
        preloaderHeight - 16
      );
    });

    this.load.bitmapFont(
      Fonts.Pixel,
      "assets/fonts/pixel.png",
      "assets/fonts/pixel.xml"
    );

    this.load.image(Sprites.Ball, "assets/img/ball.png");
    this.load.image(
      Sprites.SingleHoopPitch,
      "assets/img/single-hoop-pitch.png"
    );
    this.load.image(Sprites.ChainLink, "assets/img/chain-link.png");
  }

  create() {
    this.events.emit(PreloaderSceneEvents.Loaded);
  }
}
