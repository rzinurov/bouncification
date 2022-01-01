import { Schema, type } from "@colyseus/schema";
import { PositionState } from "./Primitives";

export class HoopState extends Schema {
  @type(PositionState)
  position: PositionState;

  @type(PositionState)
  backboardOffset: PositionState;

  @type(PositionState)
  edgeOffset: PositionState;

  constructor(
    position: PositionState,
    backboardPosition: PositionState,
    edgePosition: PositionState
  ) {
    super();
    this.position = position;
    this.backboardOffset = backboardPosition;
    this.edgeOffset = edgePosition;
  }
}
