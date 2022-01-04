import { Command } from "@colyseus/command";
import SingleHoopWorld from "server/rooms/singlehoop/SingleHoopWorld";
import { SingleHoopRoom } from "server/rooms/singlehoop/SingleHoopRoom";

export class OnLeave extends Command<SingleHoopRoom, { sessionId: string }> {
  world!: SingleHoopWorld;

  constructor(world: SingleHoopWorld) {
    super();
    this.world = world;
  }

  execute({ sessionId }: { sessionId: string }) {
    this.world.removePlayer(sessionId);
  }
}
