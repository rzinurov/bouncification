import Phaser from "phaser";
import { PlayerState } from "common/schema/PlayerState";
import Dimensions from "common/consts/Dimensions";

export default class Player extends Phaser.GameObjects.Container {
  physicsContainer: Phaser.Physics.Matter.Sprite;
  sessionId: string;
  image: Phaser.GameObjects.Image;
  nameLabel: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    sessionId: string,
    state: PlayerState,
    imageName: string
  ) {
    super(scene, state.position.x, state.position.y);
    this.width = Dimensions.playerSpriteSize;
    this.height = Dimensions.playerSpriteSize;

    this.image = scene.add.image(0, 0, imageName);
    this.add(this.image);

    this.nameLabel = this.scene.add
      .text(0, -this.height * 0.9, state.name, {
        font: "16px Arial",
        color: "#ffdd00",
      })
      .setOrigin(0.5) as Phaser.GameObjects.Text;

    this.sessionId = sessionId;
    this.physicsContainer = scene.matter.add.gameObject(
      this
    ) as Phaser.Physics.Matter.Sprite;
    this.physicsContainer.setCircle(Dimensions.playerSpriteSize / 2);

    this.scene.add.existing(this);
  }

  initState(state: PlayerState) {
    this.physicsContainer.setBounce(state.restitution);
    this.updateState(state);
  }

  updateState(state: PlayerState) {
    if (this.checkVectorDiff(this, state.position)) {
      this.physicsContainer.setPosition(state.position.x, state.position.y);
    }
    if (this.checkNumberDiff(this.angle, state.angle)) {
      this.physicsContainer.setAngle(state.angle);
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
