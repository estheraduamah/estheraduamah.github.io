/* ============================================================
   ESTHER ADUAMAH — SHARED SITE INTERACTIONS
   ============================================================ */

// 1. LIVE CLOCK & DATE (index.html & blog.html)
function updateDateline() {
  const timeEl = document.getElementById("live-time");
  const dateEl = document.getElementById("live-date");
  if (!timeEl || !dateEl) return;

  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  timeEl.textContent = `${hours}:${minutes}${ampm}`;

  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  dateEl.textContent = now
    .toLocaleDateString("en-US", dateOptions)
    .toUpperCase();
}
updateDateline();
setInterval(updateDateline, 1000);

// 2. CLIPBOARD EMAIL COPY
function copyEmail(triggerBtn) {
  const address = "estheraduamah1@gmail.com";
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(address).catch(() => {});
  } else {
    const tempInput = document.createElement("input");
    tempInput.value = address;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
  }

  if (triggerBtn) {
    const tooltip = triggerBtn.querySelector(".copy-tooltip");
    if (tooltip) {
      tooltip.classList.add("visible");
      clearTimeout(triggerBtn._copyTimer);
      triggerBtn._copyTimer = setTimeout(() => {
        tooltip.classList.remove("visible");
      }, 1900);
    }
  }
}

// 3. SECOND HEADER: DESIGN QUESTIONS + SCRAMBLETEXT (index.html)
const QUESTION_BATCHES = [
  [
    {
      label: "Should I use this or my mind?",
      href: "should-i-use-this.html#:~:text=Should%20I%20use%20this%20or%20my%20mind%3F"
    },
    {
      label: "When does AI support vs. replace autonomy?",
      href: "should-i-use-this.html#:~:text=when%20AI%20assistance%20supports%20independence%20versus%20replacing%20it"
    },
    {
      label: "How do spatial boundaries encode health inequity?",
      href: "geospatial-redlining.html#:~:text=historical%20redlining%20boundaries%20continue%20to%20shape%20environmental%20exposure"
    }
  ],
  [
    {
      label: "Can radiomics decode tumor biology?",
      href: "radiomics-spatial.html#:~:text=macro-level%20radiomic%20descriptors%20are%20rarely%20mapped%20onto%20underlying%20cellular%20gene%20expression"
    },
    {
      label: "How can AR guide hands-on kitchen tasks?",
      href: "holo-kitchen.html#:~:text=spatial%20cues%20anchored%20directly%20within%20the%20cook%27s%20field%20of%20view"
    },
    {
      label: "How do we rebuild clinical trial trust?",
      href: "clinical-trial-equity.html#:~:text=exclusion%20criteria%2C%20uncompensated%20participation%20burdens%2C%20and%20opaque%20informed%20consent%20documents"
    }
  ]
];

let currentQuestionBatch = 0;
let isQuestionRibbonHovered = false;
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/+-=*#?";

function scrambleText(el, targetText, duration = 760) {
  if (el._scrambleRaf) {
    cancelAnimationFrame(el._scrambleRaf);
  }
  const startTime = performance.now();
  const length = targetText.length;
  let lastStep = -1;

  function frame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const revealedCount = Math.floor(Math.pow(progress, 1.15) * length);
    const step = Math.floor(elapsed / 32);

    if (step !== lastStep || progress >= 1) {
      lastStep = step;
      let output = "";
      for (let i = 0; i < length; i++) {
        const ch = targetText[i];
        if (ch === " " || ch === "?" || ch === "." || ch === "," || ch === "’" || ch === "'") {
          output += ch;
        } else if (i < revealedCount) {
          output += ch;
        } else if (progress < 0.28 || i < revealedCount + 12) {
          output += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        } else {
          output += ch;
        }
      }
      el.textContent = output;
    }

    if (progress < 1) {
      el._scrambleRaf = requestAnimationFrame(frame);
    } else {
      el.textContent = targetText;
      el._scrambleRaf = null;
    }
  }

  el._scrambleRaf = requestAnimationFrame(frame);
}

function renderQuestionBatch(batchIndex, animate = false) {
  const listEl = document.getElementById("questions-list");
  const dotsContainer = document.getElementById("questions-cycle-dots");
  if (!listEl || !dotsContainer) return;

  currentQuestionBatch = (batchIndex + QUESTION_BATCHES.length) % QUESTION_BATCHES.length;
  const batch = QUESTION_BATCHES[currentQuestionBatch];
  const links = listEl.querySelectorAll(".question-link");

  links.forEach((link, i) => {
    const item = batch[i];
    link.classList.remove("active-question");
    if (!item) {
      link.style.display = "none";
      return;
    }
    link.style.display = "inline-block";
    link.setAttribute("href", item.href);

    if (animate) {
      setTimeout(() => scrambleText(link, item.label, 760), i * 70);
    } else {
      link.textContent = item.label;
    }
  });

  dotsContainer.innerHTML = QUESTION_BATCHES.map(
    (_, idx) =>
      `<button type="button" class="cycle-dot ${idx === currentQuestionBatch ? "active" : ""}" aria-label="Question set ${idx + 1}" onclick="renderQuestionBatch(${idx}, true)"></button>`
  ).join("");
}

(function initQuestionsRibbon() {
  const questionsRibbon = document.getElementById("questions-ribbon");
  if (!questionsRibbon) return;

  questionsRibbon.addEventListener("mouseenter", () => {
    isQuestionRibbonHovered = true;
  });
  questionsRibbon.addEventListener("mouseleave", () => {
    isQuestionRibbonHovered = false;
  });

  renderQuestionBatch(0, false);
  setInterval(() => {
    if (!isQuestionRibbonHovered) {
      renderQuestionBatch(currentQuestionBatch + 1, true);
    }
  }, 60000);
})();

// 4. PUBLICATIONS MODAL (index.html)
function openPubModal() {
  const pubModal = document.getElementById("pub-modal");
  if (pubModal) pubModal.classList.add("open");
}

function closePubModal() {
  const pubModal = document.getElementById("pub-modal");
  if (pubModal) pubModal.classList.remove("open");
}

(function initModalAndShortcuts() {
  const pubModal = document.getElementById("pub-modal");
  if (pubModal) {
    pubModal.addEventListener("click", (e) => {
      if (e.target === pubModal) closePubModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (pubModal && pubModal.classList.contains("open")) {
        closePubModal();
      } else if (document.body.classList.contains("case-page-body")) {
        window.location.href = "index.html";
      }
    } else if (document.body.classList.contains("case-page-body")) {
      if (e.key === "ArrowLeft") {
        const prev = document.querySelector(".case-arrow.prev");
        if (prev) window.location.href = prev.getAttribute("href");
      } else if (e.key === "ArrowRight") {
        const next = document.querySelector(".case-arrow.next");
        if (next) window.location.href = next.getAttribute("href");
      }
    }
  });
})();

// 5. READING PROGRESS BAR ON STANDALONE PROJECT PAGES
(function initCaseProgressBar() {
  const fill = document.getElementById("case-progress-fill");
  if (!fill) return;

  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = maxScroll > 0 ? Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100)) : 0;
    fill.style.width = `${pct}%`;
  }

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  updateScrollProgress();
})();

// 6. BLOG CATEGORY FILTERING (blog.html)
function filterBlogPosts(category, btnEl) {
  const buttons = document.querySelectorAll(".blog-filter-btn");
  buttons.forEach((b) => b.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");

  // Switch lead essay by active tab
  const leadArticles = document.querySelectorAll("[data-tab-lead]");
  leadArticles.forEach((article) => {
    article.style.display =
      article.getAttribute("data-tab-lead") === category ? "" : "none";
  });

  // Filter story cards
  const storyCards = document.querySelectorAll("[data-category]");
  storyCards.forEach((card) => {
    if (category === "all" || card.getAttribute("data-category") === category) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });

  // Filter Reading & Reference Shelf
  const shelfItems = document.querySelectorAll("[data-shelf-category]");
  shelfItems.forEach((item) => {
    if (
      category === "all" ||
      item.getAttribute("data-shelf-category") === category
    ) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
}