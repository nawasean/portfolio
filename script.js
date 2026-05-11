/* ════════════════════════════════════════════════
   NAWAPORN PORTFOLIO — script.js
   ════════════════════════════════════════════════

   HOW TO UPDATE CONTENT:
   → Edit content.en.json  for English text
   → Edit content.th.json  for Thai text
   → No need to touch this file or index.html
   ════════════════════════════════════════════════ */

// ── CONFIG ────────────────────────────────────────
const TOOLS = [
  'Figma','Adobe XD','Photoshop','Illustrator',
  'Premiere Pro','WordPress','Google Analytics',
  'Meta Business Suite','YouTube Studio','Microsoft 365'
];

// ── STATE ─────────────────────────────────────────
let currentLang = 'en';
let content     = {};   // holds the loaded JSON for current lang

// ── BOOT ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadLang('en');
  initScrollAnimations();
});

// ── LANGUAGE LOADING ──────────────────────────────
async function loadLang(lang) {
  try {
    const res  = await fetch(`content.${lang}.json`);
    content    = await res.json();
    currentLang = lang;
    applyContent();
    updateLangButtons();
    document.body.classList.toggle('lang-th', lang === 'th');
    document.documentElement.lang = lang;
  } catch (err) {
    console.error('Could not load language file:', err);
  }
}

function setLang(lang) {
  if (lang !== currentLang) loadLang(lang);
}

function updateLangButtons() {
  document.getElementById('btn-en').classList.toggle('active', currentLang === 'en');
  document.getElementById('btn-th').classList.toggle('active', currentLang === 'th');
}

// ── CONTENT APPLICATION ───────────────────────────
function applyContent() {
  // Update <title>
  document.getElementById('page-title').textContent = content.meta.title;

  // Simple text nodes:  data-i18n="section.key"
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = getNestedValue(content, el.dataset.i18n);
    if (val !== undefined) el.textContent = val;
  });

  // HTML nodes (allow <strong>, <em>):  data-i18n-html="section.key"
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const val = getNestedValue(content, el.dataset.i18nHtml);
    if (val !== undefined) el.innerHTML = val;
  });

  // Dynamic sections built from JSON arrays
  buildTimeline();
  buildSkills();
  buildWork();
  buildCertificates();

  // Re-observe new fade-in elements
  initScrollAnimations();
}

// ── TIMELINE ──────────────────────────────────────
function buildTimeline() {
  const container = document.getElementById('timeline');
  if (!container) return;

  container.innerHTML = content.experience.jobs.map(job => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-date">${job.date}</div>
      <div class="timeline-role">${job.role}</div>
      <div class="timeline-company">${job.company}</div>
      <ul class="timeline-bullets">
        ${job.bullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

// ── SKILLS ────────────────────────────────────────
function buildSkills() {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;

  grid.innerHTML = content.skills.items.map((item, i) => `
    <div class="skill-card fade-in" style="transition-delay:${i * 0.05}s">
      <div class="skill-icon">${item.icon}</div>
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
    </div>
  `).join('');
}

// ── WORK / FILTER ─────────────────────────────────
function buildWork() {
  buildFilterTabs();
  renderProjects('all');
}

function buildFilterTabs() {
  const tabs = document.getElementById('filter-tabs');
  if (!tabs) return;

  const filters = [
    { key: 'all',     label: content.work.filter_all     },
    { key: 'ux',      label: content.work.filter_ux      },
    { key: 'content', label: content.work.filter_content },
    { key: 'design',  label: content.work.filter_design  }
  ];

  tabs.innerHTML = filters.map((f, i) => `
    <button
      class="filter-btn ${i === 0 ? 'active' : ''}"
      onclick="filterWork('${f.key}', this)"
    >${f.label}</button>
  `).join('');
}

function renderProjects(cat) {
  const grid     = document.getElementById('work-grid');
  if (!grid) return;

  const filtered = cat === 'all'
    ? content.work.projects
    : content.work.projects.filter(p => p.cat.includes(cat));

  grid.innerHTML = filtered.map((p, i) => `
    <div class="work-card fade-in" data-cat="${p.cat}" style="transition-delay:${i * 0.05}s">
      <div class="work-thumb" style="background:${p.thumb_color}">
        ${p.emoji}
        <div class="work-thumb-label">${p.thumb_label}</div>
      </div>
      <div class="work-body">
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <div class="work-tags">
          ${p.tags.map(t => `<span class="work-tag">${t}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');

  initScrollAnimations();
}

function filterWork(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProjects(cat);
}

// ── CERTIFICATES ──────────────────────────────────
function buildCertificates() {
  const grid = document.getElementById('cert-grid');
  if (!grid) return;

  grid.innerHTML = content.certificates.items.map((c, i) => `
    <div class="cert-card fade-in" style="transition-delay:${i * 0.05}s">
      <div class="cert-icon">${c.icon}</div>
      <div class="cert-info">
        <h4>${c.title}</h4>
        <p>${c.sub}</p>
      </div>
    </div>
  `).join('');
}

// ── SCROLL ANIMATIONS ─────────────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => observer.observe(el));
}

// ── UTILITY ───────────────────────────────────────
// Reads nested keys like "hero.tagline" from an object
function getNestedValue(obj, keyPath) {
  return keyPath.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}
