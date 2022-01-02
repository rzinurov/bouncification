import Player from "client/scenes/objects/Player";
import { Bodies, Body, Engine, Events, Sleeping, World } from "matter-js";
import WorldConfig from "../../../common/consts/WorldConfig";
import PlayerPhysics from "../../../common/physics/PlayerPhysics";
import { LeaderboardRowState } from "../../../common/schema/LeaderboardRowState";
import { PlayerState } from "../../../common/schema/PlayerState";
import { PositionState } from "../../../common/schema/Primitives";
import { SingleHoopState } from "../../../common/schema/SingleHoopState";

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
    this.engine.gravity.y = WorldConfig.gravity.y;

    this.addWorldBounds();

    this.engine.gravity.y = 1;
  }

  addHoop(x: number, y: number) {
    const backBoardOffset = new PositionState(-16, 0);
    const edgeOffset = new PositionState(160, 64);

    const backboardConfig = WorldConfig.hoop.backboard;
    const backboard = Bodies.rectangle(
      x + backBoardOffset.x,
      y + backBoardOffset.y,
      backboardConfig.width,
      backboardConfig.height
    );

    const edgeConfig = WorldConfig.hoop.edge;
    const edge = Bodies.circle(
      x + edgeOffset.x,
      y + edgeOffset.y,
      edgeConfig.size / 2
    );

    const scoreSensor = Bodies.circle(
      x + edgeOffset.x / 2,
      y + edgeOffset.y + 32,
      8,
      {
        isStatic: true,
        isSensor: true,
      }
    );
    scoreSensor.label = "score_sensor";

    Events.on(this.engine, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        if (pair.bodyA.label === scoreSensor.label) {
          this.onScoreSensorHit(pair.bodyB);
        } else if (pair.bodyB.label === scoreSensor.label) {
          this.onScoreSensorHit(pair.bodyA);
        }
      });
    });

    const hoop = Body.create({
      parts: [backboard, edge, scoreSensor],
      isStatic: true,
    });
    Body.setPosition(hoop, { x, y });

    World.add(this.engine.world, [hoop]);

    this.state.hoop.position = new PositionState(x, y);
    this.state.hoop.backboardOffset = backBoardOffset;
    this.state.hoop.edgeOffset = edgeOffset;
  }

  addPlayer(sessionId: string, name: string, x: number, y: number) {
    const player = Bodies.circle(x, y, WorldConfig.player.spriteSize / 2);
    player.label = sessionId;
    player.restitution = WorldConfig.player.restitution;
    Body.setVelocity(player, { x: -10 + Math.random() * 20, y: 0 });
    Body.setAngle(player, -Math.PI / 4 + (Math.PI * Math.random()) / 2);
    World.add(this.engine.world, [player]);
    this.players[sessionId] = player;
    this.state.players.set(sessionId, new PlayerState(name, x, y));

    this.createLeaderboardRow(sessionId, name);
  }

  removePlayer(sessionId: string) {
    World.remove(this.engine.world, this.players[sessionId]);
    delete this.players[sessionId];
    this.state.players.delete(sessionId);
  }

  jump(sessionId: string, velocity: { x: number; y: number }) {
    const player = this.players[sessionId];
    Sleeping.set(player, false);
    Body.setVelocity(player, PlayerPhysics.limitVelocity(velocity));
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
    });
  }

  private onScoreSensorHit(body: Body) {
    if (this.players[body.label]) {
      this.increaseScore(body.label, 1);
    }
  }

  private createLeaderboardRow(sessionId: string, name: string) {
    const leaderboardRow = new LeaderboardRowState();
    leaderboardRow.name = name;
    leaderboardRow.score = 0;
    this.state.leaderboard.set(sessionId, leaderboardRow);
  }

  private increaseScore(sessionId: string, delta: number) {
    this.state.leaderboard.get(sessionId)!.score += delta;
  }

  private addWorldBounds() {
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
  }
}
