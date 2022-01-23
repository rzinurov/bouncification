import WorldConfig from "common/consts/WorldConfig";
import PlayerPhysics from "common/physics/PlayerPhysics";
import { GameState } from "common/schema/GameState";
import { LeaderboardRowState } from "common/schema/LeaderboardRowState";
import { PlayerState } from "common/schema/PlayerState";
import { PositionState } from "common/schema/Primitives";
import { RoundStates } from "common/schema/RoundState";
import { Bodies, Body, Engine, Events, Sleeping, World } from "matter-js";

const HOOP_BOTTOM_HIT_TIMEOUT = 3000;
const BOT_JUMP_TIMEOUT_MIN = 5000;
const BOT_JUMP_TIMEOUT_MAX = 7000;
export default class GameWorld {
  private engine: Matter.Engine;
  private state: GameState;
  private players: {
    [name: string]: Body;
  } = {};
  private botJumpTimeouts: {
    [name: string]: number;
  } = {};
  private playerScoreTimeout: {
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
    const backBoardOffset = new PositionState(
      WorldConfig.hoop.backboard.offset.x,
      WorldConfig.hoop.backboard.offset.y
    );
    const edgeOffset = new PositionState(
      WorldConfig.hoop.edge.offset.x,
      WorldConfig.hoop.edge.offset.y
    );

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

    const sensorBody = Bodies.circle(
      x + edgeOffset.x / 2,
      y + edgeOffset.y + 48,
      8,
      {
        isStatic: true,
        isSensor: true,
      }
    );
    sensorBody.label = "hoop_sensor";

    const bottomSensorBody = Bodies.circle(
      x + edgeOffset.x / 2,
      y + edgeOffset.y + 80,
      8,
      {
        isStatic: true,
        isSensor: true,
      }
    );
    bottomSensorBody.label = "hoop_bottom_sensor";

    Events.on(this.engine, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        if (pair.bodyA.label === sensorBody.label) {
          this.onScoreSensorHit(pair.bodyB);
        } else if (pair.bodyB.label === sensorBody.label) {
          this.onScoreSensorHit(pair.bodyA);
        }
        if (pair.bodyA.label === bottomSensorBody.label) {
          this.onScoreBottomSensorHit(pair.bodyB);
        } else if (pair.bodyB.label === bottomSensorBody.label) {
          this.onScoreBottomSensorHit(pair.bodyA);
        }
      });
    });

    const hoop = Body.create({
      parts: [backboardBody, edgeBody, sensorBody, bottomSensorBody],
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
    player.friction = WorldConfig.player.friction;
    Body.setVelocity(player, { x: -10 + Math.random() * 20, y: 0 });
    Body.setAngle(player, -Math.PI / 4 + (Math.PI * Math.random()) / 2);
    World.add(this.engine.world, [player]);
    this.players[sessionId] = player;
    this.state.players.set(sessionId, new PlayerState(name, x, y));

    this.createLeaderboardRow(sessionId, name);
  }

  addBot(name: string) {
    const sessionId = "bot_" + Math.random();
    this.addPlayer(sessionId, name);
    this.botJumpTimeouts[sessionId] = this.getBotJumpTimeout();
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
    this.state.players.get(sessionId)!.lastJumpTime = Date.now();
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

    this.updatePlayerStates();

    this.updateBots(dt);
  }

  private updatePlayerStates() {
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

  updateBots(dt: number) {
    if (
      ![RoundStates.Practice, RoundStates.Game].includes(
        this.state.roundState.value
      )
    ) {
      return;
    }
    Object.keys(this.botJumpTimeouts).forEach((sessionId) => {
      let timeout = this.botJumpTimeouts[sessionId];
      if (timeout - dt > 0) {
        timeout -= dt;
      } else {
        timeout = this.getBotJumpTimeout();
        this.jump(sessionId, {
          x: -50 + Math.random() * 100,
          y: -10 - Math.random() * 40,
        });
      }
      this.botJumpTimeouts[sessionId] = timeout;
    });
  }

  private onScoreSensorHit(body: Body) {
    if (this.state.roundState.value !== RoundStates.Game) {
      return;
    }
    const playerBody = this.players[body.label];
    if (playerBody && playerBody.velocity.y >= 0) {
      const scoreTimeout = this.playerScoreTimeout[body.label] || 0;
      if (scoreTimeout < Date.now() - HOOP_BOTTOM_HIT_TIMEOUT) {
        this.increaseScore(body.label, 1);
        this.playerScoreTimeout[body.label] = Date.now();
      }
    }
  }

  private onScoreBottomSensorHit(body: Body) {
    if (this.players[body.label]) {
      this.playerScoreTimeout[body.label] = Date.now();
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

  private getBotJumpTimeout(): number {
    return (
      BOT_JUMP_TIMEOUT_MIN +
      Math.random() * (BOT_JUMP_TIMEOUT_MAX - BOT_JUMP_TIMEOUT_MIN)
    );
  }
}
