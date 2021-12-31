import { Schema, type, MapSchema } from "@colyseus/schema";
import { HoopState } from "./HoopState";
import { PlayerState } from "./PlayerState";

export class SingleHoopState extends Schema {
  @type({ map: PlayerState })
  players = new MapSchema<PlayerState>();

  @type(HoopState)
  hoop = new HoopState(0, 0);

  constructor() {
    super();
  }
}
