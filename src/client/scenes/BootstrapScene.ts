import Scenes from "client/consts/Scenes";
import Server from "client/services/Server";
import Phaser from "phaser";

export default class BootstrapScene extends Phaser.Scene {
  private server!: Server;

  constructor() {
    super(Scenes.Bootstrap);
  }

  init() {
    this.server = new Server();
  }

  async create() {
    this.scene.launch(Scenes.SingleHoop, { server: this.server });
  }
}
