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

// Content pack registry (Line 40 in index.html)
const contentPacks = {
  baseGame: {
    checkboxId: 'baseGame-json',
    url: 'json/baseGame.json'
  },
  hopeFear: {
    checkboxId: 'hopeFear-json',
    url: 'json/hopeFear.json'
  },
  beastFeast: {
    checkboxId: 'beastFeast-json',
    url: 'json/beastFeast.json'
  },
  drylands: {
    checkboxId: 'drylands-json',
    url: 'json/drylands.json'
  },
  andaluria: {
    checkboxId: 'andaluria-json',
    url: 'json/andaluria.json'
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
