import Phaser from "phaser";
import Player from "./Player";

export enum TraceEvents {
  Shoot = "shoot",
}

export default class Trace extends Phaser.GameObjects.Container {
  downCoordinates?: { x: number; y: number };
  line: Phaser.GameObjects.Line;
  player: Player;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, 100, 100);
    this.player = player;

    this.line = this.scene.add
      .line(0, 0, 0, 0, 0, 0, 0xffffff, 0.5)
      .setLineWidth(4)
      .setOrigin(0, 0)
      .setVisible(false);

    scene.input.on("pointerdown", (pointer: { x: any; y: any }) => {
      // server.jumpTo(pointer);
      // player.jumpTo(pointer);
      this.onPointerDown(pointer);
    });

    scene.input.on("pointerup", (pointer: { x: any; y: any }) => {
      // server.jumpTo(pointer);
      // player.jumpTo(pointer);
      this.onPointerUp(pointer);
    });

    this.scene.add.existing(this);
  }

  preUpdate() {
    if (this.downCoordinates) {
      const vector = this.getDisplayVector();
      this.line.setPosition(this.player.x, this.player.y);
      this.line.setTo(0, 0, vector.x, vector.y);
    }
  }

  destroy() {
    super.destroy();
    this.line.destroy();
  }

  private onPointerDown(pointer: { x: number; y: number }) {
    this.downCoordinates = { x: pointer.x, y: pointer.y };
    this.x = pointer.x;
    this.y = pointer.y;
    this.line.setVisible(true);
  }

  private onPointerUp(pointer: { x: number; y: number }) {
    this.line.setVisible(false);
    const vector = this.getVector();
    this.emit(TraceEvents.Shoot, vector);
    this.downCoordinates = undefined;
  }

  private getVector() {
    if (!this.downCoordinates) {
      return { x: 0, y: 0 };
    }
    const mousePointer = this.scene.input.mousePointer;
    return {
      x: mousePointer.x - this.downCoordinates.x,
      y: mousePointer.y - this.downCoordinates.y,
    };
  }

  private getDisplayVector() {
    const vector = this.getVector();
    return {
      x: vector.x * 2,
      y: vector.y * 2,
    };
  }
}
