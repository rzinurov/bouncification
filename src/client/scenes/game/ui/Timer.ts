import Colors from "client/consts/Colors";
import Fonts from "client/consts/Fonts";
import StringUtils from "client/utils/StringUtils";
import { RoundState } from "common/schema/RoundState";
import Phaser from "phaser";

export default class Headerboard extends Phaser.GameObjects.Container {
  private topLabel!: Phaser.GameObjects.BitmapText;
  private timerLabel!: Phaser.GameObjects.BitmapText;
  private bottomLabel!: Phaser.GameObjects.BitmapText;
  private timerValue!: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    super(scene, x, y);

    this.add(this.scene.add.rectangle(0, 0, width, height, Colors.White, 0.05));

    this.topLabel = this.scene.add
      .bitmapText(0, -40, Fonts.Pixel, "", 15)
      .setTint(Colors.Blue1)
      .setOrigin(0.5, 0.5);
    this.add(this.topLabel);

    this.timerLabel = this.scene.add
      .bitmapText(0, 0, Fonts.Pixel, "00:00", 40)
      .setTint(Colors.Blue1)
      .setOrigin(0.5, 0.5);
    this.add(this.timerLabel);

    this.bottomLabel = this.scene.add
      .bitmapText(0, 40, Fonts.Pixel, "", 13)
      .setTint(Colors.Blue1)
      .setOrigin(0.5, 0.5);
    this.add(this.bottomLabel);

    this.timerValue = 1 * 60 * 1000;

    this.scene.add.existing(this);
  }

  preUpdate(time: number, delta: number) {
    if (this.timerValue - delta <= 0) {
      this.timerValue = 0;
    } else {
      this.timerValue -= delta;
    }
    const seconds = Math.floor(this.timerValue / 1000);
    if (seconds <= 0) {
      this.active = false;
    }
    this.timerLabel.text = this.formatTime(seconds);
    if (seconds > 10 || time % 1000 < 500) {
      this.timerLabel.setTint(Colors.Blue1);
    } else {
      this.timerLabel.setTint(Colors.Red);
    }
  }

  private formatTime(seconds: number): string {
    return `${StringUtils.pad(Math.floor(seconds / 60))}:${StringUtils.pad(
      seconds % 60
    )}`;
  }

  updateState(roundState: RoundState) {
    console.log("Updating timer state", roundState);

    this.topLabel.text = roundState.topMessage;
    this.timerValue = roundState.switchValueAfter;
    this.bottomLabel.text = roundState.bottomMessage;

    this.active = true;
  }
}
