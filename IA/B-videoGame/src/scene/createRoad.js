import * as THREE from "three";
import {
  ROAD_SEGMENT_COUNT,
  ROAD_SEGMENT_LENGTH,
  ROAD_WIDTH,
} from "../config/road.js";

const HALF_SEGMENT_COUNT = Math.floor(ROAD_SEGMENT_COUNT / 2);

export function createRoad() {
  const object = new THREE.Group();
  object.name = "Recycled road";

  const resources = createRoadResources();
  const segments = Array.from({ length: ROAD_SEGMENT_COUNT }, (_, slot) => {
    const segment = createRoadSegment(resources);
    segment.userData.slot = slot;
    object.add(segment);
    return segment;
  });
  const state = {
    centerSegment: Number.NaN,
    recycledSegments: 0,
  };

  function update(vehicleZ, force = false) {
    const centerSegment = Math.floor(vehicleZ / ROAD_SEGMENT_LENGTH);
    if (!force && centerSegment === state.centerSegment) return;

    state.centerSegment = centerSegment;
    for (let offset = -HALF_SEGMENT_COUNT; offset <= HALF_SEGMENT_COUNT; offset += 1) {
      const worldSegment = centerSegment + offset;
      const slot = positiveModulo(worldSegment, segments.length);
      const segment = segments[slot];
      if (!force && segment.userData.worldSegment === worldSegment) continue;
      segment.position.z = worldSegment * ROAD_SEGMENT_LENGTH;
      segment.userData.worldSegment = worldSegment;
    }
    state.recycledSegments += 1;
  }

  update(0, true);
  return { object, update, state };
}

function createRoadResources() {
  return {
    groundGeometry: new THREE.PlaneGeometry(150, ROAD_SEGMENT_LENGTH + 0.2),
    roadGeometry: new THREE.PlaneGeometry(
      ROAD_WIDTH,
      ROAD_SEGMENT_LENGTH + 0.15,
    ),
    centerLineGeometry: new THREE.PlaneGeometry(
      0.085,
      ROAD_SEGMENT_LENGTH + 0.12,
    ),
    edgeLineGeometry: new THREE.PlaneGeometry(
      0.08,
      ROAD_SEGMENT_LENGTH + 0.12,
    ),
    groundMaterial: new THREE.MeshStandardMaterial({
      color: 0x070a10,
      roughness: 1,
    }),
    roadMaterial: new THREE.MeshStandardMaterial({
      color: 0x11151c,
      roughness: 0.88,
      metalness: 0.04,
    }),
    centerLineMaterial: new THREE.MeshStandardMaterial({
      color: 0x9b7939,
      emissive: 0x241606,
      emissiveIntensity: 0.35,
      roughness: 0.82,
    }),
    edgeLineMaterial: new THREE.MeshStandardMaterial({
      color: 0x808892,
      emissive: 0x111923,
      emissiveIntensity: 0.28,
      roughness: 0.9,
    }),
  };
}

function createRoadSegment(resources) {
  const segment = new THREE.Group();
  segment.name = "Road segment";

  const ground = createHorizontalMesh(
    resources.groundGeometry,
    resources.groundMaterial,
    -0.045,
  );
  ground.name = "Desert ground";
  ground.receiveShadow = true;
  segment.add(ground);

  const road = createHorizontalMesh(
    resources.roadGeometry,
    resources.roadMaterial,
    0,
  );
  road.name = "Asphalt";
  road.receiveShadow = true;
  segment.add(road);

  for (const x of [-0.09, 0.09]) {
    const centerLine = createHorizontalMesh(
      resources.centerLineGeometry,
      resources.centerLineMaterial,
      0.012,
    );
    centerLine.name = "Center line";
    centerLine.position.x = x;
    segment.add(centerLine);
  }

  for (const x of [-ROAD_WIDTH / 2 + 0.34, ROAD_WIDTH / 2 - 0.34]) {
    const edgeLine = createHorizontalMesh(
      resources.edgeLineGeometry,
      resources.edgeLineMaterial,
      0.011,
    );
    edgeLine.name = "Road edge line";
    edgeLine.position.x = x;
    segment.add(edgeLine);
  }

  return segment;
}

function createHorizontalMesh(geometry, material, y) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  return mesh;
}

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}
