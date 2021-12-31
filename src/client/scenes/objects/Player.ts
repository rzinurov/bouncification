import Phaser from "phaser";
import { PlayerState } from "common/schema/PlayerState";
import WorldConfig from "common/consts/WorldConfig";
import PlayerPhysics from "common/physics/PlayerPhysics";

export default class Player extends Phaser.GameObjects.Container {
  matterBody: Phaser.Physics.Matter.Sprite;
  nameLabel: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, state: PlayerState, imageName: string) {
    super(scene, state.position.x, state.position.y);
    this.width = WorldConfig.player.spriteSize;
    this.height = WorldConfig.player.spriteSize;

    const image = scene.add.image(0, 0, imageName);
    this.add(image);

    this.nameLabel = this.scene.add
      .text(0, -this.height * 0.9, state.name, {
        font: `32px Arial`,
        color: "#ffdd00",
      })
      .setOrigin(0.5) as Phaser.GameObjects.Text;

    this.matterBody = scene.matter.add.gameObject(
      this
    ) as Phaser.Physics.Matter.Sprite;
    this.matterBody.setCircle(this.width / 2);
    this.matterBody.setBounce(WorldConfig.player.restitution);

    this.scene.add.existing(this);

    this.updateState(state);
  }

  jumpTo(pointer: { x: number; y: number }) {
    const velocity = PlayerPhysics.getVelocity(this.matterBody, pointer);
    this.matterBody.setVelocity(velocity.x, velocity.y);
  }

  updateState(state: PlayerState) {
    if (this.checkVectorDiff(this, state.position)) {
      this.matterBody.setPosition(state.position.x, state.position.y);
      this.matterBody.setAwake();
    }
    if (this.checkNumberDiff(this.angle, state.angle)) {
      this.matterBody.setAngle(state.angle);
      this.matterBody.setAwake();
    }
    this.matterBody.setVelocity(state.velocity.x, state.velocity.y);
    this.matterBody.setAngularVelocity(state.angularVelocity);
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
