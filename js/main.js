document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
     1. Light / Dark Mode Toggle
     ========================================= */
  const themeToggle = document.getElementById("themeToggle");
  const rootEl = document.documentElement;

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = rootEl.getAttribute("data-theme") || "light";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      rootEl.setAttribute("data-theme", nextTheme);
      localStorage.setItem("reachkit-theme", nextTheme);
    });
  }

  /* =========================================
     2. Mobile Navigation Menu
     ========================================= */
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const navLinks = document.getElementById("navLinks");

  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  /* =========================================
     3. Tool Category Filter Tabs
     ========================================= */
  const filterTabs = document.querySelectorAll(".filter-tab");
  const toolCards = document.querySelectorAll(".tool-card");
  const navFilterLinks = document.querySelectorAll("[data-nav-filter]");

  function applyFilter(category) {
    // Update active tab state
    filterTabs.forEach((tab) => {
      const isMatch = tab.dataset.filter === category;
      tab.classList.toggle("active", isMatch);
      tab.setAttribute("aria-selected", String(isMatch));
    });

    // Show / hide matching tool cards
    toolCards.forEach((card) => {
      const matches = category === "all" || card.dataset.category === category;
      if (matches) {
        card.classList.remove("is-hidden");
        card.classList.remove("fade-in");
        void card.offsetWidth; // trigger reflow for smooth animation
        card.classList.add("fade-in");
      } else {
        card.classList.add("is-hidden");
      }
    });
  }

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      applyFilter(tab.dataset.filter);
    });
  });

  // Allow Header links ("Creators" / "Marketers") to filter & close mobile menu
  navFilterLinks.forEach((link) => {
    link.addEventListener("click", () => {
      applyFilter(link.dataset.navFilter);
      if (navLinks && navLinks.classList.contains("is-open")) {
        navLinks.classList.remove("is-open");
        mobileMenuToggle?.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* =========================================
     4. FAQ Accordion
     ========================================= */
  const faqButtons = document.querySelectorAll(".faq-question");

  faqButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isExpanded = btn.getAttribute("aria-expanded") === "true";
      const answer = btn.nextElementSibling;

      btn.setAttribute("aria-expanded", String(!isExpanded));
      if (answer) {
        answer.hidden = isExpanded;
      }
    });
  });

  /* =========================================
     5. Dynamic Footer Year
     ========================================= */
  const yearEl = document.getElementById("currentYear");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});