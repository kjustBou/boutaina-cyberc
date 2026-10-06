import * as THREE from "three";
import {
  ROAD_SEGMENT_COUNT,
  ROAD_SEGMENT_LENGTH,
} from "../config/road.js";

const HALF_SEGMENT_COUNT = Math.floor(ROAD_SEGMENT_COUNT / 2);
const transform = new THREE.Object3D();

export function createNightEnvironment() {
  const object = new THREE.Group();
  object.name = "Night desert environment";

  const skyAnchor = createSkyAnchor();
  object.add(skyAnchor);

  const resources = createSceneryResources();
  const segments = Array.from({ length: ROAD_SEGMENT_COUNT }, () => {
    const segment = createScenerySegment(resources);
    object.add(segment.object);
    return segment;
  });
  const state = {
    centerSegment: Number.NaN,
    recycledSegments: 0,
    visibleInstances: 0,
  };

  function update(vehicleZ, elapsed = 0, force = false) {
    skyAnchor.position.z = vehicleZ;
    skyAnchor.userData.updateAurora(elapsed);

    const centerSegment = Math.floor(vehicleZ / ROAD_SEGMENT_LENGTH);
    if (!force && centerSegment === state.centerSegment) return;

    state.centerSegment = centerSegment;
    for (let offset = -HALF_SEGMENT_COUNT; offset <= HALF_SEGMENT_COUNT; offset += 1) {
      const worldSegment = centerSegment + offset;
      const slot = positiveModulo(worldSegment, segments.length);
      const segment = segments[slot];
      if (!force && segment.object.userData.worldSegment === worldSegment) continue;
      segment.object.position.z = worldSegment * ROAD_SEGMENT_LENGTH;
      segment.object.userData.worldSegment = worldSegment;
      segment.visibleInstances = segment.populate(worldSegment);
    }
    state.visibleInstances = segments.reduce(
      (total, segment) => total + segment.visibleInstances,
      0,
    );
    state.recycledSegments += 1;
  }

  update(0, 0, true);
  return { object, update, state };
}

function createSkyAnchor() {
  const anchor = new THREE.Group();
  anchor.name = "Following night sky";

  const starCount = 850;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const random = createRandom(4731);
  const warmStar = new THREE.Color(0xffe8cf);
  const coolStar = new THREE.Color(0x9fcaff);

  for (let index = 0; index < starCount; index += 1) {
    const positionIndex = index * 3;
    positions[positionIndex] = (random() - 0.5) * 300;
    positions[positionIndex + 1] = 18 + random() * 92;
    positions[positionIndex + 2] = (random() - 0.5) * 360;

    const color = random() > 0.82 ? warmStar : coolStar;
    const brightness = 0.45 + random() * 0.55;
    colors[positionIndex] = color.r * brightness;
    colors[positionIndex + 1] = color.g * brightness;
    colors[positionIndex + 2] = color.b * brightness;
  }

  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      size: 0.32,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      fog: false,
    }),
  );
  stars.name = "Procedural stars";
  anchor.add(stars);

  const aurora = createAurora();
  anchor.add(aurora.object, createHorizonGlow(), createDistantRidge());
  anchor.userData.updateAurora = aurora.update;

  const moonGlow = new THREE.Mesh(
    new THREE.CircleGeometry(11, 32),
    new THREE.MeshBasicMaterial({
      map: createRadialGlowTexture(),
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    }),
  );
  moonGlow.name = "Moon glow";
  moonGlow.position.set(-52, 43, 151);
  anchor.add(moonGlow);

  const moon = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 32),
    new THREE.MeshBasicMaterial({
      color: 0xd6e6f2,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      fog: false,
      side: THREE.DoubleSide,
    }),
  );
  moon.name = "Distant moon";
  moon.position.set(-52, 43, 150);
  anchor.add(moon);

  return anchor;
}

// The aurora is a few flat planes. Each is painted with a canvas texture of
// vertical "rays" (green on the bright lower edge, magenta higher up), and
// additive blending makes them glow. update() slowly sways and pulses them.
function createAurora() {
  const object = new THREE.Group();
  object.name = "Aurora curtains";

  const curtains = [
    { x: 25, y: 44, z: 158, width: 220, height: 58, opacity: 0.55, seed: 11 },
    { x: -45, y: 52, z: 168, width: 190, height: 50, opacity: 0.38, seed: 23 },
    { x: 75, y: 36, z: 150, width: 170, height: 42, opacity: 0.32, seed: 37 },
  ].map((config) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(config.width, config.height),
      new THREE.MeshBasicMaterial({
        map: createAuroraTexture(config.seed),
        transparent: true,
        opacity: config.opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        fog: false,
      }),
    );
    mesh.position.set(config.x, config.y, config.z);
    mesh.rotation.y = (config.seed % 5) * 0.03 - 0.06;
    object.add(mesh);
    return { mesh, config };
  });

  function update(elapsed) {
    curtains.forEach(({ mesh, config }, index) => {
      mesh.position.x = config.x + Math.sin(elapsed * 0.05 + index * 2) * 9;
      mesh.material.opacity =
        config.opacity * (0.72 + 0.28 * Math.sin(elapsed * 0.35 + index * 1.7));
    });
  }

  return { object, update };
}

function createAuroraTexture(seed) {
  const random = createRandom(seed);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const phaseA = random() * Math.PI * 2;
  const phaseB = random() * Math.PI * 2;

  for (let x = 0; x < canvas.width; x += 2) {
    const u = x / canvas.width;
    // Two sine waves multiplied together give irregular vertical rays.
    const ray = 0.5 + 0.5 * Math.sin(u * 38 + phaseA) * Math.sin(u * 11 + phaseB);
    const strength = Math.min(1, ray * 1.6 * Math.sin(u * Math.PI) + 0.12);
    const gradient = context.createLinearGradient(0, canvas.height, 0, 0);
    gradient.addColorStop(0, "rgba(60, 255, 150, 0)");
    gradient.addColorStop(0.12, `rgba(30, 235, 130, ${strength})`);
    gradient.addColorStop(0.5, `rgba(15, 170, 105, ${0.5 * strength})`);
    gradient.addColorStop(0.8, `rgba(200, 40, 130, ${0.45 * strength})`);
    gradient.addColorStop(1, "rgba(120, 30, 120, 0)");
    context.fillStyle = gradient;
    context.fillRect(x, 0, 2, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// The last light of sunset: a wide, low band of orange fading into teal.
function createHorizonGlow() {
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, canvas.height, 0, 0);
  gradient.addColorStop(0, "rgba(235, 115, 60, 0.75)");
  gradient.addColorStop(0.3, "rgba(150, 70, 80, 0.4)");
  gradient.addColorStop(0.65, "rgba(30, 110, 125, 0.18)");
  gradient.addColorStop(1, "rgba(10, 30, 60, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(420, 34),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      fog: false,
    }),
  );
  glow.name = "Horizon glow";
  glow.position.set(0, 16, 205);
  return glow;
}

// A static ridge of far mountains that travels with the sky, so the horizon
// always has a silhouette against the glow.
function createDistantRidge() {
  const random = createRandom(9001);
  const ridge = new THREE.Group();
  ridge.name = "Distant ridge";
  const geometry = new THREE.ConeGeometry(1, 1, 6);
  const material = new THREE.MeshBasicMaterial({ color: 0x070d18, fog: false });

  for (let x = -200; x <= 200; x += 24) {
    const radius = 12 + random() * 12;
    const height = 8 + random() * 14;
    const mountain = new THREE.Mesh(geometry, material);
    mountain.scale.set(radius * 1.4, height, radius);
    mountain.position.set(x + random() * 10, height / 2 - 0.6, 190 + random() * 8);
    ridge.add(mountain);
  }
  return ridge;
}

function createRadialGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(170, 205, 235, 0.55)");
  gradient.addColorStop(1, "rgba(170, 205, 235, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(context.canvas);
}

function createSceneryResources() {
  return {
    mountainGeometry: new THREE.ConeGeometry(1, 1, 6),
    rockGeometry: new THREE.DodecahedronGeometry(1, 0),
    poleGeometry: new THREE.CylinderGeometry(0.035, 0.055, 1, 6),
    lightGeometry: new THREE.SphereGeometry(0.11, 7, 5),
    palmTrunkGeometry: new THREE.CylinderGeometry(0.07, 0.12, 1, 6),
    palmCrownGeometry: new THREE.ConeGeometry(1, 0.55, 7),
    buildingGeometry: new THREE.BoxGeometry(1, 1, 1),
    cactusTrunkGeometry: new THREE.CylinderGeometry(0.15, 0.18, 1, 6),
    cactusArmGeometry: new THREE.CylinderGeometry(0.11, 0.12, 1, 6),
    cactusLinkGeometry: new THREE.BoxGeometry(1, 1, 1),
    cactusMaterial: new THREE.MeshBasicMaterial({ color: 0x08110f }),
    mountainMaterial: new THREE.MeshBasicMaterial({ color: 0x080b13 }),
    rockMaterial: new THREE.MeshStandardMaterial({
      color: 0x14141a,
      roughness: 1,
    }),
    poleMaterial: new THREE.MeshStandardMaterial({
      color: 0x1b2028,
      roughness: 0.75,
      metalness: 0.3,
    }),
    lightMaterial: new THREE.MeshBasicMaterial({ color: 0xff9b57 }),
    palmMaterial: new THREE.MeshBasicMaterial({ color: 0x080d10 }),
    buildingMaterial: new THREE.MeshBasicMaterial({ color: 0x070a12 }),
    cityLightMaterial: new THREE.MeshBasicMaterial({ color: 0xb84b58 }),
  };
}

function createScenerySegment(resources) {
  const object = new THREE.Group();
  object.name = "Recycled scenery segment";

  const mountains = createInstances(
    resources.mountainGeometry,
    resources.mountainMaterial,
    4,
  );
  const rocks = createInstances(
    resources.rockGeometry,
    resources.rockMaterial,
    5,
  );
  const poles = createInstances(
    resources.poleGeometry,
    resources.poleMaterial,
    4,
  );
  const poleLights = createInstances(
    resources.lightGeometry,
    resources.lightMaterial,
    4,
  );
  const palmTrunks = createInstances(
    resources.palmTrunkGeometry,
    resources.palmMaterial,
    2,
  );
  const palmCrowns = createInstances(
    resources.palmCrownGeometry,
    resources.palmMaterial,
    2,
  );
  const buildings = createInstances(
    resources.buildingGeometry,
    resources.buildingMaterial,
    5,
  );
  const cityLights = createInstances(
    resources.lightGeometry,
    resources.cityLightMaterial,
    5,
  );

  // A cactus = one trunk, plus two arms (each a short horizontal link and a
  // vertical piece), so it needs 1 / 2 / 2 instances per cactus.
  const cactusTrunks = createInstances(
    resources.cactusTrunkGeometry,
    resources.cactusMaterial,
    3,
  );
  const cactusLinks = createInstances(
    resources.cactusLinkGeometry,
    resources.cactusMaterial,
    6,
  );
  const cactusArms = createInstances(
    resources.cactusArmGeometry,
    resources.cactusMaterial,
    6,
  );

  object.add(
    mountains,
    rocks,
    poles,
    poleLights,
    palmTrunks,
    palmCrowns,
    buildings,
    cityLights,
    cactusTrunks,
    cactusLinks,
    cactusArms,
  );

  function populate(worldSegment) {
    const random = createRandom(worldSegment * 7919 + 104729);
    let visibleInstances = 0;

    for (let index = 0; index < mountains.count; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      const radius = 7 + random() * 11;
      const height = 6 + random() * 11;
      setInstance(
        mountains,
        index,
        side * (45 + random() * 50),
        height / 2 - 0.1,
        localZ(random),
        radius * 1.5,
        height,
        radius,
        random() * Math.PI,
      );
    }
    visibleInstances += mountains.count;

    for (let index = 0; index < rocks.count; index += 1) {
      const side = random() < 0.5 ? -1 : 1;
      const size = 0.35 + random() * 1.25;
      setInstance(
        rocks,
        index,
        side * (10.3 + random() * 15),
        size * 0.42,
        localZ(random),
        size * (0.8 + random() * 0.7),
        size * 0.8,
        size,
        random() * Math.PI,
      );
    }
    visibleInstances += rocks.count;

    const poleCount = random() > 0.32 ? 2 : 0;
    poles.count = poleCount;
    poleLights.count = poleCount;
    for (let index = 0; index < poleCount; index += 1) {
      const side = index === 0 ? -1 : 1;
      const x = side * (10.2 + random() * 1.5);
      const z = localZ(random);
      const height = 4 + random() * 1.8;
      setInstance(poles, index, x, height / 2, z, 1, height, 1);
      setInstance(poleLights, index, x, height, z, 1, 1, 1);
    }
    visibleInstances += poleCount * 2;

    const palmCount = Math.abs(worldSegment) % 4 === 2 ? 1 : 0;
    palmTrunks.count = palmCount;
    palmCrowns.count = palmCount;
    for (let index = 0; index < palmCount; index += 1) {
      const side = random() < 0.5 ? -1 : 1;
      const x = side * (13 + random() * 9);
      const z = localZ(random);
      const height = 4.5 + random() * 2.8;
      setInstance(palmTrunks, index, x, height / 2, z, 1, height, 1);
      setInstance(palmCrowns, index, x, height + 0.2, z, 1.7, 1.3, 1.7);
    }
    visibleInstances += palmCount * 2;

    const buildingCount = Math.abs(worldSegment) % 7 === 3 ? 5 : 0;
    buildings.count = buildingCount;
    cityLights.count = buildingCount;
    const citySide = random() < 0.5 ? -1 : 1;
    for (let index = 0; index < buildingCount; index += 1) {
      const height = 3 + random() * 8;
      const x = citySide * (38 + index * 3.2 + random() * 2);
      const z = -22 + index * 8 + random() * 3;
      setInstance(buildings, index, x, height / 2, z, 2.2, height, 2.2);
      setInstance(cityLights, index, x, height * 0.72, z - 1.12, 0.55, 0.55, 0.55);
    }
    visibleInstances += buildingCount * 2;

    for (let index = 0; index < cactusTrunks.count; index += 1) {
      const side = random() < 0.5 ? -1 : 1;
      const x = side * (12 + random() * 20);
      const z = localZ(random);
      const height = 1.8 + random() * 1.6;
      setInstance(cactusTrunks, index, x, height / 2, z, 1, height, 1);

      for (const armSide of [-1, 1]) {
        const arm = index * 2 + (armSide === -1 ? 0 : 1);
        const armHeight = height * (0.22 + random() * 0.25);
        setInstance(cactusLinks, arm, x + armSide * 0.22, height * 0.45, z, 0.44, 0.12, 0.12);
        setInstance(
          cactusArms,
          arm,
          x + armSide * 0.42,
          height * 0.45 + armHeight / 2,
          z,
          1,
          armHeight,
          1,
        );
      }
    }
    visibleInstances += cactusTrunks.count * 5;

    for (const mesh of [
      mountains,
      rocks,
      poles,
      poleLights,
      palmTrunks,
      palmCrowns,
      buildings,
      cityLights,
      cactusTrunks,
      cactusLinks,
      cactusArms,
    ]) {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }

    return visibleInstances;
  }

  return { object, populate, visibleInstances: 0 };
}

function createInstances(geometry, material, count) {
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.count = count;
  return mesh;
}

function setInstance(
  mesh,
  index,
  x,
  y,
  z,
  scaleX = 1,
  scaleY = 1,
  scaleZ = 1,
  rotationY = 0,
) {
  transform.position.set(x, y, z);
  transform.rotation.set(0, rotationY, 0);
  transform.scale.set(scaleX, scaleY, scaleZ);
  transform.updateMatrix();
  mesh.setMatrixAt(index, transform.matrix);
}

function localZ(random) {
  return (random() - 0.5) * (ROAD_SEGMENT_LENGTH - 5);
}

function createRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}
