gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, TextPlugin);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function getDeepTargetId() {
  const params = new URLSearchParams(window.location.search);
  const to = params.get("to");
  if (to) return to;

  const hash = (window.location.hash || "").replace("#", "");
  return hash || null;
}

function clearDeepLinkFromUrl(id) {
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

function initThemeToggle() {
  const themeToggle = $("#themeToggle");
  const mobileThemeToggle = $("#mobileThemeToggle");
  const html = document.documentElement;
  const icon = themeToggle ? themeToggle.querySelector("i") : null;
  const mobileIcon = mobileThemeToggle ? mobileThemeToggle.querySelector("i") : null;

  // Check for saved theme preference or default to dark mode
  const currentTheme = localStorage.getItem("theme") || "dark";
  if (currentTheme === "light") {
    html.classList.add("light-mode");
    if (icon) icon.className = "fas fa-moon";
    if (mobileIcon) mobileIcon.className = "fas fa-moon";
  } else {
    if (icon) icon.className = "fas fa-sun";
    if (mobileIcon) mobileIcon.className = "fas fa-sun";
  }

  const toggleTheme = () => {
    const isLight = html.classList.contains("light-mode");
    
    // Create ripple effect contained within button
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: ${isLight ? 'rgba(7,10,18,0.3)' : 'rgba(255,255,255,0.3)'};
      pointer-events: none;
      z-index: 1;
      transform: translate(-50%, -50%) scale(0);
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
      top: 50%;
      left: 50%;
      width: 8px;
      height: 8px;
    `;
    
    // Add ripple to button (not body)
    if (themeToggle) {
      themeToggle.style.position = 'relative';
      themeToggle.style.overflow = 'hidden';
      themeToggle.appendChild(ripple);
    }
    
    // Animate ripple
    requestAnimationFrame(() => {
      ripple.style.transform = 'translate(-50%, -50%) scale(3)';
      ripple.style.opacity = '0';
    });
    
    // Animate button
    gsap.to(themeToggle, {
      scale: 0.95,
      duration: 0.1,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(themeToggle, {
          scale: 1,
          duration: 0.25,
          ease: "elastic.out(1, 0.5)"
        });
      }
    });
    
    // Animate icon rotation
    if (icon) {
      gsap.to(icon, {
        rotation: isLight ? 180 : -180,
        duration: 0.4,
        ease: "power3.inOut",
        onComplete: () => {
          // Update theme and icon
          if (isLight) {
            html.classList.remove("light-mode");
            localStorage.setItem("theme", "dark");
            icon.className = "fas fa-sun";
            if (mobileIcon) mobileIcon.className = "fas fa-sun";
          } else {
            html.classList.add("light-mode");
            localStorage.setItem("theme", "light");
            icon.className = "fas fa-moon";
            if (mobileIcon) mobileIcon.className = "fas fa-moon";
          }
          // Reset rotation for next animation
          gsap.set(icon, { rotation: 0 });
        }
      });
    }
    
    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 400);
  };

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
  if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener("click", toggleTheme);
  }
}

function safeJSONFetch(url) {
  return fetch(url).then(r => {
    if (!r.ok) throw new Error(`Failed to fetch ${url}`);
    return r.json();
  });
}

function initSmoothScroller() {
  const isMobile = window.matchMedia("(max-width: 980px)").matches;
  
  if (reducedMotion || isMobile) return;

  const wrapper = document.querySelector("#smooth-wrapper");
  const content = document.querySelector("#smooth-content");
  if (!wrapper || !content) return;

  let current = 0;
  let target = 0;
  const ease = 0.085;

  const dpr = window.devicePixelRatio || 1;

  function setBodyHeight() {
    const h = content.scrollHeight;
    document.body.style.height = `${h}px`;
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
}

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

function initScrollSpy() {
  const navLinks = $$(".nav-link");
  if (!navLinks.length) return;

  const sections = $$("section[id]");

  function updateActive() {
    const scrollY = window.scrollY + window.innerHeight / 2;

    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const bottom = top + rect.height;

      if (scrollY >= top && scrollY < bottom) {
        setActive(sec.id);
      }
    });
  }

  function setActive(id) {
    navLinks.forEach(a => a.classList.remove("is-active"));
    const link = $(`.nav-link[href="#${id}"]`);
    if (link) link.classList.add("is-active");
  }

  window.addEventListener("scroll", updateActive);
  updateActive(); // Initial call
}

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

  tl.fromTo(kicker, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55 })
    .fromTo(title, { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.75 }, "-=0.22")
    .fromTo(sub, { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.65 }, "-=0.30")
    .fromTo(ctas, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.10, duration: 0.5 }, "-=0.25")
    .fromTo(socials, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.07, duration: 0.42 }, "-=0.30")
    .fromTo(heroCard, { y: 26, autoAlpha: 0, scale: 0.98 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.8 }, "-=0.55")
    .fromTo(badge, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55 }, "-=0.55");

  if (heroImg) {
    gsap.fromTo(heroImg, { scale: 1.08 }, { scale: 1, duration: 1.2, ease: "power3.out", delay: 0.15 });
  }

  if (heroCard) {
    gsap.to(heroCard, { 
      y: -15, 
      duration: 2.6, 
      yoyo: true, 
      repeat: -1, 
      ease: "sine.inOut" 
    });
  }

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

function initBlobParallax() {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (reducedMotion || isMobile) return;

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

function initSectionReveals() {
  if (reducedMotion) return;

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  
  // Pastikan kita tidak memilih timeline-item atau hero-card
  const targets = $$(".section-head, .card:not(.hero-card):not(.timeline-item), .about-photo, .about-content");

  // SET INITIAL STATE SECARA PAKSA (Mencegah "ngedip")
  gsap.set(targets, { 
    y: 30, 
    autoAlpha: 0 
  });

  // Batch animasi dengan fromTo untuk konsistensi
  ScrollTrigger.batch(targets, {
    start: isMobile ? "top 95%" : "top 85%",
    onEnter: (batch) => {
      gsap.fromTo(batch, 
        { y: 30, autoAlpha: 0 }, 
        { 
          y: 0, 
          autoAlpha: 1, 
          duration: 0.8, 
          ease: "power3.out", 
          stagger: 0.1, 
          overwrite: true 
        }
      );
    },
    once: true
  });
}

function initExperienceAwwwards() {
  const items = $$(".timeline-item");
  if (!items.length) return;

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  items.forEach((item, index) => {
    // Mobile: Muncul dari bawah (y: 30)
    // Desktop: Muncul dari samping
    const xStart = isMobile ? 0 : (index % 2 === 0 ? -50 : 50); 
    const yStart = isMobile ? 30 : 0;

    // 1. Set Posisi Awal (Sembunyi)
    gsap.set(item, {
      autoAlpha: 0,
      x: xStart,
      y: yStart
    });

    // 2. Animasi Masuk
    gsap.to(item, {
      scrollTrigger: {
        trigger: item,
        start: isMobile ? "top 85%" : "top 80%", // Mobile muncul lebih cepat
        // play = mainkan saat masuk
        // none = jangan lakukan apa-apa saat lewat
        // none = jangan lakukan apa-apa saat scroll balik ke atas
        // none = jangan reset
        toggleActions: "play none none none", 
        once: true // PENTING: Animasi cuma jalan 1x seumur hidup (biar gak ngedip/ilang)
      },
      duration: 1, // Durasi sedikit lebih cepat biar snappy
      x: 0,
      y: 0,
      autoAlpha: 1,
      ease: "power3.out",
      overwrite: "auto"
    });

    // Hover effect (Desktop Only)
    if (!isMobile && !reducedMotion) {
      item.addEventListener("mouseenter", () => {
        gsap.to(item, { 
          x: index % 2 === 0 ? -8 : 8, 
          duration: 0.3, 
          ease: "power2.out" 
        });
      });

      item.addEventListener("mouseleave", () => {
        gsap.to(item, { 
          x: 0, 
          duration: 0.3, 
          ease: "power2.out" 
        });
      });
    }
  });
}

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
      const skills = $$('[data-anim="skill"]', container);
      
      // LANGSUNG SEMBUNYIKAN
      gsap.set(skills, { y: 20, autoAlpha: 0 });

      ScrollTrigger.batch(skills, {
        start: "top 90%",
        onEnter: (batch) => gsap.fromTo(batch,
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out", stagger: 0.05 }
        ),
        once: true
      });
    }
  } catch (e) {
    container.innerHTML = `<p class="muted">Failed to load skills.json</p>`;
    console.error(e);
  }
}

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
      const projects = $$('[data-anim="project"]', container);
      
      // LANGSUNG SEMBUNYIKAN
      gsap.set(projects, { y: 30, autoAlpha: 0, scale: 0.98 });

      ScrollTrigger.batch(projects, {
        start: "top 88%",
        onEnter: (batch) => gsap.fromTo(batch,
          { y: 30, autoAlpha: 0, scale: 0.98 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 0.9, ease: "power3.out", stagger: 0.1 }
        ),
        once: true
      });
    }
  } catch (e) {
    container.innerHTML = `<p class="muted">Failed to load projects/projects.json</p>`;
    console.error(e);
  }
}

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

window.addEventListener("load", async () => {
  setYear();
  initThemeToggle();
  
  const deepId = getDeepTargetId();
  
  window.scrollTo(0, 0);
  
  initSmoothScroller();
  initMobileDrawer();
  initSmoothScroll();
  initScrollSpy();
  initNavbarScrollState();

  if (deepId) {
    requestAnimationFrame(() => {
      if (!reducedMotion) ScrollTrigger.refresh();
      scrollToSectionById(deepId);
      clearDeepLinkFromUrl(deepId);
    });
  }

  initHero();
  initBlobParallax();
  
  // Initialize standard sections
  initSectionReveals();
  
  initScrollTop();
  initExperienceAwwwards();
  initContactForm();
  initVisibilityTitle();

  await loadSkills();
  await loadProjectsPreview();

  initMagneticHover(".btn", 10);
  initMagneticHover(".social-btn", 8);
  initMagneticHover(".skill", 8);
  initMagneticHover(".project-card", 10);

  initTilt(".hero-card", 5);
  initTilt(".project-card", 4);
  initTilt(".skill", 3);

  if (!reducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) { 
    const dot = $(".cursor-dot");
    const outline = $(".cursor-outline");

    const xTo = gsap.quickTo(outline, "x", { duration: 0.2, ease: "power3" });
    const yTo = gsap.quickTo(outline, "y", { duration: 0.2, ease: "power3" });

    window.addEventListener("mousemove", (e) => {
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0 });
      
      xTo(e.clientX);
      yTo(e.clientY);
    });

    const interactives = $$("a, button, .card, input, textarea, .skill");

    interactives.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        const isLightMode = document.documentElement.classList.contains("light-mode");
        gsap.to(outline, {
          width: 80,
          height: 80,
          borderColor: "transparent",
          backgroundColor: isLightMode ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)",
          duration: 0.3
        });
      });

      el.addEventListener("mouseleave", () => {
        const isLightMode = document.documentElement.classList.contains("light-mode");
        gsap.to(outline, {
          width: 40,
          height: 40,
          borderColor: isLightMode ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)",
          backgroundColor: "transparent",
          duration: 0.3
        });
      });
    });
  }

  document.addEventListener("click", (e) => {
    const ripple = document.createElement("div");
    ripple.className = "click-ripple";
    document.body.appendChild(ripple);

    const size = 100;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - size/2}px`;
    ripple.style.top = `${e.clientY - size/2 + window.scrollY}px`;

    gsap.to(ripple, {
      scale: 4,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => ripple.remove()
    });
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
    });
  });
});