import Layers from "client/consts/Layers";
import Scenes from "client/consts/Scenes";
import Sprites from "client/consts/Sprites";
import Server from "client/services/Server";
import WorldConfig from "common/consts/WorldConfig";
import { RoundStates } from "common/schema/RoundState";
import Phaser from "phaser";
import PopUpMessage from "./ui/PopUpMessage";
import Aim, { TraceEvents } from "./objects/Aim";
import Hoop from "./objects/Hoop";
import Player from "./objects/Player";
import Leaderboard from "./ui/Leaderboard";
import Timer from "./ui/Timer";
import ScorePopUp from "./ui/ScorePopUp";
import Sounds from "client/consts/Sounds";
import BodyLabels from "client/consts/BodyLabels";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super(Scenes.Game);
  }

  async create(data: { server: Server; name: string }) {
    const { server } = data;

    const players: { [name: string]: Player } = {};
    const scores: { [sessionId: string]: number } = {};
    let roundStateValue: number = -1;

    let leaderboard: Leaderboard;
    let timer: Timer;
    let aim: Aim;

    const scorePopUps = this.add
      .group({ classType: ScorePopUp })
      .setDepth(Layers.Labels);
    const popUpMessage: PopUpMessage = new PopUpMessage(this);

    server.onInitialState((state) => {
      this.add
        .image(-400, 880, Sprites.Floor)
        .setDepth(Layers.Back)
        .setOrigin(0, 0);
      new Hoop(this, state.hoop);
    });

    server.onJoined(({ sessionId, state }) => {
      console.log("you joined as", state.name);

      const player = new Player(this, state, true);
      players[sessionId] = player;

      aim = new Aim(this, player);
      aim.on(TraceEvents.Jump, (velocity: { x: number; y: number }) => {
        player.jump(velocity);
        server.jump(velocity);
      });

      leaderboard = new Leaderboard(
        this,
        this.cameras.main.width - 490 - 16,
        16,
        490,
        272,
        10,
        sessionId
      );

      timer = new Timer(this, this.cameras.main.width / 2, 76, 240, 120);
    });

    server.onPlayerJoined(({ sessionId, state }) => {
      console.log(state.name, "joined");

      const player = new Player(this, state, false);
      players[sessionId] = player;
    });

    server.onPlayerLeft(({ sessionId, state }) => {
      console.log(state.name, "left");

      players[sessionId].onLeave();
      delete players[sessionId];
    });

    server.onPlayerStateChanged(({ sessionId, state }) => {
      players[sessionId].updateState(state);
    });

    server.onLeaderboardStateChanged(({ sessionId, state }) => {
      leaderboard?.update(sessionId, state);
      const points = state.score - scores[sessionId] || 0;
      if (points > 0) {
        scorePopUps.create(points);
        this.sound.play(Sounds.Score);
      }
      scores[sessionId] = state.score;
    });

    server.onRoundStateChanged(({ state }) => {
      timer?.updateState(state);
      if (roundStateValue !== state.value) {
        switch (state.value) {
          case RoundStates.Practice:
            aim?.setActive(true);
            popUpMessage.show(
              "THE GAME WILL BEGIN SHORTLY\nWAITING FOR MORE PLAYERS"
            );
            leaderboard?.setScoresVisible(false);
            break;
          case RoundStates.Game:
            aim?.setActive(true);
            popUpMessage.show("THE GAME IS ON");
            leaderboard?.setScoresVisible(true);
            break;
          case RoundStates.Results:
            aim?.setActive(false);
            popUpMessage.show("THE GAME IS OVER");
            leaderboard?.setScoresVisible(true);
            break;
        }
        this.sound.play(Sounds.Message);
      }
      roundStateValue = state.value;
    });

    // bounce sounds
    const soundTimeout = 100;
    const soundTimeouts = {};
    const maxImpulse = 20;

    this.matter.world.on("collisionstart", (_: any, a: any, b: any) => {
      const currentTime = new Date().getTime();
      const impulse = Math.sqrt(
        Math.pow(a.velocity?.x || 0 - b.velocity?.x || 0, 2) +
          Math.pow(a.velovity?.y || 0 - b.velocity?.y || 0, 2)
      );
      if (
        impulse < 1 ||
        soundTimeouts[a.id] > currentTime ||
        soundTimeouts[b.id] > currentTime
      ) {
        return;
      }

      const collisionX = a.position.x + (a.position.x - b.position.x) / 2;
      const volume = Math.min(impulse / maxImpulse, maxImpulse);
      const pan = -0.5 + collisionX / WorldConfig.bounds.width;

      if (a.label == BodyLabels.HoopNet || b.label == BodyLabels.HoopNet) {
        // something hit net
        return;
      } else if (a.label == BodyLabels.Ball && b.label == BodyLabels.Ball) {
        // ball hits another ball
        this.sound.play(Sounds.Bounce1, { volume, pan });
      } else if (
        a.label == BodyLabels.HoopBackboard ||
        b.label == BodyLabels.HoopBackboard
      ) {
        // ball hits backboard
        this.sound.play(Sounds.Bounce3, { volume, pan });
      } else if (
        a.label == BodyLabels.HoopEdge ||
        b.label == BodyLabels.HoopEdge
      ) {
        // ball hits hook edge
        this.sound.play(Sounds.Bounce3, { volume, pan });
      } else {
        // ball hits walls or floor
        this.sound.play(Sounds.Bounce2, { volume, pan });
      }

      soundTimeouts[a.id] = currentTime + soundTimeout;
      soundTimeouts[b.id] = currentTime + soundTimeout;
    });

    const { width, height } = WorldConfig.bounds;
    this.matter.world.setBounds(0, 0, width, height);
  }
}
