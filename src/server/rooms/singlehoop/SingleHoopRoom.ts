import { Dispatcher } from "@colyseus/command";
import { Client, Room } from "colyseus";
import { SingleHoopState as SingleHoopState } from "../../../common/schema/SingleHoopState";
import { OnCreate } from "./commands/OnCreate";
import { OnJoin } from "./commands/OnJoin";
import { OnLeave } from "./commands/OnLeave";
import SingleHoopWorld from "./SingleHoopWorld";

export class SingleHoopRoom extends Room<SingleHoopState> {
  dispatcher = new Dispatcher(this);
  world!: SingleHoopWorld;

  onCreate(options: any) {
    this.setState(new SingleHoopState());

    this.world = new SingleHoopWorld(this.state);

    this.setPatchRate(1000 / 20);
    this.setSimulationInterval((dt) => this.update(dt));

    this.onMessage("jumpTo", (client, message) => {
      this.world.jumpTo(client.sessionId, message.x, message.y);
    });

    this.maxClients = 10;

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
