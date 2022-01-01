import Phaser from "phaser";
import { PlayerState } from "common/schema/PlayerState";
import WorldConfig from "common/consts/WorldConfig";
import PlayerPhysics from "common/physics/PlayerPhysics";

export default class Player extends Phaser.Physics.Matter.Image {
  nameLabel: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, state: PlayerState, isYou: boolean) {
    super(scene.matter.world, state.position.x, state.position.y, "ball");

    this.setCircle(WorldConfig.player.spriteSize / 2);
    this.setBounce(WorldConfig.player.restitution);

    this.nameLabel = this.scene.add
      .text(0, 0, state.name, {
        font: `32px Arial`,
        color: isYou ? "#00dd00" : "#ffdd00",
      })
      .setOrigin(0.5) as Phaser.GameObjects.Text;

    this.scene.add.existing(this);

    this.updateState(state);
  }

  jumpTo(pointer: { x: number; y: number }) {
    const velocity = PlayerPhysics.getVelocity(this, pointer);
    this.setVelocity(velocity.x, velocity.y);
  }

  updateState(state: PlayerState) {
    if (this.checkVectorDiff(this, state.position)) {
      this.setPosition(state.position.x, state.position.y);
      this.setAwake();
    }
    if (this.checkNumberDiff(this.angle, state.angle)) {
      this.setAngle(state.angle);
      this.setAwake();
    }
    this.setVelocity(state.velocity.x, state.velocity.y);
    this.setAngularVelocity(state.angularVelocity);
  }

  private checkVectorDiff(
    a: { x: number; y: number },
    b: { x: number; y: number }
  ) {
    return this.checkNumberDiff(a.x, b.x) || this.checkNumberDiff(a.y, b.y);
  }

  private checkNumberDiff(a: number, b: number) {
    return Math.abs(a - b) >= 0.5;
  }

  preUpdate() {
    this.updateNameLabelPosition();
  }

  private updateNameLabelPosition() {
    this.nameLabel.setPosition(this.x, this.y - this.height * 0.75);
  }

  destroy() {
    this.nameLabel.destroy();
    super.destroy();
  }
}
