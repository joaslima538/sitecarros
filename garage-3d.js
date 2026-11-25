import * as THREE from './assets/three/three.module.min.js';

const designs = [
  { paint: 0x596473, light: 0xff2840, length: 4.7, width: 2, roof: 1.32, lamps: 'square' },
  { paint: 0xe96519, light: 0xff8326, length: 4.58, width: 1.93, roof: 1.25, lamps: 'oval' },
  { paint: 0x315984, light: 0x3799ff, length: 4.32, width: 1.88, roof: 1.19, lamps: 'flush' },
];

const rubber = new THREE.MeshStandardMaterial({ color: 0x17181a, roughness: .88 });
const metal = new THREE.MeshStandardMaterial({ color: 0x9d9fa6, metalness: .74, roughness: .29 });
const dark = new THREE.MeshStandardMaterial({ color: 0x171a20, roughness: .52 });
const glass = new THREE.MeshPhysicalMaterial({ color: 0x232f3e, metalness: .48, roughness: .19, clearcoat: 1 });
const headlamp = new THREE.MeshStandardMaterial({ color: 0xe1f3ff, emissive: 0xb8dbff, emissiveIntensity: 2.2 });
const brake = new THREE.MeshStandardMaterial({ color: 0xd90020, emissive: 0xde1020, emissiveIntensity: 1.3 });

function box(parent, material, dimensions, position) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...dimensions), material);
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

// Cross-sections along the length define real body volume and leave clearance for each wheel.
function bodyMesh(sections, length, width, paint) {
  const vertices = [];
  const indices = [];
  for (const [z, bottom, shoulder, height, span, crown] of sections) {
    const half = width * .5 * span;
    const section = [
      [-half * .91, bottom], [-half, shoulder],
      [-half * crown, height], [half * crown, height],
      [half, shoulder], [half * .91, bottom],
    ];
    for (const [x, y] of section) vertices.push(x, y, z * length);
  }
  for (let row = 1; row < sections.length; row++) {
    for (let col = 0; col < 6; col++) {
      const a = (row - 1) * 6 + col;
      const b = (row - 1) * 6 + (col + 1) % 6;
      indices.push(a, a + 6, b, b, a + 6, b + 6);
    }
  }
  for (let col = 1; col < 5; col++) {
    const end = (sections.length - 1) * 6;
    indices.push(0, col + 1, col, end, end + col, end + col + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, paint);
}

function makeCar({ paint, length, width, roof, lamps }) {
  const car = new THREE.Group();
  const finish = new THREE.MeshPhysicalMaterial({ color: paint, metalness: .48, roughness: .32, clearcoat: 1, side: THREE.DoubleSide });
  const tinted = glass.clone();
  tinted.side = THREE.DoubleSide;
  const axle = length * .29;
  const body = bodyMesh([
    [-.5, .24, .56, .67, .87, .88], [-.46, .22, .65, .79, .98, .91],
    [-.39, .25, .69, .82, 1, .89], [-.34, .53, .70, .84, 1, .89],
    [-.28, .74, .76, .86, 1, .88], [-.21, .29, .70, .87, .97, .88],
    [-.06, .24, .65, .86, .91, .88], [.12, .24, .65, .79, .93, .88],
    [.21, .29, .66, .77, .96, .88], [.28, .73, .75, .81, 1, .86],
    [.36, .53, .66, .76, .99, .88], [.4, .25, .62, .71, .97, .89],
    [.48, .2, .50, .62, .93, .85], [.5, .22, .44, .55, .85, .88],
  ], length, width, finish);
  car.add(body);
  car.add(bodyMesh([
    [-.29, .71, .82, .88, .83, .90], [-.15, .74, .88, roof - .09, .78, .84],
    [-.08, .75, .89, roof, .77, .84], [.08, .73, .88, roof - .02, .75, .85],
    [.21, .72, .78, .82, .81, .93],
  ], length, width, tinted));
  box(car, finish, [width * .62, .035, length * .18], [0, roof - .025, 0]).rotation.x = -.045;
  box(car, dark, [width * .91, .046, .29], [0, .21, length * .46]);
  box(car, dark, [width * .48, .19, .045], [0, .385, length * .505]);
  box(car, metal, [width * .37, .016, .025], [0, .45, length * .513]);
  box(car, metal, [width * .09, .046, .025], [0, .51, length * .505]);
  box(car, dark, [width * .93, .075, .33], [0, 1.02, -length * .45]);
  for (const side of [-1, 1]) {
    box(car, dark, [.065, .24, .08], [side * width * .32, .89, -length * .45]);
    box(car, finish, [.28, .115, .19], [side * width * .49, .89, length * .127]);
    const lamp = box(car, headlamp, [width * (lamps === 'flush' ? .13 : .175), .067, .04], [side * width * .335, lamps === 'flush' ? .40 : .54, length * .504]);
    lamp.rotation.z = side * .17;
    box(car, dark, [width * .16, .11, .04], [side * width * .322, .333, length * .49]);
    box(car, finish, [.09, .06, length * .49], [side * width * .457, .235, 0]);
    box(car, brake, [width * .17, .079, .04], [side * width * .32, .58, -length * .497]);
  }

  const wheels = [];
  for (const z of [-axle, axle]) {
    for (const side of [-1, 1]) {
      const steering = new THREE.Group();
      steering.position.set(side * width * .465, .36, z);
      const rolling = new THREE.Group();
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(.36, .36, .24, 40), rubber);
      tire.rotation.z = Math.PI / 2;
      rolling.add(tire);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(.256, .027, 8, 40), metal);
      rim.rotation.y = Math.PI / 2;
      rim.position.x = side * .123;
      rolling.add(rim);
      for (let spoke = 0; spoke < 6; spoke++) {
        const pivot = new THREE.Group();
        pivot.rotation.x = Math.PI * spoke / 3;
        box(pivot, metal, [.021, .207, .028], [side * .121, .133, 0]);
        rolling.add(pivot);
      }
      steering.add(rolling);
      car.add(steering);
      wheels.push({ steering, rolling, front: z > 0 });
    }
  }
  return { car, wheels };
}

export function createGarage(host) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.45;
  renderer.domElement.className = 'garage-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const studio = document.createElement('canvas');
  studio.width = 512;
  studio.height = 256;
  const lights = studio.getContext('2d');
  lights.fillStyle = '#272930';
  lights.fillRect(0, 0, 512, 256);
  lights.fillStyle = '#f6faff';
  lights.fillRect(40, 48, 220, 13);
  lights.fillRect(272, 68, 142, 22);
  lights.fillRect(13, 81, 40, 46);
  const studioMap = new THREE.CanvasTexture(studio);
  studioMap.mapping = THREE.EquirectangularReflectionMapping;
  studioMap.colorSpace = THREE.SRGBColorSpace;
  scene.environment = studioMap;
  scene.environmentIntensity = .63;
  scene.add(new THREE.HemisphereLight(0xd8eaff, 0x2c1a21, 2.3));
  const overhead = new THREE.DirectionalLight(0xffffff, 3.1);
  overhead.position.set(-2, 9, 5);
  scene.add(overhead);
  const accent = new THREE.PointLight(0xffffff, 180, 27, 2);
  accent.position.set(2, 3, -2);
  scene.add(accent);
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 75);
  const cars = designs.map(makeCar);

  // A world-space contact shadow follows the chassis on the same plane used by the tires.
  const shadowTile = document.createElement('canvas');
  shadowTile.width = shadowTile.height = 128;
  const ctx = shadowTile.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(1,2,4,.95)');
  gradient.addColorStop(.55, 'rgba(1,2,4,.7)');
  gradient.addColorStop(1, 'rgba(1,2,4,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const contact = new THREE.Group();
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.05, 5.4), new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(shadowTile), transparent: true, depthWrite: false, toneMapped: false,
  }));
  shadow.rotation.x = -Math.PI / 2;
  contact.add(shadow);
  scene.add(contact);

  const path = new THREE.CubicBezierCurve3(
    new THREE.Vector3(10.5, 0, -1.95),
    new THREE.Vector3(4.5, 0, -1.95),
    new THREE.Vector3(2.45, 0, -1.7),
    new THREE.Vector3(.2, 0, 1.24),
  );
  const distance = path.getLength();
  let frame = 0;
  let active;

  function size() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(1, height);
    const mobile = width < 640;
    camera.position.set(3.4, mobile ? 3.8 : 3.15, mobile ? 13 : 10.2);
    camera.fov = mobile ? 47 : 34;
    camera.lookAt(0, mobile ? 1.05 : 1.2, .1);
    camera.updateProjectionMatrix();
    if (active) renderer.render(scene, camera);
  }

  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    host.classList.remove('garage-3d');
    cancelAnimationFrame(frame);
  });
  host.append(renderer.domElement);
  new ResizeObserver(size).observe(host);
  size();

  return function show(index, animate) {
    if (renderer.getContext().isContextLost()) return false;
    cancelAnimationFrame(frame);
    if (active) scene.remove(active.car);
    active = cars[index];
    scene.add(active.car);
    host.dataset.garageModel = String(index);
    accent.color.setHex(designs[index].light);
    const start = performance.now();
    const point = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    function draw(now) {
      const time = animate ? Math.min((now - start) / 3250, 1) : 1;
      const traveled = 1 - Math.pow(1 - time, 1.52);
      path.getPointAt(traveled, point);
      path.getTangentAt(traveled, tangent);
      active.car.position.copy(point);
      active.car.rotation.y = Math.atan2(tangent.x, tangent.z);
      contact.position.copy(point);
      contact.rotation.y = active.car.rotation.y;
      const steer = Math.sin(Math.PI * Math.min(1, Math.max(0, (traveled - .23) / .72))) * .47;
      for (const { steering, rolling, front } of active.wheels) {
        steering.rotation.y = front ? steer : 0;
        rolling.rotation.x = traveled * distance / .36;
      }
      renderer.render(scene, camera);
      if (time < 1) frame = requestAnimationFrame(draw);
    }
    draw(start);
    host.classList.add('garage-3d');
    return true;
  };
}
