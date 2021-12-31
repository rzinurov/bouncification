import { Schema, type } from "@colyseus/schema";
import { VectorState } from "./Primitives";

export class HoopState extends Schema {
  @type(VectorState)
  position: VectorState;

  constructor(x: number, y: number) {
    super();
    this.position = new VectorState(x, y);
  }
}
