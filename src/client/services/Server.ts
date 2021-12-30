import * as Colyseus from "colyseus.js";
import Rooms from "common/consts/Rooms";
import type { LobbyState } from "common/schema/LobbyState";
import type { PlayerState } from "common/schema/PlayerState";

enum Events {
  YouJoined = "you-joined",
  PlayerJoined = "player-joined",
  PlayerLeft = "player-left",
  PlayerStateChanged = "player-state-changed",
  Disconnected = "disconnected",
}

const SERVER_ADDRESS = "ws://192.168.0.32:2567";

export default class Server {
  private client!: Colyseus.Client;
  private events: Phaser.Events.EventEmitter;
  private room!: Colyseus.Room<LobbyState>;

  constructor() {
    this.client = new Colyseus.Client(SERVER_ADDRESS);
    this.events = new Phaser.Events.EventEmitter();
  }

  async join(name: string) {
    this.room = await this.client.joinOrCreate<LobbyState>(Rooms.Lobby, {
      name,
    });

    console.log("joined room", this.room);

    const playerSessionId = this.room.sessionId;

    this.room.state.players.onAdd = (
      playerState: PlayerState,
      sessionId: string
    ) => {
      if (playerSessionId === sessionId) {
        this.events.emit(Events.YouJoined, {
          sessionId,
          state: playerState,
        });
      } else {
        this.events.emit(Events.PlayerJoined, {
          sessionId,
          state: playerState,
        });
      }
      playerState.onChange = (changes: [any]) => {
        changes.forEach((change) => {
          playerState[change.field] = change.value;
        });
        this.events.emit(Events.PlayerStateChanged, {
          sessionId,
          state: playerState,
        });
      };
    };

    this.room.state.players.onRemove = (
      playerState: PlayerState,
      sessionId: string
    ) => {
      this.events.emit(Events.PlayerLeft, { sessionId, state: playerState });
    };

    this.room.onLeave((code) => {
      this.events.emit(Events.Disconnected);
    });
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

  onPlayerStateChanged(
    cb: ({ sessionId: string, state: PlayerState }) => void,
    context?: any
  ) {
    this.events.on(Events.PlayerStateChanged, cb, context);
  }

  onDisconnected(cb: () => void, context?: any) {
    this.events.on(Events.Disconnected, cb, context);
  }

  jumpTo(x: number, y: number) {
    this.room.send("jumpTo", { x, y });
  }
}
