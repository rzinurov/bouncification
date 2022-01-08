import { Dispatcher } from "@colyseus/command";
import { Client, Room, updateLobby } from "colyseus";
import { GameState as GameState } from "common/schema/GameState";
import { OnCreate } from "./commands/OnCreate";
import { OnJoin } from "./commands/OnJoin";
import { OnLeave } from "./commands/OnLeave";
import GameWorld from "./GameWorld";

export class GameRoom extends Room<GameState> {
  dispatcher = new Dispatcher(this);
  world!: GameWorld;

  onCreate(options: { name: string }) {
    this.setState(new GameState());

    const playerName = options.name?.trim();

    this.setMetadata({
      ownerName: playerName ? playerName.substring(0, 16) : "anonymous",
    }).then(() => updateLobby(this));

    this.world = new GameWorld(this.state);

    this.setPatchRate(1000 / 20);
    this.setSimulationInterval((dt) => this.update(dt));

    this.onMessage("jump", (client, message: { x: number; y: number }) => {
      this.world.jump(client.sessionId, message);
    });

    this.maxClients = 8;

    this.dispatcher.dispatch(new OnCreate(this.world));
  }

  onJoin(client: Client, options: any) {
    console.log(options.name, "joined as", client.sessionId);

    this.dispatcher.dispatch(new OnJoin(this.world), {
      sessionId: client.sessionId,
      options,
    });
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    this.dispatcher.dispatch(new OnLeave(this.world), {
      sessionId: client.sessionId,
    });
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    this.dispatcher.stop();
  }

  update(dt: number) {
    this.world.update(dt);
  }
}
