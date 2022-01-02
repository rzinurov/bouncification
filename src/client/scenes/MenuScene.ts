import Fonts from "client/consts/Fonts";
import Scenes from "client/consts/Scenes";
import Phaser from "phaser";
import Button from "./ui/Button";
import InputText from "phaser3-rex-plugins/plugins/inputtext.js";
import Names from "client/utils/Names";

export enum MenuSceneEvents {
  ConnectButtonClicked = "connect-button-clicked",
}

const LS_PLAYER_NAME = "playerName";

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
      .bitmapText(width / 2, 128, Fonts.Pixel, "BOUNCIFICATION", 75)
      .setTint(0xffffff)
      .setOrigin(0.5, 0.5);

    this.add
      .bitmapText(
        width / 2,
        216,
        Fonts.Pixel,
        "A MULTIPLAYER GAME WITH BOUNCING BALLS",
        24
      )
      .setTint(0xffffff)
      .setOrigin(0.5, 0.5);

    this.add
      .bitmapText(
        width / 2,
        height / 2 - 120,
        Fonts.Pixel,
        "ENTER YOUR NAME",
        40
      )
      .setTint(0xffffff)
      .setOrigin(0.5, 0.5);

    let playerName = window.localStorage.getItem(LS_PLAYER_NAME);

    const nameInput = new InputText(
      this,
      width / 2,
      height / 2,
      width / 2,
      128,
      {
        text: playerName ? playerName : Names.randomName(),
        fontSize: "64",
        align: "center",
        color: "#ffffff",
        backgroundColor: "#222222",
        borderColor: "#ffffff",
      }
    );
    this.add.existing(nameInput);

    const connectButton = new Button(this, width / 2, height * 0.75, "CONNECT");
    connectButton.onClick(() => {
      const enteredName = nameInput.text.trim();
      window.localStorage.setItem(LS_PLAYER_NAME, enteredName);
      this.events.emit(MenuSceneEvents.ConnectButtonClicked, {
        name: enteredName ? enteredName : "anonymous",
      });
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
