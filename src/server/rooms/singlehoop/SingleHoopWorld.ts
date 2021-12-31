import { Bodies, Body, Engine, World } from "matter-js";
import { SingleHoopState } from "../../../common/schema/SingleHoopState";
import { PlayerState } from "../../../common/schema/PlayerState";
import Sprites from "../../../common/consts/Dimensions";
import Dimensions from "../../../common/consts/Dimensions";

export default class SingleHoopWorld {
  engine: Matter.Engine;
  state: SingleHoopState;
  players: {
    [name: string]: Body;
  } = {};

  constructor(state: SingleHoopState) {
    this.state = state;
    this.engine = Engine.create();

    const size = Dimensions.worldBounds;
    const wallLeft = Bodies.rectangle(-15, size.height / 2, 30, size.height, {
      isStatic: true,
    });
    const wallRight = Bodies.rectangle(
      size.width + 15,
      size.height / 2,
      30,
      size.height,
      { isStatic: true }
    );
    const wallTop = Bodies.rectangle(size.width / 2, -15, size.width, 30, {
      isStatic: true,
    });
    const wallBottom = Bodies.rectangle(
      size.width / 2,
      size.height + 15,
      size.width,
      30,
      { isStatic: true }
    );

    World.add(this.engine.world, [wallLeft, wallRight, wallTop, wallBottom]);

    this.engine.world.gravity.y = 1;
  }

  addPlayer(sessionId: string, name: string, x: number, y: number) {
    const player = Bodies.circle(x, y, Sprites.playerSpriteSize / 2);
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
    Body.setVelocity(player, {
      x: ((x - player.position.x) / Dimensions.worldBounds.width) * 50,
      y: ((y - player.position.y) / Dimensions.worldBounds.height) * 50,
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
