import { Schema, type, MapSchema } from "@colyseus/schema";
import { HoopState } from "./HoopState";
import { LeaderboardRowState } from "./LeaderboardRowState";
import { PlayerState } from "./PlayerState";
import { PositionState } from "./Primitives";

export class GameState extends Schema {
  @type({ map: PlayerState })
  players = new MapSchema<PlayerState>();

  @type({ map: LeaderboardRowState })
  leaderboard = new MapSchema<LeaderboardRowState>();

  @type(HoopState)
  hoop = new HoopState(
    new PositionState(0, 0),
    new PositionState(0, 0),
    new PositionState(0, 0)
  );

  constructor() {
    super();
  }
}
