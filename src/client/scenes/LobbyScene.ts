import Fonts from "client/consts/Fonts";
import Scenes from "client/consts/Scenes";
import Server from "client/services/Server";
import Phaser from "phaser";
import Button from "./ui/Button";

export enum LobbySceneEvents {
  CreateButtonClicked = "create-button-clicked",
  JoinButtonClicked = "join-button-clicked",
}

export default class LobbyScene extends Phaser.Scene {
  server!: Server;
  roomButtons: { [name: string]: Button } = {};

  constructor() {
    super(Scenes.Lobby);
  }

  init(data: { server: Server }) {
    this.server = data.server;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add
      .bitmapText(width / 2, 128, Fonts.Pixel, "LOBBY", 48)
      .setTint(0xffffff)
      .setOrigin(0.5, 0.5);

    const createRoomButton = new Button(
      this,
      width / 2,
      height / 2,
      "CREATE ROOM",
      width * 0.5
    );
    createRoomButton.onClick(() => {
      this.events.emit(LobbySceneEvents.CreateButtonClicked);
    });

    this.server.onRoomsChanged((rooms) => {
      Object.keys(this.roomButtons).forEach((roomId) => {
        if (!Object.keys(rooms).includes(roomId)) {
          this.roomButtons[roomId].destroy();
          delete this.roomButtons[roomId];
        }
      });
      Object.keys(rooms).forEach((roomId) => {
        const clients = rooms[roomId].clients;
        const maxClients = rooms[roomId].maxClients;
        const labelText = `${roomId} ${clients}/${maxClients}`;
        if (!Object.keys(this.roomButtons).includes(roomId)) {
          const button = new Button(
            this,
            width / 2,
            height / 2,
            labelText,
            width * 0.5
          );
          button.onClick(() => {
            this.events.emit(LobbySceneEvents.JoinButtonClicked, roomId);
          });
          this.roomButtons[roomId] = button;
          this.add.existing(button);
        } else {
          this.roomButtons[roomId].setText(labelText);
        }
      });
      Object.values(this.roomButtons).forEach((button, idx) => {
        button.y = height / 2 + 16 + (idx + 1) * 100;
      });
    });
  }
}
