/* ===== SCROLL PROGRESS ===== */
const progressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  progressBar.style.width = pct + '%';
}, { passive: true });

/* ===== NAV ===== */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

/* ===== CUSTOM CURSOR ===== */
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mx = -100, my = -100, fx = -100, fy = -100;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

function animateCursor() {
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
  fx += (mx - fx) * 0.1;
  fy += (my - fy) * 0.1;
  follower.style.left = fx + 'px';
  follower.style.top = fy + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.classList.add('active'); follower.classList.add('active'); });
  el.addEventListener('mouseleave', () => { cursor.classList.remove('active'); follower.classList.remove('active'); });
});

/* ===== HERO CANVAS (Aurora mesh) ===== */
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
let W, H, particles;

function resize() {
  W = canvas.width = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
}
resize();
window.addEventListener('resize', resize);

function makeParticles() {
  particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 2 + 0.5,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    hue: Math.random() > 0.5 ? 250 : 195,
  }));
}
makeParticles();

function drawFrame() {
  ctx.clearRect(0, 0, W, H);

  // Aurora blobs
  const blobs = [
    { x: W * 0.75, y: H * 0.25, r: W * 0.35, h: 250 },
    { x: W * 0.2,  y: H * 0.7,  r: W * 0.28, h: 195 },
  ];
  blobs.forEach(b => {
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    g.addColorStop(0, `hsla(${b.h},80%,60%,0.12)`);
    g.addColorStop(1, `hsla(${b.h},80%,60%,0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Particles + connections
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue},70%,75%,0.6)`;
    ctx.fill();
  });

  particles.forEach((a, i) => {
    for (let j = i + 1; j < particles.length; j++) {
      const b = particles[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 120) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `hsla(250,70%,70%,${(1 - d / 120) * 0.2})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  });
  requestAnimationFrame(drawFrame);
}
drawFrame();

/* ===== TYPEWRITER ===== */
const phrases = [
  'systems at 1M TPS.',
  'AI-native enterprise platforms.',
  'knowledge graph intelligence.',
  'scalable distributed backends.',
  'LLM orchestration pipelines.',
];
let pi = 0, ci = 0, deleting = false;
const tw = document.getElementById('typewriterText');

function typewrite() {
  const phrase = phrases[pi];
  if (!deleting) {
    tw.textContent = phrase.slice(0, ++ci);
    if (ci === phrase.length) { deleting = true; setTimeout(typewrite, 2200); return; }
  } else {
    tw.textContent = phrase.slice(0, --ci);
    if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(typewrite, 400); return; }
  }
  setTimeout(typewrite, deleting ? 40 : 65);
}
typewrite();

/* ===== COUNT-UP ===== */
function countUp(el, target, prefix, suffix, duration = 1800) {
  const numEl = el.querySelector('.count-val');
  const start = performance.now();
  const isDecimal = target % 1 !== 0;

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 4);
    const val = target * ease;
    numEl.textContent = isDecimal ? val.toFixed(1) : Math.floor(val);
    if (t < 1) requestAnimationFrame(step);
    else numEl.textContent = isDecimal ? target.toFixed(1) : target;
  }
  requestAnimationFrame(step);
}

/* ===== INTERSECTION OBSERVER ===== */
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('visible');

    // Count-up for impact cards
    if (el.classList.contains('impact-card') && el.dataset.count) {
      countUp(el, parseFloat(el.dataset.count), el.dataset.prefix, el.dataset.suffix);
    }
    io.unobserve(el);
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-reveal], .exp-card, .area-card, .blog-card, .impact-card, .contact-item').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 80}ms`;
  io.observe(el);
});
