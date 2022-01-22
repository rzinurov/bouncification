import BodyLabels from "client/consts/BodyLabels";
import Colors from "client/consts/Colors";
import Layers from "client/consts/Layers";
import Sprites from "client/consts/Sprites";
import WorldConfig from "common/consts/WorldConfig";
import { HoopState } from "common/schema/HoopState";
import { BodyType } from "matter";
import Phaser from "phaser";

export default class Hoop extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, state: HoopState) {
    super(scene, 0, 0);

    this.scene.add
      .image(-8, 115, Sprites.Hoop)
      .setOrigin(0, 0)
      .setDepth(Layers.Back);
    this.scene.add
      .image(24, 183, Sprites.HoopFront)
      .setOrigin(0, 0)
      .setDepth(Layers.Front);

    const backboardConfig = WorldConfig.hoop.backboard;
    const edgeConfig = WorldConfig.hoop.edge;

    // @ts-ignore: Property 'Matter' does not exist on type 'typeof Matter'.
    const Bodies = Phaser.Physics.Matter.Matter.Bodies;

    const backboardBody = Bodies.rectangle(
      state.position.x + state.backboardOffset.x,
      state.position.y + state.backboardOffset.y,
      backboardConfig.width,
      backboardConfig.height,
      { label: BodyLabels.HoopBackboard }
    );

    const edgeBody = Bodies.circle(
      state.position.x + state.edgeOffset.x,
      state.position.y + state.edgeOffset.y,
      edgeConfig.size / 2,
      { label: BodyLabels.HoopEdge }
    );

    this.scene.matter.add.gameObject(this, {
      parts: [backboardBody, edgeBody],
      isStatic: true,
    });

    const net = new Net(
      scene,
      state.position.x,
      state.position.y + state.edgeOffset.y - 4
    );
    this.scene.add.existing(net);

    this.scene.add.existing(this);
  }
}

class Net extends Phaser.GameObjects.Container {
  columns: number = 9;
  rows: number = 6;
  backGraphics: Phaser.GameObjects.Graphics;
  backParticles: BodyType[] = [];
  frontGraphics: Phaser.GameObjects.Graphics;
  frontParticles: BodyType[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.backGraphics = this.scene.add.graphics().setDepth(Layers.Back);
    this.frontGraphics = this.scene.add.graphics().setDepth(Layers.Front);

    const frontCloth = this.createCloth(this.x, this.y, 22, false);

    const backCloth = this.createCloth(this.x, this.y, -12, true);

    for (let i = 0; i < frontCloth.bodies.length; i++) {
      const frontParticle = frontCloth.bodies[i];
      const backParticle = backCloth.bodies[i];
      const column = i % this.columns;
      if (column === 0 || column == this.columns - 1) {
        this.scene.matter.add.constraint(frontParticle, backParticle, 0, 1);
      }
      this.frontParticles.push(frontParticle);
      this.backParticles.push(backParticle);
    }
  }

  preUpdate() {
    const drawParticle = (
      graphics: Phaser.GameObjects.Graphics,
      particle: BodyType,
      aplha: number
    ) => {
      graphics.beginPath();
      graphics.fillStyle(Colors.Gray, aplha);
      graphics.fillCircle(particle.position.x, particle.position.y, 2);
      graphics.fillPath();
    };

    const drawLine = (
      graphics: Phaser.GameObjects.Graphics,
      p1: BodyType,
      p2: BodyType,
      aplha: number
    ) => {
      graphics.beginPath();
      graphics.lineStyle(3, Colors.Gray, aplha);
      graphics.lineBetween(
        p1.position.x,
        p1.position.y,
        p2.position.x,
        p2.position.y
      );
      graphics.strokePath();
    };

    const drawParticles = (
      graphics: Phaser.GameObjects.Graphics,
      particles: any[],
      alpha: number
    ) => {
      graphics.clear();
      for (let i = 0; i < particles.length; i++) {
        const column = i % this.columns;
        const row = Math.floor(i / this.columns);
        drawParticle(graphics, particles[i], alpha);
        if (column > 0 && column < this.columns) {
          drawLine(graphics, particles[i], particles[i - 1], alpha);
        }
        if (row > 0) {
          drawLine(
            graphics,
            particles[i],
            particles[(row - 1) * this.columns + column],
            alpha
          );
        }
      }
    };

    drawParticles(this.backGraphics, this.backParticles, 0.25);
    drawParticles(this.frontGraphics, this.frontParticles, 0.5);
  }

  private createCloth(
    x: number,
    y: number,
    middlePointsOffsetY: number,
    ignoreCollisions: boolean
  ) {
    const group = this.scene.matter.world.nextGroup(true);

    const particleOptions = {
      friction: 0.001,
      collisionFilter: { group: group },
      render: { visible: false },
      label: BodyLabels.HoopNet,
    };
    const constraintOptions = { stiffness: 0.1 };

    const cloth = this.scene.matter.add.softBody(
      x,
      y,
      this.columns,
      this.rows,
      3,
      3,
      false,
      9,
      particleOptions,
      constraintOptions
    );

    for (let i = 0; i < cloth.bodies.length; i++) {
      const body = cloth.bodies[i];
      const column = i % this.columns;
      const row = Math.floor(i / this.columns);
      const middleColumns = [
        Math.round(this.columns * 0.33),
        Math.round(this.columns * 0.66),
      ];
      if (row === 0 && middleColumns.includes(column)) {
        body.position.y = y + middlePointsOffsetY;
      }
      const attachedColumns = [...middleColumns, 0, this.columns - 1];
      if (row === 0 && attachedColumns.includes(column)) {
        body.isStatic = true;
        body.collisionFilter.mask = 0;
      }
      if (ignoreCollisions || (column > 1 && column < this.columns - 2)) {
        body.collisionFilter.mask = 0;
      }
      body.mass = 0.1;
    }

    return cloth;
  }
}
