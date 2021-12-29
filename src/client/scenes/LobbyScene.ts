import Server from "client/services/Server";
import Names from "client/utils/Names";
import Phaser from "phaser";

export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super("lobby");
  }

  async create(data: { server: Server }) {
    const { server } = data;

    await server.join(Names.randomName());

    const players = {};

    server.onJoined(({ sessionId, state }) => {
      console.log("you joined as", state.name);

      const player = this.matter.add.circle(state.x, state.y, 16, {
        isStatic: true,
      });
      players[sessionId] = player;
    });

    server.onPlayerJoined(({ sessionId, state }) => {
      console.log(state.name, "joined");

      const player = this.matter.add.circle(state.x, state.y, 16, {
        isStatic: true,
      });
      players[sessionId] = player;
    });

    server.onPlayerLeft(({ sessionId, state }) => {
      console.log(state.name, "left");

      this.matter.world.remove(players[sessionId]);
      delete players[sessionId];
    });

    this.matter.world.setBounds();
  }
}
