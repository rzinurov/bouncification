import Colors from "client/consts/Colors";
import Fonts from "client/consts/Fonts";
import * as Phaser from "phaser";

export default class Header extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, width: number, height: number) {
    super(scene, width / 2, 128);

    this.add(
      this.scene.add
        .bitmapText(0, 0, Fonts.Pixel, "BOUNCIFICATION", 80)
        .setTint(Colors.Orange3)
        .setOrigin(0.5, 0.5)
    );

    this.add(
      this.scene.add
        .bitmapText(
          0,
          88,
          Fonts.Pixel,
          "A MULTIPLAYER GAME WITH BOUNCING BALLS",
          24
        )
        .setTint(Colors.Blue2)
        .setOrigin(0.5, 0.5)
    );
  }
}
