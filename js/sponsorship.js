document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
     2026 Brand Deal Pricing Model (Base = Tier 1 USD)
     ========================================= */
  const FORMAT_CONFIG = {
    "yt-integration": {
      label: "YouTube Integration (60–90s)",
      cpmMultiplier: 1.0,
      minFloor: 200,
    },
    "yt-dedicated": {
      label: "YouTube Dedicated Video",
      cpmMultiplier: 2.15,
      minFloor: 450,
    },
    "short-video": {
      label: "TikTok / Reels / Shorts Video",
      cpmMultiplier: 0.58,
      minFloor: 150,
    },
    "ig-bundle": {
      label: "Instagram Carousel + 3 Stories",
      cpmMultiplier: 0.48,
      minFloor: 120,
    },
  };

  // Base YouTube Integration CPM per Niche (Tier 1 USD)
  const NICHE_BASE_CPM = {
    finance: 45,
    tech: 30,
    marketing: 32,
    beauty: 24,
    education: 22,
    lifestyle: 20,
    gaming: 15,
  };

  const REGION_MULTIPLIER = {
    tier1: 1.0,   // US, UK, CA, AU
    tier2: 0.72,  // EU, Japan, Korea
    global: 0.55, // Mixed global
    tier3: 0.25,  // SEA, India, LATAM
  };

  /* DOM References */
  const formatBtns = document.querySelectorAll(".format-btn");
  const avgViewsInput = document.getElementById("avgViewsInput");
  const avgViewsSlider = document.getElementById("avgViewsSlider");
  const presetChips = document.querySelectorAll(".preset-chip");

  const engagementSlider = document.getElementById("engagementSlider");
  const engagementValue = document.getElementById("engagementValue");
  const engagementTier = document.getElementById("engagementTier");

  const nicheSelect = document.getElementById("nicheSelect");
  const regionSelect = document.getElementById("regionSelect");
  const usageSelect = document.getElementById("usageSelect");
  const exclusivitySelect = document.getElementById("exclusivitySelect");
  const rushToggle = document.getElementById("rushToggle");
  const linkBioToggle = document.getElementById("linkBioToggle");

  const resultFormatBadge = document.getElementById("resultFormatBadge");
  const effectiveCpmEl = document.getElementById("effectiveCpm");
  const targetRateEl = document.getElementById("targetRate");
  const floorNote = document.getElementById("floorNote");
  const floorRateEl = document.getElementById("floorRate");
  const midRateEl = document.getElementById("midRate");
  const anchorRateEl = document.getElementById("anchorRate");

  const baseRateOut = document.getElementById("baseRateOut");
  const usageFeeOut = document.getElementById("usageFeeOut");
  const exclusivityFeeOut = document.getElementById("exclusivityFeeOut");
  const extrasFeeOut = document.getElementById("extrasFeeOut");
  const bundleRateOut = document.getElementById("bundleRateOut");

  const copyPitchBtn = document.getElementById("copyPitchBtn");
  const copyBreakdownBtn = document.getElementById("copyBreakdownBtn");

  /* State */
  let currentFormat = "yt-integration";
  let lastPitchEmail = "";
  let lastBreakdownText = "";

  /* Formatting Helper */
  function formatUSD(amount) {
    // Round to nearest $5 for clean professional quotes
    const clean = Math.round(amount / 5) * 5;
    return "$" + clean.toLocaleString("en-US");
  }

  /* Engagement Multiplier & Tier Badge */
  function getEngagementFactor(rate) {
    engagementValue.textContent = `${rate.toFixed(1)}%`;
    engagementTier.classList.remove("is-low", "is-viral");

    if (rate < 2.5) {
      engagementTier.textContent = "Below Avg";
      engagementTier.classList.add("is-low");
      return 0.85;
    }
    if (rate < 5) {
      engagementTier.textContent = "Strong";
      return 0.95 + (rate - 2.5) * 0.06; // ~0.95 to 1.10
    }
    if (rate < 9) {
      engagementTier.textContent = "High";
      return 1.10 + (rate - 5) * 0.045; // ~1.10 to 1.28
    }
    engagementTier.textContent = "Viral Tier";
    engagementTier.classList.add("is-viral");
    return Math.min(1.45, 1.28 + (rate - 9) * 0.03);
  }

  /* Core Calculation */
  function calculate() {
    const format = FORMAT_CONFIG[currentFormat];
    const avgViews = Math.max(0, Number(avgViewsInput.value) || 0);
    const engagementRate = Number(engagementSlider.value);
    const nicheCpm = NICHE_BASE_CPM[nicheSelect.value];
    const regionMult = REGION_MULTIPLIER[regionSelect.value];
    const engagementMult = getEngagementFactor(engagementRate);

    // 1. Base deliverable pricing
    const rawBase =
      (avgViews / 1000) * nicheCpm * format.cpmMultiplier * regionMult * engagementMult;
    const minProductionFloor = format.minFloor * Math.max(0.45, regionMult);
    const usedFloor = rawBase < minProductionFloor;
    const baseRate = usedFloor ? minProductionFloor : rawBase;

    // 2. Commercial add-ons (calculated as % of base deliverable)
    const usagePct = Number(usageSelect.value);
    const exclusivityPct = Number(exclusivitySelect.value);
    const rushPct = rushToggle.checked ? 0.25 : 0;
    const linkBioPct = linkBioToggle.checked ? 0.1 : 0;

    const usageFee = baseRate * usagePct;
    const exclusivityFee = baseRate * exclusivityPct;
    const extrasFee = baseRate * (rushPct + linkBioPct);

    const targetRate = baseRate + usageFee + exclusivityFee + extrasFee;
    const floorRate = targetRate * 0.8;
    const anchorRate = targetRate * 1.25;
    const bundleRate = targetRate * 3 * 0.85; // 3-post package with 15% discount
    const effectiveCpm = avgViews > 0 ? (targetRate / avgViews) * 1000 : 0;

    // 3. Update UI
    resultFormatBadge.textContent = format.label;
    effectiveCpmEl.textContent = `$${effectiveCpm.toFixed(2)}`;
    targetRateEl.textContent = formatUSD(targetRate);
    floorNote.hidden = !usedFloor;

    floorRateEl.textContent = formatUSD(floorRate);
    midRateEl.textContent = formatUSD(targetRate);
    anchorRateEl.textContent = formatUSD(anchorRate);

    baseRateOut.textContent = formatUSD(baseRate);
    usageFeeOut.textContent = usageFee > 0 ? `+${formatUSD(usageFee)}` : "$0";
    exclusivityFeeOut.textContent = exclusivityFee > 0 ? `+${formatUSD(exclusivityFee)}` : "$0";
    extrasFeeOut.textContent = extrasFee > 0 ? `+${formatUSD(extrasFee)}` : "$0";
    bundleRateOut.textContent = formatUSD(bundleRate);

    // 4. Build Copyable Texts
    const usageLabel = usageSelect.options[usageSelect.selectedIndex].text.split(" (")[0];
    const exclLabel = exclusivitySelect.options[exclusivitySelect.selectedIndex].text.split(" (")[0];
    const extrasList = [];
    if (rushToggle.checked) extrasList.push("Rush delivery (under 72h)");
    if (linkBioToggle.checked) extrasList.push("30-day Link in Bio & pinned comment");

    lastBreakdownText = [
      `ReachKit Sponsorship Rate Card — ${format.label}`,
      `Avg Views: ${avgViews.toLocaleString("en-US")} | Engagement: ${engagementRate.toFixed(1)}%`,
      `Base Deliverable: ${formatUSD(baseRate)}`,
      `Paid Usage (${usageLabel}): ${usageFee > 0 ? formatUSD(usageFee) : "$0"}`,
      `Exclusivity (${exclLabel}): ${exclusivityFee > 0 ? formatUSD(exclusivityFee) : "$0"}`,
      extrasList.length ? `Add-Ons (${extrasList.join(", ")}): ${formatUSD(extrasFee)}` : null,
      `---`,
      `Recommended Quote: ${formatUSD(targetRate)} (eCPM: $${effectiveCpm.toFixed(2)})`,
      `Negotiation Range: ${formatUSD(floorRate)} (Floor) – ${formatUSD(anchorRate)} (Anchor)`,
      `3-Deliverable Package (15% off): ${formatUSD(bundleRate)}`,
    ]
      .filter(Boolean)
      .join("\n");

    const includedItems = [`- 1x ${format.label}`];
    if (usagePct > 0) includedItems.push(`- ${usageLabel}`);
    if (exclusivityPct > 0) includedItems.push(`- ${exclLabel}`);
    if (rushToggle.checked) includedItems.push(`- Priority turnaround (under 72 hours)`);
    if (linkBioToggle.checked) includedItems.push(`- 30-day Link in Bio & pinned comment`);

    lastPitchEmail = [
      `Hi [Brand Name] Team,`,
      ``,
      `Thanks so much for reaching out — I'd love to partner with you on this campaign! My recent uploads average ${avgViews.toLocaleString("en-US")} views with a ${engagementRate.toFixed(1)}% engagement rate.`,
      ``,
      `Based on the scope we discussed, here is my rate for this collaboration:`,
      ...includedItems,
      `Total Investment: ${formatUSD(targetRate)}`,
      ``,
      `If you're looking for stronger conversion momentum, I also offer a 3-post bundle at ${formatUSD(bundleRate)} (15% package savings).`,
      ``,
      `Let me know how this aligns with your campaign budget, and I'd be happy to share creative concepts!`,
      ``,
      `Best regards,`,
      `[Your Name]`,
    ].join("\n");
  }

  /* Event Listeners */
  formatBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFormat = btn.dataset.format;
      formatBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", String(active));
      });
      calculate();
    });
  });

  avgViewsInput.addEventListener("input", () => {
    const val = Math.max(0, Number(avgViewsInput.value) || 0);
    avgViewsSlider.value = Math.min(val, Number(avgViewsSlider.max));
    calculate();
  });

  avgViewsSlider.addEventListener("input", () => {
    avgViewsInput.value = avgViewsSlider.value;
    calculate();
  });

  presetChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const val = Number(chip.dataset.views);
      avgViewsInput.value = val;
      avgViewsSlider.value = Math.min(val, Number(avgViewsSlider.max));
      calculate();
    });
  });

  [engagementSlider, nicheSelect, regionSelect, usageSelect, exclusivitySelect, rushToggle, linkBioToggle].forEach(
    (el) => {
      el.addEventListener("input", calculate);
      el.addEventListener("change", calculate);
    }
  );

  async function copyWithFeedback(button, text) {
    try {
      await navigator.clipboard.writeText(text);
      const original = button.textContent;
      button.textContent = "Copied!";
      setTimeout(() => {
        button.textContent = original;
      }, 1800);
    } catch {
      alert(text);
    }
  }

  copyPitchBtn.addEventListener("click", () => copyWithFeedback(copyPitchBtn, lastPitchEmail));
  copyBreakdownBtn.addEventListener("click", () => copyWithFeedback(copyBreakdownBtn, lastBreakdownText));

  // Initial Calculation
  calculate();
});