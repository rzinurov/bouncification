import Fonts from "client/consts/Fonts";
import Scenes from "client/consts/Scenes";
import Sprites from "client/consts/Sprites";
import Server from "client/services/Server";
import Names from "client/utils/Names";
import WorldConfig from "common/consts/WorldConfig";
import Phaser from "phaser";
import Aim, { TraceEvents } from "./objects/Aim";
import Hoop from "./objects/Hoop";
import Player from "./objects/Player";
import Leaderboard from "./ui/Leaderboard";

export enum SingleHoopSceneEvents {
  ConnectionError = "connection-error",
}

export default class SingleHoopScene extends Phaser.Scene {
  leaderboard?: Leaderboard;
  trace?: Aim;
  connectingLabel!: Phaser.GameObjects.BitmapText;

  constructor() {
    super(Scenes.SingleHoop);
  }

  async create(data: { server: Server; name: string }) {
    const { server } = data;
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    this.connectingLabel = this.add
      .bitmapText(
        screenWidth / 2,
        screenHeight / 2,
        Fonts.Pixel,
        "CONNECTING, PLEASE WAIT..",
        32
      )
      .setTint(0xffffff)
      .setOrigin(0.5, 0.5);

    const players: { [name: string]: Player } = {};

    server.onInitialState((state) => {
      this.add.image(-400, 115, Sprites.SingleHoopPitch).setOrigin(0, 0);
      this.connectingLabel.setVisible(false);
      new Hoop(this, state.hoop);
    });

    server.onJoined(({ sessionId, state }) => {
      console.log("you joined as", state.name);

      const player = new Player(this, state, true);
      players[sessionId] = player;

      this.trace = new Aim(this, player);
      this.trace.on(TraceEvents.Jump, (velocity: { x: number; y: number }) => {
        player.jump(velocity);
        server.jump(velocity);
      });

      this.leaderboard = new Leaderboard(
        this,
        this.cameras.main.width - 512 - 16,
        16,
        512,
        272,
        10,
        sessionId
      );
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
    });

    server.onDisconnected(() => {
      this.events.emit(SingleHoopSceneEvents.ConnectionError, "disconnected");
    });

    const { width, height } = WorldConfig.bounds;
    this.matter.world.setBounds(0, 0, width, height);
  }
}
