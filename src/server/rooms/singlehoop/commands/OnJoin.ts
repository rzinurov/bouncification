import { Command } from "@colyseus/command";
import SingleHoopWorld from "server/rooms/singlehoop/SingleHoopWorld";
import { SingleHoopRoom } from "server/rooms/singlehoop/SingleHoopRoom";

export class OnJoin extends Command<
  SingleHoopRoom,
  { sessionId: string; options: { name: string } }
> {
  world!: SingleHoopWorld;

  constructor(world: SingleHoopWorld) {
    super();
    this.world = world;
  }

  execute({
    sessionId,
    options,
  }: {
    sessionId: string;
    options: { name: string };
  }) {
    const playerName = options.name.trim();
    this.world.addPlayer(
      sessionId,
      playerName ? playerName.substring(0, 16) : "anonymous"
    );
  }
}
