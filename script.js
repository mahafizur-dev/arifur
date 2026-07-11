/* ============================================================
   H M Arifur Rahman — Portfolio
   Interactions: scroll reveal, stat counters, theme, print
   ============================================================ */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* --------------------------------------------------------
     1. THEME TOGGLE (persists via localStorage)
     -------------------------------------------------------- */
  const themeToggle = document.getElementById("themeToggle");
  const root = document.documentElement;
  const THEME_KEY = "ar-portfolio-theme";

  function applyTheme(theme) {
    const isDark = theme === "dark";
    root.setAttribute("data-theme", isDark ? "dark" : "light");
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme",
      );
      const icon = themeToggle.querySelector("i");
      if (icon) icon.className = isDark ? "ti ti-sun" : "ti ti-moon";
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", isDark ? "#1c0710" : "#3A0519");
  }

  // Initial theme: saved > system preference
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem(THEME_KEY);
  } catch (e) {
    /* ignore */
  }
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme || (systemDark ? "dark" : "light"));

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const next =
        root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        /* ignore */
      }
    });
  }

  /* --------------------------------------------------------
     2. PRINT / DOWNLOAD CV
     -------------------------------------------------------- */
  const printBtn = document.getElementById("printBtn");
  if (printBtn) {
    printBtn.addEventListener("click", function () {
      window.print();
    });
  }

  /* --------------------------------------------------------
     3. SCROLL REVEAL — experience cards (staggered) + sections
     Preserves original .exp-card / data-delay / .visible behaviour
     -------------------------------------------------------- */
  const revealTargets = document.querySelectorAll(".exp-card, .reveal");

  function revealNow(el) {
    const delay = parseInt(el.dataset.delay || "0", 10);
    if (delay && !prefersReduced) {
      setTimeout(function () {
        el.classList.add("visible");
      }, delay);
    } else {
      el.classList.add("visible");
    }
  }

  if (prefersReduced || !("IntersectionObserver" in window)) {
    // Show everything immediately
    revealTargets.forEach(function (el) {
      el.classList.add("visible");
    });
  } else {
    const io = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealNow(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    revealTargets.forEach(function (el) {
      io.observe(el);
    });
  }

  /* --------------------------------------------------------
     4. ANIMATED STAT COUNTERS
     -------------------------------------------------------- */
  const stats = document.querySelectorAll(".stat-num[data-count]");

  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || "";
    if (prefersReduced) {
      el.textContent = target + suffix;
      return;
    }

    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }

  if (stats.length) {
    if (prefersReduced || !("IntersectionObserver" in window)) {
      stats.forEach(function (el) {
        el.textContent = el.dataset.count + (el.dataset.suffix || "");
      });
    } else {
      const statObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 },
      );
      stats.forEach(function (el) {
        statObserver.observe(el);
      });
    }
  }
})();
