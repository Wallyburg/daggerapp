export function initShop(data) {
  const shopList = document.getElementById("shop-listbox");
  const shopButton = document.getElementById("roll-shop-btn");
  const clearButton = document.getElementById("clear-shop-list");

  // Create overlay element and append to shop-results
  const overlay = document.createElement("div");
  overlay.classList.add("tooltip-overlay");
  document.getElementById("loot-results").appendChild(overlay);
  
  // Create tooltip element and append to loot listbox
  const tooltip = document.createElement("div");
  tooltip.classList.add("tooltip");
  document.getElementById("loot-results").appendChild(tooltip);

  function showTooltip(text) {
    tooltip.textContent = text;
    tooltip.style.left = `20px`;
    tooltip.style.top = `65px`;
    tooltip.classList.add("show");       // show tooltip
    overlay.classList.add("show");       // show overlay
    tooltip.style.opacity = "1";
  }

  function hideTooltip() {
    tooltip.style.opacity = "0";
    tooltip.classList.remove("show");       // show tooltip
    overlay.classList.remove("show");       // show overlay
  }

  // Add to listbox and bind tooltips
  function addToListBox(item, container = shopList) {
    const li = document.createElement("li");
    let tooltipText = "";

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
    shopList.innerHTML = "";
  });

  // Dice roller helper with ±1 modifier clamped between 1 and 60
  function rollDice(numDice, sides) {
    let total = 0;
    for (let i = 0; i < numDice; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    total += Math.random() < 0.5 ? -1 : 1;
    return Math.max(1, Math.min(total, 60));
  }

  // Main button logic
  shopButton.addEventListener("click", () => {
    shopList.innerHTML = "";
    const shopType = parseInt(document.getElementById("shop-dropdown").value, 10) - 1;
    const selectedTier = document.getElementById("tier-dropdown").value;

    const allGroups = [
      { name: "items", type: "roll", header: "Items" },
      { name: "potions", type: "roll", header: "Potions" },
      { name: "armor", type: "tiered", header: "Armor" },
      { name: "magic", type: "tiered", header: "Magic Weapons" },
      { name: "physical", type: "tiered", header: "Physical Weapons" },
      { name: "secondary", type: "tiered", header: "Secondary Weapons" }
    ];

    const selectedGroup = allGroups[shopType];
    if (!selectedGroup) {
      alert("Invalid shop type selected!");
      return;
    }

    const groupItems = data[selectedGroup.name] || [];
    if (groupItems.length === 0) {
      alert("No items available in this category!");
      return;
    }

    const tierDiceMap = { "1": 2, "2": 3, "3": 4, "4": 5 };
    const numDice = tierDiceMap[selectedTier] || 2;

    const headerLi = document.createElement("li");
    headerLi.textContent = selectedGroup.header;
    headerLi.classList.add("shop-header");
    shopList.appendChild(headerLi);

    const categoryUl = document.createElement("ul");
    categoryUl.classList.add("shop-category-list");
    shopList.appendChild(categoryUl);

    const tierItemCounts = {
      "1": { "1": 9 },
      "2": { "1": 7, "2": 2 },
      "3": { "1": 5, "2": 2, "3": 2 },
      "4": { "1": 3, "2": 2, "3": 2, "4": 2 }
    };
    const countMap = tierItemCounts[selectedTier] || tierItemCounts["1"];

    let totalItemsAdded = 0;

    if (selectedGroup.type === "tiered") {
      for (const [tier, count] of Object.entries(countMap)) {
        const tierItems = selectedTier === "Any"
          ? groupItems
          : groupItems.filter(item => item.Tier === tier);

        for (let i = 0; i < count; i++) {
          if (tierItems.length === 0) continue;
          const selectedItem = tierItems[Math.floor(Math.random() * tierItems.length)];
          addToListBox(selectedItem, categoryUl);
          totalItemsAdded++;
        }
      }
    } else if (selectedGroup.type === "roll") {
      for (const [tier, count] of Object.entries(countMap)) {
        for (let i = 0; i < count; i++) {
          const rollResult = rollDice(numDice, 12);
          const matches = groupItems.filter(item => parseInt(item.Roll, 10) === rollResult);
          if (matches.length === 0) continue;
          const selectedItem = matches[Math.floor(Math.random() * matches.length)];
          addToListBox(selectedItem, categoryUl);
          totalItemsAdded++;
        }
      }
    }

    if (totalItemsAdded === 0) {
      alert("No items available for that selection!");
    }
  });
}
