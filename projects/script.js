gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, TextPlugin);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

gsap.config({ nullTargetWarn: false });
ScrollTrigger.config({ ignoreMobileResize: true });

function safeJSONFetch(url) {
  return fetch(url).then(r => {
    if (!r.ok) throw new Error(`Failed to fetch ${url}`);
    return r.json();
  });
}

function setYear() {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
}

function initThemeToggle() {
  const themeToggle = $("#themeToggle");
  const html = document.documentElement;
  const icon = themeToggle ? themeToggle.querySelector("i") : null;

  // Check for saved theme preference or default to dark mode
  const currentTheme = localStorage.getItem("theme") || "dark";
  if (currentTheme === "light") {
    html.classList.add("light-mode");
    if (icon) icon.className = "fas fa-moon";
  } else {
    if (icon) icon.className = "fas fa-sun";
  }

  if (!themeToggle) return;

  themeToggle.addEventListener("click", () => {
    const isLight = html.classList.contains("light-mode");
    if (isLight) {
      html.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
      if (icon) icon.className = "fas fa-sun";
    } else {
      html.classList.add("light-mode");
      localStorage.setItem("theme", "light");
      if (icon) icon.className = "fas fa-moon";
    }
  });
}

/* =============================
   SMOOTH SCROLLER (same feel)
============================= */
let smoothApi = null;

function initSmoothScroller() {
  if (reducedMotion) return null;

  const content = $("#smooth-content");
  if (!content) return null;

  let current = 0;
  let target = 0;
  const ease = 0.085;

  const dpr = window.devicePixelRatio || 1;

  function setBodyHeight() {
    document.body.style.height = `${content.scrollHeight}px`;
  }

  function onResize() {
    setBodyHeight();
    ScrollTrigger.refresh();
  }

  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      if (arguments.length) window.scrollTo(0, value);
      return target;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: innerWidth, height: innerHeight };
    },
    pinType: "transform"
  });

  ScrollTrigger.addEventListener("refreshInit", setBodyHeight);
  window.addEventListener("resize", onResize);

  setBodyHeight();
  target = window.scrollY || 0;
  current = target;

  gsap.ticker.add(() => {
    target = window.scrollY || 0;
    current += (target - current) * ease;

    const snapped = Math.round(current * dpr) / dpr;
    content.style.transform = `translate3d(0, ${-snapped}px, 0)`;

    ScrollTrigger.update();
  });

  ScrollTrigger.refresh();

  return {
    refreshHeight: () => {
      setBodyHeight();
      ScrollTrigger.refresh();
    }
  };
}

/* =============================
   BLOBS PARALLAX (same)
============================= */
function initBlobParallax() {
  if (reducedMotion) return;

  gsap.to(".blob-1", {
    x: 90,
    y: -120,
    scrollTrigger: {
      trigger: "#smooth-content",
      start: "top top",
      end: "bottom bottom",
      scrub: 1
    }
  });

  gsap.to(".blob-2", {
    x: -80,
    y: 140,
    scrollTrigger: {
      trigger: "#smooth-content",
      start: "top top",
      end: "bottom bottom",
      scrub: 1
    }
  });
}

/* =============================
   SECTION REVEALS
============================= */
function initSectionReveals() {
  if (reducedMotion) return;

  ScrollTrigger.batch(".section-head", {
    start: "top 85%",
    onEnter: (batch) =>
      gsap.fromTo(
        batch,
        { y: 22, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.12 }
      ),
    once: true
  });
}

/* =============================
   SCROLL TOP
============================= */
function initScrollTop() {
  const btn = $("#scrollTop");
  if (!btn) return;

  btn.addEventListener("click", () => {
    gsap.to(window, {
      duration: reducedMotion ? 0 : 1.05,
      scrollTo: { y: 0 },
      ease: "power3.inOut"
    });
  });

  ScrollTrigger.create({
    start: 200,
    onUpdate: (self) => {
      const show = self.scroll() > 260;
      gsap.to(btn, {
        autoAlpha: show ? 1 : 0,
        y: show ? 0 : 14,
        duration: 0.22,
        ease: "power2.out",
        pointerEvents: show ? "auto" : "none"
      });
    }
  });
}

/* =============================
   PREMIUM HOVERS (same as landing)
============================= */
function bindMagnetic(el, strength = 10) {
  if (reducedMotion) return;
  if (!el || el.dataset.magBound === "1") return;
  el.dataset.magBound = "1";

  const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
  const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });

  el.addEventListener("mousemove", (e) => {
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    xTo(dx * strength);
    yTo(dy * strength);
  });

  el.addEventListener("mouseleave", () => {
    xTo(0);
    yTo(0);
  });
}

function bindTilt(el, maxRotate = 4) {
  if (reducedMotion) return;
  if (!el || el.dataset.tiltBound === "1") return;
  el.dataset.tiltBound = "1";

  gsap.set(el, { transformPerspective: 800, transformOrigin: "center" });

  const rxTo = gsap.quickTo(el, "rotationX", { duration: 0.35, ease: "power3.out" });
  const ryTo = gsap.quickTo(el, "rotationY", { duration: 0.35, ease: "power3.out" });
  const scTo = gsap.quickTo(el, "scale", { duration: 0.35, ease: "power3.out" });

  el.addEventListener("mousemove", (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rotY = (px - 0.5) * maxRotate * 2;
    const rotX = -(py - 0.5) * maxRotate * 2;

    rxTo(rotX);
    ryTo(rotY);
    scTo(1.01);
  });

  el.addEventListener("mouseleave", () => {
    rxTo(0);
    ryTo(0);
    scTo(1);
  });
}

function applyPremiumHovers() {
  // tombol (Back, filter, dll)
  $$(".btn").forEach(el => bindMagnetic(el, 10));

  // filter lebih kerasa
  $$(".filter-btn").forEach(el => bindMagnetic(el, 12));

  // card projects: magnetic + tilt
  $$(".project-card").forEach(el => {
    bindMagnetic(el, 10);
    bindTilt(el, 4);
  });
}

/* =============================
   PROJECTS + FILTER
============================= */
let allProjects = [];
let currentFilter = "all";

function renderProjects(list) {
  const grid = $("#projectsGrid");
  if (!grid) return;

  grid.innerHTML = list.map(p => `
    <article class="card project-card" data-cat="${p.category}">
      <img class="project-img" src="/assets/images/projects/${p.image}.png" alt="${p.name}" loading="lazy" />
      <div class="project-body">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="project-actions">
          <a class="btn ghost small" href="${p.links.view}" target="_blank" rel="noreferrer">
            View <i class="fas fa-eye"></i>
          </a>
          <a class="btn ghost small" href="${p.links.code}" target="_blank" rel="noreferrer">
            Code <i class="fas fa-code"></i>
          </a>
        </div>
      </div>
    </article>
  `).join("");

  if (!reducedMotion) {
    gsap.fromTo($$(".project-card", grid),
      { y: 26, autoAlpha: 0, scale: 0.985 },
      { y: 0, autoAlpha: 1, scale: 1, duration: 0.7, ease: "power3.out", stagger: 0.06 }
    );
  }

  // IMPORTANT: setelah DOM baru dibuat, hover harus di-bind ulang
  applyPremiumHovers();

  // refresh height (smooth scroller)
  if (smoothApi) setTimeout(() => smoothApi.refreshHeight(), 50);
  else ScrollTrigger.refresh();
}

function applyFilter(filter) {
  currentFilter = filter;

  let filtered = allProjects;
  if (filter !== "all") {
    filtered = allProjects.filter(p => p.category === filter);
  }

  const grid = $("#projectsGrid");
  if (!grid) return;

  if (reducedMotion) {
    renderProjects(filtered);
    return;
  }

  const oldCards = $$(".project-card", grid);
  gsap.to(oldCards, {
    y: 14,
    autoAlpha: 0,
    scale: 0.99,
    duration: 0.22,
    stagger: 0.02,
    ease: "power2.in",
    onComplete: () => renderProjects(filtered)
  });
}

function initFilters() {
  const wrap = $("#filters");
  if (!wrap) return;

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-filter]");
    if (!btn) return;

    $$(".filter-btn", wrap).forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");

    applyFilter(btn.dataset.filter);
  });
}

/* =============================
   INIT
============================= */
window.addEventListener("load", async () => {
  setYear();
  initThemeToggle();

  smoothApi = initSmoothScroller();
  initBlobParallax();
  initSectionReveals();
  initFilters();
  initScrollTop();

  try {
    allProjects = await safeJSONFetch("./projects.json");
    renderProjects(allProjects);
  } catch (e) {
    console.error(e);
    const grid = $("#projectsGrid");
    if (grid) grid.innerHTML = `<p class="muted">Failed to load projects.json</p>`;
  }

  // bind hovers for header buttons (Back) juga
  applyPremiumHovers();

  if (!reducedMotion) {
    setTimeout(() => {
      if (smoothApi) smoothApi.refreshHeight();
      else ScrollTrigger.refresh();
    }, 250);
  }
});
