document.addEventListener("DOMContentLoaded", () => {
  /* Sample 60-Second Short-Form Script */
  const SAMPLE_SCRIPT = `[HOOK - Fast zoom in on screen]
Most creators lose half their audience in the first five seconds—not because their topic is boring, but because their script pacing is way too slow.

[B-ROLL - Show timeline cutting silence]
Here is the simple three-step formula top YouTube and TikTok editors use. First, open with a bold outcome in under ten words. No greetings, no channel intros—jump straight into the payoff.

[ON-SCREEN TEXT - 155 to 170 WPM]
Second, aim for around 140 to 160 spoken words for a sixty-second vertical video. That leaves just enough breathing room for sound effects, pauses, and visual punchlines without feeling rushed.

[CTA - Point to caption]
Finally, break your script into short two-sentence paragraphs so every beat hits on time. Bookmark this calculator before you hit record on your next upload!`;

  /* DOM References */
  const scriptInput = document.getElementById("scriptInput");
  const loadSampleBtn = document.getElementById("loadSampleBtn");
  const clearScriptBtn = document.getElementById("clearScriptBtn");
  const ignoreBracketsToggle = document.getElementById("ignoreBracketsToggle");
  const ignoredCountBadge = document.getElementById("ignoredCountBadge");

  const paceBtns = document.querySelectorAll(".pace-btn");
  const wpmSlider = document.getElementById("wpmSlider");
  const wpmValue = document.getElementById("wpmValue");
  const bufferSlider = document.getElementById("bufferSlider");
  const bufferValue = document.getElementById("bufferValue");

  const paceLabelBadge = document.getElementById("paceLabelBadge");
  const wpsDisplay = document.getElementById("wpsDisplay");
  const totalDurationOut = document.getElementById("totalDurationOut");
  const durationRangeOut = document.getElementById("durationRangeOut");

  const targetPills = document.querySelectorAll(".target-pill");
  const targetProgressBar = document.getElementById("targetProgressBar");
  const targetStatusText = document.getElementById("targetStatusText");

  const wordCountOut = document.getElementById("wordCountOut");
  const charCountOut = document.getElementById("charCountOut");
  const sentenceCountOut = document.getElementById("sentenceCountOut");
  const pureSpeechOut = document.getElementById("pureSpeechOut");

  const sectionCountBadge = document.getElementById("sectionCountBadge");
  const timelineList = document.getElementById("timelineList");

  const copyTimecodedBtn = document.getElementById("copyTimecodedBtn");
  const copySummaryBtn = document.getElementById("copySummaryBtn");

  /* State */
  let currentTargetSec = 60;
  let lastTimecodedScript = "";
  let lastSummaryText = "";

  /* Helpers */
  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDurationHuman(totalSeconds) {
    const sec = Math.max(0, Math.round(totalSeconds));
    if (sec < 60) return `${sec}s`;
    const mins = Math.floor(sec / 60);
    const remSec = sec % 60;
    if (mins < 60) {
      return remSec > 0 ? `${mins}m ${remSec}s` : `${mins}m`;
    }
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m ${remSec}s`;
  }

  function formatTimestamp(totalSeconds) {
    const sec = Math.max(0, Math.round(totalSeconds));
    const mins = Math.floor(sec / 60);
    const remSec = sec % 60;
    return `${mins}:${String(remSec).padStart(2, "0")}`;
  }

  function getPaceLabel(wpm) {
    if (wpm <= 125) return "Slow Storytelling Pace";
    if (wpm <= 155) return "Natural YouTube Pace";
    if (wpm <= 180) return "Fast Shorts / TikTok Pace";
    return "Rapid High-Energy Pace";
  }

  function stripBrackets(text) {
    const matches = text.match(/\[[^\]]*\]/g);
    const count = matches ? matches.length : 0;
    const cleaned = text.replace(/\[[^\]]*\]/g, " ");
    return { cleaned, count };
  }

  function countWords(text) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  }

  function countSentences(text) {
    const cleaned = text.trim();
    if (!cleaned) return 0;
    const parts = cleaned.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    return Math.max(1, parts.length);
  }

  /* Core Calculation */
  function calculate() {
    const rawText = scriptInput.value;
    const wpm = Number(wpmSlider.value) || 145;
    const bufferPct = Number(bufferSlider.value) || 0;
    const ignoreBrackets = ignoreBracketsToggle.checked;

    // Update slider readouts
    wpmValue.textContent = `${wpm} WPM`;
    bufferValue.textContent = `+${bufferPct}%`;
    paceLabelBadge.textContent = getPaceLabel(wpm);
    wpsDisplay.textContent = (wpm / 60).toFixed(1);

    // Sync active preset highlight
    paceBtns.forEach((btn) => {
      btn.classList.toggle("active", Number(btn.dataset.wpm) === wpm);
    });

    // Clean full text if ignoring [stage cues]
    let spokenText = rawText;
    let ignoredCount = 0;
    if (ignoreBrackets) {
      const res = stripBrackets(rawText);
      spokenText = res.cleaned;
      ignoredCount = res.count;
    }

    if (ignoreBrackets && ignoredCount > 0) {
      ignoredCountBadge.hidden = false;
      ignoredCountBadge.textContent = `${ignoredCount} cue${ignoredCount > 1 ? "s" : ""} ignored`;
    } else {
      ignoredCountBadge.hidden = true;
    }

    const words = countWords(spokenText);
    const chars = spokenText.replace(/\s+/g, " ").trim().length;
    const sentences = countSentences(spokenText);

    const bufferMult = 1 + bufferPct / 100;
    const pureSeconds = (words / wpm) * 60;
    const totalSeconds = pureSeconds * bufferMult;

    // Realistic +/- 12% pacing range
    const lowSeconds = totalSeconds * 0.88;
    const highSeconds = totalSeconds * 1.12;

    // Update Primary & Sub Metrics
    totalDurationOut.textContent = formatDurationHuman(totalSeconds);
    durationRangeOut.textContent =
      words > 0
        ? `${formatDurationHuman(lowSeconds)} – ${formatDurationHuman(highSeconds)}`
        : "0s – 0s";
    wordCountOut.textContent = words.toLocaleString("en-US");
    charCountOut.textContent = chars.toLocaleString("en-US");
    sentenceCountOut.textContent = sentences.toLocaleString("en-US");
    pureSpeechOut.textContent = formatDurationHuman(pureSeconds);

    // Update Target Fit Checker
    updateTargetFit(totalSeconds, words, wpm, bufferMult);

    // Build Section-by-Section Timestamps
    const paragraphs = rawText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const activeSections = [];
    let runningTime = 0;

    paragraphs.forEach((rawPara) => {
      const spokenPara = ignoreBrackets ? stripBrackets(rawPara).cleaned : rawPara;
      const paraWords = countWords(spokenPara);
      if (paraWords === 0) return;

      const paraSec = (paraWords / wpm) * 60 * bufferMult;
      const startSec = runningTime;
      const endSec = runningTime + paraSec;
      runningTime = endSec;

      activeSections.push({
        start: formatTimestamp(startSec),
        end: formatTimestamp(endSec),
        duration: formatDurationHuman(paraSec),
        words: paraWords,
        displayText: spokenPara.replace(/\s+/g, " ").trim(),
      });
    });

    sectionCountBadge.textContent = `${activeSections.length} section${activeSections.length === 1 ? "" : "s"}`;

    if (activeSections.length === 0) {
      timelineList.innerHTML = `
        <div class="timeline-empty">
          Paste a script above to automatically generate timecoded pacing beats for each paragraph.
        </div>
      `;
      lastTimecodedScript = "";
    } else {
      timelineList.innerHTML = activeSections
        .map(
          (sec, idx) => `
          <div class="timeline-item">
            <div class="timeline-stamp">
              <span class="stamp-range">${sec.start} – ${sec.end}</span>
              <span class="stamp-meta">Part ${idx + 1} · ${sec.words}w (${sec.duration})</span>
            </div>
            <p class="timeline-text">${escapeHTML(sec.displayText)}</p>
          </div>
        `
        )
        .join("");

      lastTimecodedScript = activeSections
        .map((sec) => `[${sec.start} – ${sec.end}] (${sec.words} words)\n${sec.displayText}`)
        .join("\n\n");
    }

    // Build Summary Copy Text
    lastSummaryText = [
      `ReachKit Script Pacing Summary`,
      `Estimated Video Length: ${formatDurationHuman(totalSeconds)} (Range: ${formatDurationHuman(lowSeconds)} – ${formatDurationHuman(highSeconds)})`,
      `Spoken Words: ${words.toLocaleString("en-US")} | Sentences: ${sentences} | Sections: ${activeSections.length}`,
      `Pacing Settings: ${wpm} WPM + ${bufferPct}% pause buffer`,
    ].join("\n");
  }

  function updateTargetFit(totalSeconds, words, wpm, bufferMult) {
    const pct = Math.min(100, (totalSeconds / currentTargetSec) * 100);
    targetProgressBar.style.width = `${pct.toFixed(1)}%`;
    targetProgressBar.classList.remove("is-warn", "is-over");

    if (words === 0) {
      targetStatusText.innerHTML = `Paste your script to check fit against a <strong>${formatDurationHuman(currentTargetSec)}</strong> target.`;
      return;
    }

    const diffSec = currentTargetSec - totalSeconds;
    const wordsPerEffectiveSec = wpm / (60 * bufferMult);

    if (diffSec >= 0) {
      if (pct >= 88) {
        targetProgressBar.classList.add("is-warn");
      }
      const roomWords = Math.round(diffSec * wordsPerEffectiveSec);
      targetStatusText.innerHTML = `<strong class="ok">Fits ${formatDurationHuman(currentTargetSec)} target</strong> — ${formatDurationHuman(diffSec)} remaining (~${roomWords} words of room).`;
    } else {
      targetProgressBar.classList.add("is-over");
      const overSec = Math.abs(diffSec);
      const trimWords = Math.max(1, Math.round(overSec * wordsPerEffectiveSec));
      targetStatusText.innerHTML = `<strong class="over">Over by ${formatDurationHuman(overSec)}</strong> — trim roughly <strong>${trimWords} words</strong> (or speed up delivery) to fit ${formatDurationHuman(currentTargetSec)}.`;
    }
  }

  /* Event Listeners */
  scriptInput.addEventListener("input", calculate);
  ignoreBracketsToggle.addEventListener("change", calculate);
  wpmSlider.addEventListener("input", calculate);
  bufferSlider.addEventListener("input", calculate);

  paceBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      wpmSlider.value = btn.dataset.wpm;
      calculate();
    });
  });

  targetPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      currentTargetSec = Number(pill.dataset.target);
      targetPills.forEach((p) => p.classList.toggle("active", p === pill));
      calculate();
    });
  });

  loadSampleBtn.addEventListener("click", () => {
    scriptInput.value = SAMPLE_SCRIPT;
    calculate();
  });

  clearScriptBtn.addEventListener("click", () => {
    scriptInput.value = "";
    scriptInput.focus();
    calculate();
  });

  async function copyWithFeedback(button, text, emptyMsg) {
    if (!text) {
      const original = button.textContent;
      button.textContent = emptyMsg;
      setTimeout(() => {
        button.textContent = original;
      }, 1600);
      return;
    }
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

  copyTimecodedBtn.addEventListener("click", () =>
    copyWithFeedback(copyTimecodedBtn, lastTimecodedScript, "Paste a script first!")
  );
  copySummaryBtn.addEventListener("click", () =>
    copyWithFeedback(copySummaryBtn, lastSummaryText, "Paste a script first!")
  );

  // Initialize
  calculate();
});