import { Schema, type } from "@colyseus/schema";
import { VectorState } from "./Primitives";

export class PlayerState extends Schema {
  @type("string")
  name: string;

  @type(VectorState)
  position: VectorState;

  @type(VectorState)
  velocity: VectorState;

  @type("number")
  angle: number = 0;

  @type("number")
  angularVelocity: number = 0;

  constructor(name: string, x: number, y: number) {
    super();
    this.name = name;
    this.position = new VectorState(x, y);
    this.velocity = new VectorState(0, 0);
  }
}
