export function initLoot(data) {
  const lootList = document.getElementById("loot-listbox");
  const lootButton = document.getElementById("roll-loot-btn");
  const clearButton = document.getElementById("clear-loot-list");
  const shopResults = document.getElementById("shop-results");

  // Tooltip setup
  const overlay = document.createElement("div");
  overlay.classList.add("tooltip-overlay");
  shopResults.appendChild(overlay);

  const tooltip = document.createElement("div");
  tooltip.classList.add("tooltip");
  shopResults.appendChild(tooltip);

  const showTooltip = (text) => {
    tooltip.textContent = text;
    tooltip.style.left = "20px";
    tooltip.style.top = "65px";
    tooltip.style.opacity = "1";
    tooltip.classList.add("show");
    overlay.classList.add("show");
  };

  const hideTooltip = () => {
    tooltip.style.opacity = "0";
    tooltip.classList.remove("show");
    overlay.classList.remove("show");
  };

  const rollDice = (numDice, sides) => {
    let total = 0;
    for (let i = 0; i < numDice; i++) total += Math.floor(Math.random() * sides) + 1;
    total += Math.random() < 0.5 ? -1 : 1;
    return Math.min(Math.max(total, 1), 60);
  };

  const addToListBox = (item, container = lootList) => {
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
  };

  const createHeaderList = (header) => {
    const headerLi = document.createElement("li");
    headerLi.textContent = header;
    headerLi.classList.add("loot-header");
    const ul = document.createElement("ul");
    ul.classList.add("loot-category-list");
    lootList.appendChild(headerLi);
    lootList.appendChild(ul);
    return ul;
  };

  clearButton.addEventListener("click", () => (lootList.innerHTML = ""));

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
    let tries = 0;
    const maxTries = 100;

    while (lootCount < lootSize && tries++ < maxTries) {
      const groupInfo = allGroups[Math.floor(Math.random() * allGroups.length)];
      const groupItems = data[groupInfo.name] || [];
      if (!groupItems.length) continue;

      let selectedItem = null;

      if (groupInfo.type === "tiered") {
        const filtered = selectedTier === "Any" ? groupItems : groupItems.filter(i => i.Tier === selectedTier);
        if (filtered.length) selectedItem = filtered[Math.floor(Math.random() * filtered.length)];
      } else {
        const rollResult = rollDice(numDice, 12);
        const matches = groupItems.filter(i => parseInt(i.Roll, 10) === rollResult);
        if (matches.length) selectedItem = matches[Math.floor(Math.random() * matches.length)];
      }

      if (!selectedItem) continue;

      if (!headerFlags[groupInfo.header]) headerFlags[groupInfo.header] = createHeaderList(groupInfo.header);

      addToListBox(selectedItem, headerFlags[groupInfo.header]);
      lootCount++;
    }

    // Gold
    const goldUl = createHeaderList("Gold");

    const rollGold = (size, tier) => {
      let total = 0;
      for (let i = 0; i < size; i++) total += Math.floor(Math.random() * 4) + 1;
      return total * tier;
    };

    const goldAmount = rollGold(lootSize, parseInt(selectedTier, 10) || 1);
    const chests = Math.floor(goldAmount / 100);
    const remainder = goldAmount % 100;
    const bags = Math.floor(remainder / 10);
    const handfuls = remainder % 10;

    const addGoldLine = (amount, unit) => {
      if (!amount) return;
      const li = document.createElement("li");
      li.textContent = `${amount} ${amount === 1 ? unit.slice(0, -1) : unit} of Gold`;
      li.addEventListener("mouseenter", () => showTooltip("10 Handfuls = 1 Bag\n10 Bags = 1 Chest"));
      li.addEventListener("mouseleave", hideTooltip);
      goldUl.appendChild(li);
    };

    [ [chests, "Chests"], [bags, "Bags"], [handfuls, "Handfuls"] ].forEach(([amt, unit]) => addGoldLine(amt, unit));

    if (lootCount === 0) alert("No items available for that selection!");
  });
}
