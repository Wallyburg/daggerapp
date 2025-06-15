export function initCounters() {
  const counters = document.querySelectorAll(".counter-box");

  counters.forEach(counter => {
    const valueDisplay = counter.querySelector(".counter-value");
    const buttons = counter.querySelectorAll(".counter-buttons button");
    const resetBtn = counter.querySelector(".reset-btn");

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        let currentValue = Number(valueDisplay.textContent);
        let change = Number(button.getAttribute("data-value"));
        let newValue = Math.max(0, currentValue + change);
        valueDisplay.textContent = newValue;
      });
    });


    resetBtn.addEventListener("click", () => {
      valueDisplay.textContent = "0";
    });
  });
}