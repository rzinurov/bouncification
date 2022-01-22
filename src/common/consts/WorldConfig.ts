export default {
  player: {
    spriteSize: 128,
    maxVelocity: 100,
    restitution: 0.75,
  },
  hoop: {
    x: 100,
    y: 350,
    backboard: {
      offset: {
        x: -16,
        y: 0,
      },
      width: 16,
      height: 320,
    },
    edge: {
      offset: {
        x: 168,
        y: 92,
      },
      size: 12,
    },
  },
  bounds: {
    width: 1280,
    height: 1180,
  },
  gravity: {
    y: 1,
  },
};
