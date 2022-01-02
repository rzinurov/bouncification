const MAX_VELOCITY = 50;

export default {
  limitVelocity: (velocity: { x: number; y: number }) => {
    return {
      x: Math.sign(velocity.x) * Math.min(MAX_VELOCITY, Math.abs(velocity.x)),
      y: Math.sign(velocity.y) * Math.min(MAX_VELOCITY, Math.abs(velocity.y)),
    };
  },
};
