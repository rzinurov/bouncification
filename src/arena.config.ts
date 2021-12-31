import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import Rooms from "./common/consts/Rooms";
import * as express from "express";

/**
 * Import your Room files
 */
import { LobbyRoom } from "./server/rooms/LobbyRoom";

export default Arena({
  getId: () => "Bouncification",

  initializeGameServer: (gameServer) => {
    gameServer.define(Rooms.Lobby, LobbyRoom);
  },

  initializeExpress: (app) => {
    app.use("/colyseus", monitor());

    app.use(express.static(__dirname + "/static"));
  },

  beforeListen: () => {},
});
