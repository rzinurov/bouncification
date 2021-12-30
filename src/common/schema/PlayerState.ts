import { Schema, type } from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("string")
  name: string;

  @type("number")
  x: number;

  @type("number")
  y: number;

  @type("number")
  velocityX: number = 0;

  @type("number")
  velocityY: number = 0;

  @type("number")
  angle: number = 0;

  @type("number")
  angularVelocity: number = 0;

  @type("number")
  restitution: number = 0;

  constructor(name: string, x: number, y: number) {
    super();
    this.name = name;
    this.x = x;
    this.y = y;
  }
}
