const tabs = Array.from(document.querySelectorAll('.tab'));
const sections = Array.from(document.querySelectorAll('.section'));
const content = document.getElementById('content');
const order = ['home', 'games', 'market', 'settings'];

function show(view) {
  sections.forEach(s => s.hidden = s.dataset.view !== view);
  tabs.forEach(t => {
    const active = t.dataset.view === view;
    t.classList.toggle('active', active);
    t.setAttribute('aria-pressed', active);
  });
  content.focus({ preventScroll: true });
}

tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.view)));
show('home');

// Touch swipe
let startX = 0;
content.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
content.addEventListener('touchend', e => {
  const endX = e.changedTouches[0].clientX;
  const delta = endX - startX;
  const threshold = 60;
  const current = order.findIndex(v => !document.querySelector(`.section[data-view="${v}"]`).hidden);
  if (Math.abs(delta) > threshold) {
    const next = delta < 0 ? Math.min(order.length - 1, current + 1) : Math.max(0, current - 1);
    show(order[next]);
  }
}, { passive: true });

// Gamepad universal
const MAPS = {
  xbox: { confirm: 0, cancel: 1, menu: 7, up: 12, down: 13, left: 14, right: 15 },
  play: { confirm: 1, cancel: 2, menu: 9, up: 12, down: 13, left: 14, right: 15 },
  nintendo: { confirm: 1, cancel: 0, menu: 9, up: 12, down: 13, left: 14, right: 15 }
};

function familyFromId(id) {
  const low = id.toLowerCase();
  if (low.includes('xbox')) return 'xbox';
  if (low.includes('playstation') || low.includes('dualshock') || low.includes('wireless')) return 'play';
  if (low.includes('nintendo') || low.includes('pro controller')) return 'nintendo';
  return 'xbox';
}

function loop() {
  const pads = navigator.getGamepads();
  for (const pad of pads) {
    if (!pad) continue;
    const fam = familyFromId(pad.id);
    const map = MAPS[fam];
    const btn = pad.buttons;
    if (btn[map.confirm]?.pressed) alert('Confirmar (' + fam + ')');
    if (btn[map.cancel]?.pressed) alert('Atrás (' + fam + ')');
    if (btn[map.menu]?.pressed) alert('Menú (' + fam + ')');
    if (btn[map.right]?.pressed) navRight();
    if (btn[map.left]?.pressed) navLeft();
  }
  requestAnimationFrame(loop);
}

function navRight() {
  const current = order.findIndex(v => !document.querySelector(`.section[data-view="${v}"]`).hidden);
  show(order[Math.min(order.length - 1, current + 1)]);
}

function navLeft() {
  const current = order.findIndex(v => !document.querySelector(`.section[data-view="${v}"]`).hidden);
  show(order[Math.max(0, current - 1)]);
}

window.addEventListener('gamepadconnected', () => loop());
