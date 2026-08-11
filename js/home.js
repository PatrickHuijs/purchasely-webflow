
// <!-- HOME HERO GRADIENT MOVE MOVEMENT -->

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




/


