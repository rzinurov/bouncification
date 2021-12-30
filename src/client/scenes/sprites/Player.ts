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
    super(scene, state.x, state.y);
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
    this.add(this.nameLabel);

    this.sessionId = sessionId;
    this.physicsContainer = scene.matter.add.gameObject(
      this
    ) as Phaser.Physics.Matter.Sprite;
    this.physicsContainer.setCircle(Dimensions.playerSpriteSize / 2);

    this.scene.add.existing(this);

    this.updateState(state);
  }

  updateState(state: PlayerState) {
    this.setPosition(state.x, state.y);
    this.physicsContainer.setAngle(state.angle);
    this.setAngle(0);
    this.image.setAngle(state.angle);
    this.physicsContainer.setVelocity(state.velocityX, state.velocityY);
    this.physicsContainer.setAngularVelocity(state.angularVelocity);
    this.physicsContainer.setBounce(state.restitution);
  }
}
