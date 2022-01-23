import BodyLabels from "client/consts/BodyLabels";
import Colors from "client/consts/Colors";
import Fonts from "client/consts/Fonts";
import Layers from "client/consts/Layers";
import Sprites from "client/consts/Sprites";
import WorldConfig from "common/consts/WorldConfig";
import { PlayerState } from "common/schema/PlayerState";
import Phaser from "phaser";

const SHADOW_MAX_WIDTH = 96;
const SHADOW_MAX_HEIGHT = 16;
const SHADOW_MAX_ALPHA = 0.75;

const JUMP_TIMEOUT_PERIOD = 3000;
const JUMP_TIMEOUT_INDICATOR_COLORS = [Colors.White, Colors.Red];
export default class Player extends Phaser.Physics.Matter.Image {
  private aim: Phaser.GameObjects.Group;
  private nameLabel: Phaser.GameObjects.BitmapText;
  private aimVelocity?: { x: number; y: number };
  private shadow: Phaser.GameObjects.Ellipse;
  private jumpTimeout: number = 0;
  private jumpTimeoutIndicator: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, state: PlayerState, isYou: boolean) {
    super(scene.matter.world, state.position.x, state.position.y, Sprites.Ball);

    this.setCircle(WorldConfig.player.spriteSize / 2, {
      label: BodyLabels.Ball,
    });
    this.setBounce(WorldConfig.player.restitution);
    this.setDepth(Layers.Players);

    this.shadow = scene.add
      .ellipse(0, 0, SHADOW_MAX_WIDTH, SHADOW_MAX_HEIGHT, Colors.Black)
      .setOrigin(0.5, 0.5)
      .setDepth(Layers.Shadows);

    this.scene.add.existing(this);

    this.aim = this.scene.add.group([], { classType: Phaser.GameObjects.Arc });
    for (let i = 0; i < 16; i++) {
      const point = this.scene.add
        .circle(0, 0, 8, Colors.White, 0.75 - i * 0.05)
        .setDepth(Layers.Front);
      this.aim.add(point);
    }

    this.nameLabel = this.scene.add
      .bitmapText(0, 0, Fonts.Pixel, state.name, 24)
      .setTint(isYou ? Colors.Green : Colors.Orange1)
      .setOrigin(0.5)
      .setDropShadow(2, 2, Colors.Background)
      .setDepth(Layers.Front);

    this.jumpTimeoutIndicator = this.scene.add
      .graphics()
      .setAlpha(0.75)
      .setDepth(Layers.Front);

    this.updateState(state);
  }

  jump(velocity: { x: number; y: number }) {
    // this.setAwake().setVelocity(velocity.x, velocity.y);
    this.jumpTimeout = JUMP_TIMEOUT_PERIOD;
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

  preUpdate(t: number, dt: number) {
    this.updateNameLabelPosition();
    this.updateAim();
    this.updateShadow();
    this.updateJumpTimeoutIndicator(dt);
  }

  private updateNameLabelPosition() {
    this.nameLabel.setPosition(this.x, this.y - this.height * 0.75);
  }

  private updateAim() {
    if (!this.canJump() || !this.isAiming()) {
      this.aim.setVisible(false);
      return;
    }

    const trajectory = this.calculateTrajectory(
      this.aimVelocity!,
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

  private updateShadow() {
    const ballHeight = WorldConfig.bounds.height - this.y;
    const maxHeight = WorldConfig.bounds.height;
    this.shadow.setPosition(this.x, maxHeight);
    this.shadow.setSize(
      SHADOW_MAX_WIDTH - (SHADOW_MAX_WIDTH * ballHeight) / maxHeight,
      SHADOW_MAX_HEIGHT - (SHADOW_MAX_HEIGHT * ballHeight) / maxHeight
    );
    this.shadow.setAlpha(
      SHADOW_MAX_ALPHA - (SHADOW_MAX_ALPHA * ballHeight) / maxHeight
    );
  }

  private updateJumpTimeoutIndicator(dt: number) {
    this.jumpTimeout -= dt;
    this.jumpTimeout = Math.max(this.jumpTimeout, 0);

    if (this.canJump() || !this.aimVelocity) {
      this.jumpTimeoutIndicator.setVisible(false);
      return;
    }

    const color =
      Math.round(this.jumpTimeout / 200) % 2
        ? JUMP_TIMEOUT_INDICATOR_COLORS[0]
        : JUMP_TIMEOUT_INDICATOR_COLORS[1];

    const position = this.getPosition();

    this.jumpTimeoutIndicator
      .clear()
      .lineStyle(12, color, 1)
      .beginPath()
      .arc(
        position.x,
        position.y,
        32,
        Phaser.Math.DegToRad(-90),
        Phaser.Math.DegToRad(
          -90 + (this.jumpTimeout / JUMP_TIMEOUT_PERIOD) * 360
        )
      )
      .strokePath()
      .setVisible(true);
  }

  private getPosition() {
    return {
      x: this.x + this.body.velocity.x,
      y: this.y + this.body.velocity.y,
    };
  }

  isAiming() {
    return (
      this.aimVelocity && (this.aimVelocity.x !== 0 || this.aimVelocity.y !== 0)
    );
  }

  canJump() {
    return this.jumpTimeout === 0;
  }

  onLeave() {
    super.destroy();
    this.aim.destroy();
    this.shadow.destroy();
    this.jumpTimeoutIndicator.destroy();
    this.nameLabel.destroy();
  }
}
