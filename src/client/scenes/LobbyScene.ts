import Colors from "client/consts/Colors";
import Fonts from "client/consts/Fonts";
import Scenes from "client/consts/Scenes";
import Server from "client/services/Server";
import WorldConfig from "common/consts/WorldConfig";
import Phaser from "phaser";
import Button from "./ui/Button";
import Header from "./ui/Header";
import MadeBy from "./ui/MadeBy";
import RoomList from "./ui/RoomList";

export enum LobbySceneEvents {
  CreateButtonClicked = "create-button-clicked",
  JoinButtonClicked = "join-button-clicked",
}

export default class LobbyScene extends Phaser.Scene {
  server!: Server;

  constructor() {
    super(Scenes.Lobby);
  }

  init(data: { server: Server }) {
    this.server = data.server;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.existing(new Header(this, width, height));

    const selectRoomLabel = this.add
      .bitmapText(width / 2, height / 2 - 160, Fonts.Pixel, "SELECT A ROOM", 43)
      .setTint(Colors.Orange2)
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    const roomList = this.add
      .existing(new RoomList(this, width, height))
      .setVisible(false);

    const connectingLabel = this.add
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

      roomList.update(rooms);

      if (connectingLabel.visible) {
        connectingLabel.setVisible(false);
        selectRoomLabel.setVisible(true);
        roomList.setVisible(true);

        const createRoomButton = new Button(
          this,
          width / 2,
          height * 0.75,
          "CREATE ROOM"
        );
        createRoomButton.onClick(() => {
          this.events.emit(LobbySceneEvents.CreateButtonClicked);
        });
      }
    });

    this.add.existing(new MadeBy(this, width, height));
  }
}
