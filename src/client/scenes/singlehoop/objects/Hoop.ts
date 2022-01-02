import WorldConfig from "common/consts/WorldConfig";
import { HoopState } from "common/schema/HoopState";
import Phaser from "phaser";

export default class Hoop extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, state: HoopState) {
    super(scene, 0, 0);

    const backboardConfig = WorldConfig.hoop.backboard;
    const edgeConfig = WorldConfig.hoop.edge;

    this.add(
      this.scene.add
        .rectangle(
          state.backboardOffset.x,
          state.backboardOffset.y + 32,
          16,
          128,
          0xbbbbbb,
          0.5
        )
        .setOrigin(0.5, 0)
        .setAngle(45)
    );

    this.add(
      this.scene.add
        .rectangle(
          state.backboardOffset.x + backboardConfig.width,
          state.edgeOffset.y,
          state.edgeOffset.x,
          4,
          0xdddddd,
          0.3
        )
        .setOrigin(0, 0.5)
    );

    this.add(
      this.scene.add.rectangle(
        state.backboardOffset.x + 12, //TODO: why?
        state.backboardOffset.y,
        backboardConfig.width,
        backboardConfig.height,
        0xffffff
      )
    );

    this.add(
      this.scene.add.circle(
        state.edgeOffset.x + 12, //TODO: why?
        state.edgeOffset.y,
        edgeConfig.size / 2,
        0xffffff
      )
    );

    this.scene.add.existing(this);

    // @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
    const Bodies = Phaser.Physics.Matter.Matter.Bodies;

    const backboardBody = Bodies.rectangle(
      state.backboardOffset.x,
      state.backboardOffset.y,
      backboardConfig.width,
      backboardConfig.height
    );

    const edgeBody = Bodies.circle(
      state.edgeOffset.x,
      state.edgeOffset.y,
      edgeConfig.size / 2
    );

    this.scene.matter.add.gameObject(this, {
      parts: [backboardBody, edgeBody],
      isStatic: true,
    });

    this.setPosition(state.position.x, state.position.y);
  }
}
