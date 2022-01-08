import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import { LobbyRoom } from "colyseus";
import Rooms from "common/consts/Rooms";
import * as express from "express";
/**
 * Import your Room files
 */
import { GameRoom } from "server/rooms/game/GameRoom";

export default Arena({
  getId: () => "Bouncification",

  initializeGameServer: (gameServer) => {
    gameServer.define(Rooms.Lobby, LobbyRoom);
    gameServer.define(Rooms.Game, GameRoom).enableRealtimeListing();
  },

  initializeExpress: (app) => {
    app.use("/colyseus", monitor());

    app.use(express.static(__dirname + "/public"));
  },

  beforeListen: () => {},
});
