import Server from "client/services/Server";
import Names from "client/utils/Names";
import WorldConfig from "common/consts/WorldConfig";
import Phaser from "phaser";
import Hoop from "./objects/Hoop";
import Player from "./objects/Player";
import Trace, { TraceEvents } from "./objects/Trace";
import Leaderboard from "./ui/Leaderboard";

export default class SingleHoopScene extends Phaser.Scene {
  leaderboard?: Leaderboard;
  trace?: Trace;

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

    const players: { [name: string]: Player } = {};

    server.onInitialState((state) => {
      new Hoop(this, state.hoop);
    });

    server.onJoined(({ sessionId, state }) => {
      console.log("you joined as", state.name);

      const player = new Player(this, state, true);
      players[sessionId] = player;

      this.trace = new Trace(this, player);
      this.trace.on(TraceEvents.Shoot, (velocity: { x: number; y: number }) => {
        server.jump(velocity);
        player.jump(velocity);
      });

      this.leaderboard = new Leaderboard(
        this,
        this.cameras.main.width - 320 - 16,
        16,
        320,
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

      players[sessionId].destroy();
      delete players[sessionId];
    });

    server.onPlayerStateChanged(({ sessionId, state }) => {
      players[sessionId].updateState(state);
    });

    server.onLeaderboardStateChanged(({ sessionId, state }) => {
      this.leaderboard?.update(sessionId, state);
    });

    server.onDisconnected(() => {
      window.location.reload();
    });

    const { width, height } = WorldConfig.bounds;
    this.matter.world.setBounds(0, 0, width, height);
  }
}
