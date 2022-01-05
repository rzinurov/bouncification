import Phaser from "phaser";
import "regenerator-runtime/runtime";

import SingleHoopScene from "./scenes/singlehoop/SingleHoopScene";
import BootstrapScene from "./scenes/BootstrapScene";
import WorldConfig from "common/consts/WorldConfig";
import MenuScene from "./scenes/MenuScene";
import PreloaderScene from "./scenes/PreloaderScene";
import InputTextPlugin from "phaser3-rex-plugins/plugins/inputtext-plugin.js";

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
  scene: [BootstrapScene, PreloaderScene, MenuScene, SingleHoopScene],
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
