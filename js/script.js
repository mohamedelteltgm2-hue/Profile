/* ===================================================
   PORTFOLIO – script.js
   Mohamed Abdelraouf | Architectural Engineer
   =================================================== */

'use strict';

/* ===== THEME TOGGLE ===== */
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// Default: dark mode (already set in HTML attribute)
function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);
  themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Load saved preference or keep dark default
const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});


/* ===== HAMBURGER MENU ===== */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }
});


/* ===== STICKY NAVBAR ===== */
const navbar = document.getElementById('navbar');

const handleNavbarScroll = () => {
  if (window.scrollY > 30) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
};

window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll(); // run on page load


/* ===== ACTIVE NAV LINK ON SCROLL ===== */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const updateActiveLink = () => {
  const scrollY = window.scrollY + 100;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;

    if (scrollY >= top && scrollY < top + height) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${section.id}"]`);
      if (active) active.classList.add('active');
    }
  });
};

window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink();


/* ===== SCROLL REVEAL ANIMATIONS ===== */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings slightly
        const siblings = Array.from(
          entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')
        );
        const idx = siblings.indexOf(entry.target);
        const delay = Math.min(idx * 80, 400); // max 400ms stagger

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px',
  }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ===== CONTACT FORM (SIMULATED) ===== */
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = contactForm.querySelector('#email').value.trim();
    const message = contactForm.querySelector('#message').value.trim();
    const subject = contactForm.querySelector('#subject').value.trim() || 'Portfolio Inquiry';

    if (!email || !message) {
      formNote.style.color = '#ef4444';
      formNote.textContent = 'Please fill in all required fields.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      formNote.style.color = '#ef4444';
      formNote.textContent = 'Please enter a valid email address.';
      return;
    }

    // Construct Gmail Compose URL
    const recipient = 'mohamed.abdelraoufalex@gmail.com';
    const bodyText = message; // Body only contains the message now
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

    // Update UI and Redirect
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> Opening Gmail…';

    setTimeout(() => {
      window.open(gmailUrl, '_blank');
      contactForm.reset();
      formNote.style.color = '';
      formNote.textContent = '✅ Gmail opened! Please click "Send" in the new tab.';
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';

      setTimeout(() => { formNote.textContent = ''; }, 8000);
    }, 1000);
  });
}


/* ===== SMOOTH SCROLL POLYFILL FOR OLDER SAFARI ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


// Open mailto: links in Gmail instead of default client
document.addEventListener('click', (e) => {
  const mailtoLink = e.target.closest('a[href^="mailto:"]');
  if (mailtoLink) {
    e.preventDefault();
    const email = mailtoLink.getAttribute('href').replace('mailto:', '');
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
    window.open(gmailUrl, '_blank');
  }
});


/* ===== TYPED HERO TITLE EFFECT ===== */
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
  const phrases = [
    'Architectural Engineer',
    'AutoCAD Instructor',
    'Presentation Designer',
    'Visualizer',
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let pauseMs = 0;

  function type() {
    const current = phrases[phraseIdx];

    if (!deleting) {
      heroTitle.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        pauseMs = 2000; // pause before deleting
      }
    } else {
      heroTitle.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        pauseMs = 400;
      }
    }

    const speed = deleting ? 50 : 80;
    const wait = pauseMs > 0 ? pauseMs : speed;
    pauseMs = 0;

    setTimeout(type, wait);
  }

  // Start after a short delay so page loads first
  setTimeout(type, 1200);
}


/* ===== PROJECT GALLERY — DYNAMIC (reads data/projects.json) ===== */

// Lightbox DOM refs
const overlay = document.getElementById('lightboxOverlay');
const lbTitle = document.getElementById('lightboxTitle');
const lbCounter = document.getElementById('lightboxCounter');
const lbStage = document.getElementById('lightboxStage');
const lbThumbs = document.getElementById('lightboxThumbs');
const lbClose = document.getElementById('lightboxClose');
const lbPrev = document.getElementById('lightboxPrev');
const lbNext = document.getElementById('lightboxNext');

let currentGallery = null;
let currentIndex = 0;
let galleries = {};           // keyed by project id

/* ---- Lightbox core ---- */
function openLightbox(id, startIndex = 0) {
  currentGallery = galleries[id];
  if (!currentGallery) return;
  currentIndex = startIndex;
  lbTitle.textContent = currentGallery.title;
  document.body.style.overflow = 'hidden';

  // Build thumbnail strip
  lbThumbs.innerHTML = '';
  currentGallery.items.forEach((item, i) => {
    const t = document.createElement('div');
    t.className = 'lb-thumb' + (item.type === 'video' ? ' video-thumb' : '');
    if (item.type === 'video') {
      t.innerHTML = '<i class="fas fa-play"></i>';
    } else {
      const img = document.createElement('img');
      img.src = item.src; img.alt = ''; img.loading = 'lazy';
      t.appendChild(img);
    }
    t.addEventListener('click', () => showSlide(i));
    lbThumbs.appendChild(t);
  });

  overlay.classList.add('open');
  showSlide(currentIndex);
}

function closeLightbox() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  const vid = lbStage.querySelector('video');
  if (vid) vid.pause();
  currentGallery = null;
}

function showSlide(index) {
  if (!currentGallery) return;
  const items = currentGallery.items;
  index = Math.max(0, Math.min(index, items.length - 1));
  currentIndex = index;

  const existingVid = lbStage.querySelector('video');
  if (existingVid) existingVid.pause();

  const item = items[index];
  lbStage.innerHTML = '';

  if (item.type === 'video') {
    const vid = document.createElement('video');
    vid.src = item.src; vid.controls = true; vid.autoplay = true;
    vid.style.cssText = 'max-width:100%;max-height:100%';
    lbStage.appendChild(vid);
  } else {
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = `${currentGallery.title} — ${index + 1}`;
    lbStage.appendChild(img);
  }

  lbCounter.textContent = `${index + 1} / ${items.length}`;
  lbPrev.disabled = index === 0;
  lbNext.disabled = index === items.length - 1;

  lbThumbs.querySelectorAll('.lb-thumb').forEach((t, i) =>
    t.classList.toggle('active', i === index)
  );
  const at = lbThumbs.children[index];
  if (at) at.scrollIntoView({ inline: 'center', behavior: 'smooth' });
}

/* ---- Event listeners ---- */
lbClose.addEventListener('click', closeLightbox);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLightbox(); });
lbPrev.addEventListener('click', () => showSlide(currentIndex - 1));
lbNext.addEventListener('click', () => showSlide(currentIndex + 1));
document.addEventListener('keydown', (e) => {
  if (!overlay.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') showSlide(currentIndex + 1);
  if (e.key === 'ArrowLeft') showSlide(currentIndex - 1);
});

/* ---- Card renderer ---- */
function renderProjectCard(project) {
  const cover = project.items.find(i => i.type === 'image') || project.items[0];
  const imgCount = project.items.filter(i => i.type === 'image').length;
  const vidCount = project.items.filter(i => i.type === 'video').length;

  let countLabel = '';
  if (imgCount && vidCount) countLabel = `${imgCount} image${imgCount > 1 ? 's' : ''} · ${vidCount} video${vidCount > 1 ? 's' : ''}`;
  else if (imgCount) countLabel = `${imgCount} image${imgCount > 1 ? 's' : ''}`;
  else if (vidCount) countLabel = `${vidCount} video${vidCount > 1 ? 's' : ''}`;

  const coverIcon = vidCount && !imgCount ? 'fas fa-play-circle' : 'fas fa-images';

  const tags = (project.tags || []).map(t => `<span>${t}</span>`).join('');
  const id = project.id;

  const article = document.createElement('article');
  article.className = 'project-card reveal';
  article.dataset.project = id;

  article.innerHTML = `
    <div class="project-thumb">
      ${cover ? `<img src="${cover.src}" alt="${project.title} preview" loading="lazy" />` : ''}
      <div class="project-thumb-overlay">
        <span><i class="${coverIcon}"></i> ${project.items.length} file${project.items.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
    <div class="project-card-body">
      <div class="project-card-top">
        <div class="project-icon"><i class="${project.icon || 'fas fa-folder-open'}"></i></div>
        <span class="project-count">${countLabel}</span>
      </div>
      <h3>${project.title}</h3>
      <p>${project.description || ''}</p>
      <div class="project-tags">${tags}</div>
      <button class="btn btn-primary btn-gallery" data-gallery="${id}">
        <i class="fas fa-expand-alt"></i> Open Gallery
      </button>
    </div>`;

  article.querySelector('.btn-gallery').addEventListener('click', () => openLightbox(id, 0));
  return article;
}

/* ---- Bootstrap: fetch JSON (or use pre-loaded global) → render everything ---- */
async function loadProjects() {
  const grid = document.getElementById('projectsGrid');

  // Helper to process the data once retrieved
  const initGallery = (projects) => {
    galleries = {};
    projects.forEach(p => { galleries[p.id] = p; });

    grid.innerHTML = '';
    projects.forEach(p => {
      if (!p.items || p.items.length === 0) return;   // skip empty folders
      const card = renderProjectCard(p);
      grid.appendChild(card);
      revealObserver.observe(card);
    });

    if (grid.children.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center">No projects found. Add folders to images/Projects/ and run update-projects.ps1</p>';
    }
  };

  // 1. Check if data was pre-loaded via script tag (supports file://)
  if (window.projectData) {
    initGallery(window.projectData);
    return;
  }

  // 2. Fallback to fetch (for server environments)
  try {
    const res = await fetch('data/projects.json?v=' + Date.now());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    initGallery(data);
  } catch (err) {
    console.warn('Projects data not found.', err);
    grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center">⚠️ Projects data missing. Run update-projects.ps1 to generate it.</p>';
  }
}

loadProjects();

/* ===== INTERACTIVE HERO BACKGROUND ===== */
const hero = document.getElementById('hero');
const interactiveBg = document.getElementById('interactiveBg');

if (hero && interactiveBg) {
  // Click Pulse Effect
  hero.addEventListener('mousedown', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pulse = document.createElement('div');
    pulse.className = 'click-pulse';
    pulse.style.left = `${x}px`;
    pulse.style.top = `${y}px`;

    interactiveBg.appendChild(pulse);

    // Remove after animation finishes
    setTimeout(() => {
      pulse.remove();
    }, 800);
  });
}
