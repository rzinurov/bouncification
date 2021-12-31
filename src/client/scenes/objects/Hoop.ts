import WorldConfig from "common/consts/WorldConfig";
import { HoopState } from "common/schema/HoopState";
import { BodyType } from "matter";
import Phaser from "phaser";

export default class Hoop extends Phaser.GameObjects.Container {
  backboard: BodyType;

  constructor(scene: Phaser.Scene, state: HoopState) {
    super(scene, state.position.x, state.position.y);
    this.width = WorldConfig.player.spriteSize;
    this.height = WorldConfig.player.spriteSize;

    this.backboard = scene.matter.add.rectangle(
      state.position.x,
      state.position.y,
      WorldConfig.hoop.backboard.width,
      WorldConfig.hoop.backboard.height,
      { isStatic: true }
    );

    this.scene.add.existing(this);
  }
}
