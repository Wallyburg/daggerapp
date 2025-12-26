export function initShop(data) {
  const $ = id => document.getElementById(id);

  const shopList = $("shop-listbox");
  const shopButton = $("roll-shop-btn");
  const clearButton = $("clear-shop-list");
  const lootResults = $("loot-results");

  const ALL_GROUPS = [
    { name: "Items", type: "roll", header: "Items" },
    { name: "Consumables", type: "roll", header: "Consumables" },
    { name: "Armor", type: "tiered", header: "Armor" },
    { name: "Magic", type: "tiered", header: "Magic Weapons" },
    { name: "Physical", type: "tiered", header: "Physical Weapons" },
    { name: "Secondary", type: "tiered", header: "Secondary Weapons" }
  ];

  const TIER_DICE_MAP = { "1": 2, "2": 3, "3": 4, "4": 5 };
  const TIER_ITEM_COUNTS = {
    "1": { "1": 9 },
    "2": { "1": 7, "2": 2 },
    "3": { "1": 5, "2": 2, "3": 2 },
    "4": { "1": 3, "2": 2, "3": 2, "4": 2 }
  };

  // Tooltip setup
  const overlay = Object.assign(document.createElement("div"), { className: "tooltip-overlay" });
  const tooltip = Object.assign(document.createElement("div"), { className: "tooltip" });
  lootResults.append(overlay, tooltip);

  const showTooltip = text => {
    tooltip.textContent = text;
    tooltip.style.cssText = "left:20px;top:65px;opacity:1";
    tooltip.classList.add("show");
    overlay.classList.add("show");
  };

  const hideTooltip = () => {
    tooltip.style.opacity = "0";
    tooltip.classList.remove("show");
    overlay.classList.remove("show");
  };

  const rollDice = (numDice, sides) =>
    Math.min(
      Math.max([...Array(numDice)].reduce(t => t + Math.floor(Math.random() * sides) + 1, 0) + (Math.random() < 0.5 ? -1 : 1), 1),
      60
    );

  const create = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  };

  const addToListBox = (item, container) => {
    const li = document.createElement("li");
    const tooltipText =
      "Thresholds" in item
        ? `Tier: ${item.Tier}
Armor: ${item.Score}
Major: ${item.Thresholds.split(" / ")[0]} | Severe: ${item.Thresholds.split(" / ")[1]}

${item.Feature}`
        : "Trait" in item
        ? `Tier: ${item.Tier}
Trait: ${item.Trait}
Range: ${item.Range}
Burden: ${item.Burden}
Damage: ${item.Damage}

${item.Feature}`
        : "Loot" in item
        ? `Roll: ${item.Roll}
${item.Description}`
        : "Unknown item type";

    li.textContent = item.Name || item.Loot || "Unknown Item";
    li.addEventListener("mouseenter", () => showTooltip(tooltipText));
    li.addEventListener("mouseleave", hideTooltip);
    container.appendChild(li);
  };

  clearButton.onclick = () => (shopList.innerHTML = "");

  shopButton.onclick = () => {
    shopList.innerHTML = "";

    const shopType = parseInt($("shop-dropdown").value, 10) - 1;
    const selectedTier = $("tier-dropdown").value;
    const group = ALL_GROUPS[shopType];
    if (!group) return alert("Invalid shop type selected!");

    const items = data[group.name] || [];
    if (!items.length) return alert("No items available in this category!");

    const countMap = TIER_ITEM_COUNTS[selectedTier] || TIER_ITEM_COUNTS["1"];
    shopList.append(create("li", "shop-header", group.header));
    const categoryUl = create("ul", "shop-category-list");
    shopList.appendChild(categoryUl);

    let total = 0;

    for (const [tier, count] of Object.entries(countMap)) {
      const numDice = TIER_DICE_MAP[tier] || 2;
      const tieredPool = group.type === "tiered"
        ? selectedTier === "Any" ? items : items.filter(i => i.Tier === tier)
        : items;

      for (let i = 0; i < count; i++) {
        if (!tieredPool.length) continue;

        const chosen =
          group.type === "tiered"
            ? tieredPool[Math.floor(Math.random() * tieredPool.length)]
            : (() => {
                const rollResult = rollDice(numDice, 12);
                const matches = tieredPool.filter(i => parseInt(i.Roll, 10) === rollResult);
                return matches.length ? matches[Math.floor(Math.random() * matches.length)] : null;
              })();

        if (!chosen) continue;
        addToListBox(chosen, categoryUl);
        total++;
      }
    }

    if (!total) alert("No items available for that selection!");
  };
}
