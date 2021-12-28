import Phaser from "phaser";
import * as Colyseus from "colyseus.js";
import Rooms from "common/consts/Rooms";
import { LobbyState } from "common/rooms/schema/LobbyState";
import { LobbyRoom } from "colyseus";
import { PlayerState } from "common/rooms/schema/PlayerState";
import Names from "client/utils/Names";

export default class LobbyScene extends Phaser.Scene {
  private client!: Colyseus.Client;

  constructor() {
    super("lobby");
  }

  preload() {}

  init() {
    this.client = new Colyseus.Client("ws://localhost:2567");
  }

  async create() {
    const room = (await this.client.joinOrCreate(Rooms.Lobby, {
      name: Names.randomName(),
    })) as unknown as LobbyRoom;

    console.log("joined room", room);

    const sessionId = (room as any).sessionId;

    const players = {};

    room.state.players.onAdd = (
      playerState: PlayerState,
      playerSessionId: string
    ) => {
      if (sessionId === playerSessionId) {
        console.log("you joined as", playerState.name);
      } else {
        console.log(playerState.name, "joined");
      }

      const player = this.matter.add.circle(playerState.x, playerState.y, 16, {
        isStatic: true,
      });

      playerState.onChange = function (changes) {
        player.position.x = playerState.x;
        player.position.y = playerState.y;
      };

      players[playerSessionId] = player;
    };

    room.state.players.onRemove = (
      playerState: PlayerState,
      sessionId: string
    ) => {
      console.log(playerState.name, "left");

      this.matter.world.remove(players[sessionId]);
      delete players[sessionId];
    };

    this.matter.world.setBounds();
  }
}
