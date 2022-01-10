import Colors from "client/consts/Colors";
import Scenes from "client/consts/Scenes";
import Sprites from "client/consts/Sprites";
import Server from "client/services/Server";
import WorldConfig from "common/consts/WorldConfig";
import Phaser from "phaser";
import { LobbySceneEvents } from "./LobbyScene";
import { MenuSceneEvents } from "./MenuScene";

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
    this.cameras.main.setBackgroundColor(Colors.Background);

    const offScreen = new Phaser.Geom.Rectangle(
      -400,
      0,
      400,
      WorldConfig.bounds.height
    );
    const screen = new Phaser.Geom.Rectangle(
      0,
      0,
      WorldConfig.bounds.width,
      WorldConfig.bounds.height
    );

    this.add.particles(Sprites.Star, [
      {
        emitZone: { source: offScreen },
        deathZone: { source: screen, type: "onLeave" },
        frequency: 100,
        quantity: 25,
        speedX: { min: 80, max: 120 },
        lifespan: 30000,
        scale: 0.25,
      },
      {
        emitZone: { source: offScreen },
        deathZone: { source: screen, type: "onLeave" },
        frequency: 150,
        quantity: 25,
        speedX: { min: 180, max: 220 },
        lifespan: 30000,
        scale: 0.5,
      },
      {
        emitZone: { source: offScreen },
        deathZone: { source: screen, type: "onLeave" },
        frequency: 500,
        quantity: 25,
        speedX: { min: 280, max: 320 },
        lifespan: 30000,
        scale: 0.75,
      },
    ]);

    this.scene.launch(Scenes.Menu);
    this.scene
      .get(Scenes.Menu)
      .events.removeAllListeners(MenuSceneEvents.ConnectButtonClicked)
      .on(
        MenuSceneEvents.ConnectButtonClicked,
        async (data: { name: string }) => {
          await this.connect(data);
        }
      );
  }

  private async connect(data: { name: string }) {
    console.log("connecting");

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
    console.log("joining game room");

    this.server.removeAllListeners();
    window.location.hash = roomId;

    this.scene.launch(Scenes.Game, {
      server: this.server,
      name: this.name,
    });

    this.server.onDisconnected(() => {
      this.scene.stop(Scenes.Game);
      this.server.removeAllListeners();
      this.scene.launch(Scenes.Menu, { errorMessage: "disconnected" });
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
    console.log("joining lobby room");

    this.server.removeAllListeners();
    window.location.hash = "";

    this.scene.launch(Scenes.Lobby, {
      server: this.server,
    });

    this.scene
      .get(Scenes.Lobby)
      .events.removeAllListeners(LobbySceneEvents.CreateButtonClicked)
      .on(LobbySceneEvents.CreateButtonClicked, async () => {
        this.scene.stop(Scenes.Lobby);
        await this.createGameRoom();
      })
      .removeAllListeners(LobbySceneEvents.JoinButtonClicked)
      .on(LobbySceneEvents.JoinButtonClicked, async (roomId: string) => {
        this.scene.stop(Scenes.Lobby);
        await this.joinGameRoom(roomId);
      });

    this.server.onDisconnected(() => {
      this.scene.stop(Scenes.Lobby);
      this.server.removeAllListeners();
      this.scene.launch(Scenes.Menu, { errorMessage: "disconnected" });
    });

    try {
      await this.server.joinLobby();
    } catch (e) {
      this.scene.stop(Scenes.Lobby);
      this.server.removeAllListeners();
      this.scene.launch(Scenes.Menu, {
        errorMessage: "unable to connect, please retry later",
      });
    }
  }

  private async createGameRoom() {
    console.log("creating game room");

    this.server.removeAllListeners();

    this.scene.launch(Scenes.Game, {
      server: this.server,
      name: this.name,
    });

    this.server.onDisconnected(() => {
      this.scene.stop(Scenes.Game);
      this.server.removeAllListeners();
      this.scene.launch(Scenes.Menu, { errorMessage: "disconnected" });
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
