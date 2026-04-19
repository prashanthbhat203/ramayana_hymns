/* ========================================
   VALMIKI RAMAYANA — APP LOGIC
   ======================================== */

// ---- Kanda Metadata ----
const KANDA_INFO = {
  BalaKanda: {
    name: 'Bala Kanda',
    sanskrit: 'बालकाण्ड',
    meaning: 'The Book of Youth',
    description: 'The origins of Rama — from the divine lineage of Ikshvaku, the birth of the four princes through sacred fire ritual, and young Rama\'s early adventures with Sage Vishwamitra.',
    file: 'data/BalaKanda.json'
  },
  AyodhyaKanda: {
    name: 'Ayodhya Kanda',
    sanskrit: 'अयोध्याकाण्ड',
    meaning: 'The Book of Ayodhya',
    description: 'The court intrigues of Ayodhya — Rama\'s exile to the forest for fourteen years, Dasharatha\'s grief, and Bharata\'s noble refusal of the throne.',
    file: 'data/AyodhyaKanda.json'
  },
  AranyaKanda: {
    name: 'Aranya Kanda',
    sanskrit: 'अरण्यकाण्ड',
    meaning: 'The Book of the Forest',
    description: 'Life in the Dandaka forest — encounters with sages and demons, the golden deer illusion, and the fateful abduction of Sita by Ravana.',
    file: 'data/AranyaKanda.json'
  },
  KishkindhaKanda: {
    name: 'Kishkindha Kanda',
    sanskrit: 'किष्किन्धाकाण्ड',
    meaning: 'The Book of Kishkindha',
    description: 'The alliance with the Vanaras — Rama befriends Hanuman and Sugriva, the mighty battle with Vali, and the great search for Sita across the world.',
    file: 'data/KishkindhaKanda.json'
  },
  SundaraKanda: {
    name: 'Sundara Kanda',
    sanskrit: 'सुन्दरकाण्ड',
    meaning: 'The Book of Beauty',
    description: 'Hanuman\'s magnificent leap across the ocean to Lanka, discovering Sita in the Ashoka grove, and setting Lanka ablaze with his burning tail.',
    file: 'data/SundaraKanda.json'
  },
  YuddhaKanda: {
    name: 'Yuddha Kanda',
    sanskrit: 'युद्धकाण्ड',
    meaning: 'The Book of War',
    description: 'The great battle at Lanka — the bridge across the sea, the epic war between Rama\'s army and Ravana\'s forces, and the triumphant return to Ayodhya.',
    file: 'data/YuddhaKanda.json'
  }
};

const KANDA_ORDER = ['BalaKanda', 'AyodhyaKanda', 'AranyaKanda', 'KishkindhaKanda', 'SundaraKanda', 'YuddhaKanda'];

// ---- State ----
const state = {
  dataCache: {},      // { kandaKey: Array of verse objects }
  currentKanda: null,  // e.g. 'BalaKanda'
  currentChapter: null, // e.g. '10'
  chapters: {},        // { kandaKey: { chapterNum: [verses] } }
};

// ---- DOM Refs ----
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
  loadingScreen: $('#loading-screen'),
  progressBar: $('#progress-bar'),
  particleCanvas: $('#particle-canvas'),
  // Pages
  pageHome: $('#page-home'),
  pageChapters: $('#page-chapters'),
  pageReader: $('#page-reader'),
  // Home
  kandaGrid: $('#kanda-grid'),
  // Chapters
  chaptersBreadcrumbHome: $('#breadcrumb-home'),
  breadcrumbKandaName: $('#breadcrumb-kanda-name'),
  chaptersTitle: $('#chapters-title'),
  chaptersSubtitle: $('#chapters-subtitle'),
  chaptersStats: $('#chapters-stats'),
  chapterGrid: $('#chapter-grid'),
  // Reader
  readerBackBtn: $('#reader-back-btn'),
  readerKandaName: $('#reader-kanda-name'),
  readerChapterName: $('#reader-chapter-name'),
  readerPrevBtn: $('#reader-prev-btn'),
  readerNextBtn: $('#reader-next-btn'),
  readerChapterTitle: $('#reader-chapter-title'),
  readerChapterMeta: $('#reader-chapter-meta'),
  verseContainer: $('#verse-container'),
  endPrevBtn: $('#end-prev-btn'),
  endNextBtn: $('#end-next-btn'),
};

// ---- Data Loading ----
async function loadKandaData(kandaKey) {
  if (state.dataCache[kandaKey]) return state.dataCache[kandaKey];

  const info = KANDA_INFO[kandaKey];
  if (!info) return [];

  try {
    const resp = await fetch(info.file);
    const data = await resp.json();
    state.dataCache[kandaKey] = data;

    // Build chapter map
    const chapters = {};
    data.forEach(verse => {
      if (!chapters[verse.chapter]) chapters[verse.chapter] = [];
      chapters[verse.chapter].push(verse);
    });
    state.chapters[kandaKey] = chapters;

    return data;
  } catch (err) {
    console.error(`Failed to load ${kandaKey}:`, err);
    return [];
  }
}

function getChapterList(kandaKey) {
  const chapterMap = state.chapters[kandaKey];
  if (!chapterMap) return [];
  // Sort chapter numbers numerically
  return Object.keys(chapterMap).sort((a, b) => parseInt(a) - parseInt(b));
}

// ---- Page Navigation ----
function showPage(pageId) {
  const pages = $$('.page');
  pages.forEach(p => {
    p.classList.remove('active', 'visible');
  });

  const target = $(`#page-${pageId}`);
  if (target) {
    target.classList.add('active');
    // Trigger reflow for transition
    void target.offsetWidth;
    requestAnimationFrame(() => {
      target.classList.add('visible');
    });
  }

  // Update progress bar visibility
  dom.progressBar.style.display = pageId === 'reader' ? 'block' : 'none';
  dom.progressBar.style.width = '0%';

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ---- Hash Router ----
function navigate(hash) {
  window.location.hash = hash;
}

function handleRoute() {
  const hash = window.location.hash || '#home';
  const parts = hash.replace('#', '').split('/');

  if (parts[0] === 'home' || parts[0] === '') {
    showPage('home');
    renderKandaGrid();
  } else if (parts[0] === 'kanda' && parts[1]) {
    showPage('chapters');
    renderChaptersPage(parts[1]);
  } else if (parts[0] === 'read' && parts[1] && parts[2]) {
    showPage('reader');
    renderReaderPage(parts[1], parts[2]);
  } else {
    showPage('home');
    renderKandaGrid();
  }
}

// ---- Render: Kanda Grid ----
function renderKandaGrid() {
  dom.kandaGrid.innerHTML = '';

  KANDA_ORDER.forEach((key, index) => {
    const info = KANDA_INFO[key];
    const card = document.createElement('div');
    card.className = `kanda-card stagger-${index + 1}`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Read ${info.name}`);
    card.id = `kanda-card-${key}`;

    card.innerHTML = `
      <div class="kanda-number">${String(index + 1).padStart(2, '0')}</div>
      <div class="kanda-name">${info.name}</div>
      <div class="kanda-sanskrit">${info.sanskrit} — ${info.meaning}</div>
      <p class="kanda-desc">${info.description}</p>
      <div class="kanda-stats">
        <span><span class="kanda-stat-value" id="stat-chapters-${key}">—</span> chapters</span>
        <span><span class="kanda-stat-value" id="stat-verses-${key}">—</span> verses</span>
      </div>
    `;

    card.addEventListener('click', () => navigate(`#kanda/${key}`));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate(`#kanda/${key}`);
      }
    });

    dom.kandaGrid.appendChild(card);
  });

  // Reveal cards with stagger
  observeReveal('.kanda-card');

  // Load stats in background
  loadAllStats();
}

async function loadAllStats() {
  for (const key of KANDA_ORDER) {
    const data = await loadKandaData(key);
    const chapters = getChapterList(key);
    const chapEl = $(`#stat-chapters-${key}`);
    const verseEl = $(`#stat-verses-${key}`);
    if (chapEl) chapEl.textContent = chapters.length;
    if (verseEl) verseEl.textContent = data.length;
  }
}

// ---- Render: Chapters Page ----
async function renderChaptersPage(kandaKey) {
  const info = KANDA_INFO[kandaKey];
  if (!info) return navigate('#home');

  state.currentKanda = kandaKey;

  // Update banner
  dom.breadcrumbKandaName.textContent = info.name;
  dom.chaptersTitle.textContent = info.name;
  dom.chaptersSubtitle.textContent = `${info.sanskrit} — ${info.meaning}`;
  dom.chaptersStats.textContent = 'Loading chapters…';

  // Load data
  const data = await loadKandaData(kandaKey);
  const chapters = getChapterList(kandaKey);

  dom.chaptersStats.textContent = `${chapters.length} chapters · ${data.length} verses`;

  // Render chapter tiles
  dom.chapterGrid.innerHTML = '';

  chapters.forEach((chNum, index) => {
    const verseCount = state.chapters[kandaKey][chNum].length;
    const tile = document.createElement('div');
    tile.className = `chapter-tile stagger-${(index % 10) + 1}`;
    tile.setAttribute('role', 'button');
    tile.setAttribute('tabindex', '0');
    tile.id = `chapter-tile-${chNum}`;

    tile.innerHTML = `
      <div class="chapter-tile-number">${chNum}</div>
      <div class="chapter-tile-label">Chapter</div>
      <div class="chapter-tile-verses">${verseCount} verses</div>
    `;

    tile.addEventListener('click', () => navigate(`#read/${kandaKey}/${chNum}`));
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate(`#read/${kandaKey}/${chNum}`);
      }
    });

    dom.chapterGrid.appendChild(tile);
  });

  observeReveal('.chapter-tile');
}

// ---- Render: Reader Page ----
async function renderReaderPage(kandaKey, chapter) {
  const info = KANDA_INFO[kandaKey];
  if (!info) return navigate('#home');

  state.currentKanda = kandaKey;
  state.currentChapter = chapter;

  // Load data
  await loadKandaData(kandaKey);

  const chapters = getChapterList(kandaKey);
  const verses = state.chapters[kandaKey]?.[chapter];

  if (!verses || verses.length === 0) {
    return navigate(`#kanda/${kandaKey}`);
  }

  // Update header
  dom.readerKandaName.textContent = info.name;
  dom.readerChapterName.textContent = `Chapter ${chapter}`;

  // Chapter title
  dom.readerChapterTitle.textContent = `Chapter ${chapter}`;
  dom.readerChapterMeta.textContent = `${info.name} · ${verses.length} verses`;

  // Navigation state
  const chapterIdx = chapters.indexOf(chapter);
  const hasPrev = chapterIdx > 0;
  const hasNext = chapterIdx < chapters.length - 1;

  dom.readerPrevBtn.disabled = !hasPrev;
  dom.readerNextBtn.disabled = !hasNext;

  // Wire prev/next
  dom.readerPrevBtn.onclick = hasPrev ? () => navigate(`#read/${kandaKey}/${chapters[chapterIdx - 1]}`) : null;
  dom.readerNextBtn.onclick = hasNext ? () => navigate(`#read/${kandaKey}/${chapters[chapterIdx + 1]}`) : null;

  // Bottom nav
  const endPrev = dom.endPrevBtn;
  const endNext = dom.endNextBtn;

  if (hasPrev) {
    endPrev.classList.remove('disabled');
    endPrev.onclick = () => navigate(`#read/${kandaKey}/${chapters[chapterIdx - 1]}`);
    endPrev.textContent = `← Chapter ${chapters[chapterIdx - 1]}`;
  } else {
    endPrev.classList.add('disabled');
    endPrev.onclick = null;
    endPrev.textContent = '← Previous Chapter';
  }

  if (hasNext) {
    endNext.classList.remove('disabled');
    endNext.onclick = () => navigate(`#read/${kandaKey}/${chapters[chapterIdx + 1]}`);
    endNext.textContent = `Chapter ${chapters[chapterIdx + 1]} →`;
  } else {
    endNext.classList.add('disabled');
    endNext.onclick = null;
    endNext.textContent = 'Next Chapter →';
  }

  // Render verses
  dom.verseContainer.innerHTML = '';

  verses.forEach((verse, index) => {
    const card = document.createElement('div');
    const isIntro = !verse.wordDictionary && verse.translation;
    card.className = `verse-card${isIntro ? ' intro' : ''}`;
    card.id = `verse-${verse.chapter}-${verse.verse}`;

    const hasDict = verse.wordDictionary && verse.wordDictionary.trim().length > 0;
    const translationText = verse.translation ? verse.translation.trim() : '';

    // Skip empty verses
    if (!translationText && !hasDict) return;

    let dictHTML = '';
    if (hasDict) {
      dictHTML = `
        <div class="word-dict-toggle" onclick="toggleDict(this)" role="button" tabindex="0" aria-expanded="false">
          <span class="toggle-icon">▶</span> Word Meanings
        </div>
        <div class="word-dict-content">
          <div class="word-dict-text">${formatWordDict(verse.wordDictionary)}</div>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="verse-card-inner">
        <div class="verse-number">
          <span class="verse-number-badge">${verse.verse}</span>
          Verse ${verse.verse}
        </div>
        <div class="verse-translation">${escapeHTML(translationText)}</div>
        ${dictHTML}
      </div>
    `;

    dom.verseContainer.appendChild(card);
  });

  // Reveal verses on scroll
  observeReveal('.verse-card');

  // Setup progress tracking
  setupProgressTracking();
}

// ---- Word Dictionary Formatter ----
function formatWordDict(raw) {
  if (!raw) return '';

  // Escape HTML first
  let text = escapeHTML(raw);

  // Highlight Sanskrit terms (word= pattern)
  text = text.replace(/(\w[\w~\^R\']*(?:\s\w[\w~\^R\']*)*)\s*=/g,
    '<strong style="color: #D4A843;">$1</strong> =');

  // Add line breaks for readability
  text = text.replace(/;\s*/g, ';<br/>');
  text = text.replace(/\.\s*$/gm, '.<br/>');

  return text;
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- Toggle Word Dictionary ----
window.toggleDict = function(el) {
  el.classList.toggle('open');
  const content = el.nextElementSibling;
  content.classList.toggle('open');
  el.setAttribute('aria-expanded', content.classList.contains('open'));
};

// ---- Intersection Observer for Reveal ----
function observeReveal(selector) {
  const elements = $$(selector + ':not(.revealed)');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// ---- Reading Progress ----
function setupProgressTracking() {
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
    dom.progressBar.style.width = progress + '%';
  };

  // Remove any existing listener
  window._progressHandler && window.removeEventListener('scroll', window._progressHandler);
  window._progressHandler = updateProgress;
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// ---- Keyboard Navigation ----
document.addEventListener('keydown', (e) => {
  // Only in reader view
  if (!dom.pageReader.classList.contains('active')) return;

  if (e.key === 'ArrowLeft' && !dom.readerPrevBtn.disabled) {
    dom.readerPrevBtn.click();
  }
  if (e.key === 'ArrowRight' && !dom.readerNextBtn.disabled) {
    dom.readerNextBtn.click();
  }
});

// ---- Particle System ----
function initParticles() {
  const canvas = dom.particleCanvas;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -Math.random() * 0.4 - 0.1,
      opacity: Math.random() * 0.5 + 0.1,
      life: Math.random() * 200 + 100,
      maxLife: 0,
    };
  }

  function init() {
    resize();
    particles = [];
    const count = Math.min(Math.floor(canvas.width * canvas.height / 15000), 60);
    for (let i = 0; i < count; i++) {
      const p = createParticle();
      p.maxLife = p.life;
      particles.push(p);
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.life--;

      const lifeRatio = p.life / p.maxLife;
      const alpha = p.opacity * lifeRatio;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 168, 67, ${alpha})`;
      ctx.fill();

      // Reset dead particles
      if (p.life <= 0 || p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
        particles[i] = createParticle();
        particles[i].y = canvas.height + 10;
        particles[i].maxLife = particles[i].life;
      }
    });

    animId = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
  });

  init();
  animate();
}

// ---- Event Wiring ----
function wireEvents() {
  // Breadcrumb home
  dom.chaptersBreadcrumbHome.addEventListener('click', () => navigate('#home'));

  // Reader back button
  dom.readerBackBtn.addEventListener('click', () => {
    if (state.currentKanda) {
      navigate(`#kanda/${state.currentKanda}`);
    } else {
      navigate('#home');
    }
  });

  // Hash change
  window.addEventListener('hashchange', handleRoute);
}

// ---- Init ----
async function init() {
  wireEvents();
  initParticles();

  // Show home with initial route
  handleRoute();

  // Hide loading screen
  setTimeout(() => {
    dom.loadingScreen.classList.add('hidden');
  }, 600);
}

// Boot
document.addEventListener('DOMContentLoaded', init);
