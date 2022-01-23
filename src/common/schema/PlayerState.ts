import { Schema, type } from "@colyseus/schema";
import { PositionState } from "./Primitives";

export class PlayerState extends Schema {
  @type("string")
  name: string;

  @type(PositionState)
  position: PositionState;

  @type(PositionState)
  velocity: PositionState;

  @type("number")
  angle: number = 0;

  @type("number")
  angularVelocity: number = 0;

  @type("number")
  lastJumpTime: number = 0;

  constructor(name: string, x: number, y: number) {
    super();
    this.name = name;
    this.position = new PositionState(x, y);
    this.velocity = new PositionState(0, 0);
  }
}
