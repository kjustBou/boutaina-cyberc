export const ROAD_WIDTH = 12;
export const ROAD_SEGMENT_LENGTH = 60;
export const ROAD_SEGMENT_COUNT = 7;

// The road is endless along Z. Only the lateral limits are physical bounds;
// the visible road sections are recycled around the moving vehicle.
export const ROAD_BOUNDS = Object.freeze({
  minX: -4.35,
  maxX: 4.35,
});
