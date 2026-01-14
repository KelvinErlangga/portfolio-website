// =============================
// GSAP Portfolio (Premium Motion)
// =============================
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, TextPlugin);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Helpers
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function getDeepTargetId() {
  const params = new URLSearchParams(window.location.search);
  const to = params.get("to");
  if (to) return to;

  // fallback kalau ada hash
  const hash = (window.location.hash || "").replace("#", "");
  return hash || null;
}

function clearDeepLinkFromUrl(id) {
  // bikin URL bersih tapi tetap kasih hash biar enak dibaca
  const clean = window.location.pathname + (id ? `#${id}` : "");
  history.replaceState({}, "", clean);
}

function scrollToSectionById(id) {
  const el = document.getElementById(id);
  if (!el) return;

  gsap.to(window, {
    duration: reducedMotion ? 0 : 1.05,
    scrollTo: { y: el, offsetY: headerOffset() },
    ease: "power3.inOut"
  });
}

gsap.config({ nullTargetWarn: false });
ScrollTrigger.config({ ignoreMobileResize: true });

function setYear() {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
}

function safeJSONFetch(url) {
  return fetch(url).then(r => {
    if (!r.ok) throw new Error(`Failed to fetch ${url}`);
    return r.json();
  });
}

// =============================
// SMOOTH SCROLLER (FREE ScrollSmoother-like)
// =============================
function initSmoothScroller() {
  if (reducedMotion) return;

  const wrapper = document.querySelector("#smooth-wrapper");
  const content = document.querySelector("#smooth-content");
  if (!wrapper || !content) return;

  let current = 0;
  let target = 0;
  const ease = 0.085;

  const dpr = window.devicePixelRatio || 1;

  function setBodyHeight() {
    // scrollHeight lebih stabil daripada getBoundingClientRect() untuk kasus ini
    const h = content.scrollHeight;
    document.body.style.height = `${h}px`;
  }

  function onResize() {
    setBodyHeight();
    ScrollTrigger.refresh();
  }

  // proxy untuk ScrollTrigger (karena content digeser via transform)
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

    // SNAP ke pixel device (INI kunci ngilangin hairline)
    const snapped = Math.round(current * dpr) / dpr;

    // pakai translate3d biar rendering lebih stabil
    content.style.transform = `translate3d(0, ${-snapped}px, 0)`;

    ScrollTrigger.update();
  });

  ScrollTrigger.refresh();
}

// =============================
// NAV + MOBILE DRAWER (GSAP)
// =============================
let drawerTl;
let isDrawerOpen = false;

function initMobileDrawer() {
  const menuBtn = $("#menuBtn");
  const drawer = $("#mobileNav");
  const panel = $(".mobile-nav__panel");
  const closeBtn = $("#mobileClose");
  const backdrop = $("#mobileBackdrop");
  const links = drawer ? $$(".mobile-link", drawer) : [];

  if (!menuBtn || !drawer || !panel || !closeBtn || !backdrop) return;

  gsap.set(drawer, { display: "none" });
  gsap.set(panel, { x: 60, autoAlpha: 0 });
  gsap.set(backdrop, { autoAlpha: 0 });

  drawerTl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } })
    .set(drawer, { display: "block" })
    .to(backdrop, { autoAlpha: 1, duration: 0.22 })
    .to(panel, { x: 0, autoAlpha: 1, duration: 0.36 }, 0.02)
    .fromTo(links, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.28 }, 0.10);

  function openDrawer() {
    isDrawerOpen = true;
    menuBtn.setAttribute("aria-expanded", "true");
    drawer.setAttribute("aria-hidden", "false");
    drawerTl.play(0);
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    isDrawerOpen = false;
    menuBtn.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");
    drawerTl.reverse();
    drawerTl.eventCallback("onReverseComplete", () => {
      document.body.style.overflow = "";
    });
  }

  menuBtn.addEventListener("click", () => isDrawerOpen ? closeDrawer() : openDrawer());
  closeBtn.addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);
  links.forEach(a => a.addEventListener("click", closeDrawer));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isDrawerOpen) closeDrawer();
  });
}

// =============================
// SMOOTH ANCHOR SCROLL (GSAP ScrollTo)
// =============================
function headerOffset() {
  const header = $(".site-header");
  return header ? header.offsetHeight + 10 : 80;
}

function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const targetEl = $(href);
      if (!targetEl) return;

      e.preventDefault();
      gsap.to(window, {
        duration: reducedMotion ? 0 : 1.05,
        scrollTo: { y: targetEl, offsetY: headerOffset() },
        ease: "power3.inOut"
      });
    });
  });
}

// =============================
// ACTIVE NAV LINK (ScrollTrigger)
// =============================
function initScrollSpy() {
  const navLinks = $$(".nav-link");
  if (!navLinks.length) return;

  const sections = $$("section[id]");
  sections.forEach(sec => {
    ScrollTrigger.create({
      trigger: sec,
      start: "top 55%",
      end: "bottom 55%",
      onEnter: () => setActive(sec.id),
      onEnterBack: () => setActive(sec.id)
    });
  });

  function setActive(id) {
    navLinks.forEach(a => a.classList.remove("is-active"));
    const link = $(`.nav-link[href="#${id}"]`);
    if (link) link.classList.add("is-active");
  }
}

// =============================
// NAVBAR “SCROLLED” STATE
// =============================
function initNavbarScrollState() {
  const header = $(".site-header");
  if (!header || reducedMotion) return;

  ScrollTrigger.create({
    start: 10,
    onUpdate: (self) => {
      header.classList.toggle("is-scrolled", self.scroll() > 10);
    }
  });
}

// =============================
// PREMIUM HOVERS (Magnetic + Tilt)
// =============================
function initMagneticHover(selector, strength = 18) {
  if (reducedMotion) return;
  const els = $$(selector);
  els.forEach(el => {
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
      xTo(0); yTo(0);
    });
  });
}

function initTilt(selector, maxRotate = 6) {
  if (reducedMotion) return;
  const els = $$(selector);
  els.forEach(el => {
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
      rxTo(0); ryTo(0); scTo(1);
    });
  });
}

// =============================
// HERO INTRO + ROLE LOOP (FIXED)
// =============================
function initHero() {
  if (reducedMotion) return;

  const kicker = $(".hero-kicker");
  const title = $(".hero-title");
  const sub = $(".hero-sub");
  const ctas = $$(".hero-cta .btn");
  const socials = $$(".hero-socials .social-btn");
  const heroCard = $(".hero-card");
  const heroImg = $(".hero-img");
  const badge = $(".hero-badge");
  const roleText = $("#roleText");

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  // “cinematic” intro
  tl.fromTo(kicker, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55 })
    .fromTo(title, { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.75 }, "-=0.22")
    .fromTo(sub, { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.65 }, "-=0.30")
    .fromTo(ctas, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.10, duration: 0.5 }, "-=0.25")
    .fromTo(socials, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.07, duration: 0.42 }, "-=0.30")
    .fromTo(heroCard, { y: 26, autoAlpha: 0, scale: 0.98 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.8 }, "-=0.55")
    .fromTo(badge, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55 }, "-=0.55");

  // image “breath”
  if (heroImg) {
    gsap.fromTo(heroImg, { scale: 1.08 }, { scale: 1, duration: 1.2, ease: "power3.out", delay: 0.15 });
  }

  // --- BAGIAN YANG DIPERBAIKI (FIXED) ---
  
  // 1. Animasi Float (Ngambang) - TETAP ADA
  if (heroCard) {
    gsap.to(heroCard, { 
      y: -15, // Jarak ngambang sedikit ditambah biar makin kerasa
      duration: 2.6, 
      yoyo: true, 
      repeat: -1, 
      ease: "sine.inOut" 
    });
  }

  // 2. Animasi Scroll Parallax - DIHAPUS
  // (Saya menghapus bagian scrollTrigger pada heroCard yang menyebabkan bentrok/freeze)

  // --------------------------------------

  // Roles loop (type + hold + fade)
  if (roleText) {
    const roles = [
      "Fullstack Developer",
      "Frontend Developer",
      "Backend Developer",
      "Mobile Developer"
    ];

    const roleTl = gsap.timeline({ repeat: -1, delay: 0.2 });
    roles.forEach((r) => {
      roleTl
        .to(roleText, { duration: 0.55, text: r, ease: "none" })
        .to(roleText, { duration: 0.25, opacity: 1 }, 0)
        .to(roleText, { duration: 0.25, opacity: 0.75, delay: 1.1 });
    });
  }
}

// =============================
// PARALLAX BLOBS (Zeit-like)
// =============================
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

// =============================
// SECTION REVEALS (Batch, cleaner)
// =============================
function initSectionReveals() {
  if (reducedMotion) return;

  // Titles + desc (clean)
  ScrollTrigger.batch(".section-head", {
    start: "top 85%",
    onEnter: (batch) => gsap.fromTo(batch,
      { y: 22, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.12 }
    ),
    once: true
  });

  // Cards batch
  ScrollTrigger.batch(".card", {
    start: "top 88%",
    onEnter: (batch) => gsap.fromTo(batch,
      { y: 28, autoAlpha: 0, rotateX: 6, transformOrigin: "center top" },
      { y: 0, autoAlpha: 1, rotateX: 0, duration: 0.9, ease: "power3.out", stagger: 0.10 }
    ),
    once: true
  });

  // About photo + content (special)
  const aboutPhoto = $(".about-photo");
  const aboutContent = $(".about-content");
  if (aboutPhoto && aboutContent) {
    gsap.fromTo([aboutPhoto, aboutContent],
      { y: 28, autoAlpha: 0 },
      {
        y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: ".about-grid", start: "top 80%" }
      }
    );
  }
}

// =============================
// SKILLS RENDER + ANIM (Batch)
// =============================
async function loadSkills() {
  const container = $("#skillsContainer");
  if (!container) return;

  try {
    const data = await safeJSONFetch("./skills.json");
    container.innerHTML = data.map(s => `
      <div class="skill" data-anim="skill">
        <img src="${s.icon}" alt="${s.name}" loading="lazy" />
        <span>${s.name}</span>
      </div>
    `).join("");

    if (!reducedMotion) {
      ScrollTrigger.batch('[data-anim="skill"]', {
        start: "top 90%",
        onEnter: (batch) => gsap.fromTo(batch,
          { y: 22, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.75, ease: "power3.out", stagger: 0.06 }
        ),
        once: true
      });
    }
  } catch (e) {
    container.innerHTML = `<p class="muted">Failed to load skills.json</p>`;
    console.error(e);
  }
}

// =============================
// PROJECTS PREVIEW RENDER + ANIM
// =============================
async function loadProjectsPreview() {
  const container = $("#projectsPreview");
  if (!container) return;

  try {
    const data = await safeJSONFetch("./projects/projects.json");
    const items = data.filter(p => p.category !== "android").slice(0, 6);

    container.innerHTML = items.map(p => `
      <article class="card project-card" data-anim="project">
        <img class="project-img" src="./assets/images/projects/${p.image}.png" alt="${p.name}" loading="lazy" />
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
      ScrollTrigger.batch('[data-anim="project"]', {
        start: "top 88%",
        onEnter: (batch) => gsap.fromTo(batch,
          { y: 34, autoAlpha: 0, scale: 0.98 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 0.9, ease: "power3.out", stagger: 0.12 }
        ),
        once: true
      });
    }
  } catch (e) {
    container.innerHTML = `<p class="muted">Failed to load projects/projects.json</p>`;
    console.error(e);
  }
}

// =============================
// SCROLL TOP BUTTON (GSAP)
// =============================
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

// =============================
// CONTACT FORM (Input glow + micro anim)
// =============================
function initContactForm() {
  const form = $("#contact-form");
  const note = $("#formNote");
  const submitBtn = $("#submitBtn");
  if (!form) return;

  const fields = $$(".input, .textarea", form);
  fields.forEach(el => {
    el.addEventListener("focus", () => {
      if (reducedMotion) return;
      gsap.to(el, {
        duration: 0.18,
        boxShadow: "0 0 0 4px rgba(124,92,255,0.18)",
        borderColor: "rgba(124,92,255,0.45)"
      });
    });
    el.addEventListener("blur", () => {
      if (reducedMotion) return;
      gsap.to(el, {
        duration: 0.18,
        boxShadow: "0 0 0 0 rgba(0,0,0,0)",
        borderColor: "rgba(255,255,255,0.12)"
      });
    });
  });

  const ENABLE_EMAILJS = false;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (note) note.textContent = "";
    if (submitBtn) submitBtn.disabled = true;

    if (!reducedMotion) {
      gsap.fromTo(submitBtn, { scale: 1 }, { scale: 0.98, yoyo: true, repeat: 1, duration: 0.09 });
    }

    try {
      if (ENABLE_EMAILJS) {
        throw new Error("EmailJS not configured (ENABLE_EMAILJS=false)");
      }

      form.reset();
      if (note) note.textContent = "Message sent (demo). Enable EmailJS to deliver email.";
      if (note && !reducedMotion) gsap.from(note, { y: 10, autoAlpha: 0, duration: 0.45, ease: "power3.out" });
    } catch (err) {
      console.error(err);
      if (note) note.textContent = "Failed to send. Enable EmailJS and set correct keys.";
      if (note && !reducedMotion) gsap.from(note, { y: 10, autoAlpha: 0, duration: 0.45, ease: "power3.out" });
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// =============================
// TITLE + FAVICON SWITCH
// =============================
function initVisibilityTitle() {
  document.addEventListener("visibilitychange", () => {
    const fav = $("#favicon");
    if (document.visibilityState === "visible") {
      document.title = "Portfolio | Kelvin Erlangga";
      if (fav) fav.setAttribute("href", "./assets/images/hero2.jpg");
    } else {
      document.title = "Come Back To Portfolio";
      if (fav) fav.setAttribute("href", "./assets/images/exclamation_mark.png");
    }
  });
}

// =============================
// INIT
// =============================
window.addEventListener("load", async () => {
  setYear();
  
  const deepId = getDeepTargetId();
  
  window.scrollTo(0, 0);
  
  initSmoothScroller();       // <-- premium scroll inertia
  initMobileDrawer();
  initSmoothScroll();
  initScrollSpy();
  initNavbarScrollState();

  if (deepId) {
    // tunggu 1 frame + refresh supaya body height/ScrollTrigger stabil
    requestAnimationFrame(() => {
      if (!reducedMotion) ScrollTrigger.refresh();
      scrollToSectionById(deepId);
      clearDeepLinkFromUrl(deepId);
    });
  }

  initHero();
  initBlobParallax();
  initSectionReveals();
  initScrollTop();
  initContactForm();
  initVisibilityTitle();

  await loadSkills();
  await loadProjectsPreview();

  // premium hover interactions
  initMagneticHover(".btn", 10);
  initMagneticHover(".social-btn", 8);
  initMagneticHover(".skill", 8);
  initMagneticHover(".project-card", 10);

  initTilt(".hero-card", 5);
  initTilt(".project-card", 4);
  initTilt(".skill", 3);

  // refresh once assets loaded
  if (!reducedMotion) {
    setTimeout(() => ScrollTrigger.refresh(), 250);
  }
});
