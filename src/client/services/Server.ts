import * as Colyseus from "colyseus.js";
import Rooms from "common/consts/Rooms";
import type { SingleHoopState } from "common/schema/SingleHoopState";
import type { PlayerState } from "common/schema/PlayerState";
import { LeaderboardRowState } from "common/schema/LeaderboardRowState";

enum Events {
  InitialState = "initial-state",
  YouJoined = "you-joined",
  PlayerJoined = "player-joined",
  PlayerLeft = "player-left",
  PlayerStateChanged = "player-state-changed",
  LeaderboardChanged = "leaderboard-changed",
  Disconnected = "disconnected",
}

const SERVER_ADDRESS = /localhost/.test(window.location.host)
  ? "ws://localhost:2567"
  : "wss://aexy8j.colyseus.de";
console.log("Server address", SERVER_ADDRESS);

export default class Server {
  private client!: Colyseus.Client;
  private events: Phaser.Events.EventEmitter;
  private room!: Colyseus.Room<SingleHoopState>;

  constructor() {
    this.client = new Colyseus.Client(SERVER_ADDRESS);
    this.events = new Phaser.Events.EventEmitter();
  }

  async join(name: string) {
    this.room = await this.client.joinOrCreate<SingleHoopState>(
      Rooms.SingleHoop,
      {
        name,
      }
    );

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

  onInitialState(cb: (state: SingleHoopState) => void, context?: any) {
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

  removeAllListeners() {
    this.events.removeAllListeners();
  }
}
