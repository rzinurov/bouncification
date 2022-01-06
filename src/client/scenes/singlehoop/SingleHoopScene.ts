import Scenes from "client/consts/Scenes";
import Sprites from "client/consts/Sprites";
import Server from "client/services/Server";
import WorldConfig from "common/consts/WorldConfig";
import Phaser from "phaser";
import Aim, { TraceEvents } from "./objects/Aim";
import Hoop from "./objects/Hoop";
import Player from "./objects/Player";
import Leaderboard from "./ui/Leaderboard";

export default class SingleHoopScene extends Phaser.Scene {
  leaderboard?: Leaderboard;
  trace?: Aim;

  constructor() {
    super(Scenes.SingleHoop);
  }

  async create(data: { server: Server; name: string }) {
    const { server } = data;

    const players: { [name: string]: Player } = {};

    server.onInitialState((state) => {
      this.add.image(-400, 115, Sprites.SingleHoopPitch).setOrigin(0, 0);
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

    const { width, height } = WorldConfig.bounds;
    this.matter.world.setBounds(0, 0, width, height);
  }
}
