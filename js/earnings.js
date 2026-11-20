document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
     2026 RPM Benchmark Model (Base = Tier 1 USD)
     ========================================= */
  const PLATFORM_CONFIG = {
    "yt-long": {
      label: "YouTube Long-Form",
      note: "Based on monetized playback RPM for videos 8+ minutes with mid-roll ads enabled.",
      spreadLow: 0.75,
      spreadHigh: 1.35,
      niches: {
        finance: 16.5,
        marketing: 12.0,
        tech: 7.5,
        education: 6.0,
        lifestyle: 4.2,
        storytelling: 3.4,
        gaming: 2.6,
        entertainment: 2.3,
      },
    },
    "yt-shorts": {
      label: "YouTube Shorts",
      note: "Shorts Pool RPM is significantly lower than long-form and varies less by niche.",
      spreadLow: 0.7,
      spreadHigh: 1.4,
      niches: {
        finance: 0.12,
        marketing: 0.11,
        tech: 0.09,
        education: 0.08,
        lifestyle: 0.07,
        storytelling: 0.07,
        gaming: 0.06,
        entertainment: 0.06,
      },
    },
    "tiktok-crp": {
      label: "TikTok Creator Rewards",
      note: "Applies to original 1+ minute videos in eligible CRP regions. Adjusted by your Qualified Views %.",
      spreadLow: 0.75,
      spreadHigh: 1.35,
      niches: {
        finance: 1.35,
        marketing: 1.15,
        tech: 1.0,
        education: 0.85,
        lifestyle: 0.75,
        storytelling: 0.72,
        gaming: 0.55,
        entertainment: 0.52,
      },
    },
  };

  const REGION_MULTIPLIER = {
    tier1: 1.0,   // US, UK, CA, AU
    tier2: 0.65,  // Japan, Korea, Western EU
    global: 0.48, // Mixed global traffic
    tier3: 0.18,  // SEA, India, LATAM
  };

  /* DOM References */
  const platformTabs = document.querySelectorAll(".platform-tab");
  const platformNote = document.getElementById("platformNote");
  const viewsInput = document.getElementById("viewsInput");
  const viewsSlider = document.getElementById("viewsSlider");
  const presetChips = document.querySelectorAll(".preset-chip");
  const nicheSelect = document.getElementById("nicheSelect");
  const regionSelect = document.getElementById("regionSelect");

  const qualifiedBox = document.getElementById("qualifiedBox");
  const qualifiedSlider = document.getElementById("qualifiedSlider");
  const qualifiedValue = document.getElementById("qualifiedValue");

  const customRpmToggle = document.getElementById("customRpmToggle");
  const customRpmBox = document.getElementById("customRpmBox");
  const customRpmInput = document.getElementById("customRpmInput");

  const resultPlatformBadge = document.getElementById("resultPlatformBadge");
  const effectiveRpmDisplay = document.getElementById("effectiveRpmDisplay");
  const monthlyMid = document.getElementById("monthlyMid");
  const monthlyRange = document.getElementById("monthlyRange");
  const dailyEst = document.getElementById("dailyEst");
  const yearlyEst = document.getElementById("yearlyEst");
  const dailyViewsMetricBox = document.getElementById("dailyViewsMetricBox");
  const dailyViewsEst = document.getElementById("dailyViewsEst");
  const qualifiedMetricBox = document.getElementById("qualifiedMetricBox");
  const qualifiedViewsEst = document.getElementById("qualifiedViewsEst");

  const goalPills = document.querySelectorAll(".goal-pill");
  const goalViewsOutput = document.getElementById("goalViewsOutput");
  const goalNote = document.getElementById("goalNote");
  const copyResultBtn = document.getElementById("copyResultBtn");

  /* State */
  let currentPlatform = "yt-long";
  let currentGoal = 1000;
  let lastSummaryText = "";

  /* Formatting Helpers */
  function formatCurrency(num) {
    if (num < 100) {
      return "$" + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return "$" + Math.round(num).toLocaleString("en-US");
  }

  function formatCompactNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2).replace(/\.00$/, "") + "M";
    }
    return Math.round(num).toLocaleString("en-US");
  }

  /* Core Calculation */
  function calculate() {
    const config = PLATFORM_CONFIG[currentPlatform];
    const monthlyViews = Math.max(0, Number(viewsInput.value) || 0);
    const niche = nicheSelect.value;
    const region = regionSelect.value;
    const isTikTok = currentPlatform === "tiktok-crp";
    const qualifiedPct = isTikTok ? Number(qualifiedSlider.value) / 100 : 1;

    let baseRpm;
    if (customRpmToggle.checked) {
      baseRpm = Math.max(0.01, Number(customRpmInput.value) || 0.01);
    } else {
      baseRpm = config.niches[niche] * REGION_MULTIPLIER[region];
    }

    const billableViews = monthlyViews * qualifiedPct;
    const estMonthly = (billableViews / 1000) * baseRpm;
    const lowMonthly = customRpmToggle.checked ? estMonthly * 0.9 : estMonthly * config.spreadLow;
    const highMonthly = customRpmToggle.checked ? estMonthly * 1.1 : estMonthly * config.spreadHigh;

    const estDaily = estMonthly / 30;
    const estYearly = estMonthly * 12;

    // Update Main UI
    resultPlatformBadge.textContent = config.label;
    effectiveRpmDisplay.textContent = `$${baseRpm.toFixed(2)}`;
    monthlyMid.textContent = formatCurrency(estMonthly);
    monthlyRange.textContent = `${formatCurrency(lowMonthly)} – ${formatCurrency(highMonthly)}`;
    dailyEst.textContent = formatCurrency(estDaily);
    yearlyEst.textContent = formatCurrency(estYearly);

    if (isTikTok) {
      qualifiedMetricBox.hidden = false;
      dailyViewsMetricBox.hidden = true;
      qualifiedViewsEst.textContent = formatCompactNumber(billableViews);
    } else {
      qualifiedMetricBox.hidden = true;
      dailyViewsMetricBox.hidden = false;
      dailyViewsEst.textContent = formatCompactNumber(monthlyViews / 30);
    }

    // Goal Planner Calculation
    const requiredBillableViews = (currentGoal / baseRpm) * 1000;
    const requiredTotalViews = requiredBillableViews / qualifiedPct;
    goalViewsOutput.textContent = formatCompactNumber(requiredTotalViews);
    goalNote.textContent = isTikTok
      ? `total monthly views (~${Math.round(qualifiedPct * 100)}% qualified)`
      : `monthly views at $${baseRpm.toFixed(2)} RPM`;

    // Build Clipboard Summary
    lastSummaryText = [
      `ReachKit Revenue Estimate (${config.label})`,
      `Monthly Views: ${monthlyViews.toLocaleString("en-US")}`,
      isTikTok ? `Qualified Views (${Math.round(qualifiedPct * 100)}%): ${Math.round(billableViews).toLocaleString("en-US")}` : null,
      `Estimated RPM: $${baseRpm.toFixed(2)}`,
      `Monthly Estimate: ${formatCurrency(estMonthly)} (Range: ${formatCurrency(lowMonthly)} – ${formatCurrency(highMonthly)})`,
      `Yearly Projection: ${formatCurrency(estYearly)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  /* Event Listeners */
  platformTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      currentPlatform = tab.dataset.platform;
      const config = PLATFORM_CONFIG[currentPlatform];
      platformNote.textContent = config.note;

      platformTabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("active", active);
        t.setAttribute("aria-selected", String(active));
      });

      qualifiedBox.hidden = currentPlatform !== "tiktok-crp";
      calculate();
    });
  });

  // Sync Number Input & Slider
  viewsInput.addEventListener("input", () => {
    const val = Math.max(0, Number(viewsInput.value) || 0);
    viewsSlider.value = Math.min(val, Number(viewsSlider.max));
    calculate();
  });

  viewsSlider.addEventListener("input", () => {
    viewsInput.value = viewsSlider.value;
    calculate();
  });

  presetChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const val = Number(chip.dataset.views);
      viewsInput.value = val;
      viewsSlider.value = Math.min(val, Number(viewsSlider.max));
      calculate();
    });
  });

  nicheSelect.addEventListener("change", calculate);
  regionSelect.addEventListener("change", calculate);

  qualifiedSlider.addEventListener("input", () => {
    qualifiedValue.textContent = `${qualifiedSlider.value}%`;
    calculate();
  });

  customRpmToggle.addEventListener("change", () => {
    customRpmBox.hidden = !customRpmToggle.checked;
    // Pre-fill custom RPM box with current auto-calculated RPM for smooth UX
    if (customRpmToggle.checked) {
      const autoRpm =
        PLATFORM_CONFIG[currentPlatform].niches[nicheSelect.value] *
        REGION_MULTIPLIER[regionSelect.value];
      customRpmInput.value = autoRpm.toFixed(2);
    }
    calculate();
  });

  customRpmInput.addEventListener("input", calculate);

  goalPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      currentGoal = Number(pill.dataset.goal);
      goalPills.forEach((p) => p.classList.toggle("active", p === pill));
      calculate();
    });
  });

  copyResultBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(lastSummaryText);
      const original = copyResultBtn.textContent;
      copyResultBtn.textContent = "Copied to Clipboard!";
      setTimeout(() => {
        copyResultBtn.textContent = original;
      }, 1800);
    } catch {
      alert(lastSummaryText);
    }
  });

  // Initial Calculation
  calculate();
});