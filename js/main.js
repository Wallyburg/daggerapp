import { initCounters } from './counter.js';
import { initInfoButtons } from './info.js';
import { initLoot } from './loot.js';
import { initShop } from './shop.js';

initInfoButtons();
initCounters();

const response = await fetch('json/masterlist.json');
const data = await response.json();

initLoot(data);
initShop(data);

// Scale app to fit smaller screens without scaling up beyond 100%
function scaleApp() {
  const app = document.getElementById('app');
  if (!app) return;

  const containerWidth = 1080;
  const containerHeight = 770;

  const scaleX = window.innerWidth / containerWidth;
  const scaleY = window.innerHeight / containerHeight;
  const scale = Math.min(scaleX, scaleY, 1);

  const scaledWidth = containerWidth * scale;
  const scaledHeight = containerHeight * scale;

  const translateX = (window.innerWidth - scaledWidth) / 2;
  const translateY = (window.innerHeight - scaledHeight) / 2;

  app.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

window.addEventListener('resize', scaleApp);
window.addEventListener('load', scaleApp);

scaleApp(); // Initial scaling on load

// Show body after scaling to prevent flicker
document.body.style.visibility = 'visible';

// Tab Setup
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-button.active').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content.active').forEach(content => content.classList.remove('active'));

    button.classList.add('active');
    const tabId = button.getAttribute('data-tab');
    document.getElementById(tabId)?.classList.add('active');
  });
});
