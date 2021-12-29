import * as Colyseus from "colyseus.js";
import Rooms from "common/consts/Rooms";
import type { LobbyState } from "common/schema/LobbyState";
import type { PlayerState } from "common/schema/PlayerState";

enum Events {
  YouJoined = "you-joined",
  PlayerJoined = "player-joined",
  PlayerLeft = "player-left",
}

export default class Server {
  private client!: Colyseus.Client;
  private events: Phaser.Events.EventEmitter;

  constructor() {
    this.client = new Colyseus.Client("ws://localhost:2567");
    this.events = new Phaser.Events.EventEmitter();
  }

  async join(name: string) {
    const room = await this.client.joinOrCreate<LobbyState>(Rooms.Lobby, {
      name,
    });

    console.log("joined room", room);

    const sessionId = room.sessionId;

    room.state.players.onAdd = (
      playerState: PlayerState,
      playerSessionId: string
    ) => {
      if (sessionId === playerSessionId) {
        this.events.emit(Events.YouJoined, { sessionId, state: playerState });
      } else {
        this.events.emit(Events.PlayerJoined, {
          sessionId,
          state: playerState,
        });
      }
    };

    room.state.players.onRemove = (
      playerState: PlayerState,
      sessionId: string
    ) => {
      this.events.emit(Events.PlayerLeft, { sessionId, state: playerState });
    };
  }

  onJoined(
    cb: ({ sessionId: string, state: PlayerState }) => void,
    context?: any
  ) {
    this.events.on(Events.YouJoined, cb, context);
  }

  onPlayerJoined(
    cb: ({ sessionId: string, state: PlayerState }) => void,
    context?: any
  ) {
    this.events.on(Events.PlayerJoined, cb, context);
  }

  onPlayerLeft(
    cb: ({ sessionId: string, state: PlayerState }) => void,
    context?: any
  ) {
    this.events.on(Events.PlayerLeft, cb, context);
  }
}
