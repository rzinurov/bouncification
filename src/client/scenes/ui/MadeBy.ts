import Colors from "client/consts/Colors";
import Fonts from "client/consts/Fonts";
import * as Phaser from "phaser";

export default class MadeBy extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, width: number, height: number) {
    super(scene, width / 2, height - 64);

    function openExternalLink(url: string) {
      var s = window.open(url, "_blank");
      if (s && s.focus) {
        s.focus();
      } else if (!s) {
        window.location.href = url;
      }
    }

    this.add(
      this.scene.add
        .bitmapText(0, -20, Fonts.Pixel, "MADE BY RUSTAM ZINUROV", 24)
        .setTint(Colors.Blue2)
        .setOrigin(0.5, 0)
        .setInteractive({ useHandCursor: true })
        .on("pointerup", () => openExternalLink(linkedInUrl))
    );

    const linkedInUrl = "https://linkedin.com/in/rzinurov";
    this.add(
      this.scene.add
        .bitmapText(0, 20, Fonts.Pixel, linkedInUrl.toUpperCase(), 24)
        .setTint(Colors.Blue2)
        .setOrigin(0.5, 0)
        .setInteractive({ useHandCursor: true })
        .on("pointerup", () => openExternalLink(linkedInUrl))
    );
  }
}
