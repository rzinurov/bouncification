import { Client, Room } from "colyseus";
import { SingleHoopState as SingleHoopState } from "../../../common/schema/SingleHoopState";
import SingleHoopWorld from "./SingleHoopWorld";

export class SingleHoopRoom extends Room<SingleHoopState> {
  world!: SingleHoopWorld;

  onCreate(options: any) {
    this.setState(new SingleHoopState());

    this.world = new SingleHoopWorld(this.state);

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

    this.setPatchRate(1000 / 20);
    this.setSimulationInterval((dt) => this.update(dt));

    this.onMessage("jumpTo", (client, message) => {
      this.world.jumpTo(client.sessionId, message.x, message.y);
    });
  }

  onJoin(client: Client, options: any) {
    console.log(options.name, "joined as", client.sessionId);

    this.world.addPlayer(
      client.sessionId,
      options.name,
      100 + Math.random() * 600,
      100 + Math.random() * 200
    );
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    this.world.removePlayer(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  update(dt: number) {
    this.world.update(dt);
  }
}
