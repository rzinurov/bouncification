import Scenes from "client/consts/Scenes";
import Server from "client/services/Server";
import Phaser from "phaser";
import { MenuSceneEvents } from "./MenuScene";
import { PreloaderSceneEvents } from "./PreloaderScene";
import { SingleHoopSceneEvents } from "./singlehoop/SingleHoopScene";

export default class BootstrapScene extends Phaser.Scene {
  private server!: Server;

  constructor() {
    super(Scenes.Bootstrap);
  }

  init() {
    this.server = new Server();
  }

  async create() {
    this.scene
      .get(Scenes.Preloader)
      .events.on(PreloaderSceneEvents.Loaded, () => {
        this.scene.stop(Scenes.Preloader);
        this.scene.launch(Scenes.Menu);
      });

    this.scene
      .get(Scenes.Menu)
      .events.on(MenuSceneEvents.ConnectButtonClicked, () => {
        this.scene.stop(Scenes.Menu);
        this.scene.start(Scenes.SingleHoop, { server: this.server });
      });

    this.scene
      .get(Scenes.SingleHoop)
      .events.on(SingleHoopSceneEvents.ConnectionError, (message: string) => {
        this.server.removeAllListeners();
        this.scene.stop(Scenes.SingleHoop);
        this.scene.start(Scenes.Menu, { errorMessage: message });
      });

    this.scene.launch(Scenes.Preloader);
  }
}
