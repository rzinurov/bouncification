import { Command } from "@colyseus/command";
import GameWorld from "server/rooms/game/GameWorld";
import { GameRoom } from "server/rooms/game/GameRoom";

export class OnJoin extends Command<
  GameRoom,
  { sessionId: string; options: { name: string } }
> {
  world!: GameWorld;

  constructor(world: GameWorld) {
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
    console.log("OnJoin", this.room.roomId, sessionId);

    const playerName = options.name?.trim();
    this.world.addPlayer(
      sessionId,
      playerName ? playerName.substring(0, 16) : "anonymous"
    );
    this.world.updateRoundTimer(); // so that the joined player gets correct timer value
  }
}
