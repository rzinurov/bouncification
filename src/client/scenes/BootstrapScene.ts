import Server from "client/services/Server";
import Phaser from "phaser";

export default class BootstrapScene extends Phaser.Scene {
  private server!: Server;

  constructor() {
    super("bootstrap");
  }

  init() {
    this.server = new Server();
  }

  async create() {
    this.scene.launch("lobby", { server: this.server });
  }
}
