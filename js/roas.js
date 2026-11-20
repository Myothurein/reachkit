document.addEventListener("DOMContentLoaded", () => {
  /* Currency Presets */
  const CURRENCIES = {
    USD: { symbol: "$", decimals: 2, suffix: false },
    EUR: { symbol: "€", decimals: 2, suffix: false },
    GBP: { symbol: "£", decimals: 2, suffix: false },
    THB: { symbol: "฿", decimals: 0, suffix: false },
    MMK: { symbol: "Ks", decimals: 0, suffix: true },
  };

  /* DOM References */
  const currencySelect = document.getElementById("currencySelect");
  const currencySymbols = document.querySelectorAll(".currency-symbol");

  const sellingPriceInput = document.getElementById("sellingPriceInput");
  const cogsInput = document.getElementById("cogsInput");
  const shippingInput = document.getElementById("shippingInput");
  const feePercentInput = document.getElementById("feePercentInput");

  const targetMarginSlider = document.getElementById("targetMarginSlider");
  const targetMarginValue = document.getElementById("targetMarginValue");

  const adSpendInput = document.getElementById("adSpendInput");
  const presetChips = document.querySelectorAll(".preset-chip");
  const currentRoasInput = document.getElementById("currentRoasInput");
  const currentRoasSlider = document.getElementById("currentRoasSlider");

  const statusBadge = document.getElementById("statusBadge");
  const grossMarginPctEl = document.getElementById("grossMarginPct");
  const breakEvenRoasEl = document.getElementById("breakEvenRoas");
  const breakEvenCpaEl = document.getElementById("breakEvenCpa");
  const targetRoasOut = document.getElementById("targetRoasOut");
  const targetRoasHint = document.getElementById("targetRoasHint");
  const actualCpaOut = document.getElementById("actualCpaOut");
  const poasOut = document.getElementById("poasOut");

  const estOrdersOut = document.getElementById("estOrdersOut");
  const estRevenueOut = document.getElementById("estRevenueOut");
  const totalCogsOut = document.getElementById("totalCogsOut");
  const adSpendOut = document.getElementById("adSpendOut");
  const netProfitRow = document.getElementById("netProfitRow");
  const netMarginOut = document.getElementById("netMarginOut");
  const netProfitOut = document.getElementById("netProfitOut");

  const barCogs = document.getElementById("barCogs");
  const barAds = document.getElementById("barAds");
  const barProfit = document.getElementById("barProfit");

  const scenarioTableBody = document.getElementById("scenarioTableBody");
  const copyReportBtn = document.getElementById("copyReportBtn");

  let lastReportText = "";

  /* Formatting Helper */
  function formatMoney(amount, forceSign = false) {
    const cfg = CURRENCIES[currencySelect.value] || CURRENCIES.USD;
    const isNeg = amount < 0;
    const absVal = Math.abs(amount);
    const useDecimals = cfg.decimals > 0 && absVal < 1000;
    const formatted = absVal.toLocaleString("en-US", {
      minimumFractionDigits: useDecimals ? cfg.decimals : 0,
      maximumFractionDigits: useDecimals ? cfg.decimals : 0,
    });

    const sign = isNeg ? "-" : forceSign && amount > 0 ? "+" : "";
    if (cfg.suffix) {
      return `${sign}${formatted} ${cfg.symbol}`;
    }
    return `${sign}${cfg.symbol}${formatted}`;
  }

  function updateCurrencyUI() {
    const cfg = CURRENCIES[currencySelect.value] || CURRENCIES.USD;
    currencySymbols.forEach((el) => {
      el.textContent = cfg.symbol;
    });
  }

  /* Core Calculation */
  function calculate() {
    const price = Math.max(0, Number(sellingPriceInput.value) || 0);
    const cogs = Math.max(0, Number(cogsInput.value) || 0);
    const shipping = Math.max(0, Number(shippingInput.value) || 0);
    const feePct = Math.min(99, Math.max(0, Number(feePercentInput.value) || 0));
    const targetNetPct = Number(targetMarginSlider.value) || 20;

    const adSpend = Math.max(0, Number(adSpendInput.value) || 0);
    const currentRoas = Math.max(0.01, Number(currentRoasInput.value) || 0.01);

    targetMarginValue.textContent = `${targetNetPct}%`;
    targetRoasHint.textContent = `For ${targetNetPct}% net`;

    // 1. Unit Economics
    const feePerUnit = price * (feePct / 100);
    const totalUnitCost = cogs + shipping + feePerUnit;
    const contributionMargin = price - totalUnitCost;
    const marginRatio = price > 0 ? contributionMargin / price : 0;
    const grossMarginPct = marginRatio * 100;

    const isUnitProfitable = contributionMargin > 0 && price > 0;
    const breakEvenRoas = isUnitProfitable ? 1 / marginRatio : null;
    const breakEvenCpa = isUnitProfitable ? contributionMargin : 0;

    // 2. Target ROAS for Desired Net Margin
    const targetMarginDecimal = targetNetPct / 100;
    let targetRoas = null;
    if (isUnitProfitable && marginRatio > targetMarginDecimal) {
      targetRoas = 1 / (marginRatio - targetMarginDecimal);
    }

    // 3. Campaign Simulation
    const estRevenue = adSpend * currentRoas;
    const estOrders = price > 0 ? estRevenue / price : 0;
    const actualCpa = estOrders > 0 ? adSpend / estOrders : 0;
    const totalVariableCosts = estOrders * totalUnitCost;
    const grossProfitBeforeAds = estRevenue - totalVariableCosts;
    const netProfit = grossProfitBeforeAds - adSpend;
    const netMarginPct = estRevenue > 0 ? (netProfit / estRevenue) * 100 : 0;
    const poas = adSpend > 0 ? grossProfitBeforeAds / adSpend : 0;

    // 4. Status Badge
    statusBadge.classList.remove("is-profit", "is-breakeven", "is-loss");
    if (!isUnitProfitable) {
      statusBadge.textContent = "Negative Unit Margin";
      statusBadge.classList.add("is-loss");
    } else if (Math.abs(netProfit) < Math.max(1, adSpend * 0.01)) {
      statusBadge.textContent = "At Break-Even";
      statusBadge.classList.add("is-breakeven");
    } else if (netProfit > 0) {
      statusBadge.textContent = "Profitable Campaign";
      statusBadge.classList.add("is-profit");
    } else {
      statusBadge.textContent = "Losing Money";
      statusBadge.classList.add("is-loss");
    }

    // 5. Update Primary & Sub Metrics
    grossMarginPctEl.textContent = `${grossMarginPct.toFixed(1)}%`;
    breakEvenRoasEl.textContent = breakEvenRoas ? `${breakEvenRoas.toFixed(2)}x` : "N/A";
    breakEvenCpaEl.textContent = isUnitProfitable ? formatMoney(breakEvenCpa) : "N/A";
    targetRoasOut.textContent = targetRoas ? `${targetRoas.toFixed(2)}x` : "Too High";
    actualCpaOut.textContent = price > 0 ? formatMoney(actualCpa) : "N/A";
    poasOut.textContent = `${poas.toFixed(2)}x`;

    // 6. Update Campaign P&L Breakdown
    estOrdersOut.textContent = Math.round(estOrders).toLocaleString("en-US");
    estRevenueOut.textContent = formatMoney(estRevenue);
    totalCogsOut.textContent = `-${formatMoney(totalVariableCosts)}`;
    adSpendOut.textContent = `-${formatMoney(adSpend)}`;
    netMarginOut.textContent = `${netMarginPct.toFixed(1)}%`;
    netProfitOut.textContent = formatMoney(netProfit, true);

    netProfitRow.classList.remove("is-profit", "is-loss");
    if (netProfit > 0) netProfitRow.classList.add("is-profit");
    if (netProfit < 0) netProfitRow.classList.add("is-loss");

    // 7. Update Visual Revenue Split Bar
    if (estRevenue > 0) {
      const totalBarBase = Math.max(estRevenue, totalVariableCosts + adSpend);
      const cogsW = Math.min(100, (totalVariableCosts / totalBarBase) * 100);
      const adsW = Math.min(100 - cogsW, (adSpend / totalBarBase) * 100);
      const profitW = netProfit > 0 ? Math.max(0, 100 - cogsW - adsW) : 0;

      barCogs.style.width = `${cogsW.toFixed(1)}%`;
      barAds.style.width = `${adsW.toFixed(1)}%`;
      barProfit.style.width = `${profitW.toFixed(1)}%`;
    } else {
      barCogs.style.width = "0%";
      barAds.style.width = "0%";
      barProfit.style.width = "0%";
    }

    // 8. Populate Scenario Comparison Table
    const scenarios = [
      { label: "Underperforming (-1.0x)", roas: Math.max(0.5, currentRoas - 1.0), isCurrent: false },
      { label: "Break-Even Point", roas: breakEvenRoas || 1.0, isCurrent: false, isBreakEven: true },
      { label: "Current Campaign", roas: currentRoas, isCurrent: true },
      { label: "Scaled Target (+1.0x)", roas: currentRoas + 1.0, isCurrent: false },
    ];

    // Sort cleanly by ROAS ascending
    scenarios.sort((a, b) => a.roas - b.roas);

    scenarioTableBody.innerHTML = scenarios
      .map((s) => {
        if (s.isBreakEven && !breakEvenRoas) return "";
        const rev = adSpend * s.roas;
        const orders = price > 0 ? rev / price : 0;
        const cpa = orders > 0 ? adSpend / orders : 0;
        const profit = rev * marginRatio - adSpend;
        const profitClass =
          Math.abs(profit) < 1 ? "text-neutral" : profit > 0 ? "text-profit" : "text-loss";

        return `
          <tr class="${s.isCurrent ? "is-current" : ""}">
            <td>${s.label}</td>
            <td><strong>${s.roas.toFixed(2)}x</strong></td>
            <td>${formatMoney(rev)}</td>
            <td>${price > 0 ? formatMoney(cpa) : "N/A"}</td>
            <td class="${profitClass}">${formatMoney(profit, true)}</td>
          </tr>
        `;
      })
      .join("");

    // 9. Build Clipboard Report
    lastReportText = [
      `ReachKit Ad ROAS & Break-Even Report (${currencySelect.value})`,
      `Selling Price: ${formatMoney(price)} | Unit Costs: ${formatMoney(totalUnitCost)} | Gross Margin: ${grossMarginPct.toFixed(1)}%`,
      `Break-Even ROAS: ${breakEvenRoas ? breakEvenRoas.toFixed(2) + "x" : "N/A"} | Max CPA: ${isUnitProfitable ? formatMoney(breakEvenCpa) : "N/A"}`,
      `Target ROAS (${targetNetPct}% net margin): ${targetRoas ? targetRoas.toFixed(2) + "x" : "Unreachable"}`,
      `---`,
      `Campaign Simulation (@ ${currentRoas.toFixed(2)}x ROAS on ${formatMoney(adSpend)} spend):`,
      `Est. Revenue: ${formatMoney(estRevenue)} (${Math.round(estOrders)} orders | CPA: ${formatMoney(actualCpa)})`,
      `Net Profit: ${formatMoney(netProfit, true)} (${netMarginPct.toFixed(1)}% net margin | POAS: ${poas.toFixed(2)}x)`,
    ].join("\n");
  }

  /* Event Listeners */
  currencySelect.addEventListener("change", () => {
    updateCurrencyUI();
    calculate();
  });

  [sellingPriceInput, cogsInput, shippingInput, feePercentInput, targetMarginSlider, adSpendInput].forEach(
    (el) => {
      el.addEventListener("input", calculate);
    }
  );

  currentRoasInput.addEventListener("input", () => {
    const val = Math.max(0.1, Number(currentRoasInput.value) || 0.1);
    currentRoasSlider.value = Math.min(val, Number(currentRoasSlider.max));
    calculate();
  });

  currentRoasSlider.addEventListener("input", () => {
    currentRoasInput.value = Number(currentRoasSlider.value).toFixed(1);
    calculate();
  });

  presetChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      adSpendInput.value = chip.dataset.spend;
      calculate();
    });
  });

  copyReportBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(lastReportText);
      const original = copyReportBtn.textContent;
      copyReportBtn.textContent = "Copied Report!";
      setTimeout(() => {
        copyReportBtn.textContent = original;
      }, 1800);
    } catch {
      alert(lastReportText);
    }
  });

  // Initialize
  updateCurrencyUI();
  calculate();
});