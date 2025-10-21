export function initLoot(data) {
  const lootList = document.getElementById("loot-listbox");
  const lootButton = document.getElementById("roll-loot-btn");
  const clearButton = document.getElementById("clear-loot-list");

  // Create overlay and append to shop-results
  const overlay = document.createElement("div");
  overlay.classList.add("tooltip-overlay");
  document.getElementById("shop-results").appendChild(overlay);
  
  // Create tooltip and append to shop listbox
  const tooltip = document.createElement("div");
  tooltip.classList.add("tooltip");
  document.getElementById("shop-results").appendChild(tooltip);

  function showTooltip(text) {
    tooltip.textContent = text;
    tooltip.style.left = `20px`;
    tooltip.style.top = `65px`;
    tooltip.classList.add("show");
    overlay.classList.add("show");
    tooltip.style.opacity = "1";
  }

  function hideTooltip() {
    tooltip.style.opacity = "0";
    tooltip.classList.remove("show");
    overlay.classList.remove("show");
  }

  // Add to listbox and bind tooltips
  function addToListBox(item, container = lootList) {
    const li = document.createElement("li");
    let tooltipText = "";

    // Armor, Items/Consumables, Weapons all have different JSON keys
    // Change tooltips based on those keys
    if ("Thresholds" in item) {
      tooltipText = `Tier: ${item.Tier}
Armor: ${item.Score}
Major: ${item.Thresholds.split(" / ")[0]} | Severe: ${item.Thresholds.split(" / ")[1]}

${item.Feature}`;
      li.textContent = item.Name;

    } else if ("Trait" in item) {
      tooltipText = `Tier: ${item.Tier}
Trait: ${item.Trait}
Range: ${item.Range}
Burden: ${item.Burden}
Damage: ${item.Damage}

${item.Feature}`;
      li.textContent = item.Name;

    } else if ("Loot" in item) {
      tooltipText = `Roll: ${item.Roll}  
${item.Description}`;
      li.textContent = item.Loot;

    } else {
      tooltipText = `Unknown item type`;
      li.textContent = "Unknown Item";
    }

    li.addEventListener("mouseenter", () => showTooltip(tooltipText));
    li.addEventListener("mouseleave", hideTooltip);

    container.appendChild(li);
  }

  // Clear the list
  clearButton.addEventListener("click", () => {
    lootList.innerHTML = "";
  });

  // Dice roller helper with ±1 modifier clamped between 1 and 60
  // This is for rolling Items and Consumables
  function rollDice(numDice, sides) {
    let total = 0;
    for (let i = 0; i < numDice; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    total += Math.random() < 0.5 ? -1 : 1;
    return Math.min(Math.max(total, 1), 60);
  }

  // Main button logic
  // Pulls random drops from JSON based on selected dropdown options
  lootButton.addEventListener("click", () => {
    lootList.innerHTML = "";
    const lootSize = parseInt(document.getElementById("loot-dropdown").value, 10);
    const selectedTier = document.getElementById("tier-dropdown").value;

    const allGroups = [
      { name: "Armor", type: "tiered", header: "Armor & Weapons" },
      { name: "Magic", type: "tiered", header: "Armor & Weapons" },
      { name: "Physical", type: "tiered", header: "Armor & Weapons" },
      { name: "Secondary", type: "tiered", header: "Armor & Weapons" },
      { name: "Items", type: "roll", header: "Items & Consumables" },
      { name: "Consumables", type: "roll", header: "Items & Consumables" },
    ];

    const tierDiceMap = { "1": 2, "2": 3, "3": 4, "4": 5 };
    const numDice = tierDiceMap[selectedTier] || 2;

    const headerFlags = {};
    let lootCount = 0;
    const maxTries = 100;
    let tries = 0;

    while (lootCount < lootSize && tries < maxTries) {
      tries++;
      const groupInfo = allGroups[Math.floor(Math.random() * allGroups.length)];
      const groupItems = data[groupInfo.name] || [];
      if (groupItems.length === 0) continue;

      let selectedItem = null;

      // Some drops pull based on Tier selected
      // Others pull based on a Roll table
      if (groupInfo.type === "tiered") {
        const filtered = selectedTier === "Any"
          ? groupItems
          : groupItems.filter(item => item.Tier === selectedTier);
        if (filtered.length) {
          selectedItem = filtered[Math.floor(Math.random() * filtered.length)];
        }
      } else if (groupInfo.type === "roll") {
        const rollResult = rollDice(numDice, 12);
        const matches = groupItems.filter(item => parseInt(item.Roll, 10) === rollResult);
        if (matches.length) {
          selectedItem = matches[Math.floor(Math.random() * matches.length)];
        }
      }

      if (selectedItem) {
        if (!headerFlags[groupInfo.header]) {
          const headerLi = document.createElement("li");
          headerLi.textContent = groupInfo.header;
          headerLi.classList.add("loot-header");
          lootList.appendChild(headerLi);

          const categoryUl = document.createElement("ul");
          categoryUl.classList.add("loot-category-list");
          lootList.appendChild(categoryUl);

          headerFlags[groupInfo.header] = categoryUl;
        }
        addToListBox(selectedItem, headerFlags[groupInfo.header]);
        lootCount++;
      }
    }

    // Gold drop header and list
    const goldHeader = document.createElement("li");
    goldHeader.textContent = "Gold Drop";
    goldHeader.classList.add("loot-header");
    lootList.appendChild(goldHeader);

    const goldUl = document.createElement("ul");
    goldUl.classList.add("loot-category-list");
    lootList.appendChild(goldUl);

    // 1d4 per lootSize * tier
    function rollGold(lootSize, tier) {
      let total = 0;
      for (let i = 0; i < lootSize; i++) {
        total += Math.floor(Math.random() * 4) + 1;
      }
      return total * tier;
    }

    const goldAmount = rollGold(lootSize, parseInt(selectedTier, 10) || 1);

    const chests = Math.floor(goldAmount / 100);
    const remainderAfterChests = goldAmount % 100;
    const bags = Math.floor(remainderAfterChests / 10);
    const handfuls = remainderAfterChests % 10;

    function addGoldLine(amount, unit) {
      if (amount > 0) {
        const li = document.createElement("li");
        // remove 's' if singular (1 Handful vs 2 Handfuls)
        const unitText = amount === 1 ? unit.slice(0, -1) : unit;
        li.textContent = `${amount} ${unitText} of Gold`;
        goldUl.appendChild(li);

        const tooltipText = "10 Handfuls = 1 Bag\n10 Bags = 1 Chest";

        li.addEventListener("mouseenter", () => showTooltip(tooltipText));
        li.addEventListener("mouseleave", hideTooltip);
      }
    }

    addGoldLine(chests, "Chests");
    addGoldLine(bags, "Bags");
    addGoldLine(handfuls, "Handfuls");

    if (lootCount === 0) {
      alert("No items available for that selection!");
    }
  });
}
