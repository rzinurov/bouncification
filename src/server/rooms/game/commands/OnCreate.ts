import { Command } from "@colyseus/command";
import { GameRoom } from "server/rooms/game/GameRoom";
import GameWorld from "server/rooms/game/GameWorld";

export class OnCreate extends Command<GameRoom> {
  world!: GameWorld;

  constructor(world: GameWorld) {
    super();
    this.world = world;
  }

  execute() {
    console.log("OnCreate", this.room.roomId);

    this.world.addHoop(100, 350);

    this.world.addBot("bot one");
    this.world.addBot("bot two");
  }
}
