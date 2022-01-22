import Colors from "client/consts/Colors";
import Fonts from "client/consts/Fonts";
import Layers from "client/consts/Layers";
import WorldConfig from "common/consts/WorldConfig";
import Phaser from "phaser";

const TIMER_MAX = 3000;

export default class ScorePopUp extends Phaser.GameObjects.Container {
  private label!: Phaser.GameObjects.BitmapText;
  private timer!: number;

  constructor(scene: Phaser.Scene, points: number) {
    super(
      scene,
      WorldConfig.hoop.x + WorldConfig.hoop.edge.offset.x / 2,
      WorldConfig.hoop.y + WorldConfig.hoop.edge.offset.y - 32
    );

    this.label = this.scene.add
      .bitmapText(0, 0, Fonts.Pixel, `+${points}`, 40)
      .setTint(Colors.Orange1)
      .setDropShadow(2, 2, Colors.Background)
      .setOrigin(0.5, 0.5);
    this.add(this.label);

    this.timer = TIMER_MAX;

    this.scene.add.existing(this);

    this.setDepth(Layers.Labels);
  }

  preUpdate(time: number, delta: number) {
    if (this.timer - delta <= 0) {
      this.timer = 0;
    } else {
      this.timer -= delta;
    }
    this.y -= 1;
    this.alpha = this.timer / TIMER_MAX;
    if (this.timer === 0) {
      this.destroy();
    }
  }
}
