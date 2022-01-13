import { Command } from "@colyseus/command";
import { GameState } from "common/schema/GameState";
import { RoundStates } from "common/schema/RoundState";
import { GameRoom } from "server/rooms/game/GameRoom";

export class OnNextRoundState extends Command<GameRoom> {
  async execute() {
    console.log("OnNextRoundState", this.room.roomId);

    const state = this.room.state as any as GameState;
    switch (state.roundState.value) {
      case RoundStates.End:
        console.log("Disconnecting room", this.room.roomId);
        await this.room.disconnect();
        break;
    }
  }
}
