import { Body } from "matter-js";
import WorldConfig from "../consts/WorldConfig";

export default {
  getVelocity: (
    playerPosition: { x: number; y: number },
    pointerPosition: { x: number; y: number }
  ) => {
    return {
      x:
        ((pointerPosition.x - playerPosition.x) / WorldConfig.bounds.width) *
        WorldConfig.player.maxVelocity,
      y:
        ((pointerPosition.y - playerPosition.y) / WorldConfig.bounds.height) *
        WorldConfig.player.maxVelocity,
    };
  },
};
