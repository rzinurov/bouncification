import { Command } from "@colyseus/command";
import GameWorld from "server/rooms/game/GameWorld";
import { GameRoom } from "server/rooms/game/GameRoom";

export class OnLeave extends Command<GameRoom, { sessionId: string }> {
  world!: GameWorld;

  constructor(world: GameWorld) {
    super();
    this.world = world;
  }

  execute({ sessionId }: { sessionId: string }) {
    console.log("OnLeave", this.room.roomId, sessionId);

    this.world.removePlayer(sessionId);
  }
}
