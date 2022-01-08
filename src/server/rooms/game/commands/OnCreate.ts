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
    this.world.addHoop(100, 350);

    this.world.addPlayer("bot_1", "bot");

    this.world.addPlayer("bot_2", "bot");
  }
}
