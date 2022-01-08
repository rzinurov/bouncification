import WorldConfig from "common/consts/WorldConfig";
import Phaser from "phaser";
import InputTextPlugin from "phaser3-rex-plugins/plugins/inputtext-plugin.js";
import "regenerator-runtime/runtime";
import BootstrapScene from "./scenes/BootstrapScene";
import LobbyScene from "./scenes/LobbyScene";
import MenuScene from "./scenes/MenuScene";
import PreloaderScene from "./scenes/PreloaderScene";
import GameScene from "./scenes/game/GameScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 1280,
  physics: {
    default: "matter",
    matter: {
      enableSleeping: true,
      gravity: { y: WorldConfig.gravity.y },
      debug: /localhost/.test(window.location.host),
    },
  },
  scene: [BootstrapScene, LobbyScene, MenuScene, PreloaderScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  parent: "game",
  dom: {
    createContainer: true,
  },
  plugins: {
    global: [
      {
        key: "rexInputTextPlugin",
        plugin: InputTextPlugin,
        start: true,
      },
    ],
  },
};

export default new Phaser.Game(config);
