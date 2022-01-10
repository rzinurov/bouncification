import Colors from "client/consts/Colors";
import Fonts from "client/consts/Fonts";
import Scenes from "client/consts/Scenes";
import Server from "client/services/Server";
import WorldConfig from "common/consts/WorldConfig";
import Phaser from "phaser";
import GameWorld from "../../../dist/server/server/rooms/game/GameWorld";
import Button from "./ui/Button";

export enum LobbySceneEvents {
  CreateButtonClicked = "create-button-clicked",
  JoinButtonClicked = "join-button-clicked",
}

export default class LobbyScene extends Phaser.Scene {
  server!: Server;
  roomButtons: { [name: string]: Button } = {};
  connectingLabel!: Phaser.GameObjects.BitmapText;

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
      .bitmapText(width / 2, 128, Fonts.Pixel, "BOUNCIFICATION", 75)
      .setTint(Colors.Orange3)
      .setOrigin(0.5, 0.5);

    this.add
      .bitmapText(
        width / 2,
        216,
        Fonts.Pixel,
        "A MULTIPLAYER GAME WITH BOUNCING BALLS",
        24
      )
      .setTint(Colors.Blue2)
      .setOrigin(0.5, 0.5);

    this.connectingLabel = this.add
      .bitmapText(
        WorldConfig.bounds.width / 2,
        WorldConfig.bounds.height * 0.6,
        Fonts.Pixel,
        "connecting to server..",
        32
      )
      .setTint(Colors.Blue2)
      .setOrigin(0.5, 0.5);

    this.server.onRoomsChanged((rooms) => {
      console.log("rooms changed", rooms);

      Object.keys(this.roomButtons).forEach((roomId) => {
        if (!Object.keys(rooms).includes(roomId)) {
          this.roomButtons[roomId].destroy();
          delete this.roomButtons[roomId];
        }
      });

      Object.keys(rooms).forEach((roomId) => {
        const room = rooms[roomId];
        const clients = room.clients;
        const maxClients = room.maxClients;
        const ownerName = room.metadata.ownerName;
        const labelText = `${ownerName} ${clients}/${maxClients}`;
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

      if (this.connectingLabel.visible) {
        this.connectingLabel.setVisible(false);
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
      }
    });
  }
}
