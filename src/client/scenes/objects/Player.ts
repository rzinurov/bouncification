import WorldConfig from "common/consts/WorldConfig";
import { PlayerState } from "common/schema/PlayerState";
import Phaser from "phaser";

export default class Player extends Phaser.Physics.Matter.Image {
  private aimGraphics: Phaser.GameObjects.Graphics;
  private aimCurve: Phaser.Curves.CubicBezier;
  private nameLabel: Phaser.GameObjects.Text;
  private aimVelocity?: { x: number; y: number };

  constructor(scene: Phaser.Scene, state: PlayerState, isYou: boolean) {
    super(scene.matter.world, state.position.x, state.position.y, "ball");

    this.setCircle(WorldConfig.player.spriteSize / 2);
    this.setBounce(WorldConfig.player.restitution);

    this.scene.add.existing(this);

    this.aimGraphics = this.scene.add.graphics();

    this.aimCurve = new Phaser.Curves.CubicBezier(
      new Phaser.Math.Vector2(0, 0),
      new Phaser.Math.Vector2(0, 0),
      new Phaser.Math.Vector2(0, 0),
      new Phaser.Math.Vector2(0, 0)
    );

    this.nameLabel = this.scene.add
      .text(0, 0, state.name, {
        font: `32px Arial`,
        color: isYou ? "#00dd00" : "#ffdd00",
      })
      .setOrigin(0.5) as Phaser.GameObjects.Text;

    this.updateState(state);
  }

  jump(velocity: { x: number; y: number }) {
    this.setVelocity(velocity.x, velocity.y);
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
  }

  private updateNameLabelPosition() {
    this.nameLabel.setPosition(this.x, this.y - this.height * 0.75);
  }

  private updateAim() {
    if (
      !this.aimVelocity ||
      (this.aimVelocity.x === 0 && this.aimVelocity.y === 0)
    ) {
      this.aimGraphics.setVisible(false);
      return;
    }

    this.aimGraphics.setPosition(this.x, this.y).setVisible(true);

    const aimLength = 15;

    const getTracePosition = (t: number) => {
      const velocityMultiplier = 6.5;
      const airFriction = 0.25 * Math.pow(t, 2);
      const g = 10;
      const vx = this.aimVelocity!.x * velocityMultiplier;
      const vy = this.aimVelocity!.y * velocityMultiplier;
      const angle = Math.atan2(vy, vx);
      return {
        x: Math.sign(vx) * (vx * t * Math.cos(angle) - airFriction),
        y:
          Math.sign(vy) * (vy * t * Math.sin(angle) - airFriction) +
          (g * Math.pow(t, 2)) / 2,
      };
    };

    const p1 = getTracePosition(aimLength * 0.25);
    const p2 = getTracePosition(aimLength * 0.75);
    const p3 = getTracePosition(aimLength);

    this.aimCurve.p0.x = 0;
    this.aimCurve.p0.y = 0;
    this.aimCurve.p1.x = p1.x;
    this.aimCurve.p1.y = p1.y;
    this.aimCurve.p2.x = p2.x;
    this.aimCurve.p2.y = p2.y;
    this.aimCurve.p3.x = p3.x;
    this.aimCurve.p3.y = p3.y;

    const points = this.aimCurve.getPoints(16);
    this.aimGraphics.clear();
    for (let i = 0; i < points.length; i++) {
      this.aimGraphics.fillStyle(0xffffff, 0.8 - i * 0.05);
      this.aimGraphics.fillCircle(points[i].x, points[i].y, 8);
    }
  }

  destroy() {
    this.nameLabel.destroy();
    this.aimGraphics.destroy();
    super.destroy();
  }
}
