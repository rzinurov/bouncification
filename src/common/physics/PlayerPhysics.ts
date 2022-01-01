export default {
  limitVelocity: (velocity: { x: number; y: number }) => {
    return {
      x: Math.min(30, velocity.x),
      y: Math.min(30, velocity.y),
    };
  },
};
