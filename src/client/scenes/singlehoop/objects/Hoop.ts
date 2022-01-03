import Sprites from "client/consts/Sprites";
import WorldConfig from "common/consts/WorldConfig";
import { HoopState } from "common/schema/HoopState";
import { BodyType } from "matter";
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

    const leftEdgeBody = Bodies.circle(
      state.position.x,
      state.position.y + state.edgeOffset.y,
      edgeConfig.size / 2
    );

    const rightEdgeBody = Bodies.circle(
      state.position.x + state.edgeOffset.x,
      state.position.y + state.edgeOffset.y,
      edgeConfig.size / 2
    );

    this.scene.matter.add.gameObject(this, {
      parts: [backboardBody, leftEdgeBody, rightEdgeBody],
      isStatic: true,
    });

    const chainLength = 5;
    const leftChain = this.createChain(leftEdgeBody, chainLength);
    const rightChain = this.createChain(rightEdgeBody, chainLength);
    for (let i = 2; i < chainLength; i++) {
      this.scene.matter.add.joint(
        leftChain[i],
        rightChain[i],
        (0.75 - i * 0.05) *
          (rightEdgeBody.position.x - leftEdgeBody.position.x),
        0.01,
        {
          damping: 0,
        }
      );
    }

    this.scene.add.existing(this);
  }

  private createChain(prev: any, length: number) {
    const links: BodyType[] = [];
    for (var i = 0; i < length; i++) {
      const link = this.scene.matter.add.image(
        prev.position.x,
        prev.position.y + i * 16,
        Sprites.ChainLink,
        undefined,
        {
          mass: i === length ? 2 : 0.2,
        }
      );
      link.setCircle(12);
      link.setFixedRotation();
      const linkBody = link.body as BodyType;
      this.scene.matter.add.joint(prev, linkBody, 24, 0.2, {
        damping: 0,
      });
      prev = linkBody;
      links.push(linkBody);
    }
    return links;
  }
}
