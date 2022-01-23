import * as Phaser from "phaser";
import * as Colyseus from "colyseus.js";
import Button from "./Button";
import { LobbySceneEvents } from "../LobbyScene";

const MAX_ROOMS = 3;

export default class RoomList extends Phaser.GameObjects.Container {
  roomButtons: Button[] = [];

  constructor(scene: Phaser.Scene, width: number, height: number) {
    super(scene, width / 2, height * 0.35);

    this.scene.add.existing(this);
  }

  update(rooms: Colyseus.RoomAvailable<any>[]) {
    this.roomButtons.forEach((btn) => {
      btn.destroy();
    });
    this.roomButtons = [];

    const roomIds = Object.keys(rooms);

    for (let i = 0; i < MAX_ROOMS; i++) {
      const roomId = roomIds[i] || undefined;
      const button = new Button(
        this.scene,
        0,
        128 + i * 100,
        "",
        this.scene.cameras.main.width / 2
      );
      if (roomId) {
        const room = rooms[roomId];
        const clients = room.clients;
        const maxClients = room.maxClients;
        const ownerName = room.metadata.ownerName;
        const labelText = `${ownerName} ${clients}/${maxClients}`;
        button.setText(labelText);
        button.onClick(() => {
          this.scene.events.emit(LobbySceneEvents.JoinButtonClicked, roomId);
        });
      } else {
        button.setText(`< EMPTY >`);
        button.onClick(() => {
          this.scene.events.emit(LobbySceneEvents.CreateButtonClicked);
        });
      }
      this.roomButtons.push(button);
      this.add(button);
    }
  }
}
