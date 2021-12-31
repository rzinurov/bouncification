import Server from "client/services/Server";
import Names from "client/utils/Names";
import Phaser from "phaser";
import Dimensions from "common/consts/Dimensions";
import Player from "./objects/Player";

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
    }

    const players: { [name: string]: Player } = {};

    server.onJoined(({ sessionId, state }) => {
      console.log("you joined as", state.name);

      const player = new Player(this, sessionId, state, "ball");
      players[sessionId] = player;

      this.input.on("pointerdown", (pointer: { x: any; y: any }) => {
        server.jumpTo(pointer.x, pointer.y);
      });
    });

    server.onPlayerJoined(({ sessionId, state }) => {
      console.log(state.name, "joined");

      const player = new Player(this, sessionId, state, "ball");
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

    server.onDisconnected(() => {
      window.location.reload();
    });

    const { width, height } = Dimensions.worldBounds;
    this.matter.world.setBounds(0, 0, width, height);
  }
}
