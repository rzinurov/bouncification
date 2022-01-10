import Colors from "client/consts/Colors";
import Fonts from "client/consts/Fonts";
import Phaser from "phaser";

export default class Hoop extends Phaser.GameObjects.Container {
  rect: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.BitmapText;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    width: number = 320,
    height: number = 96
  ) {
    super(scene, x, y);

    this.rect = this.scene.add
      .rectangle(0, 0, width, height, Colors.Blue3, 0.75)
      .setInteractive({ useHandCursor: true });

    this.text = this.scene.add
      .bitmapText(0, 0, Fonts.Pixel, text, 32)
      .setTint(Colors.Blue1)
      .setOrigin(0.5, 0.5);

    this.add(this.rect).add(this.text);

    this.scene.add.existing(this);
  }

  onClick(fn: () => void) {
    this.rect.on("pointerup", fn);
  }

  setText(text: string) {
    return this.text.setText(text);
  }
}
