import Fonts from "client/consts/Fonts";
import Scenes from "client/consts/Scenes";
import Phaser from "phaser";
import Button from "./ui/Button";

export enum MenuSceneEvents {
  ConnectButtonClicked = "connect-button-clicked",
}

export default class MenuScene extends Phaser.Scene {
  errorMessage?: string;

  constructor() {
    super(Scenes.Menu);
  }

  init(data: { errorMessage?: string }) {
    this.errorMessage = data.errorMessage;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add
      .bitmapText(width / 2, 128, Fonts.Pixel, "BOUNCIFICATION", 64)
      .setTint(0xffffff)
      .setOrigin(0.5, 0.5);

    this.add
      .bitmapText(
        width / 2,
        192,
        Fonts.Pixel,
        "A MULTIPLAYER GAME WITH BOUNCING BALLS",
        20
      )
      .setTint(0xffffff)
      .setOrigin(0.5, 0.5);

    const connectButton = new Button(this, width / 2, height * 0.75, "CONNECT");
    connectButton.onClick(() => {
      this.events.emit(MenuSceneEvents.ConnectButtonClicked);
    });

    if (this.errorMessage) {
      this.add
        .bitmapText(
          width / 2,
          height * 0.85,
          Fonts.Pixel,
          `${this.errorMessage}`,
          24
        )
        .setTint(0xff0000)
        .setOrigin(0.5, 0.5);
    }
  }
}
