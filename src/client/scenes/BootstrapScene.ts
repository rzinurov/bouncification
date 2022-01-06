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
      .events.on(
        MenuSceneEvents.ConnectButtonClicked,
        async (data: { name: string }) => {
          this.scene.stop(Scenes.Menu);
          this.server.removeAllListeners();
          this.scene.start(Scenes.SingleHoop, {
            server: this.server,
            name: data.name,
          });
          const roomId = window.location.hash?.substring(1);
          if (roomId) {
            await this.joinRoomById(roomId, data.name);
          } else {
            await this.joinOrCreateRoom(data.name);
          }
        }
      );

    this.scene
      .get(Scenes.SingleHoop)
      .events.on(SingleHoopSceneEvents.ConnectionError, (message: string) => {
        this.scene.stop(Scenes.SingleHoop);
        this.scene.start(Scenes.Menu, { errorMessage: message });
      });

    this.scene.launch(Scenes.Preloader);
  }

  private async createRoom(name: string) {
    try {
      const roomId = await this.server.create(name);
      window.location.hash = roomId;
    } catch (e) {
      this.scene.stop(Scenes.SingleHoop);
      this.scene.start(Scenes.Menu, {
        errorMessage: "unable to create a room, please retry later",
      });
    }
  }

  private async joinRoomById(roomId: string, name: string) {
    try {
      await this.server.joinById(roomId, name);
    } catch (e) {
      console.log(
        `Unable to join room ${roomId}. Will create or join a random room instead.`
      );
      this.joinOrCreateRoom(name);
    }
  }

  private async joinOrCreateRoom(name: string) {
    try {
      const roomId = await this.server.joinOrCreate(name);
      window.location.hash = roomId;
    } catch (e) {
      this.scene.stop(Scenes.SingleHoop);
      this.scene.start(Scenes.Menu, {
        errorMessage: "unable to connect, please retry later",
      });
    }
  }
}
