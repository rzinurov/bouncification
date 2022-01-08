import Scenes from "client/consts/Scenes";
import Server from "client/services/Server";
import Phaser from "phaser";
import { LobbySceneEvents } from "./LobbyScene";
import { MenuSceneEvents } from "./MenuScene";
import { PreloaderSceneEvents } from "./PreloaderScene";

export default class BootstrapScene extends Phaser.Scene {
  private server!: Server;
  private name!: string;

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
          await this.connect(data);
        }
      );

    this.scene.launch(Scenes.Preloader);
  }

  private async connect(data: { name: string }) {
    this.name = data.name;
    this.scene.stop(Scenes.Menu);
    const roomId = window.location.hash?.substring(1);
    if (roomId) {
      await this.joinGameRoom(roomId);
    } else {
      await this.joinLobbyRoom();
    }
  }

  private async joinGameRoom(roomId: string) {
    this.server.removeAllListeners();
    window.location.hash = roomId;

    this.scene.start(Scenes.Game, {
      server: this.server,
      name: this.name,
    });

    this.server.onDisconnected(() => {
      this.scene.stop(Scenes.Game);
      this.scene.start(Scenes.Menu, { errorMessage: "disconnected" });
    });

    try {
      await this.server.joinById(roomId, this.name);
    } catch (e) {
      this.scene.stop(Scenes.Game);
      console.log(`Unable to join room ${roomId}. Showing lobby instead.`);
      await this.joinLobbyRoom();
    }
  }

  private async joinLobbyRoom() {
    this.server.removeAllListeners();
    window.location.hash = "";

    this.scene.start(Scenes.Lobby, {
      server: this.server,
    });

    this.scene
      .get(Scenes.Lobby)
      .events.on(LobbySceneEvents.CreateButtonClicked, async () => {
        this.scene.stop(Scenes.Lobby);
        await this.createGameRoom();
      })
      .on(LobbySceneEvents.JoinButtonClicked, async (roomId: string) => {
        this.scene.stop(Scenes.Lobby);
        await this.joinGameRoom(roomId);
      });

    this.server.onDisconnected(() => {
      this.scene.stop(Scenes.Game);
      this.scene.start(Scenes.Menu, { errorMessage: "disconnected" });
    });

    try {
      await this.server.joinLobby();
    } catch (e) {
      this.scene.stop(Scenes.Lobby);
      this.scene.start(Scenes.Menu, {
        errorMessage: "unable to connect, please retry later",
      });
    }
  }

  private async createGameRoom() {
    this.server.removeAllListeners();

    this.scene.start(Scenes.Game, {
      server: this.server,
      name: this.name,
    });

    this.server.onDisconnected(() => {
      this.scene.stop(Scenes.Game);
      this.scene.start(Scenes.Menu, { errorMessage: "disconnected" });
    });

    try {
      const roomId = await this.server.create(this.name);
      window.location.hash = roomId;
    } catch (e) {
      this.scene.stop(Scenes.Game);
      console.log(`Unable to create room. Showing lobby instead.`);
      await this.joinLobbyRoom();
    }
  }
}
