/* ================================================================
   PORTFOLIO SHARED JS — Navigation, Scroll, Canvas, Animations
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── PROGRESS BAR ────────────────────────────────────────────
  const bar = document.getElementById('progress-bar');
  if (bar) {
    window.addEventListener('scroll', () => {
      const total = document.body.scrollHeight - window.innerHeight;
      bar.style.width = Math.round((window.scrollY / total) * 100) + '%';
    });
  }

  // ── NAV SCROLL EFFECT ────────────────────────────────────────
  const nav = document.querySelector('.nav');
  const backTop = document.querySelector('.back-top');
  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
    if (backTop) backTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  // ── BACK TO TOP ──────────────────────────────────────────────
  if (backTop) {
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ── MOBILE NAV ───────────────────────────────────────────────
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.nav-mobile');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── ACTIVE NAV LINK ──────────────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(currentPage)) link.classList.add('active');
  });

  // ── SCROLL REVEAL ────────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revObs.observe(el));
  }

  // ── SKILL BAR ANIMATION ──────────────────────────────────────
  const skillBars = document.querySelectorAll('.skill-fill');
  if (skillBars.length) {
    const skillObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const pct = e.target.dataset.pct;
          e.target.style.width = pct + '%';
          skillObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    skillBars.forEach(el => skillObs.observe(el));
  }

  // ── CANVAS PARTICLE BG ───────────────────────────────────────
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const TEAL = '10,124,110';
  const GOLD = '232,160,32';
  const MINT = '29,200,176';

  class Dot {
    constructor() { this.init(); }
    init() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.r  = Math.random() * 1.8 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.cols = [TEAL, GOLD, MINT];
      this.c  = this.cols[Math.floor(Math.random() * 3)];
      this.a  = Math.random() * 0.4 + 0.1;
    }
    move() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.c},${this.a})`;
      ctx.fill();
    }
  }

  const dots = Array.from({ length: 70 }, () => new Dot());
  const CONNECT_D = 130;

  function drawConnections() {
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < CONNECT_D) {
          const a = (1 - d / CONNECT_D) * 0.12;
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(${TEAL},${a})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    dots.forEach(d => { d.move(); d.draw(); });
    requestAnimationFrame(loop);
  }
  loop();

  // ── NUMBER COUNTER ANIMATION ─────────────────────────────────
  document.querySelectorAll('[data-count]').forEach(el => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const target = +el.dataset.count;
        const suffix = el.dataset.suffix || '';
        const dur = 1800;
        const start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(ease * target) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        obs.unobserve(el);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  // ── SMOOTH HOVER CARD TILT ───────────────────────────────────
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x*10}deg) rotateX(${-y*10}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

});
