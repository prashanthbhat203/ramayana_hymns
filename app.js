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
  },
  UttaraKanda: {
    name: 'Uttara Kanda',
    sanskrit: 'उत्तरकाण्ड',
    meaning: 'The Final Book',
    description: 'The aftermath of the war — Rama\'s reign as king, the stories of sages and demons, Sita\'s trial by fire, and the final ascension.',
    file: 'data/UttaraKanda.json'
  }
};

const KANDA_ORDER = ['BalaKanda', 'AyodhyaKanda', 'AranyaKanda', 'KishkindhaKanda', 'SundaraKanda', 'YuddhaKanda', 'UttaraKanda'];

// ---- State ----
const state = {
  dataCache: {},       // { kandaKey: Array of verse objects }
  currentKanda: null,  // e.g. 'BalaKanda'
  currentChapter: null, // e.g. 1
  chapters: {},        // { kandaKey: { sargaNum: [verses] } }
  bookmarks: [],       // Array of { kanda, sarga, shloka, text }
  theme: 'dark',
  fontSize: 'medium'
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
  sidebarSargaList: $('#sidebar-sarga-list'),
  // FABs
  fabSearch: $('#fab-search'),
  fabBookmarks: $('#fab-bookmarks'),
  fabSettings: $('#fab-settings'),
  fabTop: $('#fab-top'),
  // Modals
  searchModal: $('#search-modal'),
  bookmarksModal: $('#bookmarks-modal'),
  settingsModal: $('#settings-modal'),
  closeSearch: $('#close-search'),
  closeBookmarks: $('#close-bookmarks'),
  closeSettings: $('#close-settings'),
  // Settings
  themeToggle: $('#theme-toggle'),
  fontToggle: $('#font-toggle'),
  // Search
  searchInput: $('#search-input'),
  searchResults: $('#search-results'),
  bookmarksList: $('#bookmarks-list'),
};

// ---- Preferences & Local Storage ----
function loadPreferences() {
  const savedBookmarks = localStorage.getItem('ramayana_bookmarks');
  if (savedBookmarks) state.bookmarks = JSON.parse(savedBookmarks);

  const savedTheme = localStorage.getItem('ramayana_theme') || 'dark';
  const savedFont = localStorage.getItem('ramayana_font') || 'medium';
  
  setTheme(savedTheme);
  setFontSize(savedFont);
  renderBookmarksList();
}

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ramayana_theme', theme);
  
  if (dom.themeToggle) {
    dom.themeToggle.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === theme);
    });
  }
}

function setFontSize(size) {
  state.fontSize = size;
  let scale = 1;
  if (size === 'small') scale = 0.85;
  if (size === 'large') scale = 1.25;
  
  document.documentElement.style.setProperty('--reading-scale', scale);
  localStorage.setItem('ramayana_font', size);
  
  if (dom.fontToggle) {
    dom.fontToggle.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === size);
    });
  }
}

// ---- Modals ----
function openModal(modalEl) {
  if (modalEl) modalEl.classList.add('active');
}

function closeModal(modalEl) {
  if (modalEl) modalEl.classList.remove('active');
}

// ---- Data Loading ----
async function loadKandaData(kandaKey) {
  if (state.dataCache[kandaKey]) return state.dataCache[kandaKey];

  const info = KANDA_INFO[kandaKey];
  if (!info) return [];

  try {
    const resp = await fetch(info.file);
    const data = await resp.json();
    state.dataCache[kandaKey] = data;

    // Build chapter (sarga) map
    const chapters = {};
    data.forEach(verse => {
      const sarga = verse.sarga;
      if (!chapters[sarga]) chapters[sarga] = [];
      chapters[sarga].push(verse);
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
    void target.offsetWidth;
    requestAnimationFrame(() => {
      target.classList.add('visible');
    });
  }

  dom.progressBar.style.display = pageId === 'reader' ? 'block' : 'none';
  dom.progressBar.style.width = '0%';

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
        <span><span class="kanda-stat-value" id="stat-chapters-${key}">—</span> sargas</span>
        <span><span class="kanda-stat-value" id="stat-verses-${key}">—</span> shlokas</span>
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

  observeReveal('.kanda-card');
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

  dom.breadcrumbKandaName.textContent = info.name;
  dom.chaptersTitle.textContent = info.name;
  dom.chaptersSubtitle.textContent = `${info.sanskrit} — ${info.meaning}`;
  dom.chaptersStats.textContent = 'Loading sargas…';

  const data = await loadKandaData(kandaKey);
  const chapters = getChapterList(kandaKey);

  dom.chaptersStats.textContent = `${chapters.length} sargas · ${data.length} shlokas`;

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
      <div class="chapter-tile-label">Sarga</div>
      <div class="chapter-tile-verses">${verseCount} shlokas</div>
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

  // Dynamic Meta Tag (SEO & Title)
  document.title = `${info.name} — Sarga ${chapter} | Valmiki Ramayana`;

  await loadKandaData(kandaKey);

  const chapters = getChapterList(kandaKey);
  const verses = state.chapters[kandaKey]?.[chapter];

  if (!verses || verses.length === 0) {
    return navigate(`#kanda/${kandaKey}`);
  }

  // Update header
  dom.readerKandaName.textContent = info.name;
  dom.readerChapterName.textContent = `Sarga ${chapter}`;

  dom.readerChapterTitle.textContent = `Sarga ${chapter}`;
  dom.readerChapterMeta.textContent = `${info.name} · ${verses.length} shlokas`;

  // Render Sidebar
  if (dom.sidebarSargaList) {
    dom.sidebarSargaList.innerHTML = '';
    chapters.forEach(ch => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = `sidebar-link ${ch === String(chapter) ? 'active' : ''}`;
      a.textContent = `Sarga ${ch}`;
      a.onclick = () => {
        if (ch !== String(chapter)) navigate(`#read/${kandaKey}/${ch}`);
      };
      li.appendChild(a);
      dom.sidebarSargaList.appendChild(li);
    });
    // Auto-scroll sidebar to current active sarga
    setTimeout(() => {
      const activeLink = dom.sidebarSargaList.querySelector('.active');
      if (activeLink) activeLink.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 100);
  }

  // Navigation state
  const chapterIdx = chapters.indexOf(String(chapter));
  const hasPrev = chapterIdx > 0;
  const hasNext = chapterIdx < chapters.length - 1;

  dom.readerPrevBtn.disabled = !hasPrev;
  dom.readerNextBtn.disabled = !hasNext;

  dom.readerPrevBtn.onclick = hasPrev ? () => navigate(`#read/${kandaKey}/${chapters[chapterIdx - 1]}`) : null;
  dom.readerNextBtn.onclick = hasNext ? () => navigate(`#read/${kandaKey}/${chapters[chapterIdx + 1]}`) : null;

  // Bottom nav
  const endPrev = dom.endPrevBtn;
  const endNext = dom.endNextBtn;

  if (hasPrev) {
    endPrev.classList.remove('disabled');
    endPrev.onclick = () => navigate(`#read/${kandaKey}/${chapters[chapterIdx - 1]}`);
    endPrev.textContent = `← Sarga ${chapters[chapterIdx - 1]}`;
  } else {
    endPrev.classList.add('disabled');
    endPrev.onclick = null;
    endPrev.textContent = '← Previous Sarga';
  }

  if (hasNext) {
    endNext.classList.remove('disabled');
    endNext.onclick = () => navigate(`#read/${kandaKey}/${chapters[chapterIdx + 1]}`);
    endNext.textContent = `Sarga ${chapters[chapterIdx + 1]} →`;
  } else {
    endNext.classList.add('disabled');
    endNext.onclick = null;
    endNext.textContent = 'Next Sarga →';
  }

  // Render verses
  dom.verseContainer.innerHTML = '';

  verses.forEach((verse) => {
    const card = document.createElement('div');
    card.className = 'verse-card';
    card.id = `verse-${verse.sarga}-${verse.shloka}`;

    const shlokaText = verse.shloka_text ? verse.shloka_text.trim() : '';
    const transliteration = verse.transliteration ? verse.transliteration.trim() : '';
    const translation = verse.translation ? verse.translation.trim() : '';
    const explanation = verse.explanation ? verse.explanation.trim() : '';
    const comments = verse.comments ? verse.comments.trim() : '';

    // Skip completely empty verses
    if (!shlokaText && !translation && !explanation) return;

    // Build expandable sections
    let expandSections = '';

    // Word-by-word meanings (translation field)
    if (translation) {
      expandSections += `
        <div class="word-dict-toggle" onclick="toggleDict(this)" role="button" tabindex="0" aria-expanded="false">
          <span class="toggle-icon">▶</span> Word-by-Word Meanings
        </div>
        <div class="word-dict-content">
          <div class="word-dict-text">${formatWordDict(translation)}</div>
        </div>
      `;
    }

    // Commentary
    if (comments) {
      expandSections += `
        <div class="word-dict-toggle commentary-toggle" onclick="toggleDict(this)" role="button" tabindex="0" aria-expanded="false">
          <span class="toggle-icon">▶</span> Commentary
        </div>
        <div class="word-dict-content">
          <div class="word-dict-text commentary-text">${escapeHTML(comments)}</div>
        </div>
      `;
    }

    // Transliteration section
    let translitHTML = '';
    if (transliteration) {
      translitHTML = `<div class="verse-transliteration">${escapeHTML(transliteration)}</div>`;
    }

    // Check if bookmarked
    const isBookmarked = state.bookmarks.some(b => b.kanda === kandaKey && b.sarga === chapter && b.shloka === verse.shloka);

    card.innerHTML = `
      <div class="verse-card-inner">
        <svg class="verse-bookmark-btn ${isBookmarked ? 'active' : ''}" onclick="toggleBookmark('${kandaKey}', ${chapter}, ${verse.shloka}, this)" width="20" height="20" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" aria-label="Bookmark Shloka"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
        <div class="verse-number">
          <span class="verse-number-badge">${verse.shloka}</span>
          Shloka ${verse.shloka}
        </div>
        ${shlokaText ? `<div class="verse-sanskrit">${escapeHTML(shlokaText)}</div>` : ''}
        ${translitHTML}
        ${explanation ? `<div class="verse-translation">${escapeHTML(explanation)}</div>` : ''}
        ${expandSections}
      </div>
    `;

    dom.verseContainer.appendChild(card);
  });

  observeReveal('.verse-card');
  setupProgressTracking();
}

// ---- Word Dictionary Formatter ----
function formatWordDict(raw) {
  if (!raw) return '';
  let text = escapeHTML(raw);

  // Highlight Sanskrit terms (devanagari word followed by English meaning)
  // Match Devanagari words
  text = text.replace(/([\u0900-\u097F\u200C\u200D]+(?:\s[\u0900-\u097F\u200C\u200D]+)*)\s+/g,
    '<strong class="sanskrit-term">$1</strong> ');

  // Add line breaks at commas between word entries for readability
  text = text.replace(/,\s*/g, ',<br/>');

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

  window._progressHandler && window.removeEventListener('scroll', window._progressHandler);
  window._progressHandler = updateProgress;
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// ---- Keyboard Navigation ----
document.addEventListener('keydown', (e) => {
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

      if (p.life <= 0 || p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
        particles[i] = createParticle();
        particles[i].y = canvas.height + 10;
        particles[i].maxLife = particles[i].life;
      }
    });

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  init();
  animate();
}

// ---- Event Wiring ----
function wireEvents() {
  dom.chaptersBreadcrumbHome.addEventListener('click', () => navigate('#home'));

  dom.readerBackBtn.addEventListener('click', () => {
    if (state.currentKanda) {
      navigate(`#kanda/${state.currentKanda}`);
    } else {
      navigate('#home');
    }
  });

  window.addEventListener('hashchange', handleRoute);

  // FAB Modals
  if (dom.fabSearch) dom.fabSearch.addEventListener('click', () => { openModal(dom.searchModal); dom.searchInput.focus(); });
  if (dom.fabBookmarks) dom.fabBookmarks.addEventListener('click', () => { openModal(dom.bookmarksModal); renderBookmarksList(); });
  if (dom.fabSettings) dom.fabSettings.addEventListener('click', () => openModal(dom.settingsModal));

  // Modal Close Buttons
  if (dom.closeSearch) dom.closeSearch.addEventListener('click', () => closeModal(dom.searchModal));
  if (dom.closeBookmarks) dom.closeBookmarks.addEventListener('click', () => closeModal(dom.bookmarksModal));
  if (dom.closeSettings) dom.closeSettings.addEventListener('click', () => closeModal(dom.settingsModal));

  // Close modals on overlay click or Escape
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(closeModal);
    }
  });

  // Settings Toggles
  if (dom.themeToggle) {
    dom.themeToggle.addEventListener('click', (e) => {
      if (e.target.classList.contains('toggle-btn')) setTheme(e.target.dataset.value);
    });
  }
  
  if (dom.fontToggle) {
    dom.fontToggle.addEventListener('click', (e) => {
      if (e.target.classList.contains('toggle-btn')) setFontSize(e.target.dataset.value);
    });
  }

  // Scroll to Top
  if (dom.fabTop) {
    dom.fabTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) dom.fabTop.classList.add('visible');
      else dom.fabTop.classList.remove('visible');
    }, { passive: true });
  }

  // Search Logic
  if (dom.searchInput) {
    let searchTimeout;
    dom.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => handleSearch(e.target.value.trim()), 400);
    });
  }
}

// ---- Bookmarks Logic ----
window.toggleBookmark = function(kanda, sarga, shloka, el) {
  const index = state.bookmarks.findIndex(b => b.kanda === kanda && b.sarga === sarga && b.shloka === shloka);
  if (index >= 0) {
    // Remove
    state.bookmarks.splice(index, 1);
    el.classList.remove('active');
    el.setAttribute('fill', 'none');
  } else {
    // Add (Capture text preview)
    const verseContent = $(`#verse-${sarga}-${shloka} .verse-translation`)?.innerText || 
                         $(`#verse-${sarga}-${shloka} .verse-sanskrit`)?.innerText || 
                         `Sarga ${sarga}, Shloka ${shloka}`;
    
    state.bookmarks.unshift({
      kanda, sarga, shloka, 
      text: verseContent.substring(0, 80) + '...',
      timestamp: Date.now()
    });
    el.classList.add('active');
    el.setAttribute('fill', 'currentColor');
  }
  
  localStorage.setItem('ramayana_bookmarks', JSON.stringify(state.bookmarks));
  renderBookmarksList();
};

function renderBookmarksList() {
  if (!dom.bookmarksList) return;
  dom.bookmarksList.innerHTML = '';
  
  if (state.bookmarks.length === 0) {
    dom.bookmarksList.innerHTML = '<div class="search-placeholder">No saved shlokas yet. Click the bookmark icon on any verse to save it.</div>';
    return;
  }

  state.bookmarks.forEach(bm => {
    const info = KANDA_INFO[bm.kanda];
    const div = document.createElement('div');
    div.className = 'bookmark-item';
    div.innerHTML = `
      <span class="bookmark-item-meta">${info.name} — Sarga ${bm.sarga}, Shloka ${bm.shloka}</span>
      <span class="bookmark-item-text">${escapeHTML(bm.text)}</span>
    `;
    div.addEventListener('click', () => {
      closeModal(dom.bookmarksModal);
      navigate(`#read/${bm.kanda}/${bm.sarga}`);
      // Scroll to specific verse after routing delay
      setTimeout(() => {
        const verseEl = $(`#verse-${bm.sarga}-${bm.shloka}`);
        if (verseEl) verseEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 500);
    });
    dom.bookmarksList.appendChild(div);
  });
}

// ---- Search Engine ----
async function handleSearch(query) {
  if (!query || query.length < 3) {
    dom.searchResults.innerHTML = '<div class="search-placeholder">Type at least 3 characters to search...</div>';
    return;
  }

  dom.searchResults.innerHTML = '<div class="search-placeholder">Searching sacred texts...</div>';
  
  const qObj = query.toLowerCase();
  const results = [];
  
  // Download all kandas if not cached (lazy load massive JSON block)
  for (const key of KANDA_ORDER) {
    const data = await loadKandaData(key);
    // Simple filter search
    for (const v of data) {
      if (
        (v.shloka_text && v.shloka_text.toLowerCase().includes(qObj)) ||
        (v.translation && v.translation.toLowerCase().includes(qObj)) ||
        (v.explanation && v.explanation.toLowerCase().includes(qObj)) ||
        (v.transliteration && v.transliteration.toLowerCase().includes(qObj))
      ) {
        results.push({ kanda: key, verse: v });
      }
      if (results.length > 50) break; // Limit to 50 results
    }
  }

  if (results.length === 0) {
    dom.searchResults.innerHTML = '<div class="search-placeholder">No verses found matching your query.</div>';
    return;
  }

  dom.searchResults.innerHTML = '';
  results.forEach(r => {
    const { kanda, verse } = r;
    const info = KANDA_INFO[kanda];
    
    // Determine which field matched best to show as preview snippet
    let previewText = verse.explanation || verse.translation || verse.shloka_text;
    if (previewText.length > 120) previewText = previewText.substring(0, 120) + '...';

    const div = document.createElement('div');
    div.className = 'search-item';
    div.innerHTML = `
      <span class="search-item-meta">${info.name} — Sarga ${verse.sarga}, Shloka ${verse.shloka}</span>
      <span class="search-item-text">${escapeHTML(previewText)}</span>
    `;
    
    div.addEventListener('click', () => {
      closeModal(dom.searchModal);
      navigate(`#read/${kanda}/${verse.sarga}`);
      setTimeout(() => {
        const verseEl = $(`#verse-${verse.sarga}-${verse.shloka}`);
        if (verseEl) {
          verseEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
          verseEl.style.boxShadow = 'var(--shadow-glow)';
          setTimeout(() => verseEl.style.boxShadow = '', 2000);
        }
      }, 500);
    });
    
    dom.searchResults.appendChild(div);
  });
}

// ---- Register Service Worker ----
function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
        .then(req => console.log('ServiceWorker registered'))
        .catch(err => console.log('ServiceWorker registration failed:', err));
    });
  }
}

// ---- Init ----
async function init() {
  loadPreferences();
  wireEvents();
  initParticles();
  handleRoute();
  registerSW();

  setTimeout(() => {
    dom.loadingScreen.classList.add('hidden');
  }, 600);
}

document.addEventListener('DOMContentLoaded', init);
