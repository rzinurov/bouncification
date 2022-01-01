import { Schema, type } from "@colyseus/schema";

export class LeaderboardRowState extends Schema {
  @type("string")
  name: string = "";

  @type("number")
  score: number = 0;
}
