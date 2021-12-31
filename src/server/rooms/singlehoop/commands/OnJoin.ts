import { Command } from "@colyseus/command";
import SingleHoopWorld from "../SingleHoopWorld";
import { SingleHoopRoom } from "../SingleHoopRoom";

export class OnJoin extends Command<
  SingleHoopRoom,
  { sessionId: string; options: { name: string } }
> {
  world!: SingleHoopWorld;

  constructor(world: SingleHoopWorld) {
    super();
    this.world = world;
  }

  execute({ sessionId, options }: { sessionId: string; options: any }) {
    this.world.addPlayer(
      sessionId,
      options.name,
      100 + Math.random() * 600,
      100 + Math.random() * 200
    );
  }
}
