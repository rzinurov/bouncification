import { Bodies, Body, Engine, Sleeping, World } from "matter-js";
import { SingleHoopState } from "../../../common/schema/SingleHoopState";
import { PlayerState } from "../../../common/schema/PlayerState";
import WorldConfig from "../../../common/consts/WorldConfig";

export default class SingleHoopWorld {
  engine: Matter.Engine;
  state: SingleHoopState;
  players: {
    [name: string]: Body;
  } = {};

  constructor(state: SingleHoopState) {
    this.state = state;
    this.engine = Engine.create();
    this.engine.enableSleeping = true;

    const worldBounds = WorldConfig.bounds;
    const wallThickness = 300;
    const wallLeft = Bodies.rectangle(
      -wallThickness / 2,
      worldBounds.height / 2,
      wallThickness,
      worldBounds.height,
      {
        isStatic: true,
      }
    );
    const wallRight = Bodies.rectangle(
      worldBounds.width + wallThickness / 2,
      worldBounds.height / 2,
      wallThickness,
      worldBounds.height,
      { isStatic: true }
    );
    const wallTop = Bodies.rectangle(
      worldBounds.width / 2,
      -wallThickness / 2,
      worldBounds.width,
      wallThickness,
      {
        isStatic: true,
      }
    );
    const wallBottom = Bodies.rectangle(
      worldBounds.width / 2,
      worldBounds.height + wallThickness / 2,
      worldBounds.width,
      wallThickness,
      { isStatic: true }
    );

    World.add(this.engine.world, [wallLeft, wallRight, wallTop, wallBottom]);

    this.engine.world.gravity.y = 1;
  }

  addPlayer(sessionId: string, name: string, x: number, y: number) {
    const player = Bodies.circle(x, y, WorldConfig.player.spriteSize / 2);
    Body.setVelocity(player, { x: -10 + Math.random() * 20, y: 0 });
    Body.setAngle(player, -Math.PI / 4 + (Math.PI * Math.random()) / 2);
    player.restitution = 0.75;
    World.add(this.engine.world, [player]);
    this.players[sessionId] = player;
    this.state.players.set(sessionId, new PlayerState(name, x, y));
  }

  removePlayer(sessionId: string) {
    World.remove(this.engine.world, this.players[sessionId]);
    delete this.players[sessionId];
    this.state.players.delete(sessionId);
  }

  jumpTo(sessionId: string, x: number, y: number) {
    const player = this.players[sessionId];
    Sleeping.set(player, false);
    Body.setVelocity(player, {
      x:
        ((x - player.position.x) / WorldConfig.bounds.width) *
        WorldConfig.player.maxVelocity,
      y:
        ((y - player.position.y) / WorldConfig.bounds.height) *
        WorldConfig.player.maxVelocity,
    });
  }

  update(dt: number) {
    Engine.update(this.engine, dt);

    Object.entries(this.players).forEach(([sessionId, player]) => {
      const playerState = this.state.players.get(sessionId) as PlayerState;
      playerState.position.x = player.position.x;
      playerState.position.y = player.position.y;
      playerState.velocity.x = player.velocity.x;
      playerState.velocity.y = player.velocity.y;
      playerState.angle = player.angle * (180 / Math.PI);
      playerState.angularVelocity = player.angularVelocity;
      playerState.restitution = player.restitution;
    });
  }
}
