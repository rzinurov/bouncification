import { Bodies, Body, Engine, Events, Sleeping, World } from "matter-js";
import WorldConfig from "common/consts/WorldConfig";
import PlayerPhysics from "common/physics/PlayerPhysics";
import { LeaderboardRowState } from "common/schema/LeaderboardRowState";
import { PlayerState } from "common/schema/PlayerState";
import { PositionState } from "common/schema/Primitives";
import { GameState } from "common/schema/GameState";
import { RoundState, RoundStates } from "common/schema/RoundState";

const HOOP_BOTTOM_HIT_TIMEOUT = 3000;
export default class GameWorld {
  private engine: Matter.Engine;
  private state: GameState;
  private players: {
    [name: string]: Body;
  } = {};
  private hoopBottomSensorHits: {
    [name: string]: number;
  } = {};
  private roundStateTimer: number = 0;
  private onNextRoundState: () => void;

  constructor(state: GameState, onNextRoundState: () => void) {
    this.state = state;
    this.onNextRoundState = onNextRoundState;

    this.engine = Engine.create();
    this.engine.enableSleeping = true;
    this.engine.gravity.y = WorldConfig.gravity.y;

    this.addWorldBounds();

    this.engine.gravity.y = 1;

    this.roundStateTimer = state.roundState.timer;
  }

  addHoop(x: number, y: number) {
    const backBoardOffset = new PositionState(-16, 0);
    const edgeOffset = new PositionState(168, 92);

    const backboardConfig = WorldConfig.hoop.backboard;
    const backboardBody = Bodies.rectangle(
      x + backBoardOffset.x,
      y + backBoardOffset.y,
      backboardConfig.width,
      backboardConfig.height
    );

    const edgeConfig = WorldConfig.hoop.edge;
    const edgeBody = Bodies.circle(
      x + edgeOffset.x,
      y + edgeOffset.y,
      edgeConfig.size / 2
    );

    const hoopSensorBody = Bodies.circle(
      x + edgeOffset.x / 2,
      y + edgeOffset.y + 32,
      8,
      {
        isStatic: true,
        isSensor: true,
      }
    );
    hoopSensorBody.label = "hoop_sensor";

    const hoopBottomSensorBody = Bodies.circle(
      x + edgeOffset.x / 2,
      y + edgeOffset.y + 64,
      8,
      {
        isStatic: true,
        isSensor: true,
      }
    );
    hoopBottomSensorBody.label = "hoop_bottom_sensor";

    Events.on(this.engine, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        if (pair.bodyA.label === hoopSensorBody.label) {
          this.onScoreSensorHit(pair.bodyB);
        } else if (pair.bodyB.label === hoopSensorBody.label) {
          this.onScoreSensorHit(pair.bodyA);
        }
        if (pair.bodyA.label === hoopBottomSensorBody.label) {
          this.onScoreBottomSensorHit(pair.bodyB);
        } else if (pair.bodyB.label === hoopBottomSensorBody.label) {
          this.onScoreBottomSensorHit(pair.bodyA);
        }
      });
    });

    const hoop = Body.create({
      parts: [backboardBody, edgeBody, hoopSensorBody, hoopBottomSensorBody],
      isStatic: true,
    });

    World.add(this.engine.world, [hoop]);

    this.state.hoop.position = new PositionState(x, y);
    this.state.hoop.backboardOffset = backBoardOffset;
    this.state.hoop.edgeOffset = edgeOffset;
  }

  addPlayer(sessionId: string, name: string) {
    const x =
      WorldConfig.bounds.width / 2 +
      (Math.random() * WorldConfig.bounds.width) / 4;
    const y = 100 + Math.random() * 200;

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

  nextRoundState() {
    const roundState = this.state.roundState;
    switch (roundState.value) {
      case RoundStates.Practice:
        roundState.value = RoundStates.Game;
        roundState.timer = 120 * 1000;
        roundState.topMessage = "GAME IS ON";
        roundState.bottomMessage = "HIT THE HOOP";
        this.roundStateTimer = roundState.timer;
        break;
      case RoundStates.Game:
        roundState.value = RoundStates.Results;
        roundState.timer = 60 * 1000;
        roundState.topMessage = "GAME OVER";
        roundState.bottomMessage = "WELL DONE";
        this.roundStateTimer = roundState.timer;
        break;
      case RoundStates.Results:
        this.roundStateTimer = 0;
        roundState.value = RoundStates.End;
        break;
    }
    this.onNextRoundState();
  }

  update(dt: number) {
    if (this.roundStateTimer - dt > 0) {
      this.roundStateTimer -= dt;
    } else {
      this.roundStateTimer = 0;
      this.nextRoundState();
    }

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

  updateRoundTimer() {
    this.state.roundState.timer = this.roundStateTimer;
  }

  private onScoreSensorHit(body: Body) {
    if (this.state.roundState.value !== RoundStates.Game) {
      return;
    }
    const playerBody = this.players[body.label];
    if (playerBody && playerBody.velocity.y >= 0) {
      const lastHoopBottomHit = this.hoopBottomSensorHits[body.label] || 0;
      if (lastHoopBottomHit < new Date().getTime() - HOOP_BOTTOM_HIT_TIMEOUT) {
        this.increaseScore(body.label, 1);
      }
    }
  }

  private onScoreBottomSensorHit(body: Body) {
    if (this.players[body.label]) {
      this.hoopBottomSensorHits[body.label] = new Date().getTime();
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
