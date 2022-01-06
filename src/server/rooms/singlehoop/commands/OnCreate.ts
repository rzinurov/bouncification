import { Command } from "@colyseus/command";
import SingleHoopWorld from "server/rooms/singlehoop/SingleHoopWorld";
import { SingleHoopRoom } from "server/rooms/singlehoop/SingleHoopRoom";
import WorldConfig from "common/consts/WorldConfig";

export class OnCreate extends Command<SingleHoopRoom> {
  world!: SingleHoopWorld;

  constructor(world: SingleHoopWorld) {
    super();
    this.world = world;
  }

  execute() {
    this.world.addHoop(100, 350);

    this.world.addPlayer("bot_1", "bot");

    this.world.addPlayer("bot_2", "bot");
  }
}
