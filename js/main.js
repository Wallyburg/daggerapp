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
function scaleApp() {
  const app = document.getElementById('app');
  if (!app) return;

  const viewport = window.visualViewport;
  
  const containerWidth = 1080;
  const containerHeight = 690;

  const vw = viewport?.width || window.innerWidth;
  const vh = viewport?.height || window.innerHeight;

  const baseScaleX = vw / containerWidth;
  const baseScaleY = vh / containerHeight;
  const baseScale = Math.min(baseScaleX, baseScaleY, 1);

  const zoomScale = viewport?.scale || 1;
  const finalScale = baseScale * zoomScale;

  const scaledWidth = containerWidth * baseScale;
  const scaledHeight = containerHeight * baseScale;

  const translateX = (vw - scaledWidth) / 2;
  const translateY = (vh - scaledHeight) / 2;

  app.style.transform = `translate(${translateX}px, ${translateY}px) scale(${finalScale})`;
}

window.addEventListener('load', scaleApp);
window.addEventListener('resize', scaleApp);
window.visualViewport?.addEventListener('resize', scaleApp);
window.addEventListener('orientationchange', () => {
  setTimeout(scaleApp, 100);
});

// Call function to scale on first time page load
scaleApp();

// Show body after scaling to prevent flicker (Hidden in CSS by default)
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
