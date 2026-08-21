 // <!-- NAVIGATION -->


  function initMegaNavDirectionalHover() {
  const DUR = {
    bgMorph: 0.4,
    contentIn: 0.3,
    contentOut: 0.2,
    stagger: 0.25,
    backdropIn: 0.3,
    backdropOut: 0.2,
    openScale: 0.35,
    closeScale: 0.25,
  };
  
  const HOVER_ENTER = 120;
  const HOVER_LEAVE = 150;

  // DOM references
  const menuWrap = document.querySelector("[data-menu-wrap]");
  const navList = document.querySelector("[data-nav-list]");
  const dropWrapper = document.querySelector("[data-dropdown-wrapper]");
  const dropContainer = document.querySelector("[data-dropdown-container]");
  const dropBg = document.querySelector("[data-dropdown-bg]");
  const backdrop = document.querySelector("[data-menu-backdrop]");
  const toggles = [...document.querySelectorAll("[data-dropdown-toggle]")];
  const panels = [...document.querySelectorAll("[data-nav-content]")];
  const burger = document.querySelector("[data-burger-toggle]");
  const backBtn = document.querySelector("[data-mobile-back]");
  const logo = document.querySelector("[data-menu-logo]");
  const [lineTop, lineMid, lineBot] = ["top", "mid", "bot"].map(
    (id) => document.querySelector(`[data-burger-line='${id}']`)
  );

  // State
  const state = {
    isOpen: false,
    activePanel: null,
    activePanelIndex: -1,
    isMobile: window.innerWidth <= 991,
    mobileMenuOpen: false,
    mobilePanelActive: null,
    hoverTimer: null,
    leaveTimer: null,
    tl: null,
    mobileTl: null,
    mobilePanelTl: null,
  };

  // Helpers
  const getPanel = (name) => document.querySelector(`[data-nav-content="${name}"]`);
  const getToggle = (name) => document.querySelector(`[data-dropdown-toggle="${name}"]`);
  const getFade = (el) => el.querySelectorAll("[data-menu-fade]");
  const getNavItems = () => navList.querySelectorAll("[data-nav-list-item]");
  const getIndex = (name) => toggles.indexOf(getToggle(name));
  const stagger = (n) => (n <= 1 ? 0 : { amount: DUR.stagger });

  function clearTimers() {
    clearTimeout(state.hoverTimer);
    clearTimeout(state.leaveTimer);
    state.hoverTimer = state.leaveTimer = null;
  }

  function killTl(key) {
    if (state[key]) { state[key].kill(); state[key] = null; }
  }

  function killDropdown() {
    killTl("tl");
    gsap.killTweensOf(dropContainer);
    gsap.killTweensOf(backdrop);
    panels.forEach((p) => { gsap.killTweensOf(p); gsap.killTweensOf(getFade(p)); });
  }

  function killMobile() {
    killTl("mobileTl");
    gsap.killTweensOf([navList, lineTop, lineMid, lineBot]);
  }

  function killMobilePanel() {
    killTl("mobilePanelTl");
    gsap.killTweensOf(getNavItems());
    gsap.killTweensOf([backBtn, logo]);
    panels.forEach((p) => { gsap.killTweensOf(p); gsap.killTweensOf(getFade(p)); });
  }

  function resetToggles() {
    toggles.forEach((t) => t.setAttribute("aria-expanded", "false"));
  }

  function resetDesktop() {
    panels.forEach((p) => {
      gsap.set(p, { visibility:"hidden", opacity:0, pointerEvents:"none", x:0, y:0, xPercent:0 });
      gsap.set(getFade(p), { autoAlpha:0, x:0, y:0, xPercent:0 });
    });
  
    gsap.set(dropContainer, { height:0, clearProps:"transform" });
    gsap.set(backdrop, { autoAlpha:0 });
  
    menuWrap.setAttribute("data-menu-open", "false");
    resetToggles();
  }

  function setupMobile() {
    panels.forEach((p) => {
      gsap.set(p, { autoAlpha: 0, xPercent: 0, visibility: "visible", pointerEvents: "none" });
      gsap.set(getFade(p), { xPercent: 20, autoAlpha: 0 });
    });
    gsap.set(getNavItems(), { xPercent: 0, y: 0, autoAlpha: 1 });
    gsap.set(navList, { autoAlpha: 0, x: 0 });
    gsap.set(backBtn, { autoAlpha: 0 });
    gsap.set(logo, { autoAlpha: 1 });
    gsap.set(dropContainer, { clearProps: "height" });
    gsap.set(backdrop, { autoAlpha: 0 });
  }

  function measurePanel(name) {
    const el = getPanel(name);
    if (!el) return 0;
    const s = el.style;
    const prev = [s.visibility, s.opacity, s.pointerEvents];
    Object.assign(s, { visibility: "visible", opacity: "0", pointerEvents: "none" });
    const h = el.getBoundingClientRect().height;
    [s.visibility, s.opacity, s.pointerEvents] = prev;
    return h;
  }

  // DESKTOP — open dropdown (first open)
  function openDropdown(panelName) {
    if (state.isOpen && state.activePanel === panelName) return;
    if (state.isOpen) return switchPanel(state.activePanel, panelName);

    const height = measurePanel(panelName);
    if (!height) return;

    killDropdown();
    resetDesktop();

    const el = getPanel(panelName);
    const fade = getFade(el);
    const toggle = getToggle(panelName);

    state.isOpen = true;
    state.activePanel = panelName;
    state.activePanelIndex = getIndex(panelName);
    menuWrap.setAttribute("data-menu-open", "true");
    if (toggle) toggle.setAttribute("aria-expanded", "true");

    gsap.set(dropContainer, { height: 0 });

    const tl = gsap.timeline();
    state.tl = tl;
    tl.to(backdrop, { autoAlpha: 1, duration: DUR.backdropIn, ease: "power2.out" }, 0);
    tl.to(dropContainer, { height, duration: DUR.openScale, ease: "power3.out" }, 0);
    tl.set(el, { visibility: "visible", opacity: 1, pointerEvents: "auto" }, 0.05);
    if (fade.length) {
      tl.fromTo(fade,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: DUR.contentIn, stagger: stagger(fade.length), ease: "power3.out" },
        0.1
      );
    }
  }

  // DESKTOP — close dropdown
  function closeDropdown() {
    if (!state.isOpen) return;
    const el = getPanel(state.activePanel);
    const fade = el ? getFade(el) : [];

    killDropdown();

    const tl = gsap.timeline({
      onComplete() {
        state.isOpen = false;
        state.activePanel = null;
        state.activePanelIndex = -1;
        state.tl = null;
        resetDesktop();
      },
    });
    state.tl = tl;
    if (fade.length) tl.to(fade, { autoAlpha: 0, y: -4, duration: DUR.contentOut * 0.7, ease: "power2.in" }, 0);
    tl.to(dropContainer, { height: 0, duration: DUR.closeScale, ease: "power2.in" }, 0.05);
    tl.to(backdrop, { autoAlpha: 0, duration: DUR.backdropOut, ease: "power2.out" }, 0);
    if (el) tl.set(el, { visibility: "hidden", opacity: 0, pointerEvents: "none" });
  }

  // DESKTOP — switch panel (directional)
  function switchPanel(fromName, toName) {
    const dir = getIndex(toName) > getIndex(fromName) ? 1 : -1;
    const fromEl = getPanel(fromName), toEl = getPanel(toName);
    if (!fromEl || !toEl) return;

    const fromFade = getFade(fromEl), toFade = getFade(toEl);
    const toHeight = measurePanel(toName);
    if (!toHeight) return;

    killDropdown();

    // Reset all panels, then restore fromEl as visible
    panels.forEach((p) => {
      gsap.set(p, { visibility: "hidden", opacity: 0, pointerEvents: "none", xPercent: 0 });
      gsap.set(getFade(p), { autoAlpha: 0, x: 0, y: 0 });
    });
    gsap.set(fromEl, { visibility: "visible", opacity: 1, pointerEvents: "auto", x: 0 });
    if (fromFade.length) gsap.set(fromFade, { autoAlpha: 1, x: 0, y: 0 });
    gsap.set(backdrop, { autoAlpha: 1 });

    const toToggle = getToggle(toName);
    state.activePanel = toName;
    state.activePanelIndex = getIndex(toName);
    resetToggles();
    if (toToggle) toToggle.setAttribute("aria-expanded", "true");

    const xOut = dir * -30, xIn = dir * 30;
    const tl = gsap.timeline();
    state.tl = tl;

    if (fromFade.length) tl.to(fromFade, { autoAlpha: 0, x: xOut, duration: DUR.contentOut, ease: "power2.in" }, 0);
    tl.set(fromEl, { visibility: "hidden", opacity: 0, pointerEvents: "none", xPercent: 0 }, DUR.contentOut);
    if (fromFade.length) tl.set(fromFade, { x: 0 }, DUR.contentOut);
    tl.to(dropContainer, { height: toHeight, duration: DUR.bgMorph, ease: "power3.out" }, 0.05);
    tl.set(toEl, { visibility: "visible", opacity: 1, pointerEvents: "auto", xPercent: 0 }, DUR.contentOut * 0.5);
    if (toFade.length) {
      tl.fromTo(toFade,
        { autoAlpha: 0, x: xIn },
        { autoAlpha: 1, x: 0, duration: DUR.contentIn, stagger: stagger(toFade.length), ease: "power3.out" },
        DUR.contentOut * 0.6
      );
    }
  }

  // DESKTOP — hover intent
  function handleToggleEnter(e) {
    if (state.isMobile) return;
    const name = e.currentTarget.getAttribute("data-dropdown-toggle");
    if (!name) return;
    clearTimeout(state.leaveTimer); state.leaveTimer = null;
    clearTimeout(state.hoverTimer);
    state.hoverTimer = setTimeout(() => openDropdown(name), state.isOpen ? 0 : HOVER_ENTER);
  }

  function handleToggleLeave() {
    if (state.isMobile) return;
    clearTimeout(state.hoverTimer); state.hoverTimer = null;
    state.leaveTimer = setTimeout(closeDropdown, HOVER_LEAVE);
  }

  function handleWrapperEnter() {
    if (state.isMobile) return;
    clearTimeout(state.leaveTimer); state.leaveTimer = null;
  }

  function handleWrapperLeave() {
    if (state.isMobile) return;
    state.leaveTimer = setTimeout(closeDropdown, HOVER_LEAVE);
  }

  // DESKTOP — close behaviors
  function handleEscape(e) {
    if (e.key !== "Escape") return;
    if (state.isMobile) {
      state.mobilePanelActive ? closeMobilePanel() : state.mobileMenuOpen && closeMobileMenu();
      return;
    }
    if (state.isOpen) {
      const t = getToggle(state.activePanel);
      closeDropdown();
      if (t) t.focus();
    }
  }

  function handleDocClick(e) {
    if (state.isMobile || !state.isOpen) return;
    if (!e.target.closest("[data-menu-wrap]")) closeDropdown();
  }

  // DESKTOP — keyboard navigation
  function focusFirstLink(panelName) {
    setTimeout(() => {
      const el = getPanel(panelName);
      if (!el) return;
      const link = el.querySelector("a");
      if (!link) return;
      gsap.set(link, { visibility: "visible" });
      link.focus();
    }, 80);
  }

  function handleKeydownOnToggle(e) {
    if (state.isMobile) return;
    const name = e.currentTarget.getAttribute("data-dropdown-toggle");

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (state.isOpen && state.activePanel === name) closeDropdown();
      else { openDropdown(name); focusFirstLink(name); }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!state.isOpen || state.activePanel !== name) openDropdown(name);
      focusFirstLink(name);
    }
    if (e.key === "Tab" && !e.shiftKey && state.isOpen && state.activePanel === name) {
      e.preventDefault();
      const link = getPanel(name)?.querySelector("a");
      if (link) link.focus();
    }
  }

  function handleKeydownInPanel(e) {
    if (state.isMobile || !state.isOpen) return;
    const el = getPanel(state.activePanel);
    if (!el) return;

    const links = [...el.querySelectorAll("a")];
    const idx = links.indexOf(document.activeElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      links[(idx + 1) % links.length].focus();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (idx <= 0) { const t = getToggle(state.activePanel); if (t) t.focus(); }
      else links[idx - 1].focus();
    }
    if (e.key === "Tab" && !e.shiftKey && idx === links.length - 1) {
      e.preventDefault();
      const curIdx = toggles.indexOf(getToggle(state.activePanel));
      const next = curIdx < toggles.length - 1 ? toggles[curIdx + 1] : null;
      closeDropdown();
      if (next) next.focus();
    }
    if (e.key === "Tab" && e.shiftKey && idx === 0) {
      e.preventDefault();
      const t = getToggle(state.activePanel);
      if (t) t.focus();
    }
  }

  // MOBILE — burger animation
  function animateBurger(toX) {
    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
    if (toX) {
      tl.to(lineTop, { y: "0.3125em", duration: 0.15 }, 0);
      tl.to(lineBot, { y: "-0.3125em", duration: 0.15 }, 0);
      tl.to(lineMid, { autoAlpha: 0, duration: 0.1 }, 0.1);
      tl.to(lineTop, { rotation: 45, duration: 0.2 }, 0.15);
      tl.to(lineBot, { rotation: -45, duration: 0.2 }, 0.15);
    } else {
      tl.to(lineTop, { rotation: 0, duration: 0.2 }, 0);
      tl.to(lineBot, { rotation: 0, duration: 0.2 }, 0);
      tl.to(lineTop, { y: 0, duration: 0.15 }, 0.15);
      tl.to(lineBot, { y: 0, duration: 0.15 }, 0.15);
      tl.to(lineMid, { autoAlpha: 1, duration: 0.1 }, 0.15);
    }
    return tl;
  }

  // MOBILE — open/close menu
  function openMobileMenu() {
    killMobile();
    state.mobileMenuOpen = true;
    menuWrap.setAttribute("data-menu-open", "true");
    burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";

    const items = getNavItems();
    const tl = gsap.timeline();
    state.mobileTl = tl;
    tl.add(animateBurger(true), 0);
    tl.to(navList, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0);
    if (items.length) {
      tl.fromTo(items,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.04, ease: "power3.out" },
        0.15
      );
    }
  }

  function closeMobileMenu() {
    const hadPanel = state.mobilePanelActive;
    const panelEl = hadPanel ? getPanel(hadPanel) : null;
  
    killMobile();
    killMobilePanel();
  
    menuWrap.setAttribute("data-menu-open", "false");
    state.mobileMenuOpen = false;
    state.mobilePanelActive = null;
    burger.setAttribute("aria-expanded", "false");
  
    const tl = gsap.timeline({
      onComplete() {
        document.body.style.overflow = "";
        state.mobileTl = null;
        setupMobile();
      },
    });
    state.mobileTl = tl;
  
    tl.add(animateBurger(false), 0);
  
    // If a panel was open, fade it out with the close — no snap reset
    if (hadPanel && panelEl) {
      tl.to(panelEl, { autoAlpha: 0, duration: 0.3, ease: "power2.inOut" }, 0.05);
      tl.to(backBtn, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0.05);
    }
  
    // Fade out the nav list container
    tl.to(navList, { autoAlpha: 0, duration: 0.3, ease: "power2.inOut" }, 0.05);
  }

  // MOBILE — slide-over panels 
  function openMobilePanel(panelName) {
    const el = getPanel(panelName);
    if (!el) return;
    killMobilePanel();
    state.mobilePanelActive = panelName;

    const navItems = getNavItems();
    const panelFade = getFade(el);

    const tl = gsap.timeline();
    state.mobilePanelTl = tl;

    // Fade out each nav item to the left
    if (navItems.length) {
      tl.to(navItems, {
        xPercent: -10, autoAlpha: 0,
        duration: 0.35, stagger: 0.03, ease: "power2.in",
      }, 0);
    }

    // Logo → back button swap
    tl.to(logo, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0);
    tl.to(backBtn, { autoAlpha: 1, duration: 0.25, ease: "power2.inOut" }, 0.15);

    // Show panel container, then fade in its items from the right
    tl.set(el, { autoAlpha: 1, xPercent: 0, pointerEvents: "auto" }, 0.2);
    if (panelFade.length) {
      tl.fromTo(panelFade,
        { xPercent: 8, autoAlpha: 0 },
        { xPercent: 0, autoAlpha: 1, duration: 0.3, stagger: stagger(panelFade.length), ease: "power3.out" },
        0.25
      );
    }
  }

  function closeMobilePanel() {
    if (!state.mobilePanelActive) return;
    const el = getPanel(state.mobilePanelActive);
    if (!el) return;
    killMobilePanel();

    const navItems = getNavItems();
    const panelFade = getFade(el);

    const tl = gsap.timeline({
      onComplete() { state.mobilePanelActive = null; state.mobilePanelTl = null; },
    });
    state.mobilePanelTl = tl;

    // Fade out panel items to the right
    if (panelFade.length) {
      tl.to(el, {
        xPercent: 20, autoAlpha: 0,
        duration: 0.3, stagger: 0.02, ease: "power2.in",
      }, 0);
    }

    // Hide panel
    tl.set(el, { autoAlpha: 0, pointerEvents: "none" }, 0.25);

    // Back → logo swap
    tl.to(backBtn, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0);
    tl.to(logo, { autoAlpha: 1, duration: 0.25, ease: "power2.out" }, 0.15);

    // Fade nav items back in from center
    if (navItems.length) {
      tl.fromTo(navItems,
        { xPercent: -20, autoAlpha: 0 },
        { xPercent: 0, autoAlpha: 1, duration: 0.35, stagger: 0.03, ease: "power3.out" },
        0.25
      );
    }
  }

  function handleToggleClick(e) {
    if (!state.isMobile || !state.mobileMenuOpen) return;
    const name = e.currentTarget.getAttribute("data-dropdown-toggle");
    if (name) { e.preventDefault(); openMobilePanel(name); }
  }

  // RESIZE
  let resizeTimer = null;
  let lastWidth = window.innerWidth;
  function handleResize() {
    const w = window.innerWidth;
    if (w === lastWidth) return;
    lastWidth = w;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const was = state.isMobile;
      state.isMobile = window.innerWidth <= 991;

      if (was && !state.isMobile) {
        killMobile(); killMobilePanel();
        gsap.set(navList, { clearProps: "all" });
        gsap.set(getNavItems(), { clearProps: "all" });
        gsap.set(backBtn, { autoAlpha: 0 });
        gsap.set(logo, { clearProps: "all" });
        gsap.set([lineTop, lineMid, lineBot], { rotation: 0, y: 0, autoAlpha: 1 });
      
        panels.forEach((p) => {
          gsap.set(p, { clearProps: "all" });
          gsap.set(getFade(p), { clearProps: "all" });
        });
      
        burger.setAttribute("aria-expanded", "false");
        state.mobileMenuOpen = false;
        state.mobilePanelActive = null;
        document.body.style.overflow = "";
        resetDesktop();
      }
      
      if (!was && state.isMobile) {
        killDropdown();
        state.isOpen = false; state.activePanel = null; state.activePanelIndex = -1;
        clearTimers();
        menuWrap.setAttribute("data-menu-open", "false");
        resetToggles();
        setupMobile();
      }
      
    }, 150);
  }

  // EVENT BINDING
  toggles.forEach((btn) => {
    btn.addEventListener("mouseenter", handleToggleEnter);
    btn.addEventListener("mouseleave", handleToggleLeave);
    btn.addEventListener("keydown", handleKeydownOnToggle);
    btn.addEventListener("click", handleToggleClick);
  });
  
  dropWrapper.addEventListener("mouseenter", handleWrapperEnter);
  dropWrapper.addEventListener("mouseleave", handleWrapperLeave);
  
  panels.forEach((p) => p.addEventListener("keydown", handleKeydownInPanel));
  
  backdrop.addEventListener("click", closeDropdown);
  
  document.addEventListener("keydown", handleEscape);
  document.addEventListener("click", handleDocClick);
  
  burger.addEventListener("click", () => state.mobileMenuOpen ? closeMobileMenu() : openMobileMenu());
  
  backBtn.addEventListener("click", closeMobilePanel);
  
  window.addEventListener("resize", handleResize);

  // INIT
  state.isMobile ? setupMobile() : resetDesktop();
}


// Initialize Mega Navigation (Directional Hover)
document.addEventListener('DOMContentLoaded', function() {
  initMegaNavDirectionalHover();
});


// <!-- DYNAMIC BACKGROUND COLOR ATTRIBUTE -->

  document.querySelectorAll('[data-bg-color-solid]').forEach(el => {
  el.style.background = el.getAttribute('data-bg-color-solid');
});



// <!-- NAV SCROLL BACKGROUND -->

gsap.registerPlugin(ScrollTrigger);
const nav = document.querySelector(".mega-nav");
ScrollTrigger.create({
  start: "top top-=1",
  end: "max",
  onUpdate: (self) => {
    nav.classList.toggle("is--scrolled", self.scroll() > 0);
  }
});




// <!-- NEW NAV -->



(function () {
  function initNav() {
    try {
      var navbar = document.querySelector('.navbar');
      var navComponent = document.querySelector('.nav_component');
      if (!navbar) return;

      var THRESHOLD = 50;
      var ATTR = 'data-wf--nav--variant';
      var VARIANT_CLASS = 'w-variant-60e6535e-fa98-f488-883d-dfb6393bd1d2';
      var ticking = false;

      var hadInverted = navComponent && navComponent.getAttribute(ATTR) === 'inverted';
      var variantEls = Array.prototype.slice.call(
        document.querySelectorAll('.nav_component .' + VARIANT_CLASS)
      );

      function update() {
        try {
          var scrolled = window.scrollY > THRESHOLD;
          navbar.classList.toggle('is-scrolled', scrolled);
          if (navComponent) navComponent.classList.toggle('is-scrolled', scrolled);

          if (hadInverted) {
            if (scrolled) {
              navComponent.removeAttribute(ATTR);
            } else {
              navComponent.setAttribute(ATTR, 'inverted');
            }
          }

          variantEls.forEach(function (el) {
            el.classList.toggle(VARIANT_CLASS, !scrolled);
          });
        } catch (err) {
          console.error('Nav update error:', err);
        }
        ticking = false;
      }

      window.addEventListener('scroll', function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      }, { passive: true });

      update();
    } catch (err) {
      console.error('Nav init error:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();

	


// <!-- BUTTON TEXT GRADIENT ON SCROLL -->

gsap.registerPlugin(ScrollTrigger);

gsap.utils.toArray('.button__text[data-text-gradient="true"]').forEach((el) => {
  gsap.fromTo(el,
    { backgroundPositionX: "0%" },
    {
      backgroundPositionX: "200%", // 👈 now 100% = one full visible pass
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    }
  );
});




// <!-- CROSS FADE SLIDER -->

document.querySelectorAll('[data-slider="init"]').forEach(function (root) {
  var list = root.querySelector('[data-slider="list"]');
  if (!list) return;

  var fade = parseFloat(root.dataset.fade) || 0.3;
  var delay = parseInt(root.dataset.autoplay, 10) || 0;
  var gsapOn = typeof window.gsap !== 'undefined';

  var slides = list.querySelectorAll('[data-slide]');
  var i = 0;
  var timer = null;

  root.style.setProperty('--fade', fade + 's');

  function show(next) {
    next = (next + slides.length) % slides.length; // wrap both ways
    if (next === i) return;

    var incoming = slides[next], outgoing = slides[i];
    i = next;

    if (gsapOn) {
      gsap.to(outgoing, { opacity: 0, duration: fade });
      gsap.to(incoming, {
        opacity: 1,
        duration: fade,
        onStart: function () { incoming.setAttribute('data-active', ''); },
        onComplete: function () { outgoing.removeAttribute('data-active'); }
      });
    } else {
      slides.forEach(function (s) { s.removeAttribute('data-active'); });
      incoming.setAttribute('data-active', '');
    }
  }

  function restart() {
    if (!delay) return;
    clearInterval(timer);
    timer = setInterval(function () { show(i + 1); }, delay);
  }

  // Re-read the slides after Finsweet injects combined items.
  function refresh() {
    slides = list.querySelectorAll('[data-slide]');
    if (!slides.length) return;
    if (i >= slides.length) i = 0;
    slides.forEach(function (s, idx) {
      if (idx === i) s.setAttribute('data-active', '');
      else s.removeAttribute('data-active');
      if (gsapOn) gsap.set(s, { opacity: idx === i ? 1 : 0 });
    });
    restart();
  }

  var next = root.querySelector('[data-slider-next]');
  var prev = root.querySelector('[data-slider-prev]');
  if (next) next.addEventListener('click', function () { show(i + 1); restart(); });
  if (prev) prev.addEventListener('click', function () { show(i - 1); restart(); });

  var debounce = null;
  new MutationObserver(function () {
    clearTimeout(debounce);
    debounce = setTimeout(refresh, 50);
  }).observe(list, { childList: true });

  refresh();
});




// <!-- FADE IN BLUR ELEMENT ON SCROLL -->

  gsap.registerPlugin(ScrollTrigger);

  function initBlurFadeAnimation() {
	const elements = document.querySelectorAll('[data-ani-blur="true"]');
    elements.forEach((el) => {
      const delay = parseFloat(el.getAttribute("data-ani-delay")) || 0;

      gsap.set(el, {
        opacity: 0,
        filter: "blur(5px)"
      });

      gsap.to(el, {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.8,
        delay: delay,
        ease: "power1.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initBlurFadeAnimation();
  });



// <!-- HEADING SPLIT BLUR -->

gsap.registerPlugin(SplitText, ScrollTrigger);

function initTextSplitAnimation() {
  const elements = document.querySelectorAll("[data-split-blur]");

  elements.forEach((el) => {
        const split = new SplitText(el, {
      type: "words, chars",
      wordsClass: "split-word",
      charsClass: "split-char"
    });
    gsap.set(split.chars, {
      opacity: 0,
      filter: "blur(5px)"
    });

    gsap.to(split.chars, {
      opacity: 1,
      filter: "blur(0px)",
      duration: 0.6,
      ease: "power1.out",
      stagger: 0.02,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });
  });
}

// ✅ Wait for fonts BEFORE splitting
function initWhenFontsReady() {
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      initTextSplitAnimation();
    });
  } else {
    // fallback
    window.addEventListener("load", initTextSplitAnimation);
  }
}

document.addEventListener("DOMContentLoaded", initWhenFontsReady);




// <!-- FEATURE SLIDER -->

gsap.registerPlugin(CustomEase, ScrollTrigger, Draggable, InertiaPlugin)

CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1")

// breakpoint helper. At 767px and below, the slider shows
// a single centered slide and moves 1 slide at a time instead of 2.
const MOBILE_BREAKPOINT = 767
const mobileQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
const isMobile = () => mobileQuery.matches

function initSliders() {
  const sliderWrappers = gsap.utils.toArray(document.querySelectorAll('[data-centered-slider="wrapper"]'))
  const teardowns = []

  function buildSlider(sliderWrapper) {
    const slides = gsap.utils.toArray(sliderWrapper.querySelectorAll('[data-centered-slider="slide"]'))
    const bullets = gsap.utils.toArray(sliderWrapper.querySelectorAll('[data-centered-slider="bullet"]'))
    const prevButton = sliderWrapper.querySelector('[data-centered-slider="prev-button"]')
    const nextButton = sliderWrapper.querySelector('[data-centered-slider="next-button"]')

    // STEP and pairCenter depend on the breakpoint.
    // Desktop/tablet: move two slides at a time, center the gap between them.
    // Mobile (<=767px): move one slide at a time, center a single slide.
    const mobile = isMobile()
    const STEP = mobile ? 1 : 2
    const PAIR_CENTER = !mobile

    let currentIndex = 0
    let autoplay
    const listeners = []

    const autoplayEnabled = sliderWrapper.getAttribute('data-slider-autoplay') === 'true'
    const autoplayDuration = autoplayEnabled ? parseFloat(sliderWrapper.getAttribute('data-slider-autoplay-duration')) || 0 : 0

    slides.forEach((slide, i) => {
      slide.setAttribute("id", `slide-${i}`)
    })

    if (bullets && bullets.length > 0) {
      bullets.forEach((bullet, i) => {
        bullet.setAttribute("aria-controls", `slide-${i}`)
        bullet.setAttribute("aria-selected", i === currentIndex ? "true" : "false")
      })
    }

    const loop = horizontalLoop(slides, {
      paused: true,
      center: true,
      pairCenter: PAIR_CENTER, // only pair-center above the breakpoint
      step: STEP,              // snapping / next / previous step
      onChange: (element, index) => {
        currentIndex = index

        slides.forEach((s) => s.classList.remove("active"))
        slides[index].classList.add("active")

        // only mark a second "partner" slide active when pairing.
        if (STEP > 1) {
          const partner = slides[(index + 1) % slides.length]
          if (partner) partner.classList.add("active")
        }

        if (bullets && bullets.length > 0) {
          bullets.forEach((bullet, i) => {
            bullet.classList.toggle("active", i === index)
            bullet.setAttribute("aria-selected", i === index ? "true" : "false")
          })
        }
      }
    })

    // start on an even pair-index above the breakpoint,
    // start on slide 0 at/below the breakpoint.
    loop.toIndex(STEP > 1 ? 2 : 0, { duration: 0.01 })

    function startAutoplay() {
      if (autoplayDuration > 0 && !autoplay) {
        const repeat = () => {
          loop.next({ ease: "osmo-ease", duration: 1.2 })
          autoplay = gsap.delayedCall(autoplayDuration, repeat)
        }
        autoplay = gsap.delayedCall(autoplayDuration, repeat)
      }
    }

    function stopAutoplay() {
      if (autoplay) {
        autoplay.kill()
        autoplay = null
      }
    }

    const st = ScrollTrigger.create({
      trigger: sliderWrapper,
      start: "top bottom",
      end: "bottom top",
      onEnter: startAutoplay,
      onLeave: stopAutoplay,
      onEnterBack: startAutoplay,
      onLeaveBack: stopAutoplay
    })

    const onEnterHandler = () => stopAutoplay()
    const onLeaveHandler = () => {
      if (ScrollTrigger.isInViewport(sliderWrapper)) startAutoplay()
    }
    sliderWrapper.addEventListener("mouseenter", onEnterHandler)
    sliderWrapper.addEventListener("mouseleave", onLeaveHandler)
    listeners.push([sliderWrapper, "mouseenter", onEnterHandler])
    listeners.push([sliderWrapper, "mouseleave", onLeaveHandler])

    // Clicking a slide jumps to the nearest valid step index,
    // but clicks on links/buttons inside a slide pass through.
    slides.forEach((slide, i) => {
      const handler = (e) => {
        if (e.target.closest("a, button")) return
        const target = i - (i % STEP)
        loop.toIndex(target, { ease: "osmo-ease", duration: 1.2 })
      }
      slide.addEventListener("click", handler)
      listeners.push([slide, "click", handler])
    })

    if (bullets && bullets.length > 0) {
      bullets.forEach((bullet, i) => {
        const handler = () => {
          const target = i - (i % STEP)
          loop.toIndex(target, { ease: "osmo-ease", duration: 1.2 })
        }
        bullet.addEventListener("click", handler)
        listeners.push([bullet, "click", handler])
      })
    }

    if (prevButton) {
      const handler = () => loop.previous({ ease: "osmo-ease", duration: 1.2 })
      prevButton.addEventListener("click", handler)
      listeners.push([prevButton, "click", handler])
    }

    if (nextButton) {
      const handler = () => loop.next({ ease: "osmo-ease", duration: 1.2 })
      nextButton.addEventListener("click", handler)
      listeners.push([nextButton, "click", handler])
    }

    // teardown so the slider can be rebuilt cleanly when the
    // breakpoint is crossed (mobile <-> desktop).
    return () => {
      stopAutoplay()
      st.kill()
      if (loop.draggable) loop.draggable.kill()
      loop.kill()
      listeners.forEach(([el, type, fn]) => el.removeEventListener(type, fn))
      slides.forEach((s) => s.classList.remove("active"))
    }
  }

  sliderWrappers.forEach((sliderWrapper) => {
    teardowns.push(buildSlider(sliderWrapper))
  })

  // rebuild all sliders when crossing the 767px breakpoint,
  // so mobile always gets 1 centered slide / 1 slide per move.
  function handleBreakpointChange() {
    teardowns.forEach((teardown) => teardown())
    teardowns.length = 0
    sliderWrappers.forEach((sliderWrapper) => {
      teardowns.push(buildSlider(sliderWrapper))
    })
  }

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", handleBreakpointChange)
  } else {
    // Safari fallback
    mobileQuery.addListener(handleBreakpointChange)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initSliders()
})

// GSAP Helper function to create a looping slider
// Read more: https://gsap.com/docs/v3/HelperFunctions/helpers/seamlessLoop
//
// Modified from the original to support:
//   config.pairCenter  -> centers the gap between item i and item i+1
//   config.step        -> snap step for next()/previous() (e.g. 2)
function horizontalLoop(items, config) {
  let timeline
  items = gsap.utils.toArray(items)
  config = config || {}
  gsap.context(() => {
    let onChange = config.onChange,
      lastIndex = 0,
      step = config.step || 1,
      tl = gsap.timeline({repeat: config.repeat, onUpdate: onChange && function() {
          let i = tl.closestIndex()
          if (lastIndex !== i) {
            lastIndex = i
            onChange(items[i], i)
          }
        }, paused: config.paused, defaults: {ease: "none"}, onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)}),
      length = items.length,
      startX = items[0].offsetLeft,
      times = [],
      widths = [],
      spaceBefore = [],
      xPercents = [],
      curIndex = 0,
      indexIsDirty = false,
      center = config.center,
      pixelsPerSecond = (config.speed || 1) * 100,
      snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1),
      timeOffset = 0,
      container = center === true ? items[0].parentNode : gsap.utils.toArray(center)[0] || items[0].parentNode,
      totalWidth,
      getTotalWidth = () => items[length-1].offsetLeft + xPercents[length-1] / 100 * widths[length-1] - startX + spaceBefore[0] + items[length-1].offsetWidth * gsap.getProperty(items[length-1], "scaleX") + (parseFloat(config.paddingRight) || 0),
      populateWidths = () => {
        let b1 = container.getBoundingClientRect(), b2
        items.forEach((el, i) => {
          widths[i] = parseFloat(gsap.getProperty(el, "width", "px"))
          xPercents[i] = snap(parseFloat(gsap.getProperty(el, "x", "px")) / widths[i] * 100 + gsap.getProperty(el, "xPercent"))
          b2 = el.getBoundingClientRect()
          spaceBefore[i] = b2.left - (i ? b1.right : b1.left)
          b1 = b2
        })
        gsap.set(items, {
          xPercent: i => xPercents[i]
        })
        totalWidth = getTotalWidth()
      },
      timeWrap,
      populateOffsets = () => {
        timeOffset = center ? tl.duration() * (container.offsetWidth / 2) / totalWidth : 0
        // when pairCenter is on, shift each item left by half a slide
        // plus half a gap so item i and item i+1 straddle the container center.
        let gap = spaceBefore[1] || 0
        center && times.forEach((t, i) => {
          let pairShift = config.pairCenter
            ? tl.duration() * ((widths[i] + gap) / 2) / totalWidth
            : 0
          times[i] = timeWrap(tl.labels["label" + i] + tl.duration() * widths[i] / 2 / totalWidth - timeOffset + pairShift)
        })
      },
      getClosest = (values, value, wrap) => {
        let i = values.length,
          closest = 1e10,
          index = 0, d
        while (i--) {
          d = Math.abs(values[i] - value)
          if (d > wrap / 2) {
            d = wrap - d
          }
          if (d < closest) {
            closest = d
            index = i
          }
        }
        return index
      },
      populateTimeline = () => {
        let i, item, curX, distanceToStart, distanceToLoop
        tl.clear()
        for (i = 0; i < length; i++) {
          item = items[i]
          curX = xPercents[i] / 100 * widths[i]
          distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0]
          distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX")
          tl.to(item, {xPercent: snap((curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond}, 0)
            .fromTo(item, {xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100)}, {xPercent: xPercents[i], duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond, immediateRender: false}, distanceToLoop / pixelsPerSecond)
            .add("label" + i, distanceToStart / pixelsPerSecond)
          times[i] = distanceToStart / pixelsPerSecond
        }
        timeWrap = gsap.utils.wrap(0, tl.duration())
      },
      refresh = (deep) => {
        let progress = tl.progress()
        tl.progress(0, true)
        populateWidths()
        deep && populateTimeline()
        populateOffsets()
        deep && tl.draggable ? tl.time(times[curIndex], true) : tl.progress(progress, true)
      },
      onResize = () => refresh(true),
      proxy
    gsap.set(items, {x: 0})
    populateWidths()
    populateTimeline()
    populateOffsets()
    window.addEventListener("resize", onResize)
    function toIndex(index, vars) {
      vars = vars || {};
      (Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length);
      let newIndex = gsap.utils.wrap(0, length, index),
        time = times[newIndex];
      if (time > tl.time() !== index > curIndex && index !== curIndex) {
        time += tl.duration() * (index > curIndex ? 1 : -1);
      }
      if (time < 0 || time > tl.duration()) {
        vars.modifiers = { time: timeWrap };
      }
      curIndex = newIndex;
      vars.overwrite = true;
      gsap.killTweensOf(proxy);
      return vars.duration === 0 ? tl.time(timeWrap(time)) : tl.tweenTo(time, vars);
    }

    tl.toIndex = (index, vars) => toIndex(index, vars)
    tl.closestIndex = setCurrent => {
      let index = getClosest(times, tl.time(), tl.duration())
      // keep the reported index on the first slide of a step group.
      if (step > 1) index -= index % step
      if (setCurrent) {
        curIndex = index
        indexIsDirty = false
      }
      return index
    }
    tl.current = () => indexIsDirty ? tl.closestIndex(true) : curIndex
    tl.next = vars => toIndex(tl.current() + step, vars)
    tl.previous = vars => toIndex(tl.current() - step, vars)
    tl.times = times
    tl.progress(1, true).progress(0, true)
    if (config.reversed) {
      tl.vars.onReverseComplete()
      tl.reverse()
    }
    tl.closestIndex(true)
    lastIndex = curIndex
    onChange && onChange(items[curIndex], curIndex)
    timeline = tl
    return () => window.removeEventListener("resize", onResize)
  })
  return timeline
}



// <!-- TOGGLE -->

  function initToggleSwitches() {
  const cleanups = [];

  document.querySelectorAll("[data-toggle-init]").forEach((toggle) => {
    const buttons = [...toggle.querySelectorAll("[data-toggle-btn]")];
    if (buttons.length < 2) return;

    toggle.style.setProperty("--toggle-count", buttons.length);

    // Initial active is the marked button, otherwise the first.
    let activeIndex = buttons.findIndex((btn) => btn.hasAttribute("data-toggle-active"));
    if (activeIndex < 0) activeIndex = 0;

    function setActive(index) {
      activeIndex = index;
      toggle.style.setProperty("--toggle-active", index);
      buttons.forEach((btn, i) => {
        const isActive = i === index;
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
        btn.toggleAttribute("data-toggle-active", isActive);
        btn.tabIndex = isActive ? 0 : -1;
      });
    }

    function onClick(event) {
      const index = buttons.indexOf(event.currentTarget);
      if (index !== activeIndex) setActive(index);
    }

    function onKeydown(event) {
      const dir = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      event.preventDefault();
      const next = (activeIndex + dir + buttons.length) % buttons.length;
      setActive(next);
      buttons[next].focus();
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", onClick);
      btn.addEventListener("keydown", onKeydown);
    });

    setActive(activeIndex);

    cleanups.push(() => {
      buttons.forEach((btn) => {
        btn.removeEventListener("click", onClick);
        btn.removeEventListener("keydown", onKeydown);
      });
    });
  });

  // Return a destroy function
  return () => cleanups.forEach((fn) => fn());
}

// Initialize Toggle Switches
document.addEventListener("DOMContentLoaded", () => {
  initToggleSwitches();
});




// <!-- DRAGGABLE LOGO MARQUEE -->

  gsap.registerPlugin(Observer, ScrollTrigger);

function initDraggableMarquee() {
  const wrappers = document.querySelectorAll("[data-draggable-marquee-init]");

  const getNumberAttr = (el, name, fallback) => {
    const value = parseFloat(el.getAttribute(name));
    return Number.isFinite(value) ? value : fallback;
  };

  wrappers.forEach((wrapper) => {
    if (wrapper.getAttribute("data-draggable-marquee-init") === "initialized") return;

    const collection = wrapper.querySelector("[data-draggable-marquee-collection]");
    const list = wrapper.querySelector("[data-draggable-marquee-list]");
    if (!collection || !list) return;

    const duration = getNumberAttr(wrapper, "data-duration", 20);
    const multiplier = getNumberAttr(wrapper, "data-multiplier", 40);
    const sensitivity = getNumberAttr(wrapper, "data-sensitivity", 0.01);

    const wrapperWidth = wrapper.getBoundingClientRect().width;
    const listWidth = list.scrollWidth || list.getBoundingClientRect().width;
    if (!wrapperWidth || !listWidth) return;

    // Make enough duplicates to cover screen
    const minRequiredWidth = wrapperWidth + listWidth + 2;
    while (collection.scrollWidth < minRequiredWidth) {
      const listClone = list.cloneNode(true);
      listClone.setAttribute("data-draggable-marquee-clone", "");
      listClone.setAttribute("aria-hidden", "true");
      collection.appendChild(listClone);
    }

    const wrapX = gsap.utils.wrap(-listWidth, 0);
    
    gsap.set(collection, { x: 0 });
    
    const marqueeLoop = gsap.to(collection, {
      x: -listWidth,
      duration,
      ease: "none",
      repeat: -1,
      onReverseComplete: () => marqueeLoop.progress(1),
      modifiers: {
        x: (x) => wrapX(parseFloat(x)) + "px"
      },
    });
    
    // Direction can be used for css + set initial direction on load
    const initialDirectionAttr = (wrapper.getAttribute("data-direction") || "left").toLowerCase();
    const baseDirection = initialDirectionAttr === "right" ? -1 : 1;
    
    const timeScale = { value: 1 };
    
    timeScale.value = baseDirection;
    wrapper.setAttribute("data-direction", baseDirection < 0 ? "right" : "left");
    
    if (baseDirection < 0) marqueeLoop.progress(1);
    
    function applyTimeScale() {
      marqueeLoop.timeScale(timeScale.value);
      wrapper.setAttribute("data-direction", timeScale.value < 0 ? "right" : "left");
    }
    
    applyTimeScale();

    // Drag observer
    const marqueeObserver = Observer.create({
      target: wrapper,
      type: "pointer,touch",
      preventDefault: true,
      debounce: false,
      onChangeX: (observerEvent) => {
        let velocityTimeScale = observerEvent.velocityX * -sensitivity;
        velocityTimeScale = gsap.utils.clamp(-multiplier, multiplier, velocityTimeScale);

        gsap.killTweensOf(timeScale);

        const restingDirection = velocityTimeScale < 0 ? -1 : 1;

        gsap.timeline({ onUpdate: applyTimeScale })
          .to(timeScale, { value: velocityTimeScale, duration: 0.1, overwrite: true })
          .to(timeScale, { value: restingDirection, duration: 1.0 });
      }
    });

    // Pause marquee when scrolled out of view
    ScrollTrigger.create({
      trigger: wrapper,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => { marqueeLoop.resume(); applyTimeScale(); marqueeObserver.enable(); },
      onEnterBack: () => { marqueeLoop.resume(); applyTimeScale(); marqueeObserver.enable(); },
      onLeave: () => { marqueeLoop.pause(); marqueeObserver.disable(); },
      onLeaveBack: () => { marqueeLoop.pause(); marqueeObserver.disable(); }
    });
    
    wrapper.setAttribute("data-draggable-marquee-init", "initialized");
  });
}

// Initialize Draggable Marquee (Directional)
document.addEventListener("DOMContentLoaded", () => {
  initDraggableMarquee();
});

// <!-- SIMPLE LOGO MARQUEE -->

function initCSSMarquee() {
  const pixelsPerSecond = 75;
  const marquees = document.querySelectorAll('[data-css-marquee]');

  marquees.forEach(marquee => {
    marquee.querySelectorAll('[data-css-marquee-list]').forEach(list => {
      marquee.appendChild(list.cloneNode(true));
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle('is-inview', entry.isIntersecting);
    });
  }, { threshold: 0 });

  marquees.forEach(marquee => {
    const customDuration = marquee.getAttribute('data-css-marquee-duration');
    const isVertical = marquee.getAttribute('data-css-marquee-axis') === 'y';
    marquee.querySelectorAll('[data-css-marquee-list]').forEach(list => {
      const size = isVertical ? list.offsetHeight : list.offsetWidth;
      list.style.animationDuration = customDuration || (size / pixelsPerSecond) + 's';
    });
    observer.observe(marquee);
  });
}

document.addEventListener('DOMContentLoaded', initCSSMarquee);




// <!-- TEXT SPLIT -->

  gsap.registerPlugin(SplitText, ScrollTrigger);

  const splitConfig = {
    lines: { duration: 0.8, stagger: 0.08 },
    words: { duration: 0.6, stagger: 0.06 },
    chars: { duration: 0.4, stagger: 0.01 },
  };

  function initMaskTextScrollReveal() {
    document.querySelectorAll('[data-split="heading"]').forEach((heading) => {
      // Reset CSS visibility here (prevents hidden text issues)
      gsap.set(heading, { autoAlpha: 1 });

      // Find the split type, default is 'lines'
      const type = heading.dataset.splitReveal || 'lines';
      const typesToSplit = type === 'lines' ? ['lines'] : type === 'words' ? ['lines', 'words'] : ['lines', 'words', 'chars'];

      // Split the text
      SplitText.create(heading, {
        type: typesToSplit.join(', '),
        mask: 'lines',
        autoSplit: true,
        linesClass: 'line',
        wordsClass: 'word',
        charsClass: 'letter',
        onSplit: function (instance) {
          const targets = instance[type];
          const config = splitConfig[type];

          // Check if element is already in viewport
          const rect = heading.getBoundingClientRect();
          const isInViewport = rect.top < window.innerHeight * 0.8;

          return gsap.from(targets, {
            yPercent: 110,
            duration: config.duration,
            stagger: config.stagger,
            ease: 'expo.out',
            scrollTrigger: isInViewport
              ? undefined
              : {
                  trigger: heading,
                  start: 'clamp(top 80%)',
                  once: true,
                },
            // If in viewport, play immediately with slight delay for polish
            delay: isInViewport ? 0.1 : 0,
          });
        },
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.fonts.ready.then(() => {
      initMaskTextScrollReveal();
    });
  });



// <!-- GRAPH GROWTH ON ENTER -->

(function () {
  var DURATION = 900;   // ms per bar
  var STAGGER  = 40;    // ms between bars
  var reduce   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init(wrp) {
    var bars = wrp.querySelectorAll('.graph-svg rect');
    if (!bars.length) return;

    bars.forEach(function (bar, i) {
      // pull tx / ty out of transform="matrix(1 0 0 -1 tx ty)"
      var n  = (bar.getAttribute('transform') || '').match(/-?[\d.]+/g) || [1, 0, 0, -1, 0, 0];
      var at = 'translate(' + n[4] + 'px,' + n[5] + 'px) scaleY(';

      bar._to = at + '-1)';
      bar.style.transform = at + (reduce ? -1 : 0) + ')';
      bar.style.setProperty('--dur', DURATION + 'ms');
      bar.style.setProperty('--delay', (i * STAGGER) + 'ms');
    });

    wrp.classList.add('is-ready');
    if (reduce) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        bars.forEach(function (bar) { bar.style.transform = bar._to; });
        io.unobserve(entry.target); // play once, no reverse on scroll up
      });
    }, { threshold: 0.2 });

    io.observe(wrp);
  }

  document.querySelectorAll('.graph_graph-wrp').forEach(init);
})();

// <!-- SWIPER ACCESSIBLITY -->

  function fixSwiperRoles() {
    document.querySelectorAll('[role="list"].swiper-wrapper').forEach((list) => {
      list.querySelectorAll('[role="group"]').forEach((child) => {
        child.setAttribute('role', 'listitem');
      });
    });
  }

  // Run after slight delay to wait for Swiper init + Webflow render
  window.addEventListener('load', () => {
    setTimeout(fixSwiperRoles, 300);
  });



// <!-- CARDS STAGGER ON SCROLL -->

  gsap.utils.toArray('[data-scroll-stagger=wrapper]').forEach((wrapper) => {
    gsap.fromTo(
      wrapper.querySelectorAll('[data-scroll-stagger=item]'), // Select cards inside the current wrapper
      { y: '15%', opacity: 0 }, // Start position for each card
      {
        y: '0%', // End position for each card
        opacity: 1,
        stagger: 0.1, // Delay between each card's animation
        scrollTrigger: {
          trigger: wrapper,
          start: 'top bottom',
          end: 'top center',
          scrub: false,
        },
      },
    );
  });


// <!-- FADE IN REVEAL ON SCROLL -->

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray('[data-scroll-fade]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 20 }, // start invisible & slightly below
      {
        opacity: 1,
        y: 0,
        duration: 1.3,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%', // fade in when element hits 80% of viewport
          toggleActions: 'play none none none', // fade out again on scroll up
        },
      },
    );
  });


// <!-- DIVIDER GROW REVEAL -->

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray('.divider-horizontal').forEach((divider) => {
    gsap.fromTo(
      divider,
      { width: '0%' }, // start collapsed
      {
        width: '100%', // expand to full width
        duration: 1.3,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: divider,
          start: 'top 90%', // when divider hits 80% of viewport
          toggleActions: 'play none none reverse', // reverse on scroll back
        },
      },
    );
  });


// <!-- PARALLAX IMAGES -->

  gsap.utils.toArray('[data-img-parallax="trigger"][data-animation="true"]').forEach((trigger) => {
    const target = trigger.querySelector('[data-img-parallax="target"]');
    if (!target) return;

    // per-element strength (percent). default = 9
    const strength = parseFloat(trigger.getAttribute('data-parallax')) || 5;
    const dir = trigger.getAttribute('data-direction') === 'reverse' ? -1 : 1;

    gsap.fromTo(
      target,
      { y: `${strength * dir}%` },
      {
        y: `${-strength * dir}%`,
        ease: 'none',
        scrollTrigger: {
          trigger,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );
  });

// <!-- FAQ ACCORDION -->
	

function initAccordionCSS() {
  document.querySelectorAll('[data-accordion-css-init]').forEach((accordion) => {
    const closeSiblings = accordion.getAttribute('data-accordion-close-siblings') === 'true';

    accordion.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-accordion-toggle]');
      if (!toggle) return; // Exit if the clicked element is not a toggle

      const singleAccordion = toggle.closest('[data-accordion-status]');
      if (!singleAccordion) return; // Exit if no accordion container is found

      const isActive = singleAccordion.getAttribute('data-accordion-status') === 'active';
      singleAccordion.setAttribute('data-accordion-status', isActive ? 'not-active' : 'active');
      
      // When [data-accordion-close-siblings="true"]
      if (closeSiblings && !isActive) {
        accordion.querySelectorAll('[data-accordion-status="active"]').forEach((sibling) => {
          if (sibling !== singleAccordion) sibling.setAttribute('data-accordion-status', 'not-active');
        });
      }
    });
  });
}

// Initialize Accordion CSS
document.addEventListener('DOMContentLoaded', () => {
  initAccordionCSS();
});

// <!-- CHART GROW REVEAL ON SCROLL -->

  gsap.registerPlugin(ScrollTrigger);

  function initBarChartAnimation() {
    const rows = document.querySelectorAll(".barchart_row");

    rows.forEach((row) => {
      const items = row.querySelectorAll(".barchart_item");
      const numbers = row.querySelectorAll(".barchart_number-wrp");
      const bottoms = row.querySelectorAll(".barchart_item-bottom");

      gsap.set(items, { height: "0%" });
      gsap.set([numbers, bottoms], { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: row,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });

      tl.to(items, {
        height: "100%",
        duration: 1.5,
        ease: "power2.out",
        stagger: 0.15
      });

      tl.to([numbers, bottoms], {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.1
      }, 0.3); // starts 0.3s after the timeline begins, not after the bars finish
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initBarChartAnimation();
  });




// <!-- HOME PRODUCT TABS -->

document.querySelectorAll('[data-tabs]').forEach(function (root) {
  var links    = Array.from(root.querySelectorAll('[data-tab]'));
  var panes    = Array.from(root.querySelectorAll('[data-tabs-pane]'));
  var currents = Array.from(root.querySelectorAll('[data-tabs-current]'));
  var prevs    = Array.from(root.querySelectorAll('[data-tabs-arrow="prev"]'));
  var nexts    = Array.from(root.querySelectorAll('[data-tabs-arrow="next"]'));
  var order    = links.map(function (l) { return l.getAttribute('data-tab'); });
  var active   = 0;

  function syncCurrent(activePane, srcLink) {
    // Number still comes from the matching link
    if (srcLink) {
      var srcNr = srcLink.querySelector('.home-tabs_menu-link-nr, .toggle-switch__number');
      currents.forEach(function (current) {
        var toNr = current.querySelector('.home-tabs_menu-link-nr, .toggle-switch__number');
        if (srcNr && toNr) toNr.innerHTML = srcNr.innerHTML;
      });
    }
    // Label comes from the active pane's data-tabs-pane-id
    if (activePane) {
      var name = activePane.getAttribute('data-tabs-pane-id') || '';
      currents.forEach(function (current) {
        var target = current.querySelector('[data-tabs-pane-id]');
        if (target) target.textContent = name;
      });
    }
  }

  function show(i) {
    active = (i + order.length) % order.length;
    var key = order[active];
    var activePane = null;
    links.forEach(function (l) {
      l.classList.toggle('is-active', l.getAttribute('data-tab') === key);
    });
    panes.forEach(function (p) {
      var on = p.getAttribute('data-tabs-pane') === key;
      p.classList.toggle('is-current', on);
      p.setAttribute('aria-hidden', on ? 'false' : 'true');
      if (on) activePane = p;
    });
    syncCurrent(activePane, links[active]);
  }

  links.forEach(function (l, i) {
    l.addEventListener('click', function () { show(i); });
  });
  prevs.forEach(function (btn) {
    btn.addEventListener('click', function () { show(active - 1); });
  });
  nexts.forEach(function (btn) {
    btn.addEventListener('click', function () { show(active + 1); });
  });

  show(0);
});



// <!-- LENIS SMOOTH SCROLL-->

  // Lenis (with GSAP ScrollTrigger)
  const lenis = new Lenis({
    lerp: 0.07,
    smooth: true,
    smoothTouch: false,
  });

  // 👇 make Lenis accessible to other scripts
  window.lenis = lenis;

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

