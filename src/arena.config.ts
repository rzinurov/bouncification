import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import { LobbyRoom } from "colyseus";
import Rooms from "common/consts/Rooms";
import * as express from "express";

/**
 * Import your Room files
 */
import { SingleHoopRoom } from "server/rooms/singlehoop/SingleHoopRoom";

export default Arena({
  getId: () => "Bouncification",

  initializeGameServer: (gameServer) => {
    gameServer.define(Rooms.Lobby, LobbyRoom);
    gameServer.define(Rooms.SingleHoop, SingleHoopRoom).enableRealtimeListing();
  },

  initializeExpress: (app) => {
    app.use("/colyseus", monitor());

    app.use(express.static(__dirname + "/public"));
  },

  beforeListen: () => {},
});
