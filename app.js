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
const sideWheels = [
  [[22.1, 70.3, 5.8, 17.4], [79.5, 70.1, 5.8, 17.4]],
  [[22.7, 72.5, 5.8, 17.4], [79.9, 72.9, 5.8, 17.4]],
  [[23.8, 72.3, 5.8, 17.4], [81.7, 72.3, 5.8, 17.4]],
];

function addWheels(car, image, positions, aspect) {
  positions.forEach(([x, y, rx, ry], index) => {
    const mask = document.createElement('div');
    mask.className = 'garage-wheel';
    if (index === (car.classList.contains('garage-profile-shell') ? 1 : 0)) mask.classList.add('front-wheel');
    mask.style.setProperty('--wheel-center', x + '% ' + y + '%');
    mask.style.setProperty('--wheel-radius', rx + '% ' + ry + '%');
    mask.style.setProperty('--wheel-perspective', rx * aspect / ry);
    const rim = image.cloneNode();
    rim.removeAttribute('fetchpriority');
    mask.append(rim);
    car.append(mask);
  });
}

const profiles = slides.map((slide, index) => {
  const image = slide.querySelector('img');
  const reflection = image.cloneNode();
  reflection.className = 'garage-reflection';
  reflection.removeAttribute('fetchpriority');
  slide.prepend(reflection);

  addWheels(slide, image, wheelPositions[index], 1536 / 895);

  const profile = document.createElement('div');
  profile.className = 'garage-car garage-profile';
  const side = document.createElement('div');
  side.className = 'garage-profile-shell';
  const sideImage = new Image();
  sideImage.src = 'assets/' + (index === 0 ? 'drive' : cars[index].asset + '-side') + '.webp';
  sideImage.alt = '';
  side.append(sideImage);
  addWheels(side, sideImage, sideWheels[index], 3);
  profile.append(side);
  slide.before(profile);
  return profile;
});
const garageLight = hero.querySelector('.garage-light');
const backdrop = hero.querySelector('.garage-backdrop');
const beam = hero.querySelector('.garage-beam');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const dots = [...hero.querySelectorAll('.pagination button')];
let current = 0;
let hasSelected = false;
let showGarage;
const garageReady = import('./garage-3d.js').then(({ createGarage }) => {
  showGarage = createGarage(hero.querySelector('.hero-media'));
  if (hasSelected) animateArrival(slides[current], slides[current]);
}).catch(() => {});

function rollWheels(car, frames, timing) {
  car.querySelectorAll('.garage-wheel img').forEach(rim => {
    rim.animate(frames.map(([angle, offset]) => ({
      transform: 'scaleX(var(--wheel-perspective)) rotate(' + angle + 'deg) scaleX(calc(1 / var(--wheel-perspective)))',
      offset,
    })), timing);
  });
}

function animateArrival(previous, next) {
  const previousPose = getComputedStyle(previous).transform;
  for (const slide of [...slides, ...profiles]) {
    slide.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
    slide.classList.remove('in-transit');
  }
  for (const layer of [garageLight, backdrop, beam]) {
    layer.getAnimations().forEach(animation => animation.cancel());
  }
  if (showGarage?.(slides.indexOf(next), !reducedMotion.matches)) return;
  if (reducedMotion.matches) return;

  if (previous !== next) {
    previous.classList.add('in-transit');
    const timing = { duration: 600, easing: 'cubic-bezier(.55,.05,.83,.45)' };
    const exit = previous.animate([
      { transform: previousPose, opacity: 1 },
      { transform: 'translate(-85%, 12%) scale(1.38)', opacity: 0 },
    ], timing);
    rollWheels(previous, [[0, 0], [-640, 1]], timing);
    exit.addEventListener('finish', () => previous.classList.remove('in-transit'));
  }

  const delay = previous === next ? 0 : 320;
  const timing = { duration: 3050, delay, fill: 'backwards' };
  const profile = profiles[slides.indexOf(next)];
  profile.classList.add('in-transit');
  const crossing = profile.animate([
    { transform: 'translate(155%, -14%) scale(.55) rotateY(0deg)', opacity: 1 },
    { transform: 'translate(49%, -11%) scale(.58) rotateY(0deg)', opacity: 1, offset: .36 },
    { transform: 'translate(23%, -8%) scale(.67) rotateY(31deg)', opacity: 1, offset: .52 },
    { transform: 'translate(13%, -4%) scale(.77) rotateY(47deg)', opacity: 0, offset: .64 },
    { transform: 'translate(13%, -4%) scale(.77) rotateY(47deg)', opacity: 0 },
  ], timing);
  crossing.addEventListener('finish', () => profile.classList.remove('in-transit'));
  rollWheels(profile, [[0, 0], [650, .36], [815, .52], [950, .64], [950, 1]], timing);
  profile.querySelector('.front-wheel').animate([
    { transform: 'scaleX(1)' }, { transform: 'scaleX(1)', offset: .29 },
    { transform: 'scaleX(.63) skewY(-8deg)', offset: .48 }, { transform: 'scaleX(1)', offset: .64 },
    { transform: 'scaleX(1)' },
  ], timing);
  next.animate([
    { transform: 'translate(39%, -12%) scale(.55) rotateY(25deg)', opacity: 0 },
    { transform: 'translate(23%, -8%) scale(.67) rotateY(22deg)', opacity: 0, offset: .48 },
    { transform: 'translate(13%, -4%) scale(.77) rotateY(11deg)', opacity: 1, offset: .64 },
    { transform: 'translate(-.4%, 0) scale(1.004) rotateY(0deg)', opacity: 1, offset: .93, easing: 'ease-out' },
    { transform: 'translate(0, 0) scale(1) rotateY(0deg)', opacity: 1 },
  ], timing);
  rollWheels(next, [[0, 0], [0, .48], [-330, .64], [-720, .93], [-720, 1]], timing);
  next.querySelector('.front-wheel').animate([
    { transform: 'scaleX(.72) skewY(5deg)' }, { transform: 'scaleX(.72) skewY(5deg)', offset: .55 },
    { transform: 'scaleX(1)', offset: .91 }, { transform: 'scaleX(1)' },
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
  animateArrival(previous, slides[current]);
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

function updateSpecs(car) {
  specs.style.setProperty('--garage-rgb', car.color);
  const model = document.createElement('em');
  model.textContent = car.model;
  specsTitle.replaceChildren(car.make + ' ', model);
  specsImage.src = 'assets/' + car.asset + '-top.webp';
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
  specs.style.setProperty('--spec-progress', reducedMotion.matches ? 1 : reveal);
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
  Promise.all([
    initial.querySelector('img[fetchpriority]').decode(),
    profiles[0].querySelector('img').decode(),
    garageReady,
  ]).then(() => {
    if (!hasSelected && !initial.getAnimations().length) animateArrival(initial, initial);
  }).catch(() => {});
}, { threshold: .4 });

function observeIntro() {
  if (document.visibilityState === 'visible') {
    intro.observe(hero);
    document.removeEventListener('visibilitychange', observeIntro);
  }
}

document.addEventListener('visibilitychange', observeIntro);
observeIntro();
