import { Command } from "@colyseus/command";
import SingleHoopWorld from "../SingleHoopWorld";
import { SingleHoopRoom } from "../SingleHoopRoom";

export class OnCreate extends Command<SingleHoopRoom> {
  world!: SingleHoopWorld;

  constructor(world: SingleHoopWorld) {
    super();
    this.world = world;
  }

  execute() {
    this.world.addHoop(100, 350);

    this.world.addPlayer(
      "bot_1",
      "bot",
      100 + Math.random() * 600,
      100 + Math.random() * 200
    );

    this.world.addPlayer(
      "bot_2",
      "bot",
      100 + Math.random() * 600,
      100 + Math.random() * 200
    );
  }
}
