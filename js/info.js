export function initInfoButtons() {
  const app = document.getElementById('app');
  if (!app) return;  // fail gracefully if #app is missing

  // Create modal overlay and content
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "modal-content";

  const closeBtn = document.createElement("button");
  closeBtn.className = "close-btn";
  closeBtn.innerHTML = "&times;";

  const message = document.createElement("div");

  const scrollableContent = document.createElement("div");
  scrollableContent.className = "modal-scrollable-content";
  scrollableContent.appendChild(message);

  modal.append(closeBtn, scrollableContent);
  overlay.appendChild(modal);
  app.appendChild(overlay);

  // Info message library
  const infoMessages = {
    welcome: `License & Contribution

    DaggerApp is a free and open-source tool created for the Daggerheart community.  
    It is licensed under the GNU General Public License v3.0 (GPLv3).

    What this means:

      - Anyone is free to use, share, and modify this tool.  
      - Any changes or improvements must remain free and open to the community under the same license.  
      - DaggerApp will always be a free resource for Daggerheart Game Masters and players.

    ---

    The app includes all base items, consumables, weapons, and armor from the Daggerheart rulebook.
    *Note: Does not include Campaign Frame specific content*
    
    Daggerheart, and any referenced material, is the property of Darrington Press.
      - https://www.daggerheart.com/
      - https://darringtonpress.com/

    ---

    DaggerApp is a personal project, created in my limited free time.
    While contributions and improvements are always welcome, I may not be quick on pull requests and issues.`,
    //End Welcome

    loot: `Loot Generator
    
    Rolls random items, consumables, weapons, or armor from the Daggerheart rulebook.
    It will also generate a gold drop depending on loot size and tier selected.

      -Small: One drop from selected tier and (1d4 x tier) handfuls of gold
      -Medium: Two drops from selected tier and (2d4 x tier) handfuls of gold
      -Large: Three drops from selected tier and (3d4 x tier) handfuls of gold
      -Hoard: Four drops from selected tier and (4d4 x tier) handfuls of gold

    To use, select desired loot size and tier, then click the roll loot button.
    Clicking the clear list button will empty the list.
    Hover over list items to view tooltips.
   
---

Tier Selection
    
    Armor and weapons will roll from the selected tier.
    Items and consumables roll on the tables in the Daggerheart rulebook.

      -Tier 1: 2d12 plus or minus 1
      -Tier 2: 3d12 plus or minus 1
      -Tier 3: 4d12 plus or minus 1
      -Tier 4: 5d12 plus or minus 1

    Results fall between 1-60, making higher and lower rolls less common.
    This makes rare items truly rare.
    
---

Shop Generator
    
    Rolls random lists from the Daggerheart rulebook based on tier and shop type.
    Nine entries from the selected category are displayed and can contain duplicates.

    As tier increases, two of those entries are replaced by items of a higher tier.
    This effect stacks to simulate rarity at higher levels.

      -Tier 1: Nine items from tier 1
      -Tier 2: Seven items from tier 1, two items from tier 2
      -Tier 3: Five from tier 1, two from tier 2, two from tier 3
      -Tier 4: Three from tier 1, two from tier 2, two from tier 3, two from tier 4
        
    To use, select desired shop type and tier, then click the roll shop button.
    Clicking the clear list button will empty the list.
    Hover over list items to view tooltips.`,
    //End Loot

    countdowns: `Countdowns
    
    This section is for keeping track of various countdowns mentioned in the Daggerheart rulebook.
    For convenience, I've included three separate trackers in case there are multiple countdowns active at once.
    
    Use the plus or minus buttons to increase or decrease the countdowns.
    The reset button will return the counter to zero.
    
    See the official Daggerheart rulebook for more information on using countdowns.`
    //End Countdowns
  };

  // Button click handlers
  document.querySelectorAll(".info-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const infoType = btn.getAttribute("data-info");
      if (infoMessages[infoType]) {
        message.textContent = infoMessages[infoType];
        overlay.classList.add("show");
        modal.classList.add("show");
      }
    });
  });

  // Close modal handler
  const closeModal = () => {
    overlay.classList.remove("show");
    modal.classList.remove("show");
  };

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
}
