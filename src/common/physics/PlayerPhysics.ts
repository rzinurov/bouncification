export default {
  getVelocity: (vector: { x: number; y: number }) => {
    return {
      x: Math.min(30, vector.x * 0.2),
      y: Math.min(30, vector.y * 0.2),
    };
  },
};
