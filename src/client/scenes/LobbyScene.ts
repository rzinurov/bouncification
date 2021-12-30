import Server from "client/services/Server";
import Names from "client/utils/Names";
import Phaser from "phaser";
import Dimensions from "common/consts/Dimensions";
import Player from "./sprites/Player";

export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super("lobby");
  }

  preload() {
    this.load.image("ball_blue", "assets/img/ball_blue.png");
    this.load.image("ball_yellow", "assets/img/ball_yellow.png");
    this.load.image("ball_red", "assets/img/ball_red.png");
    this.load.image("bg", "assets/img/bg.jpg");
  }

  async create(data: { server: Server }) {
    const { server } = data;

    this.add.image(0, 0, "bg");
    this.add.image(0, 626, "bg");
    this.add.image(626, 0, "bg");
    this.add.image(626, 626, "bg");

    try {
      await server.join(Names.randomName());
    } catch (e) {
      alert("Unable to connect to server");
    }

    const players: { [name: string]: Player } = {};

    server.onJoined(({ sessionId, state }) => {
      console.log("you joined as", state.name);

      const player = new Player(this, sessionId, state, "ball_blue");
      players[sessionId] = player;

      this.input.on("pointerdown", (pointer: { x: any; y: any }) => {
        server.jumpTo(pointer.x, pointer.y);
      });
    });

    server.onPlayerJoined(({ sessionId, state }) => {
      console.log(state.name, "joined");

      const player = new Player(this, sessionId, state, "ball_yellow");
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
