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

export default class GameScene extends Phaser.Scene {
  private leaderboard?: Leaderboard;
  private aim?: Aim;
  private timer?: Timer;
  private popUpMessage?: PopUpMessage;
  private roundStateValue: number = -1;
  private scorePopUps!: Phaser.GameObjects.Group;
  private scores: { [sessionId: string]: number } = {};

  constructor() {
    super(Scenes.Game);
  }

  async create(data: { server: Server; name: string }) {
    const { server } = data;

    const players: { [name: string]: Player } = {};

    this.scorePopUps = this.add
      .group({ classType: ScorePopUp })
      .setDepth(Layers.Labels);

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

      this.aim = new Aim(this, player);
      this.aim.on(TraceEvents.Jump, (velocity: { x: number; y: number }) => {
        player.jump(velocity);
        server.jump(velocity);
      });

      this.leaderboard = new Leaderboard(
        this,
        this.cameras.main.width - 490 - 16,
        16,
        490,
        272,
        10,
        sessionId
      );

      this.timer = new Timer(this, this.cameras.main.width / 2, 76, 240, 120);

      this.popUpMessage = new PopUpMessage(this);
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
      this.leaderboard?.update(sessionId, state);
      const points = state.score - this.scores[sessionId] || 0;
      if (points > 0) {
        this.scorePopUps.create(points);
      }
      this.scores[sessionId] = state.score;
    });

    server.onRoundStateChanged(({ state }) => {
      this.timer?.updateState(state);
      if (this.roundStateValue !== state.value) {
        switch (state.value) {
          case RoundStates.Practice:
            this.aim?.setActive(true);
            this.popUpMessage?.show(
              "THE GAME WILL BEGIN SHORTLY\nWAITING FOR MORE PLAYERS"
            );
            this.leaderboard?.setScoresVisible(false);
            break;
          case RoundStates.Game:
            this.aim?.setActive(true);
            this.popUpMessage?.show("THE GAME IS ON");
            this.leaderboard?.setScoresVisible(true);
            break;
          case RoundStates.Results:
            this.aim?.setActive(false);
            this.popUpMessage?.show("THE GAME IS OVER");
            this.leaderboard?.setScoresVisible(true);
            break;
        }
      }
      this.roundStateValue = state.value;
    });

    const { width, height } = WorldConfig.bounds;
    this.matter.world.setBounds(0, 0, width, height);
  }
}
