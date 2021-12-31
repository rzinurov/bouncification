import Phaser from "phaser";
import { PlayerState } from "common/schema/PlayerState";
import WorldConfig from "common/consts/WorldConfig";

export default class Hoop extends Phaser.GameObjects.Container {
  physicsContainer: Phaser.Physics.Matter.Sprite;

  constructor(scene: Phaser.Scene, state: PlayerState) {
    super(scene, state.position.x, state.position.y);
    this.width = WorldConfig.player.spriteSize;
    this.height = WorldConfig.player.spriteSize;

    this.physicsContainer = scene.matter.add.gameObject(
      this
    ) as Phaser.Physics.Matter.Sprite;
    this.physicsContainer.setCircle(this.width / 2);

    this.scene.add.existing(this);

    this.initState(state);
  }

  initState(state: PlayerState) {
    this.physicsContainer.setBounce(state.restitution);
    this.updateState(state);
  }

  updateState(state: PlayerState) {
    if (this.checkVectorDiff(this, state.position)) {
      this.physicsContainer.setPosition(state.position.x, state.position.y);
      this.physicsContainer.setAwake();
    }
    if (this.checkNumberDiff(this.angle, state.angle)) {
      this.physicsContainer.setAngle(state.angle);
      this.physicsContainer.setAwake();
    }
    this.physicsContainer.setVelocity(state.velocity.x, state.velocity.y);
    this.physicsContainer.setAngularVelocity(state.angularVelocity);
  }

  checkVectorDiff(a: { x: number; y: number }, b: { x: number; y: number }) {
    return this.checkNumberDiff(a.x, b.x) || this.checkNumberDiff(a.y, b.y);
  }

  checkNumberDiff(a: number, b: number) {
    return Math.abs(a - b) >= 0.5;
  }

  preUpdate() {
    this.nameLabel.setPosition(this.x, this.y - this.height * 0.75);
  }

  destroy() {
    this.nameLabel.destroy();
    super.destroy();
  }
}
