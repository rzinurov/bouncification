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

    const edgeBody = Bodies.circle(
      state.position.x + state.edgeOffset.x,
      state.position.y + state.edgeOffset.y,
      edgeConfig.size / 2
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
  graphics: Phaser.GameObjects.Graphics;
  frontParticles: BodyType[] = [];
  backParticles: BodyType[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.graphics = this.scene.add.graphics();

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
    const drawParticle = (particle: BodyType, aplha: number) => {
      this.graphics.beginPath();
      this.graphics.fillStyle(0xbbbbbb, aplha);
      this.graphics.fillCircle(particle.position.x, particle.position.y, 2);
      this.graphics.fillPath();
    };

    const drawLine = (p1: BodyType, p2: BodyType, aplha: number) => {
      this.graphics.beginPath();
      this.graphics.lineStyle(3, 0xbbbbbb, aplha);
      this.graphics.lineBetween(
        p1.position.x,
        p1.position.y,
        p2.position.x,
        p2.position.y
      );
      this.graphics.strokePath();
    };

    const drawParticles = (particles, alpha: number) => {
      for (let i = 0; i < particles.length; i++) {
        const column = i % this.columns;
        const row = Math.floor(i / this.columns);
        drawParticle(particles[i], alpha);
        if (column > 0 && column < this.columns) {
          drawLine(particles[i], particles[i - 1], alpha);
        }
        if (row > 0) {
          drawLine(
            particles[i],
            particles[(row - 1) * this.columns + column],
            alpha
          );
        }
      }
    };

    this.graphics.clear();
    drawParticles(this.frontParticles, 0.5);
    drawParticles(this.backParticles, 0.25);
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
