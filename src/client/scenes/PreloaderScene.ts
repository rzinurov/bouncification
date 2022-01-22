import Colors from "client/consts/Colors";
import Fonts from "client/consts/Fonts";
import Scenes from "client/consts/Scenes";
import Sounds from "client/consts/Sounds";
import Sprites from "client/consts/Sprites";
import Phaser from "phaser";

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
    this.progressContainer.fillStyle(Colors.Background, 0.8);
    this.progressContainer.fillRect(
      width * 0.25,
      height / 2 - preloaderHeight / 2,
      width * 0.5,
      preloaderHeight
    );

    this.load.on("progress", (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(Colors.White, 1);
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

    this.load.image(Sprites.Star, "assets/img/star.png");
    this.load.image(Sprites.Ball, "assets/img/ball.png");
    this.load.image(Sprites.Floor, "assets/img/floor.png");
    this.load.image(Sprites.Hoop, "assets/img/hoop.png");
    this.load.image(Sprites.HoopFront, "assets/img/hoop-front.png");

    this.load.audio(Sounds.Bounce1, "assets/snd/bounce_1.mp3", {
      instances: 8,
    });
    this.load.audio(Sounds.Bounce2, "assets/snd/bounce_2.mp3", {
      instances: 8,
    });
    this.load.audio(Sounds.Bounce3, "assets/snd/bounce_3.mp3", {
      instances: 8,
    });
    this.load.audio(Sounds.Message, "assets/snd/message.mp3", {
      instances: 2,
    });
    this.load.audio(Sounds.Score, "assets/snd/score.mp3", {
      instances: 2,
    });
    this.load.audio(Sounds.Timer, "assets/snd/timer.mp3");
    this.load.audio(Sounds.Button, "assets/snd/button.mp3");
  }

  create() {
    this.scene.start(Scenes.Bootstrap);
  }
}
