// The 3D scene on the home page. Everything is driven by one number, the stage:
// 0 hero, 1 read, 2 compare, 3 check, 4 draft, 5 at volume, 6 sign-off.
// Home.tsx works the stage out from the scroll position and this file draws it.
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  Euler,
  Float32BufferAttribute,
  Fog,
  GridHelper,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  type Material,
  MeshLambertMaterial,
  Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";

export type LoopScene = { signOff: () => void; destroy: () => void };

const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim();

// Eases x from 0 to 1 as it travels between two stage numbers.
function ramp(from: number, to: number, x: number) {
  const t = Math.min(Math.max((x - from) / (to - from), 0), 1);
  return t * t * (3 - 2 * t);
}

// The track: a long oval with a gentle wave. It is deliberately not a figure-eight,
// because that shape would read as a redrawn copy of the logo.
const TRACK_X = 7.2;
const TRACK_Z = 4;
function trackPoint(u: number, out: Vector3) {
  return out.set(TRACK_X * Math.cos(u), 0.05 * Math.sin(3 * u), TRACK_Z * Math.sin(u));
}
function trackYaw(u: number) {
  return Math.atan2(-TRACK_X * Math.sin(u), TRACK_Z * Math.cos(u));
}

// Walking the oval by angle bunches things up at the two ends, where it curves. This table turns
// "how far round, from 0 to 1" into the angle that is that far along, so spacing is always even.
const ARC_STEPS = 720;
const arcTable = (() => {
  const lengths = [0];
  const a = new Vector3();
  const b = new Vector3();
  for (let i = 1; i <= ARC_STEPS; i++) {
    trackPoint(((i - 1) / ARC_STEPS) * Math.PI * 2, a);
    trackPoint((i / ARC_STEPS) * Math.PI * 2, b);
    lengths.push(lengths[i - 1] + a.distanceTo(b));
  }
  return lengths;
})();
function arcAngle(turns: number) {
  const target = (turns - Math.floor(turns)) * arcTable[ARC_STEPS];
  let low = 0;
  let high = ARC_STEPS;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if (arcTable[mid] <= target) low = mid;
    else high = mid;
  }
  const fraction = (target - arcTable[low]) / (arcTable[high] - arcTable[low] || 1);
  return ((low + fraction) / ARC_STEPS) * Math.PI * 2;
}

// The belt's top surface sits this far below the track line.
const BELT_TOP = -0.03;
// A strip that follows the track: its half width, how far it sits to one side, its top height and its depth.
function buildTrack(color: string, halfWidth: number, lateral: number, lift: number, thickness: number) {
  const positions: number[] = [];
  const indices: number[] = [];
  const point = new Vector3();
  const segments = 256;
  for (let i = 0; i <= segments; i++) {
    const u = (i / segments) * Math.PI * 2;
    trackPoint(u, point);
    const yaw = trackYaw(u);
    const centreX = point.x + Math.cos(yaw) * lateral;
    const centreZ = point.z - Math.sin(yaw) * lateral;
    const sideX = Math.cos(yaw) * halfWidth;
    const sideZ = -Math.sin(yaw) * halfWidth;
    const top = point.y + BELT_TOP + lift;
    // Four corners of the slab at this point along the track.
    positions.push(centreX + sideX, top, centreZ + sideZ);
    positions.push(centreX - sideX, top, centreZ - sideZ);
    positions.push(centreX + sideX, top - thickness, centreZ + sideZ);
    positions.push(centreX - sideX, top - thickness, centreZ - sideZ);
    if (i < segments) {
      const a = i * 4;
      indices.push(a, a + 4, a + 1, a + 1, a + 4, a + 5); // top
      indices.push(a, a + 2, a + 4, a + 2, a + 6, a + 4); // one side wall
      indices.push(a + 1, a + 5, a + 3, a + 3, a + 5, a + 7); // other side wall
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new Mesh(geometry, new MeshLambertMaterial({ color, side: 2 }));
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  return mesh;
}

// Ruler marks along the track edge, like the graduations on an audit ledger.
function buildRulerMarks(color: string) {
  const count = 280;
  const marks = new InstancedMesh(
    new BoxGeometry(0.16, 0.004, 0.018),
    new MeshBasicMaterial({ color }),
    count,
  );
  const dummy = new Object3D();
  const point = new Vector3();
  for (let i = 0; i < count; i++) {
    const u = arcAngle(i / count);
    trackPoint(u, point);
    const yaw = trackYaw(u);
    dummy.position.set(point.x + Math.cos(yaw) * 0.84, point.y - 0.02, point.z - Math.sin(yaw) * 0.84);
    dummy.rotation.y = yaw;
    dummy.updateMatrix();
    marks.setMatrixAt(i, dummy.matrix);
  }
  return marks;
}

// The small printed look shared by every sheet on the track.
function buildSheetTexture(ink: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 352;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "white";
  c.fillRect(0, 0, 256, 352);
  c.fillStyle = ink;
  c.fillRect(24, 28, 90, 12);
  for (let y = 72; y < 320; y += 26) {
    c.fillRect(24, y, 120 + ((y * 7) % 40), 5);
    c.fillRect(190, y, 42, 5);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

// Row heights on the big working paper, in canvas pixels. Shared with the link lines.
const PAPER_W = 1024;
const PAPER_H = 1448;
const ROW_YS = Array.from({ length: 10 }, (_, i) => 250 + i * 84);
const FLAGGED_ROWS = [3, 7];
const MATCHED_ROWS = [0, 2, 4, 6, 8];

type Colours = Record<"navy" | "slate" | "line" | "green" | "bright" | "amber", string>;

// Draws the working paper for a stage. Figures are bars, not numbers, so nothing here
// can be mistaken for real data.
function drawPaper(c: CanvasRenderingContext2D, stage: number, tick: number, colours: Colours) {
  c.fillStyle = "white";
  c.fillRect(0, 0, PAPER_W, PAPER_H);
  c.strokeStyle = colours.line; // an edge, so the paper still reads on the white sign-off screen
  c.lineWidth = 10;
  c.strokeRect(0, 0, PAPER_W, PAPER_H);
  c.fillStyle = colours.navy;
  c.font = '500 38px "IBM Plex Mono"';
  c.fillText("Working paper", 90, 130);
  c.fillStyle = colours.line;
  c.fillRect(90, 170, PAPER_W - 180, 3);

  ROW_YS.forEach((y, row) => {
    const flagged = stage >= 3 && FLAGGED_ROWS.includes(row);
    c.fillStyle = colours.line;
    c.fillRect(90, y, 300 + ((row * 97) % 160), 14);
    if (stage >= 1) {
      c.globalAlpha = 0.18;
      c.fillStyle = flagged ? colours.amber : colours.bright;
      c.fillRect(620, y - 20, 240, 54);
      c.globalAlpha = 1;
    }
    c.fillStyle = flagged ? colours.amber : stage >= 1 ? colours.green : colours.slate;
    c.fillRect(650, y, 180, 14);
    if (stage >= 3 && !flagged) drawTick(c, 900, y - 22, 1, colours.green, 7);
  });

  if (stage >= 4) {
    c.font = '400 30px "IBM Plex Mono"';
    c.fillStyle = colours.slate;
    c.fillText("Prepared by: Endloops", 90, 1170);
    c.fillText("Reviewed by:", 90, 1290);
    c.fillStyle = colours.navy;
    c.fillRect(350, 1294, PAPER_W - 440, 3);
    drawTick(c, 490, 1140, 1, colours.green, 7);
  }
  if (tick > 0) drawTick(c, 380, 1222, tick, colours.green, 10, 1.5);
}

function drawTick(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number,
  colour: string,
  width: number,
  size = 1,
) {
  c.strokeStyle = colour;
  c.lineWidth = width;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.setLineDash([120 * size, 120 * size]);
  c.lineDashOffset = 120 * size * (1 - progress);
  c.beginPath();
  c.moveTo(x, y + 26 * size);
  c.lineTo(x + 16 * size, y + 44 * size);
  c.lineTo(x + 56 * size, y);
  c.stroke();
  c.setLineDash([]);
}

function buildLedgerTexture(colours: Colours) {
  const canvas = document.createElement("canvas");
  canvas.width = PAPER_W / 2;
  canvas.height = PAPER_H / 2;
  const c = canvas.getContext("2d")!;
  c.scale(0.5, 0.5);
  c.fillStyle = "white";
  c.fillRect(0, 0, PAPER_W, PAPER_H);
  c.fillStyle = colours.navy;
  c.font = '500 38px "IBM Plex Mono"';
  c.fillText("Ledger", 90, 130);
  c.fillStyle = colours.navy;
  c.fillRect(90, 170, PAPER_W - 180, 3);
  ROW_YS.forEach((y, row) => {
    c.fillStyle = colours.slate;
    c.fillRect(90, y, 150, 14);
    c.fillStyle = colours.line;
    c.fillRect(300, y, 240 + ((row * 61) % 120), 14);
  });
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

// Where the camera and the working paper sit at each stage.
const FACING = new Quaternion().setFromEuler(new Euler(-0.04, -0.08, 0.015));
const FLAT = new Quaternion().setFromEuler(new Euler(-Math.PI / 2, 0, 0));
const STACK_X = 1.9; // where the sheets pile up at the draft stage
// Text sits at the top of the screen, so every pose keeps the track in the lower part of the frame.
const poses = [
  { camera: [0, 8, 13.5], look: [0, 2.6, 0], paper: [0, 0, 0], turn: FLAT, size: 1 },
  { camera: [0, 3.2, 11], look: [0, 2.6, 0], paper: [1.93, 2.3, 3], turn: FACING, size: 1 },
  { camera: [0, 3.2, 12], look: [0, 2.6, 0], paper: [1.05, 2.15, 3], turn: FACING, size: 1 },
  { camera: [0, 5.5, 13], look: [0, 3, 0], paper: [2.4, 2, 1], turn: FACING, size: 1 },
  { camera: [0, 6.2, 6.8], look: [0, 0.2, 1.3], paper: [STACK_X, 0.62, 0], turn: FLAT, size: 1 },
  { camera: [0, 7, 14], look: [0, 3.4, 0], paper: [STACK_X, 0.62, 0], turn: FLAT, size: 0.001 },
  { camera: [0, 2.8, 10.5], look: [0, 2.6, 3], paper: [1.6, 2.35, 3], turn: FACING, size: 1 },
];

export function createLoopScene(
  canvas: HTMLCanvasElement,
  getStage: () => number,
  // Pixels of the screen's top taken by the hero text, so the ring can always start just below it.
  getHeroInset: () => number = () => 0,
): LoopScene {
  const mobile = window.innerWidth < 768;
  const sheetCount = mobile ? 60 : 400;
  const heroCount = mobile ? 10 : 22;
  const stacked = window.innerWidth < 1024; // matches the lg: breakpoint in Home.tsx
  const narrow = stacked ? 0.15 : 1; // narrow screens pull everything towards the centre
  const stackX = STACK_X * narrow;
  const colours: Colours = {
    navy: token("navy"),
    slate: token("slate"),
    line: token("line"),
    green: token("green"),
    bright: token("green-bright"),
    amber: token("amber"),
  };

  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = PCFShadowMap;

  const navy = new Color(colours.navy);
  const fog = new Fog(navy.clone(), 14, 30);
  const scene = new Scene();
  scene.fog = fog; // distant things fade into the background, which adds a lot of depth
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);

  scene.add(new AmbientLight(0xffffff, 2.3));
  const sun = new DirectionalLight(0xffffff, 1.1);
  sun.position.set(-5, 14, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -12;
  sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 8;
  sun.shadow.camera.bottom = -8;
  sun.shadow.radius = 5;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);

  const ground = new Mesh(new PlaneGeometry(60, 60), new ShadowMaterial({ opacity: 0.3 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.4;
  ground.receiveShadow = true;
  scene.add(ground);

  // A ledger-paper grid for a floor, so the scene has a real space to sit in.
  const floor = new GridHelper(80, 80, 0xffffff, 0xffffff);
  floor.position.y = -0.38; // just above the shadow plane, which would otherwise hide parts of it
  const floorMaterial = floor.material as Material;
  floorMaterial.transparent = true;
  scene.add(floor);

  // A conveyor: a dark frame, the belt running in it, and a rail along each side.
  const steel = (amount: number) => `#${new Color(colours.navy).lerp(new Color("white"), amount).getHexString()}`;
  scene.add(buildTrack(`#${new Color(colours.navy).multiplyScalar(0.45).getHexString()}`, 1.15, 0, -0.02, 0.55));
  scene.add(buildTrack(token("navy-soft"), 0.92, 0, 0.01, 0.02));
  scene.add(buildTrack(steel(0.2), 0.05, 1.1, 0.1, 0.12));
  scene.add(buildTrack(steel(0.2), 0.05, -1.1, 0.1, 0.12));
  scene.add(buildRulerMarks(colours.bright));

  // Cross-lines on the belt. They move with the sheets, so you can see the belt itself running.
  const BELT_LINES = 90;
  const beltLines = new InstancedMesh(
    new BoxGeometry(1.84, 0.004, 0.03),
    new MeshBasicMaterial({ color: steel(0.15) }),
    BELT_LINES,
  );
  beltLines.frustumCulled = false;
  scene.add(beltLines);

  // Sheets on the track: one instanced mesh, so hundreds of sheets cost one draw call.
  const sheetTexture = buildSheetTexture(colours.line);
  const sheets = new InstancedMesh(
    new BoxGeometry(1.15, 0.012, 1.5),
    new MeshLambertMaterial({ map: sheetTexture }),
    sheetCount,
  );
  sheets.castShadow = true;
  sheets.frustumCulled = false;
  scene.add(sheets);

  // The first sheets are always on show; the rest only appear at the "at volume" stage.
  const crowdCount = sheetCount - heroCount;
  // The hero sheets are evenly spaced with a gap between them. The crowd at the "at volume" stage
  // runs in two neat lanes, each sheet resting a little above the one before it, like shingles.
  const crowdIndex = (i: number) => i - heroCount;
  const sheetTurn = Array.from({ length: sheetCount }, (_, i) =>
    i < heroCount ? i / heroCount : (crowdIndex(i) >> 1) / (crowdCount / 2),
  );
  // A tiny, steady scatter, so no two sheets lie exactly alike without ever looking untidy.
  const scatter = (i: number, salt: number) => ((i * salt) % 1) - 0.5;
  const sheetSide = Array.from({ length: sheetCount }, (_, i) =>
    i < heroCount ? scatter(i, 0.754877) * 0.1 : (crowdIndex(i) & 1 ? 0.46 : -0.46) + scatter(i, 0.618) * 0.06,
  );
  const sheetTwist = Array.from({ length: sheetCount }, (_, i) =>
    i < heroCount ? scatter(i, 0.569840) * 0.08 : scatter(i, 0.382) * 0.12,
  );
  // Sheets rest just above the belt's surface, never inside it.
  const sheetLayer = Array.from({ length: sheetCount }, (_, i) =>
    i < heroCount ? 0.024 : 0.024 + ((crowdIndex(i) >> 1) % 8) * 0.005,
  );
  const flagged = [3, Math.floor(heroCount * 0.6)];
  // The working paper rides in the slot of this sheet, so the two never overlap.
  const paperSlot = Math.floor(heroCount * 0.3);

  // The working paper: the one sheet the whole story follows.
  const paperCanvas = document.createElement("canvas");
  paperCanvas.width = PAPER_W;
  paperCanvas.height = PAPER_H;
  const paperContext = paperCanvas.getContext("2d")!;
  const paperTexture = new CanvasTexture(paperCanvas);
  paperTexture.colorSpace = SRGBColorSpace;
  paperTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const PAPER_WIDTH = 2.1;
  const PAPER_HEIGHT = 2.97;
  const paper = new Group();
  const page = new Mesh(
    new BoxGeometry(PAPER_WIDTH, PAPER_HEIGHT, 0.012),
    new MeshBasicMaterial({ map: paperTexture, fog: false }), // unlit, so it stays true white at any angle
  );
  page.castShadow = true;
  paper.add(page);

  const binder = new Mesh(new BoxGeometry(0.8, 0.045, 0.04), new MeshBasicMaterial({ color: colours.navy, fog: false }));
  binder.position.set(0, PAPER_HEIGHT / 2 - 0.06, 0.02);
  paper.add(binder);

  // The ledger that appears beside the paper at the compare stage, and the lines between them.
  const ledger = new Mesh(
    new BoxGeometry(PAPER_WIDTH, PAPER_HEIGHT, 0.012),
    new MeshBasicMaterial({ map: buildLedgerTexture(colours), fog: false }),
  );
  ledger.position.x = 2.6;
  ledger.castShadow = true;
  paper.add(ledger);

  const rowHeight = (y: number) => (PAPER_H / 2 - y) * (PAPER_HEIGHT / PAPER_H);
  const linkStart = 0.8;
  const linkEnd = 2.6 - PAPER_WIDTH / 2 + 0.15;
  const links = MATCHED_ROWS.map((row) => {
    const link = new Mesh(new BoxGeometry(1, 0.016, 0.004), new MeshBasicMaterial({ color: colours.bright, fog: false }));
    link.position.set(0, rowHeight(ROW_YS[row] + 7), 0.02);
    paper.add(link);
    return link;
  });
  scene.add(paper);

  let paperStage = -1;
  let signTick = 0;
  let signed = false;
  const redrawPaper = () => {
    drawPaper(paperContext, paperStage, signTick, colours);
    paperTexture.needsUpdate = true;
  };
  document.fonts.load('500 38px "IBM Plex Mono"').then(() => paperStage >= 0 && redrawPaper());

  // Sizing. The scene fills the screen, and on narrow screens shifts down to sit under the text.
  let viewWidth = 1;
  let viewHeight = 1;
  let viewShift = 0; // how far the whole scene is pushed down, in pixels
  const applyShift = (shift: number) => {
    viewShift = shift;
    camera.setViewOffset(viewWidth, viewHeight, 0, -shift, viewWidth, viewHeight);
    camera.updateProjectionMatrix();
  };
  const resize = () => {
    const parent = canvas.parentElement!;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    viewWidth = width;
    viewHeight = height;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = stacked ? 46 : 32;
    applyShift(viewShift);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas.parentElement!);
  resize();

  const pointer = { x: 0, y: 0 };
  const onPointerMove = (event: PointerEvent) => {
    pointer.x = event.clientX / window.innerWidth - 0.5;
    pointer.y = event.clientY / window.innerHeight - 0.5;
  };
  if (!mobile) window.addEventListener("pointermove", onPointerMove, { passive: true });

  // Reused every frame, so the loop creates no garbage.
  const dummy = new Object3D();
  dummy.rotation.order = "YXZ"; // turn along the track first, then tilt
  const point = new Vector3();
  const cameraPosition = new Vector3();
  const cameraLook = new Vector3();
  const from = new Vector3();
  const to = new Vector3();
  const turn = new Quaternion();
  const flatOnTrack = new Quaternion();
  const white = new Color(0xffffff);
  const paleGreen = new Color(colours.bright).lerp(white, 0.68);
  const paleAmber = new Color(colours.amber).lerp(white, 0.35);
  const tint = new Color();
  const background = new Color();

  let stage = getStage();
  let travel = 0;
  let resume = 0;
  let parallaxX = 0;
  let parallaxY = 0;
  let lastTime = performance.now();
  let frame = 0;
  let onScreen = true;

  const animate = (time: number) => {
    frame = onScreen ? requestAnimationFrame(animate) : 0;
    // Phones draw at 30 frames a second, which looks the same here and halves the work.
    if (mobile && time - lastTime < 30) return;
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    stage += (getStage() - stage) * (1 - Math.exp(-dt * 7));

    // Motion slows and stops at the sign-off stage, and only resumes after the visitor signs.
    if (signed) resume = Math.min(resume + dt * 0.6, 1);
    const stopped = ramp(5.1, 5.85, stage) * (1 - resume);
    const speed = (0.1 + 0.14 * ramp(4.2, 5, stage)) * (1 - stopped);
    travel += (dt * speed) / (Math.PI * 2);

    const gather = ramp(3.3, 3.95, stage) * (1 - ramp(4.1, 4.8, stage));
    const crowd = ramp(4.2, 5, stage) * (1 - ramp(5.2, 5.8, stage) * (1 - resume));
    const checked = ramp(2.3, 3, stage);
    const tip = checked * (1 - ramp(3.4, 3.9, stage));

    for (let i = 0; i < sheetCount; i++) {
      const hero = i < heroCount;
      const isFlagged = flagged.includes(i);
      const u = arcAngle(sheetTurn[i] + travel);
      trackPoint(u, point);
      const yaw = trackYaw(u);
      // The flagged sheets sit a little skewed and pushed out of line: the ones that do not fit.
      const side = sheetSide[i] + (isFlagged ? tip * 0.3 : 0);
      const x = point.x + Math.cos(yaw) * side;
      const z = point.z - Math.sin(yaw) * side;

      // Hero sheets leave the belt and stack up under the working paper at the draft stage.
      const g = hero ? gather : 0;
      const rest = point.y + BELT_TOP + sheetLayer[i] + (isFlagged ? tip * 0.02 : 0);
      dummy.position.set(x * (1 - g) + stackX * g, rest * (1 - g) + g * (0.06 + i * 0.012), z * (1 - g));
      dummy.rotation.set(0, (yaw + sheetTwist[i] + (isFlagged ? tip * 0.35 : 0)) * (1 - g), 0);
      // The sheet whose slot the working paper rides in stays out of the way until the paper lifts off.
      const slot = i === paperSlot ? ramp(0.1, 0.9, stage) : 1;
      const size = (hero ? slot : crowd * 0.55) * (1 + g * 1.24);
      dummy.scale.setScalar(Math.max(size, 0.0001));
      dummy.updateMatrix();
      sheets.setMatrixAt(i, dummy.matrix);

      tint.copy(white).lerp(paleGreen, checked);
      if (isFlagged) tint.lerp(paleAmber, tip);
      sheets.setColorAt(i, tint);
    }
    sheets.instanceMatrix.needsUpdate = true;
    sheets.instanceColor!.needsUpdate = true;

    for (let k = 0; k < BELT_LINES; k++) {
      const u = arcAngle(k / BELT_LINES + travel);
      trackPoint(u, point);
      dummy.position.set(point.x, point.y + BELT_TOP + 0.0125, point.z);
      dummy.rotation.set(0, trackYaw(u), 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      beltLines.setMatrixAt(k, dummy.matrix);
    }
    beltLines.instanceMatrix.needsUpdate = true;

    const compare = ramp(1.35, 1.9, stage) * (1 - ramp(2.2, 2.7, stage));

    // When the machine stops, the whole screen turns to white paper and the track fades away.
    // Signing off lets it come quietly back.
    const whiteOut = ramp(5, 5.7, stage);
    background.copy(navy).lerp(white, whiteOut);
    renderer.setClearColor(background, 1);
    fog.color.copy(background);
    fog.near = 14 + (6 + resume * 4 - 14) * whiteOut;
    fog.far = 30 + (9.5 + resume * 12.5 - 30) * whiteOut;
    // At the draft stage the far track fades out, so the stack has the stage to itself.
    const draftFocus = ramp(3.3, 3.9, stage) * (1 - ramp(4.1, 4.7, stage));
    fog.near += (7.4 - fog.near) * draftFocus;
    fog.far += (11 - fog.far) * draftFocus;
    floorMaterial.opacity = 0.14 * (1 - whiteOut);
    (ground.material as ShadowMaterial).opacity = 0.3 * (1 - whiteOut * (1 - resume * 0.5));

    // Blend between the two nearest poses.
    // On the hero the ring is pushed down until it clears the text, then eases back as the story starts.
    // Phones always sit a little lower, to leave room for the text above the scene.
    const base = stacked ? viewHeight * 0.22 : 0;
    const ringTop = viewHeight * (stacked ? 0.66 : 0.53);
    const wanted = base + Math.max(0, getHeroInset() + 16 - ringTop) * (1 - ramp(0, 0.7, stage));
    if (Math.abs(wanted - viewShift) > 0.5) applyShift(wanted);

    const index = Math.min(Math.floor(stage), poses.length - 2);
    const blend = ramp(0, 1, stage - index);
    const a = poses[index];
    const b = poses[index + 1];
    cameraPosition.lerpVectors(from.fromArray(a.camera), to.fromArray(b.camera), blend);
    cameraLook.lerpVectors(from.fromArray(a.look), to.fromArray(b.look), blend);

    if (stacked) {
      cameraPosition.x *= narrow;
      cameraLook.x *= narrow;
    }

    parallaxX += (pointer.x - parallaxX) * 0.05;
    parallaxY += (pointer.y - parallaxY) * 0.05;
    const still = 1 - ramp(5.1, 5.85, stage);
    camera.position.copy(cameraPosition).sub(cameraLook).multiplyScalar(stacked ? 1.05 + compare * 0.27 : 1).add(cameraLook);
    camera.position.x += parallaxX * 0.7 * still;
    camera.position.y -= parallaxY * 0.35 * still;
    camera.lookAt(cameraLook);

    // At stage 0 the paper rides the track like any other sheet, then lifts off.
    if (index === 0) {
      // Same pose as the sheets around it, lying on the belt, so it looks like one of them.
      const u = arcAngle(sheetTurn[paperSlot] + travel);
      trackPoint(u, point);
      const along = trackYaw(u);
      const yaw = along + sheetTwist[paperSlot];
      point.x += Math.cos(along) * sheetSide[paperSlot];
      point.z -= Math.sin(along) * sheetSide[paperSlot];
      point.y += BELT_TOP + sheetLayer[paperSlot] + 0.008;
      flatOnTrack.setFromEuler(new Euler(-Math.PI / 2, yaw, 0, "YXZ"));
      paper.position.lerpVectors(point, to.fromArray(b.paper), blend);
      turn.copy(flatOnTrack).slerp(b.turn, blend);
      paper.scale.setScalar(0.45 + (b.size - 0.45) * blend);
    } else {
      paper.position.lerpVectors(from.fromArray(a.paper), to.fromArray(b.paper), blend);
      turn.copy(a.turn).slerp(b.turn, blend);
      paper.scale.setScalar(a.size + (b.size - a.size) * blend);
    }
    if (stacked) paper.position.x = paper.position.x * narrow - compare * 1.3; // centres the pair at compare
    paper.quaternion.copy(turn);

    // Ledger and link lines exist only around the compare stage.
    ledger.visible = compare > 0.001;
    ledger.scale.setScalar(Math.max(compare, 0.001));
    ledger.position.x = linkStart + (2.6 - linkStart) * compare;
    const linkDraw = ramp(1.7, 2, stage) * (1 - ramp(2.1, 2.3, stage));
    links.forEach((link) => {
      link.visible = linkDraw > 0.001;
      const length = (linkEnd - linkStart) * linkDraw;
      link.scale.x = Math.max(length, 0.001);
      link.position.x = linkStart + length / 2;
    });

    // The binder clip shows the sheets have become one working paper.
    const bound = ramp(3.5, 4, stage);
    binder.visible = bound > 0.001;
    binder.scale.setScalar(Math.max(bound, 0.001));

    // Redraw the paper only when it changes: uploading a texture every frame would be wasteful.
    const nextStage = Math.round(stage);
    if (nextStage !== paperStage || (signed && signTick < 1)) {
      paperStage = nextStage;
      if (signed) signTick = Math.min(signTick + dt * 1.8, 1);
      redrawPaper();
    }

    renderer.render(scene, camera);
  };

  // Stop drawing when the scene is off-screen.
  const visibility = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen && !frame) {
      lastTime = performance.now();
      frame = requestAnimationFrame(animate);
    }
  });
  visibility.observe(canvas);
  frame = requestAnimationFrame(animate);

  return {
    signOff: () => {
      signed = true;
    },
    destroy: () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      sheetTexture.dispose();
      paperTexture.dispose();
      renderer.dispose();
    },
  };
}
