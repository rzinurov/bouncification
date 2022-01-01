import Server from "client/services/Server";
import Names from "client/utils/Names";
import Phaser from "phaser";
import WorldConfig from "common/consts/WorldConfig";
import Player from "./objects/Player";
import { SingleHoopState } from "common/schema/SingleHoopState";
import Hoop from "./objects/Hoop";
import Leaderboard from "./ui/Leaderboard";

export default class SingleHoopScene extends Phaser.Scene {
  constructor() {
    super("single-hoop");
  }

  preload() {
    this.load.image("ball", "assets/img/ball.png");
  }

  async create(data: { server: Server }) {
    const { server } = data;

    try {
      await server.join(Names.randomName());
    } catch (e) {
      alert("Unable to connect to server");
      return;
    }

    const leaderboard = new Leaderboard(
      this,
      this.cameras.main.width - 272,
      16,
      256,
      256
    );

    const players: { [name: string]: Player } = {};

    server.onInitialState((state) => {
      new Hoop(this, state.hoop);
    });

    server.onJoined(({ sessionId, state }) => {
      console.log("you joined as", state.name);

      const player = new Player(this, state, true);
      players[sessionId] = player;

      this.input.on("pointerdown", (pointer: { x: any; y: any }) => {
        server.jumpTo(pointer);
        player.jumpTo(pointer);
      });
    });

    server.onPlayerJoined(({ sessionId, state }) => {
      console.log(state.name, "joined");

      const player = new Player(this, state, false);
      players[sessionId] = player;
    });

    server.onPlayerLeft(({ sessionId, state }) => {
      console.log(state.name, "left");

      players[sessionId].destroy();
      delete players[sessionId];
    });

    server.onPlayerStateChanged(({ sessionId, state }) => {
      players[sessionId].updateState(state);
    });

    server.onLeaderboardStateChanged(({ sessionId, state }) => {
      leaderboard.update(sessionId, state);
    });

    server.onDisconnected(() => {
      window.location.reload();
    });

    const { width, height } = WorldConfig.bounds;
    this.matter.world.setBounds(0, 0, width, height);
  }
}
