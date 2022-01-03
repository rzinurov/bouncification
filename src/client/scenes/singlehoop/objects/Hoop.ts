import WorldConfig from "common/consts/WorldConfig";
import { HoopState } from "common/schema/HoopState";
import Phaser from "phaser";

export default class Hoop extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, state: HoopState) {
    super(scene, 0, 0);

    const backboardConfig = WorldConfig.hoop.backboard;
    const edgeConfig = WorldConfig.hoop.edge;

    // @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
    const Bodies = Phaser.Physics.Matter.Matter.Bodies;

    const backboardBody = Bodies.rectangle(
      state.position.x + state.backboardOffset.x,
      state.position.y + state.backboardOffset.y,
      backboardConfig.width,
      backboardConfig.height
    );

    const edgeBody = Bodies.circle(
      state.position.x + state.edgeOffset.x,
      state.position.y + state.edgeOffset.y,
      edgeConfig.size / 2
    );

    this.scene.matter.add.gameObject(this, {
      parts: [backboardBody, edgeBody],
      isStatic: true,
    });

    this.scene.add.existing(this);
  }
}
