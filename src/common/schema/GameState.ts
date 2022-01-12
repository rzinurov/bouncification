import { MapSchema, Schema, type } from "@colyseus/schema";
import { HoopState } from "./HoopState";
import { LeaderboardRowState } from "./LeaderboardRowState";
import { PlayerState } from "./PlayerState";
import { PositionState } from "./Primitives";
import { RoundState } from "./RoundState";

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

  @type(RoundState)
  roundState: RoundState = new RoundState();
}
