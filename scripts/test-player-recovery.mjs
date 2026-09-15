import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

// DOM/API doubles test our controls, not YouTube authentication or real playback.
const source = await fs.readFile(new URL('../public/app.js', import.meta.url), 'utf8');
const block = source.slice(source.indexOf('const trackHeadings='), source.indexOf('const heroTopList='));
const titleMap = { 'first song': '4iFP_wd6QU8', 'second song': 'NrhiAhozWZk' };

class Element {
  children = [];
  listeners = new Map();
  hidden = false;
  textContent = '';
  dataset = {};
  selectors = new Map();
  classList = { add() {}, remove() {} };
  append(child) { this.children.push(child); }
  replaceChildren(...children) { this.children = children; }
  setAttribute() {}
  insertAdjacentElement(_position, element) { this.actions = element; }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  click() { return this.listeners.get('click')?.(); }
  querySelector(selector) {
    if (!this.selectors.has(selector)) this.selectors.set(selector, new Element());
    return this.selectors.get(selector);
  }
}

function setup(withPlaylist) {
  const headings = Object.keys(titleMap).map(title => Object.assign(new Element(), { textContent: title }));
  const body = new Element();
  const serviceButtons = new Element();
  const timers = new Map();
  const players = [];
  let timerId = 0;
  class Player {
    constructor(mount, config) {
      this.config = config;
      this.loaded = [];
      mount.iframe = true;
      players.push(this);
      queueMicrotask(() => config.events.onReady({ target: this }));
    }
    loadVideoById(id) { this.loaded.push(id); }
    destroy() { this.destroyed = true; }
  }
  const YT = { Player, PlayerState: { PLAYING: 1, ENDED: 0 } };
  const context = vm.createContext({
    URLSearchParams, YT,
    window: { YT, location: { pathname: '/test', origin: 'https://kpopyangon.com', href: 'https://kpopyangon.com/test' } },
    document: {
      body,
      querySelectorAll(selector) { return selector === '.tracklist li h2' ? headings : []; },
      querySelector(selector) { return selector === '.listen-panel .service-buttons' ? serviceButtons : null; },
      createElement() { return new Element(); }
    },
    setTimeout(fn) { const id = ++timerId; timers.set(id, fn); return id; },
    clearTimeout(id) { timers.delete(id); }
  });
  serviceButtons.prepend = child => serviceButtons.children.unshift(child);
  vm.runInContext(`const youtubeTracks=${JSON.stringify(titleMap)}; const youtubePlaylistByPost=${JSON.stringify(withPlaylist ? { '/test': 'PLEENx4_BAFy8' } : {})};\n${block}`, context);
  const shell = body.children[0];
  const node = selector => shell.querySelector(selector);
  const playButton = index => headings[index].actions.children[0];
  return { headings, shell, node, playButton, players, timers };
}

const native = setup(true);
await native.playButton(1).click();
let iframe = native.node('[data-youtube-player]').children[0];
let params = new URL(iframe.src).searchParams;
assert.equal(params.get('listType'), 'playlist');
assert.equal(params.get('list'), 'PLEENx4_BAFy8');
assert.equal(params.get('index'), '1');
assert.match(iframe.src, /embed\/NrhiAhozWZk/);
const external = new URL(native.node('[data-player-youtube-link]').href);
assert.equal(external.searchParams.get('v'), 'NrhiAhozWZk');
assert.equal(external.searchParams.get('list'), 'PLEENx4_BAFy8');
assert.equal(external.searchParams.get('index'), '2');
assert.equal(native.headings[1].actions.children[1].href, external.href);
native.node('[data-player-blocked]').click();
assert.equal(native.node('[data-youtube-player]').children.length, 0);
assert.equal(native.node('[data-player-recovery]').hidden, false);
assert.equal(native.node('[data-player-recovery-link]').href, external.href);
assert.equal(native.timers.size, 0);
await native.node('[data-player-retry]').click();
assert.equal(native.node('[data-player-recovery]').hidden, true);
assert.match(native.node('[data-youtube-player]').children[0].src, /embed\/NrhiAhozWZk/);
native.node('[data-player-close]').click();
assert.equal(native.shell.hidden, true);

const custom = setup(false);
await custom.playButton(0).click();
const firstPlayer = custom.players[0];
assert.deepEqual(firstPlayer.loaded, ['4iFP_wd6QU8']);
firstPlayer.config.events.onError({ data: 150 });
assert.equal(custom.node('[data-player-recovery]').hidden, false);
assert.equal(custom.timers.size, 0, 'Initial playback restrictions must not cascade through tracks');
firstPlayer.config.events.onAutoplayBlocked();
assert.equal(custom.node('[data-player-recovery]').hidden, false);
custom.node('[data-player-blocked]').click();
assert.equal(firstPlayer.destroyed, true);
firstPlayer.config.events.onStateChange({ data: 1 });
firstPlayer.config.events.onStateChange({ data: 0 });
assert.equal(custom.timers.size, 0, 'Events from a destroyed player must not restart playback');
await custom.node('[data-player-retry]').click();
assert.equal(custom.players.length, 2);
const retryPlayer = custom.players[1];
assert.deepEqual(retryPlayer.loaded, ['4iFP_wd6QU8']);
retryPlayer.config.events.onStateChange({ data: 1 });
retryPlayer.config.events.onStateChange({ data: 0 });
assert.equal(custom.timers.size, 1);
for (const fn of [...custom.timers.values()]) fn();
assert.deepEqual(retryPlayer.loaded, ['4iFP_wd6QU8', 'NrhiAhozWZk']);
custom.node('[data-player-blocked]').click();
assert.equal(custom.timers.size, 0);
custom.node('[data-player-close]').click();
await custom.playButton(1).click();
assert.deepEqual(custom.players[2].loaded, ['NrhiAhozWZk']);
console.log('PASS: selection, playlist links, manual recovery, retry, close, restriction handling, autoplay feedback, ended-next');
