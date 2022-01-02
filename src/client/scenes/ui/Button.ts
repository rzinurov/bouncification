import Fonts from "client/consts/Fonts";
import Phaser from "phaser";

export default class Hoop extends Phaser.GameObjects.Container {
  rect: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.BitmapText;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
    super(scene, x, y);

    this.rect = this.scene.add
      .rectangle(0, 0, 320, 96, 0xdddddd, 0.75)
      .setInteractive({ useHandCursor: true });

    this.text = this.scene.add
      .bitmapText(0, 0, Fonts.Pixel, "CONNECT", 32)
      .setTint(0x000000)
      .setOrigin(0.5, 0.5);

    this.add(this.rect).add(this.text);

    this.scene.add.existing(this);
  }

  onClick(fn: () => void) {
    this.rect.on("pointerup", fn);
  }
}
