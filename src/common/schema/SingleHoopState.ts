import { Schema, type, MapSchema } from "@colyseus/schema";
import { HoopState } from "./HoopState";
import { PlayerState } from "./PlayerState";
import { PositionState } from "./Primitives";

export class SingleHoopState extends Schema {
  @type({ map: PlayerState })
  players = new MapSchema<PlayerState>();

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
