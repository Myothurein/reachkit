document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
     Platform Safe-Zone Specs (Base: 1080 x 1920)
     ========================================= */
  const PLATFORMS = {
    tiktok: {
      name: "TikTok",
      topPx: 150,
      bottomPx: 430,
      rightPx: 140,
      leftPx: 40,
      mockupHTML: `
        <div class="mock-top">
          <div class="mock-top-center">
            <span class="mock-muted">Following</span>
            <span>For You</span>
          </div>
          <span>🔍</span>
        </div>
        <div class="mock-right">
          <div class="mock-avatar"></div>
          <div class="mock-action"><span>♥</span><span>42.8K</span></div>
          <div class="mock-action"><span>💬</span><span>618</span></div>
          <div class="mock-action"><span>🔖</span><span>3,104</span></div>
          <div class="mock-action"><span>↗</span><span>1,240</span></div>
        </div>
        <div class="mock-bottom">
          <div class="mock-user">@reachkit.creator</div>
          <div class="mock-caption">Always check your safe zones before exporting your vertical edits #creatortips</div>
          <div class="mock-audio">♫ Original Sound — ReachKit Studio</div>
        </div>
        <div class="mock-nav">
          <span>Home</span><span>Friends</span><span>＋</span><span>Inbox</span><span>Profile</span>
        </div>
      `,
    },
    reels: {
      name: "Instagram Reels",
      topPx: 190,
      bottomPx: 420,
      rightPx: 140,
      leftPx: 40,
      mockupHTML: `
        <div class="mock-top">
          <span style="font-size:0.85rem;font-weight:700;">Reels</span>
          <span>📷</span>
        </div>
        <div class="mock-right">
          <div class="mock-action"><span>♡</span><span>18.4K</span></div>
          <div class="mock-action"><span>💬</span><span>245</span></div>
          <div class="mock-action"><span>➤</span><span>912</span></div>
          <div class="mock-action"><span>•••</span></div>
        </div>
        <div class="mock-bottom">
          <div class="mock-user">
            <span class="mock-avatar" style="width:20px;height:20px;"></span>
            <span>reachkit_hq</span>
            <span style="border:1px solid #fff;padding:1px 6px;border-radius:4px;font-size:0.6rem;">Follow</span>
          </div>
          <div class="mock-caption">Clean framing increases watch time. Keep captions above this line... more</div>
          <div class="mock-audio">♫ Trending Audio · Original</div>
        </div>
        <div class="mock-nav">
          <span>Home</span><span>Search</span><span>Reels</span><span>Shop</span><span>Profile</span>
        </div>
      `,
    },
    shorts: {
      name: "YouTube Shorts",
      topPx: 150,
      bottomPx: 380,
      rightPx: 140,
      leftPx: 40,
      mockupHTML: `
        <div class="mock-top">
          <span style="font-size:0.85rem;font-weight:700;">Shorts</span>
          <span>🔍   ⋮</span>
        </div>
        <div class="mock-right">
          <div class="mock-action"><span>👍</span><span>29K</span></div>
          <div class="mock-action"><span>👎</span><span>Dislike</span></div>
          <div class="mock-action"><span>💬</span><span>412</span></div>
          <div class="mock-action"><span>↗</span><span>Share</span></div>
          <div class="mock-action"><span>↻</span><span>Remix</span></div>
        </div>
        <div class="mock-bottom">
          <div class="mock-user">
            <span class="mock-avatar" style="width:22px;height:22px;"></span>
            <span>@ReachKit</span>
            <span class="mock-sub-pill">Subscribe</span>
          </div>
          <div class="mock-caption">Stop letting YouTube Shorts buttons block your subtitles!</div>
          <div class="mock-audio">♫ Original audio - ReachKit</div>
        </div>
        <div class="mock-nav">
          <span>Home</span><span>Shorts</span><span>＋</span><span>Subs</span><span>You</span>
        </div>
      `,
    },
  };

  /* DOM References */
  const platformTabs = document.querySelectorAll(".platform-tab");
  const uploadZone = document.getElementById("uploadZone");
  const fileInput = document.getElementById("fileInput");
  const browseBtn = document.getElementById("browseBtn");
  const sampleBtn = document.getElementById("sampleBtn");
  const resetBtn = document.getElementById("resetBtn");

  const phoneFrame = document.getElementById("phoneFrame");
  const samplePlaceholder = document.getElementById("samplePlaceholder");
  const previewImg = document.getElementById("previewImg");
  const previewVideo = document.getElementById("previewVideo");

  const videoControls = document.getElementById("videoControls");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const videoStatus = document.getElementById("videoStatus");

  const dangerLayer = document.getElementById("dangerLayer");
  const dangerTop = document.getElementById("dangerTop");
  const dangerBottom = document.getElementById("dangerBottom");
  const dangerRight = document.getElementById("dangerRight");
  const dangerLeft = document.getElementById("dangerLeft");
  const safeBox = document.getElementById("safeBox");
  const mockupOverlay = document.getElementById("mockupOverlay");
  const gridOverlay = document.getElementById("gridOverlay");

  const toggleDanger = document.getElementById("toggleDanger");
  const toggleMockup = document.getElementById("toggleMockup");
  const toggleGrid = document.getElementById("toggleGrid");
  const opacityRange = document.getElementById("opacityRange");
  const opacityValue = document.getElementById("opacityValue");
  const fitCoverBtn = document.getElementById("fitCoverBtn");
  const fitContainBtn = document.getElementById("fitContainBtn");
  const exportBtn = document.getElementById("exportBtn");

  const specPlatformName = document.getElementById("specPlatformName");
  const specTop = document.getElementById("specTop");
  const specBottom = document.getElementById("specBottom");
  const specRight = document.getElementById("specRight");
  const specSafeArea = document.getElementById("specSafeArea");

  /* State */
  let currentPlatform = "tiktok";
  let currentMediaType = "none"; // "none" | "image" | "video"
  let currentObjectURL = null;
  let currentFit = "cover";

  /* =========================================
     1. Apply Platform Safe-Zone Geometry
     ========================================= */
  function applyPlatform(key) {
    currentPlatform = key;
    const spec = PLATFORMS[key];

    const topPct = (spec.topPx / 1920) * 100;
    const bottomPct = (spec.bottomPx / 1920) * 100;
    const rightPct = (spec.rightPx / 1080) * 100;
    const leftPct = (spec.leftPx / 1080) * 100;

    // Position danger masks
    dangerTop.style.height = `${topPct}%`;
    dangerBottom.style.height = `${bottomPct}%`;

    dangerRight.style.top = `${topPct}%`;
    dangerRight.style.bottom = `${bottomPct}%`;
    dangerRight.style.width = `${rightPct}%`;

    dangerLeft.style.top = `${topPct}%`;
    dangerLeft.style.bottom = `${bottomPct}%`;
    dangerLeft.style.width = `${leftPct}%`;

    // Position green safe box
    safeBox.style.top = `${topPct}%`;
    safeBox.style.bottom = `${bottomPct}%`;
    safeBox.style.left = `${leftPct}%`;
    safeBox.style.right = `${rightPct}%`;

    // Update UI Mockup
    mockupOverlay.innerHTML = spec.mockupHTML;
    phoneFrame.setAttribute("data-platform", key);

    // Update Specs Card
    const safeW = 1080 - spec.leftPx - spec.rightPx;
    const safeH = 1920 - spec.topPx - spec.bottomPx;
    specPlatformName.textContent = spec.name;
    specTop.textContent = `${spec.topPx} px`;
    specBottom.textContent = `${spec.bottomPx} px`;
    specRight.textContent = `${spec.rightPx} px`;
    specSafeArea.textContent = `${safeW}×${safeH} px`;

    // Update active tab UI
    platformTabs.forEach((tab) => {
      const active = tab.dataset.platform === key;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });
  }

  platformTabs.forEach((tab) => {
    tab.addEventListener("click", () => applyPlatform(tab.dataset.platform));
  });

  /* =========================================
     2. Media Upload (Image / Video) & Demo
     ========================================= */
  function clearMediaURL() {
    if (currentObjectURL) {
      URL.revokeObjectURL(currentObjectURL);
      currentObjectURL = null;
    }
  }

  function handleFile(file) {
    if (!file) return;
    clearMediaURL();

    const url = URL.createObjectURL(file);
    currentObjectURL = url;

    if (file.type.startsWith("image/")) {
      currentMediaType = "image";
      previewImg.src = url;
      previewImg.hidden = false;
      previewVideo.hidden = true;
      previewVideo.pause();
      previewVideo.removeAttribute("src");
      samplePlaceholder.hidden = true;
      videoControls.hidden = true;
      resetBtn.hidden = false;
    } else if (file.type.startsWith("video/")) {
      currentMediaType = "video";
      previewVideo.src = url;
      previewVideo.hidden = false;
      previewImg.hidden = true;
      samplePlaceholder.hidden = true;
      videoControls.hidden = false;
      resetBtn.hidden = false;
      playPauseBtn.textContent = "Pause Video";
      videoStatus.textContent = "Playing muted loop";
      previewVideo.play().catch(() => {});
    } else {
      alert("Please upload a valid image (PNG, JPG, WebP) or video (MP4, WebM) file.");
    }
  }

  // Generate an in-browser 1080x1920 Demo Thumbnail so users can test export & fit immediately
  function loadDemoImage() {
    clearMediaURL();
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
    grad.addColorStop(0, "#1e1b4b");
    grad.addColorStop(0.5, "#4338ca");
    grad.addColorStop(1, "#0f172a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative glow
    const rad = ctx.createRadialGradient(540, 820, 60, 540, 820, 520);
    rad.addColorStop(0, "rgba(99, 102, 241, 0.45)");
    rad.addColorStop(1, "rgba(99, 102, 241, 0)");
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Sample safe-zone headline
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "bold 76px Inter, sans-serif";
    ctx.fillText("3 EDITING TIPS", 540, 740);
    ctx.fillText("FOR HIGHER VIEWS", 540, 835);

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "500 40px Inter, sans-serif";
    ctx.fillText("Safe caption area check", 540, 940);

    // Example subtitle placed intentionally near bottom to test overlap
    ctx.fillStyle = "#fde047";
    ctx.font = "bold 52px Inter, sans-serif";
    ctx.fillText("THIS SUBTITLE IS SAFE", 540, 1380);

    currentMediaType = "image";
    previewImg.src = canvas.toDataURL("image/png");
    previewImg.hidden = false;
    previewVideo.hidden = true;
    previewVideo.pause();
    samplePlaceholder.hidden = true;
    videoControls.hidden = true;
    resetBtn.hidden = false;
  }

  function resetPreview() {
    clearMediaURL();
    currentMediaType = "none";
    previewImg.hidden = true;
    previewImg.removeAttribute("src");
    previewVideo.hidden = true;
    previewVideo.pause();
    previewVideo.removeAttribute("src");
    samplePlaceholder.hidden = false;
    videoControls.hidden = true;
    resetBtn.hidden = true;
    fileInput.value = "";
  }

  browseBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
  sampleBtn.addEventListener("click", loadDemoImage);
  resetBtn.addEventListener("click", resetPreview);

  // Drag & Drop handlers
  ["dragenter", "dragover"].forEach((evt) => {
    uploadZone.addEventListener(evt, (e) => {
      e.preventDefault();
      uploadZone.classList.add("is-dragover");
    });
  });

  ["dragleave", "drop"].forEach((evt) => {
    uploadZone.addEventListener(evt, (e) => {
      e.preventDefault();
      uploadZone.classList.remove("is-dragover");
    });
  });

  uploadZone.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files[0];
    handleFile(file);
  });

  // Video Play/Pause
  playPauseBtn.addEventListener("click", () => {
    if (previewVideo.paused) {
      previewVideo.play();
      playPauseBtn.textContent = "Pause Video";
      videoStatus.textContent = "Playing muted loop";
    } else {
      previewVideo.pause();
      playPauseBtn.textContent = "Play Video";
      videoStatus.textContent = "Paused (ready to export frame)";
    }
  });

  /* =========================================
     3. Overlay & Fit Controls
     ========================================= */
  toggleDanger.addEventListener("change", () => {
    dangerLayer.hidden = !toggleDanger.checked;
  });

  toggleMockup.addEventListener("change", () => {
    mockupOverlay.hidden = !toggleMockup.checked;
  });

  toggleGrid.addEventListener("change", () => {
    gridOverlay.hidden = !toggleGrid.checked;
  });

  opacityRange.addEventListener("input", () => {
    const val = opacityRange.value;
    opacityValue.textContent = `${val}%`;
    dangerLayer.style.setProperty("--danger-opacity", (val / 100).toFixed(2));
  });

  fitCoverBtn.addEventListener("click", () => {
    currentFit = "cover";
    phoneFrame.classList.remove("fit-contain");
    fitCoverBtn.classList.add("active");
    fitContainBtn.classList.remove("active");
  });

  fitContainBtn.addEventListener("click", () => {
    currentFit = "contain";
    phoneFrame.classList.add("fit-contain");
    fitContainBtn.classList.add("active");
    fitCoverBtn.classList.remove("active");
  });

  /* =========================================
     4. Export 1080x1920 Safe-Zone Proof PNG
     ========================================= */
  function drawMediaOnCanvas(ctx, media, mediaW, mediaH, targetW, targetH, fit) {
    const mediaRatio = mediaW / mediaH;
    const targetRatio = targetW / targetH;
    let drawW, drawH, offsetX, offsetY;

    if (
      (fit === "cover" && mediaRatio > targetRatio) ||
      (fit === "contain" && mediaRatio < targetRatio)
    ) {
      drawH = targetH;
      drawW = targetH * mediaRatio;
    } else {
      drawW = targetW;
      drawH = targetW / mediaRatio;
    }

    offsetX = (targetW - drawW) / 2;
    offsetY = (targetH - drawH) / 2;
    ctx.drawImage(media, offsetX, offsetY, drawW, drawH);
  }

  exportBtn.addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");

    // 1. Base background
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Draw user media (or fallback gradient if none)
    if (currentMediaType === "image" && previewImg.naturalWidth > 0) {
      drawMediaOnCanvas(ctx, previewImg, previewImg.naturalWidth, previewImg.naturalHeight, 1080, 1920, currentFit);
    } else if (currentMediaType === "video" && previewVideo.videoWidth > 0) {
      drawMediaOnCanvas(ctx, previewVideo, previewVideo.videoWidth, previewVideo.videoHeight, 1080, 1920, currentFit);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
      grad.addColorStop(0, "#1e1b4b");
      grad.addColorStop(1, "#0f172a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);
    }

    // 3. Draw Safe-Zone Danger Overlays
    const spec = PLATFORMS[currentPlatform];
    const alpha = parseInt(opacityRange.value, 10) / 100;

    if (toggleDanger.checked) {
      ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
      // Top
      ctx.fillRect(0, 0, 1080, spec.topPx);
      // Bottom
      ctx.fillRect(0, 1920 - spec.bottomPx, 1080, spec.bottomPx);
      // Right
      ctx.fillRect(1080 - spec.rightPx, spec.topPx, spec.rightPx, 1920 - spec.topPx - spec.bottomPx);
      // Left
      ctx.fillRect(0, spec.topPx, spec.leftPx, 1920 - spec.topPx - spec.bottomPx);

      // Green Dashed Safe Box
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 6;
      ctx.setLineDash([18, 12]);
      ctx.strokeRect(
        spec.leftPx,
        spec.topPx,
        1080 - spec.leftPx - spec.rightPx,
        1920 - spec.topPx - spec.bottomPx
      );
      ctx.setLineDash([]);

      // Label inside Safe Box
      ctx.fillStyle = "rgba(22, 163, 74, 0.9)";
      ctx.fillRect(spec.leftPx + 18, spec.topPx + 18, 390, 52);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px Inter, sans-serif";
      ctx.fillText(`${spec.name.toUpperCase()} SAFE ZONE`, spec.leftPx + 36, spec.topPx + 53);
    }

    // 4. Optional Rule of Thirds Grid
    if (toggleGrid.checked) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 3;
      [360, 720].forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1920);
        ctx.stroke();
      });
      [640, 1280].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1080, y);
        ctx.stroke();
      });
    }

    // 5. Trigger PNG download
    const link = document.createElement("a");
    link.download = `reachkit-${currentPlatform}-safe-zone.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });

  // Initialize Default View
  applyPlatform("tiktok");
});