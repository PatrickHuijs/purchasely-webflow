
<!-- HOME HERO GRADIENT MOVE MOVEMENT -->

document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.section.home-hero');

  // where the gradient is now
  let currentX = 80.87;
  let currentY = 62.43;
  // where the mouse wants it to go
  let targetX = 80.87;
  let targetY = 62.43;

  // lower = slower and smoother (try 0.02 to 0.1)
  const ease = 0.01;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    targetX = ((e.clientX - rect.left) / rect.width) * 100;
    targetY = ((e.clientY - rect.top) / rect.height) * 100;
  });

  function animate() {
    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;
    hero.style.setProperty('--mouse-x', `${currentX}%`);
    hero.style.setProperty('--mouse-y', `${currentY}%`);
    requestAnimationFrame(animate);
  }
  animate();
});




<!-- CHART GROW REVEAL ON SCROLL -->

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




<!-- HOME PRODUCT TABS -->

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



