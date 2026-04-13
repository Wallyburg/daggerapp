import { initCounters } from './counter.js';
import { initInfoButtons } from './info.js';
import { initLoot } from './loot.js';
import { initShop } from './shop.js';

initInfoButtons();
initCounters();

// Active data object
const activeData = {
  Armor: [],
  Magic: [],
  Physical: [],
  Secondary: [],
  Items: [],
  Consumables: []
};

// Content pack registry
const contentPacks = {
  baseGame: {
    checkboxId: 'baseGame-json',
    url: 'json/baseGame.json'
  },
/*  hopeFear: {
    checkboxId: 'hopeFear-json',
    url: 'json/hopeFear.json'
  },
*/ //Remove block comment from hopeFear after go-live. See line 63 in index.html
  beastFeast: {
    checkboxId: 'beastFeast-json',
    url: 'json/beastFeast.json'
  },
  drylands: {
    checkboxId: 'drylands-json',
    url: 'json/drylands.json'
  }
};

// Utility functions
async function loadJSON(url) {
  const res = await fetch(url);
  return res.json();
}

function tagData(data, source) {
  Object.values(data).forEach(arr => {
    if (Array.isArray(arr)) {
      arr.forEach(item => item.__source = source);
    }
  });
}

function mergeData(target, source) {
  Object.keys(source).forEach(key => {
    if (!target[key]) target[key] = [];
    target[key].push(...source[key]);
  });
}

function removePack(source) {
  Object.keys(activeData).forEach(key => {
    activeData[key] = activeData[key].filter(item => item.__source !== source);
  });
}

// Load all checked content at startup
for (const [key, pack] of Object.entries(contentPacks)) {
  const checkbox = document.getElementById(pack.checkboxId);
  if (checkbox?.checked) {
    const data = await loadJSON(pack.url);
    tagData(data, key);
    mergeData(activeData, data);
  }
}

// Initialize Loot and Shop generators
initLoot(activeData);
initShop(activeData);

// Add event listeners to checkboxes
Object.entries(contentPacks).forEach(([key, pack]) => {
  const checkbox = document.getElementById(pack.checkboxId);
  if (!checkbox) return;

  checkbox.addEventListener('change', async () => {
    if (checkbox.checked) {
      const data = await loadJSON(pack.url);
      tagData(data, key);
      mergeData(activeData, data);
    } else {
      removePack(key);
    }

    // Refresh generators after content change
    initLoot(activeData);
    initShop(activeData);
  });
});

// Scale app to fit smaller screens without scaling up beyond 100%
const BASE_WIDTH = 1080;
const BASE_HEIGHT = 690;

// Base layout scale (fit-to-screen)
let baseScale = 1;

// User-controlled zoom (pinch zoom)
let userZoom = 1;

// Pan offsets
let panX = 0;
let panY = 0;

// Render
function render() {
  const app = document.getElementById('app');
  if (!app) return;

  const scale = baseScale * userZoom;

  app.style.transform =
    `translate(${panX}px, ${panY}px) scale(${scale})`;
}

// Fit to Screen
function fitToScreen() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  baseScale = Math.min(
    vw / BASE_WIDTH,
    vh / BASE_HEIGHT,
    1
  );

  const scale = baseScale * userZoom;

  panX = (vw - BASE_WIDTH * scale) / 2;
  panY = (vh - BASE_HEIGHT * scale) / 2;

  render();
}

// Resize Handler
function handleResize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  baseScale = Math.min(
    vw / BASE_WIDTH,
    vh / BASE_HEIGHT,
    1
  );

  const scale = baseScale * userZoom;

  panX = (vw - BASE_WIDTH * scale) / 2;
  panY = (vh - BASE_HEIGHT * scale) / 2;

  render();
}

// Pinch Zoom
let lastDistance = null;

function getDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

document.addEventListener('touchmove', (e) => {
  if (e.touches.length !== 2) return;

  const dist = getDistance(e.touches);

  if (lastDistance) {
    const delta = dist / lastDistance;

    const prevZoom = userZoom;

    userZoom *= delta;

    // clamp zoom
    userZoom = Math.max(0.5, Math.min(userZoom, 3));

    const prevScale = baseScale * prevZoom;
    const newScale = baseScale * userZoom;

    const focalX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const focalY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

    panX = focalX - (focalX - panX) * (newScale / prevScale);
    panY = focalY - (focalY - panY) * (newScale / prevScale);

    render();
  }

  lastDistance = dist;
}, { passive: true });

document.addEventListener('touchend', () => {
  lastDistance = null;
});

// Event Listeners
window.addEventListener('load', fitToScreen);
window.addEventListener('resize', handleResize);

window.addEventListener('orientationchange', () => {
  setTimeout(fitToScreen, 100);
});

// Initial Render
fitToScreen();
document.body.style.visibility = 'visible';

// Tab Setup and Cycling
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-button.active').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content.active').forEach(content => content.classList.remove('active'));

    button.classList.add('active');
    const tabId = button.getAttribute('data-tab');
    document.getElementById(tabId)?.classList.add('active');
  });
});
