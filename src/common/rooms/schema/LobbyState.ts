import { Schema, type, MapSchema } from "@colyseus/schema";
import { PlayerState } from "./PlayerState";

export class LobbyState extends Schema {
  @type({ map: PlayerState })
  players = new MapSchema<PlayerState>();

  constructor() {
    super();
  }

  createPlayer(sessionId: string, name: string, x: number, y: number) {
    this.players.set(sessionId, new PlayerState(name, x, y));
  }

  removePlayer(sessionId: string) {
    this.players.delete(sessionId);
  }
}
