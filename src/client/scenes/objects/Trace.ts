import PlayerPhysics from "common/physics/PlayerPhysics";
import Phaser from "phaser";
import Player from "./Player";

export enum TraceEvents {
  Shoot = "shoot",
}

export default class Trace extends Phaser.GameObjects.Container {
  anchor: Phaser.GameObjects.Arc;
  cursorLine: Phaser.GameObjects.Line;
  aimGraphics: Phaser.GameObjects.Graphics;
  aimCurve: Phaser.Curves.CubicBezier;
  player: Player;
  lastPointerPosition?: { x: number; y: number };

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, 100, 100);
    this.player = player;
    this.mousePointer = this.scene.input.activePointer;

    scene.input.on("pointerdown", (pointer: { x: any; y: any }) => {
      this.onPointerDown(pointer);
    });

    scene.input.on("pointerup", (pointer: { x: any; y: any }) => {
      this.onPointerUp(pointer);
    });

    scene.input.on(
      "pointermove",
      (pointer: { x: any; y: any; isDown: boolean }) => {
        this.onPointerMove(pointer);
      }
    );

    this.anchor = this.scene.add.circle(0, 0, 16, 0xffffff, 0.25);
    this.add(this.anchor);

    this.cursorLine = this.scene.add
      .line(0, 0, 0, 0, 0, 0, 0xffffff, 0.25)
      .setOrigin(0, 0);
    this.cursorLine.setLineWidth(4);
    this.add(this.cursorLine);

    this.cursorLine.setPosition(50, 50);
    this.cursorLine.setTo(100, 100);

    this.aimGraphics = this.scene.add.graphics();

    this.aimCurve = new Phaser.Curves.CubicBezier(
      new Phaser.Math.Vector2(0, 0),
      new Phaser.Math.Vector2(0, 0),
      new Phaser.Math.Vector2(0, 0),
      new Phaser.Math.Vector2(0, 0)
    );

    this.setVisible(false);

    this.scene.add.existing(this);
  }

  preUpdate() {
    if (!this.visible || !this.lastPointerPosition) {
      return;
    }

    this.cursorLine
      .setPosition(0, 0)
      .setTo(
        this.lastPointerPosition.x - this.x,
        this.lastPointerPosition.y - this.y
      );

    const vector = this.getVelocity(this.lastPointerPosition);

    const aimLength = 15;

    const p1 = this.getTracePosition(vector, aimLength * 0.25);
    const p2 = this.getTracePosition(vector, aimLength * 0.75);
    const p3 = this.getTracePosition(vector, aimLength);

    this.aimGraphics.setPosition(this.player.x, this.player.y);
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

  private onPointerMove(pointer: { x: number; y: number; isDown: boolean }) {
    {
      if (!pointer.isDown) {
        return;
      }
      this.lastPointerPosition = pointer;
    }
  }

  private getTracePosition(vector: { x: number; y: number }, t: number) {
    const velocityMultiplier = 6.5;
    const airFriction = 0.25 * Math.pow(t, 2);
    const g = 10;
    const vx = vector.x * velocityMultiplier;
    const vy = vector.y * velocityMultiplier;
    const angle = Math.atan2(vy, vx);
    return {
      x: Math.sign(vx) * (vx * t * Math.cos(angle) - airFriction),
      y:
        Math.sign(vy) * (vy * t * Math.sin(angle) - airFriction) +
        (g * Math.pow(t, 2)) / 2,
    };
  }

  destroy() {
    super.destroy();
    this.aimGraphics.destroy();
  }

  private onPointerDown(pointer: { x: number; y: number }) {
    this.setPosition(pointer.x, pointer.y).setVisible(true);
    this.cursorLine.setPosition(0, 0).setTo(0, 0);
    this.aimGraphics.clear();
    this.aimGraphics.setVisible(true);
  }

  private onPointerUp(pointer: { x: number; y: number }) {
    this.setVisible(false);
    this.cursorLine.setPosition(0, 0).setTo(0, 0);
    this.aimGraphics.clear();
    this.aimGraphics.setVisible(false);

    const velocity = this.getVelocity(pointer);
    this.emit(TraceEvents.Shoot, velocity);
  }

  private getVelocity(pointer: { x: number; y: number }) {
    const multiplier = 0.2;
    return {
      x: (pointer.x - this.x) * multiplier,
      y: (pointer.y - this.y) * multiplier,
    };
  }
}
