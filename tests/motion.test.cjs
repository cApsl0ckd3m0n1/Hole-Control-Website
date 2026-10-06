const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

const source = readFileSync(`${__dirname}/../motion.js`, 'utf8');

function setup() {
  const operations = [];
  const frames = new Map();
  let nextFrame = 0;
  const events = () => ({
    listeners: {},
    addEventListener(name, callback) {
      const previous = this.listeners[name];
      this.listeners[name] = (...args) => { previous?.(...args); callback(...args); };
    },
  });
  const style = {
    setProperty(name, value) { operations.push(['write', name, value]); },
    removeProperty(name) { operations.push(['write', name, null]); },
  };
  const header = { getBoundingClientRect() { operations.push(['read', 'header']); return { height: 60 }; } };
  const sections = [100, 800].map((top) => ({
    top,
    getBoundingClientRect() { operations.push(['read', 'section']); return { top: this.top }; },
  }));
  const links = sections.map((_, index) => ({
    hash: `#section-${index}`,
    setAttribute(name, value) { operations.push(['write', `${index}:${name}`, value]); },
    removeAttribute(name) { operations.push(['write', `${index}:${name}`, null]); },
  }));
  const surface = Object.assign(events(), {
    getBoundingClientRect() {
      operations.push(['read', 'surface']);
      return { left: 0, top: 0, width: 100, height: 100 };
    },
  });
  const art = { style, classList: { add() {}, remove() {} } };
  const enabled = Object.assign(events(), { matches: true });
  const window = Object.assign(events(), {
    scrollY: 0, innerHeight: 600,
    // Skip entrance animation; test navigation and tilt independently.
    matchMedia: (query) => query.startsWith('(min-width:') ? enabled : { matches: true },
  });
  const document = {
    querySelector: (query) => ({ header, '.hero-visual': surface, '.hero-art': art })[query] || null,
    querySelectorAll: () => links,
    getElementById: (id) => sections[Number(id.replace('section-', ''))] || null,
    documentElement: {
      style,
      get scrollHeight() { operations.push(['read', 'page']); return 2000; },
    },
  };
  vm.runInNewContext(source, {
    window, document,
    getComputedStyle() { operations.push(['read', 'style']); return { position: 'sticky' }; },
    requestAnimationFrame(callback) { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame(id) { frames.delete(id); },
  });
  const flush = () => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback());
  };
  return { operations, frames, sections, window, surface, enabled, flush };
}

test('navigation finishes layout reads before writes and coalesces scroll events', () => {
  const state = setup();
  const firstWrite = state.operations.findIndex(([type]) => type === 'write');
  assert.ok(firstWrite > 0);
  assert.ok(state.operations.slice(firstWrite).every(([type]) => type === 'write'));
  state.operations.length = 0;
  for (let i = 0; i < 20; i++) state.window.listeners.scroll();
  assert.equal(state.frames.size, 1);
  state.flush();
  assert.equal(state.operations.filter(([type]) => type === 'write').length, 0);
});

test('navigation still selects the last section at the bottom of the page', () => {
  const state = setup();
  state.operations.length = 0;
  state.window.scrollY = 1400;
  state.window.listeners.scroll();
  state.flush();
  assert.ok(state.operations.some((op) => op[1] === '1:aria-current' && op[2] === 'location'));
});

test('pointer bursts defer measurement and render only the latest position', () => {
  const state = setup();
  state.operations.length = 0;
  for (const position of [0, 25, 50, 100]) {
    state.surface.listeners.pointermove({ pointerType: 'mouse', clientX: position, clientY: position });
  }
  assert.equal(state.operations.length, 0);
  assert.equal(state.frames.size, 1);
  state.flush();
  assert.deepEqual(state.operations, [
    ['read', 'surface'], ['write', '--tilt-x', '-2.00deg'], ['write', '--tilt-y', '3.00deg'],
  ]);
});

test('leaving cancels pending tilt; touch and disabled motion do not schedule work', () => {
  const state = setup();
  const move = (pointerType = 'mouse') => state.surface.listeners.pointermove({ pointerType, clientX: 50, clientY: 50 });
  state.operations.length = 0;
  move();
  state.surface.listeners.pointerleave();
  assert.equal(state.frames.size, 0);
  assert.ok(!state.operations.some(([type]) => type === 'read'));
  move('touch');
  assert.equal(state.frames.size, 0);
  state.enabled.matches = false;
  move();
  assert.equal(state.frames.size, 0);
});
