import { Schema, type } from "@colyseus/schema";

export const RoundStates = {
  Practice: 0,
  Game: 1,
  Results: 2,
  End: 3,
};

export class RoundState extends Schema {
  @type("number")
  value: number = RoundStates.Practice;

  @type("number")
  timer: number = 60000;

  @type("string")
  topMessage: string = "game starts in";

  @type("string")
  bottomMessage: string = "call your friends";
}
