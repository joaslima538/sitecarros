const cars = [
  {
    asset: 'gtr',
    specs: { engine: '3.8 V6 biturbo', code: 'VR38DETT', drive: 'Integral', origin: 'Yokohama' },
    color: '255, 40, 55',
    make: 'NISSAN',
    model: 'GT-R R35',
    tag: 'GODZILLA',
    description: 'O monstro de Yokohama. Um V6 biturbo, tração integral e presença suficiente para dominar qualquer rua.',
  },
  {
    asset: 'supra',
    specs: { engine: '3.0 seis em linha biturbo', code: '2JZ-GTE', drive: 'Traseira', origin: 'Toyota, Aichi' },
    color: '255, 131, 38',
    make: 'TOYOTA',
    model: 'SUPRA MK4',
    tag: '2JZ-GTE',
    description: 'O seis-em-linha que virou lenda. O 2JZ biturbo fez do Supra uma das plataformas favoritas da cultura tuner.',
  },
  {
    asset: 'rx7',
    specs: { engine: '1.3 rotativo biturbo', code: '13B-REW', drive: 'Traseira', origin: 'Hiroshima' },
    color: '55, 153, 255',
    make: 'MAZDA',
    model: 'RX-7 FD',
    tag: '13B-REW',
    description: 'Leve, baixo e movido por um rotativo biturbo. O RX-7 tem uma silhueta tão inconfundível quanto seu ronco.',
  },
];

const hero = document.querySelector('.hero');
const slides = [...hero.querySelectorAll('.garage-car')];
const wheelPositions = [
  [[70, 68, 4, 16], [96.1, 48, 2, 12.7]],
  [[69.5, 69.4, 3.9, 14.6], [95.7, 49.3, 1.65, 11]],
  [[69, 71, 4.0, 15.8], [96.7, 48.9, 1.65, 12]],
];
function addWheels(car, image, positions, aspect) {
  positions.forEach(([x, y, rx, ry], index) => {
    const mask = document.createElement('div');
    mask.className = 'garage-wheel';
    if (index === 0) mask.classList.add('front-wheel');
    mask.style.setProperty('--wheel-center', x + '% ' + y + '%');
    mask.style.setProperty('--wheel-radius', rx + '% ' + ry + '%');
    mask.style.setProperty('--wheel-perspective', rx * aspect / ry);
    const rim = image.cloneNode();
    rim.removeAttribute('fetchpriority');
    mask.append(rim);
    car.append(mask);
  });
}

slides.forEach((slide, index) => {
  const image = slide.querySelector('img');
  const reflection = image.cloneNode();
  reflection.className = 'garage-reflection';
  reflection.removeAttribute('fetchpriority');
  slide.prepend(reflection);

  addWheels(slide, image, wheelPositions[index], 1536 / 895);

});
const garageLight = hero.querySelector('.garage-light');
const backdrop = hero.querySelector('.garage-backdrop');
const beam = hero.querySelector('.garage-beam');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const dots = [...hero.querySelectorAll('.pagination button')];
const cameraAngle = document.querySelector('#camera-angle');
function updateCamera() {
  const degrees = cameraAngle.valueAsNumber;
  hero.style.setProperty('--camera-yaw', degrees + 'deg');
  hero.style.setProperty('--camera-pan', degrees * -.6 + 'px');
}
cameraAngle.addEventListener('input', updateCamera);
let current = 0;
let hasSelected = false;
let activeArrival;
const arrivalBar = hero.querySelector('.arrival-progress');

function rollWheels(car, frames, timing) {
  car.querySelectorAll('.garage-wheel img').forEach(rim => {
    rim.animate(frames.map(([angle, offset]) => ({
      transform: 'scaleX(var(--wheel-perspective)) rotate(' + angle + 'deg) scaleX(calc(1 / var(--wheel-perspective)))',
      offset,
    })), timing);
  });
}

function animateArrival(previous, next, { selected = false } = {}) {
  const previousPose = getComputedStyle(previous).transform;
  for (const slide of slides) {
    slide.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
    slide.classList.remove('in-transit');
  }
  for (const layer of [garageLight, backdrop, beam, arrivalBar]) {
    layer.getAnimations().forEach(animation => animation.cancel());
  }
  hero.classList.remove('arriving');
  if (reducedMotion.matches && !selected) return;
  const gentle = reducedMotion.matches;
  hero.classList.add('arriving');

  if (previous !== next && !gentle) {
    previous.classList.add('in-transit');
    const timing = { duration: 600, easing: 'cubic-bezier(.55,.05,.83,.45)' };
    const exit = previous.animate([
      { transform: previousPose, opacity: 1 },
      { transform: 'translate(-85%, 12%) scale(1.38)', opacity: 0 },
    ], timing);
    rollWheels(previous, [[0, 0], [-640, 1]], timing);
    exit.addEventListener('finish', () => previous.classList.remove('in-transit'));
  }

  const delay = previous === next || gentle ? 0 : 280;
  const timing = { duration: gentle ? 950 : 3450, delay, fill: 'backwards' };
  arrivalBar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
    ...timing, fill: 'both',
  });
  // Keep one body on screen so the lights, wheels and shadow follow the same pose.
  const path = gentle ? [
    { transform: 'translate(13%, -2%) scale(.94) rotateY(-8deg)' },
    { transform: 'translate(0, 0) scale(1) rotateY(0deg)' },
  ] : [
    { transform: 'translate(94%, -9%) scale(.66) rotateY(-28deg)' },
    { transform: 'translate(54%, -8%) scale(.71) rotateY(-26deg)', offset: .27 },
    { transform: 'translate(24%, -5%) scale(.83) rotateY(-16deg)', offset: .55, easing: 'cubic-bezier(.18,.63,.38,1)' },
    { transform: 'translate(0, 0) scale(1) rotateY(0deg)', offset: .92 },
    { transform: 'translate(0, 0) scale(1) rotateY(0deg)' },
  ];
  const arrival = next.animate(path, timing);
  activeArrival = arrival;
  arrival.addEventListener('finish', () => {
    if (activeArrival === arrival) hero.classList.remove('arriving');
  });
  rollWheels(next, gentle
    ? [[0, 0], [-105, .75], [-110, 1]]
    : [[0, 0], [-300, .27], [-555, .55], [-720, .92], [-720, 1]], timing);
  next.querySelector('.front-wheel').animate([
    { transform: 'scaleX(1)' }, { transform: 'scaleX(1)', offset: .22 },
    { transform: 'scaleX(.77) skewY(5deg)', offset: .49 },
    { transform: 'scaleX(1)', offset: .88 }, { transform: 'scaleX(1)' },
  ], timing);
  next.querySelector('.headlight').animate([
    { opacity: .3 }, { opacity: 1, offset: .28 }, { opacity: .67, offset: .74 }, { opacity: 0, offset: .91 }, { opacity: 0 },
  ], timing);
  beam.animate([
    { transform: 'translate(32%, -10%) scale(.65)', opacity: .8 },
    { transform: 'translate(4%, 0) scale(1.05)', opacity: .77, offset: .47 },
    { transform: 'translate(-41%, 17%) scale(1.3)', opacity: 0, offset: .9 },
    { opacity: 0 },
  ], timing);
  backdrop.animate([
    { transform: 'translateX(1.6%) scale(1.055)' },
    { transform: 'translateX(-.65%) scale(1.028)', offset: .67 },
    { transform: 'none' },
  ], timing);
  garageLight.animate([
    { opacity: .28 }, { opacity: .52, offset: .3 }, { opacity: 1, offset: .84 }, { opacity: 1 },
  ], timing);
}

function selectCar(index) {
  hasSelected = true;
  intro.disconnect();
  const previous = slides[current];
  current = (index + cars.length) % cars.length;
  const car = cars[current];

  hero.style.setProperty('--garage-rgb', car.color);
  cameraAngle.value = '0';
  updateCamera();
  animateArrival(previous, slides[current], { selected: true });
  slides.forEach((slide, i) => slide.classList.toggle('shown', i === current));

  dots.forEach((dot, i) => {
    dot.classList.toggle('selected', i === current);
    if (i === current) {
      dot.setAttribute('aria-current', 'true');
    } else {
      dot.removeAttribute('aria-current');
    }
  });
  document.querySelector('#hero-make').textContent = car.make;
  document.querySelector('#hero-model').textContent = car.model;
  document.querySelector('#hero-tag').textContent = car.tag;
  document.querySelector('#hero-description').textContent = car.description;
  updateSpecs(car);

  if (!reducedMotion.matches) {
    const copy = hero.querySelector('.hero-copy');
    copy.getAnimations().forEach(animation => animation.cancel());
    copy.animate(
      [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 420, easing: 'ease-out' },
    );
  }
}

document.querySelector('#previous').addEventListener('click', () => selectCar(current - 1));
document.querySelector('#next').addEventListener('click', () => selectCar(current + 1));
dots.forEach((dot, index) => dot.addEventListener('click', () => selectCar(index)));
document.querySelectorAll('[data-car]').forEach(card => {
  card.addEventListener('click', () => selectCar(Number(card.dataset.car)));
});

hero.addEventListener('keydown', event => {
  if (event.target === cameraAngle) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    selectCar(current + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});

const stage = hero.querySelector('.hero-media');
let drag;

stage.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
  stage.setPointerCapture(event.pointerId);
});

stage.addEventListener('pointermove', event => {
  if (drag?.id !== event.pointerId || reducedMotion.matches) return;
  const x = event.clientX - drag.x;
  const y = event.clientY - drag.y;
  if (Math.abs(x) > Math.abs(y)) {
    stage.style.setProperty('--drag', Math.min(125, Math.max(-125, x * .48)) + 'px');
  }
});

function finishDrag(event) {
  if (drag?.id !== event.pointerId) return;
  const x = event.clientX - drag.x;
  const y = event.clientY - drag.y;
  drag = null;
  stage.style.removeProperty('--drag');
  if (event.type === 'pointerup' && Math.abs(x) > 45 && Math.abs(x) > Math.abs(y) * 1.35) {
    selectCar(current + (x < 0 ? 1 : -1));
  }
}

stage.addEventListener('pointerup', finishDrag);
stage.addEventListener('pointercancel', finishDrag);
stage.addEventListener('lostpointercapture', finishDrag);

let wheelDistance = 0;
let lastWheel = -Infinity;
let wheelLocked = false;
stage.addEventListener('wheel', event => {
  const horizontal = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
  if (!horizontal || (!event.shiftKey && Math.abs(horizontal) <= Math.abs(event.deltaY))) return;
  event.preventDefault();
  const now = performance.now();
  if (now - lastWheel > 230) {
    wheelDistance = 0;
    wheelLocked = false;
  }
  lastWheel = now;
  if (wheelLocked) return;
  wheelDistance += horizontal * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerWidth : 1);
  if (Math.abs(wheelDistance) >= 45) {
    wheelLocked = true;
    selectCar(current + Math.sign(wheelDistance));
  }
}, { passive: false });

const specs = document.querySelector('.specs');
const specsTitle = document.querySelector('#specs-title');
const specsImage = document.querySelector('#spec-image');
const specsApproach = document.querySelector('#spec-approach');

function updateSpecs(car) {
  specs.style.setProperty('--garage-rgb', car.color);
  const model = document.createElement('em');
  model.textContent = car.model;
  specsTitle.replaceChildren(car.make + ' ', model);
  specsImage.src = 'assets/' + car.asset + '-top.webp';
  specsApproach.src = 'assets/' + car.asset + '-front.webp';
  specsImage.alt = car.make + ' ' + car.model + ' visto de cima';
  for (const [field, value] of Object.entries(car.specs)) {
    document.querySelector('#spec-' + field).textContent = value;
  }
}

const experience = document.querySelector('.experience');
const drive = document.querySelector('.drive');
const speed = document.querySelector('#speed');
const navLinks = [...document.querySelectorAll('.header nav a')];
const navSections = navLinks.map(link => document.querySelector(link.hash));
let pendingFrame;

function renderScroll() {
  pendingFrame = null;
  const scene = experience.getBoundingClientRect();
  const details = specs.getBoundingClientRect();
  const reveal = Math.min(1, Math.max(0, (innerHeight * .74 - details.top) / (innerHeight * .9)));
  const lift = reducedMotion.matches ? 1 : reveal * reveal * (3 - 2 * reveal);
  const overhead = Math.min(1, Math.max(0, (lift - .17) / .65));
  specs.style.setProperty('--spec-progress', lift);
  specs.style.setProperty('--overhead', overhead);
  const active = navSections.findLastIndex(section => section.getBoundingClientRect().top <= innerHeight * 0.35);
  navLinks.forEach((link, index) => link.classList.toggle('active', index === active));

  if (reducedMotion.matches) {
    drive.style.removeProperty('--progress');
    return;
  }

  const distance = Math.max(1, scene.height - drive.offsetHeight);
  const progress = Math.min(1, Math.max(0, -scene.top / distance));
  drive.style.setProperty('--progress', progress);
  speed.textContent = String(Math.round(320 * progress)).padStart(3, '0');
}

function scheduleRender() {
  if (pendingFrame == null) pendingFrame = requestAnimationFrame(renderScroll);
}

addEventListener('scroll', scheduleRender, { passive: true });
addEventListener('resize', scheduleRender);
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) animateArrival(slides[current], slides[current]);
  scheduleRender();
});
scheduleRender();

const intro = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting || document.visibilityState !== 'visible') return;
  intro.disconnect();
  const initial = slides[0];
  const start = () => {
    if (!hasSelected) animateArrival(initial, initial);
  };
  initial.querySelector('img[fetchpriority]').decode().then(start, start);
}, { threshold: .4 });

function observeIntro() {
  if (document.visibilityState === 'visible') {
    intro.observe(hero);
    document.removeEventListener('visibilitychange', observeIntro);
  }
}

document.addEventListener('visibilitychange', observeIntro);
observeIntro();
