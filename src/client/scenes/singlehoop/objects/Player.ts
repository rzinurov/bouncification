import Fonts from "client/consts/Fonts";
import Sprites from "client/consts/Sprites";
import WorldConfig from "common/consts/WorldConfig";
import { PlayerState } from "common/schema/PlayerState";
import Phaser from "phaser";

const shadowMaxWidth = 96;
const shadowMaxHeight = 16;
const shadowMaxAlpha = 0.75;

const defaultColor = 0xffdd00;
const playerColor = 0x00dd00;
export default class Player extends Phaser.Physics.Matter.Image {
  private aim: Phaser.GameObjects.Group;
  private nameLabel: Phaser.GameObjects.BitmapText;
  private aimVelocity?: { x: number; y: number };
  private shadow: Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, state: PlayerState, isYou: boolean) {
    super(scene.matter.world, state.position.x, state.position.y, Sprites.Ball);

    this.setCircle(WorldConfig.player.spriteSize / 2);
    this.setBounce(WorldConfig.player.restitution);
    this.setDepth(1);

    this.shadow = scene.add
      .ellipse(0, 0, shadowMaxWidth, shadowMaxHeight, 0x000000)
      .setOrigin(0.5, 0.5);

    this.scene.add.existing(this);

    this.aim = this.scene.add.group([], { classType: Phaser.GameObjects.Arc });
    for (let i = 0; i < 16; i++) {
      this.aim.add(this.scene.add.circle(0, 0, 8, 0xffffff, 0.75 - i * 0.05));
    }

    this.nameLabel = this.scene.add
      .bitmapText(0, 0, Fonts.Pixel, state.name, 20)
      .setTint(isYou ? playerColor : defaultColor)
      .setOrigin(0.5);

    this.updateState(state);
  }

  jump(velocity: { x: number; y: number }) {
    this.setAwake().setVelocity(velocity.x, velocity.y);
  }

  getAimVelocity() {
    return this.aimVelocity;
  }

  setAimVelocity(velocity: { x: number; y: number }) {
    this.aimVelocity = velocity;
  }

  clearAimVelocity() {
    this.aimVelocity = undefined;
  }

  updateState(state: PlayerState) {
    const checkVectorDiff = (
      a: { x: number; y: number },
      b: { x: number; y: number }
    ) => {
      return checkNumberDiff(a.x, b.x) || checkNumberDiff(a.y, b.y);
    };
    const checkNumberDiff = (a: number, b: number) => {
      return Math.abs(a - b) >= 0.5;
    };
    if (checkVectorDiff(this, state.position)) {
      this.setPosition(state.position.x, state.position.y);
      this.setAwake();
    }
    if (checkNumberDiff(this.angle, state.angle)) {
      this.setAngle(state.angle);
      this.setAwake();
    }
    this.setVelocity(state.velocity.x, state.velocity.y);
    this.setAngularVelocity(state.angularVelocity);
  }

  preUpdate() {
    this.updateNameLabelPosition();
    this.updateAim();
    this.updateShadow();
  }

  private updateNameLabelPosition() {
    this.nameLabel.setPosition(this.x, this.y - this.height * 0.75);
  }

  private updateAim() {
    if (
      !this.aimVelocity ||
      (this.aimVelocity.x === 0 && this.aimVelocity.y === 0)
    ) {
      this.aim.setVisible(false);
      return;
    }

    const trajectory = this.calculateTrajectory(
      this.aimVelocity,
      this.aim.getChildren().length * 2
    );

    for (let i = 0; i < this.aim.getChildren().length; i++) {
      const aimPoint = this.aim.getChildren()[i] as Phaser.GameObjects.Arc;
      const trajectoryPoint = trajectory[i * 2];
      aimPoint.setPosition(trajectoryPoint.x, trajectoryPoint.y);
    }

    this.aim.setVisible(true);
  }

  private calculateTrajectory(
    velocity: { x: number; y: number },
    numPoints: number
  ) {
    const points: { x: number; y: number }[] = [];

    // @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
    const Body = Phaser.Physics.Matter.Matter.Body;

    const matterBody = this.body as MatterJS.BodyType;
    const realPosition = { ...matterBody.position };
    const realForce = { ...matterBody.force };
    const realVelocity = { ...matterBody.velocity };
    const realAngle = matterBody.angle;
    const realAngularVelocity = matterBody.angularVelocity;

    Body.setVelocity(matterBody, velocity);

    for (let i = 0; i < numPoints; i++) {
      matterBody.force.y += matterBody.mass * WorldConfig.gravity.y * 0.001;
      Body.update(matterBody, 16.19, 1, 1);
      points.push({ ...matterBody.position });
      matterBody.force.x = 0;
      matterBody.force.y = 0;
    }

    Body.setPosition(matterBody, realPosition);
    matterBody.force = realForce;
    Body.setVelocity(matterBody, realVelocity);
    Body.setAngle(matterBody, realAngle);
    Body.setAngularVelocity(matterBody, realAngularVelocity);

    return points;
  }

  updateShadow() {
    const ballHeight = WorldConfig.bounds.height - this.y;
    const maxHeight = WorldConfig.bounds.height;
    this.shadow.setPosition(this.x, maxHeight);
    this.shadow.setSize(
      shadowMaxWidth - (shadowMaxWidth * ballHeight) / maxHeight,
      shadowMaxHeight - (shadowMaxHeight * ballHeight) / maxHeight
    );
    this.shadow.setAlpha(
      shadowMaxAlpha - (shadowMaxAlpha * ballHeight) / maxHeight
    );
  }

  destroy() {
    this.nameLabel.destroy();
    this.aim.destroy();
    super.destroy();
  }
}
