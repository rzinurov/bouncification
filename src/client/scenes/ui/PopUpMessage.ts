import Colors from "client/consts/Colors";
import Fonts from "client/consts/Fonts";
import Layers from "client/consts/Layers";
import * as Phaser from "phaser";

const SHOW_TIMEOUT = 3000;

export default class PopUpMessage extends Phaser.GameObjects.BitmapText {
  timer: number = 0;

  constructor(scene: Phaser.Scene) {
    super(
      scene,
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 2,
      Fonts.Pixel,
      "",
      40,
      Phaser.GameObjects.BitmapText.ALIGN_CENTER
    );
    this.setOrigin(0.5, 0.5)
      .setDepth(Layers.Labels)
      .setDropShadow(4, 4, Colors.Background)
      .setTint(Colors.Orange3);

    this.setVisible(false).setActive(false);

    this.scene.add.existing(this);
  }

  show(text: string) {
    this.setText(text).setVisible(true).setActive(true);
    this.timer = SHOW_TIMEOUT;
  }

  preUpdate(t: number, dt: number) {
    if (this.timer - dt > 0) {
      this.timer -= dt;
    } else {
      this.timer = 0;
    }
    const isActive = this.timer > 0;
    this.setVisible(isActive).setActive(this.timer > 0);
  }
}
