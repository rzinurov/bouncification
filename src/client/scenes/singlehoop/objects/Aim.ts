import PlayerPhysics from "common/physics/PlayerPhysics";
import Phaser from "phaser";
import Player from "./Player";

export enum TraceEvents {
  Jump = "jump",
}

const AIM_VELOCITY_MULTIPLIER = 0.2;

export default class Aim extends Phaser.GameObjects.Container {
  anchor: Phaser.GameObjects.Arc;
  cursorLine: Phaser.GameObjects.Line;
  player: Player;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, 100, 100);
    this.player = player;

    this.anchor = this.scene.add.circle(0, 0, 16, 0xffffff);
    this.add(this.anchor);

    this.cursorLine = this.scene.add
      .line(0, 0, 0, 0, 0, 0, 0xffffff)
      .setLineWidth(4)
      .setOrigin(0, 0);
    this.add(this.cursorLine);

    this.setAlpha(0.25).setVisible(false);
    this.scene.add.existing(this);

    scene.input.on("pointerdown", (pointer: { x: any; y: any }) => {
      this.onPointerDown(pointer);
    });

    scene.input.on("pointerup", (pointer: { x: any; y: any }) => {
      this.onPointerUp(pointer);
    });

    scene.input.on("gameout", () => {
      this.onPointerUp({ x: this.x, y: this.y });
    });

    scene.input.on(
      "pointermove",
      (pointer: { x: any; y: any; isDown: boolean }) => {
        this.onPointerMove(pointer);
      }
    );
  }

  destroy() {
    super.destroy();
  }

  private onPointerDown(pointer: { x: number; y: number }) {
    this.setPosition(pointer.x, pointer.y).setVisible(true);
    this.cursorLine.setPosition(0, 0).setTo(0, 0);
    this.player.setAimVelocity({ x: 0, y: 0 });
  }

  private onPointerMove(pointer: { x: number; y: number; isDown: boolean }) {
    {
      if (!pointer.isDown) {
        return;
      }
      const velocity = this.getAimVelocity(pointer);
      this.player.setAimVelocity(velocity);

      this.cursorLine
        .setPosition(0, 0)
        .setTo(pointer.x - this.x, pointer.y - this.y);
    }
  }

  private onPointerUp(pointer: { x: number; y: number }) {
    if (!this.visible) {
      return;
    }
    this.setVisible(false);
    this.cursorLine.setPosition(0, 0).setTo(0, 0);

    if (this.player.isAiming() && this.player.canJump()) {
      const velocity = this.getAimVelocity(pointer);
      this.emit(TraceEvents.Jump, velocity);
    }

    this.player.clearAimVelocity();
  }

  private getAimVelocity(pointer: { x: number; y: number }) {
    return PlayerPhysics.limitVelocity({
      x: (pointer.x - this.x) * AIM_VELOCITY_MULTIPLIER,
      y: (pointer.y - this.y) * AIM_VELOCITY_MULTIPLIER,
    });
  }
}
