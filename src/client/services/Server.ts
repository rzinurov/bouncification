import * as Colyseus from "colyseus.js";
import Rooms from "common/consts/Rooms";
import type { GameState as GameState } from "common/schema/GameState";
import type { PlayerState } from "common/schema/PlayerState";
import { LeaderboardRowState } from "common/schema/LeaderboardRowState";

enum Events {
  InitialState = "initial-state",
  YouJoined = "you-joined",
  PlayerJoined = "player-joined",
  PlayerLeft = "player-left",
  PlayerStateChanged = "player-state-changed",
  LeaderboardChanged = "leaderboard-changed",
  RoomsChanged = "rooms-changed",
  Disconnected = "disconnected",
}

const SERVER_ADDRESS = /localhost/.test(window.location.host)
  ? "ws://localhost:2567"
  : "wss://aexy8j.colyseus.de";
console.log("Server address", SERVER_ADDRESS);

export default class Server {
  private client!: Colyseus.Client;
  private events: Phaser.Events.EventEmitter;
  private room!: Colyseus.Room<GameState>;
  private rooms: { [name: string]: Colyseus.RoomAvailable } = {};

  constructor() {
    this.client = new Colyseus.Client(SERVER_ADDRESS);
    this.events = new Phaser.Events.EventEmitter();
  }

  async create(name: string) {
    this.room = await this.client.create<GameState>(Rooms.Game, {
      name,
    });

    console.log("created room", this.room);

    this.registerRoomStateListeners();

    return this.room.id;
  }

  async joinById(roomId: string, name: string) {
    this.room = await this.client.joinById<GameState>(roomId, {
      name,
    });

    console.log("joined room", this.room);

    this.registerRoomStateListeners();
  }

  async joinOrCreate(name: string) {
    this.room = await this.client.joinOrCreate<GameState>(Rooms.Game, {
      name,
    });

    console.log("joined or created room", this.room);

    this.registerRoomStateListeners();

    return this.room.id;
  }

  async joinLobby() {
    this.room = await this.client.joinOrCreate<GameState>(Rooms.Lobby);

    console.log("joined lobby", this.room);

    this.room.onMessage("rooms", (rooms) => {
      rooms.forEach((room) => {
        this.rooms[room.roomId] = room;
      });
      this.events.emit(Events.RoomsChanged, this.rooms);
    });

    this.room.onMessage("+", ([roomId, room]) => {
      this.rooms[roomId] = room;
      this.events.emit(Events.RoomsChanged, this.rooms);
    });

    this.room.onMessage("-", (roomId) => {
      delete this.rooms[roomId];
      this.events.emit(Events.RoomsChanged, this.rooms);
    });
  }

  private registerRoomStateListeners() {
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

    this.room.state.leaderboard.onAdd = (
      leaderboardState: LeaderboardRowState,
      sessionId: string
    ) => {
      this.events.emit(Events.LeaderboardChanged, {
        sessionId,
        state: leaderboardState,
      });

      leaderboardState.onChange = (changes: [any]) => {
        changes.forEach((change) => {
          leaderboardState[change.field] = change.value;
        });
        this.events.emit(Events.LeaderboardChanged, {
          sessionId,
          state: leaderboardState,
        });
      };
    };

    this.room.onLeave((code) => {
      this.events.emit(Events.Disconnected);
    });

    this.room.onStateChange.once((state) => {
      this.events.emit(Events.InitialState, state);
    });
  }

  onInitialState(cb: (state: GameState) => void, context?: any) {
    this.events.on(Events.InitialState, cb, context);
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

  onLeaderboardStateChanged(
    cb: ({ sessionId: string, state: LeaderboardRowState }) => void,
    context?: any
  ) {
    this.events.on(Events.LeaderboardChanged, cb, context);
  }

  onDisconnected(cb: () => void, context?: any) {
    this.events.on(Events.Disconnected, cb, context);
  }

  jump({ x, y }: { x: number; y: number }) {
    this.room.send("jump", { x, y });
  }

  onRoomsChanged(cb: (rooms: Colyseus.RoomAvailable[]) => void, context?: any) {
    this.events.on(Events.RoomsChanged, cb, context);
  }

  removeAllListeners() {
    this.events.removeAllListeners();
  }
}
