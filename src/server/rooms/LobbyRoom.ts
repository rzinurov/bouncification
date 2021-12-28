import { Room, Client } from "colyseus";
import { LobbyState } from "common/rooms/schema/LobbyState";

export class LobbyRoom extends Room<LobbyState> {
  onCreate(options: any) {
    this.setState(new LobbyState());

    this.state.createPlayer(
      "bot",
      "bot",
      100 + Math.random() * 600,
      100 + Math.random() * 200
    );
  }

  onJoin(client: Client, options: any) {
    console.log(options.name, "joined as", client.sessionId);

    this.state.createPlayer(
      client.sessionId,
      options.name,
      100 + Math.random() * 600,
      100 + Math.random() * 200
    );
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    this.state.removePlayer(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
