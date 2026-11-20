// Leonida Platinum — tracker logic.
// Progress lives in localStorage on this device only. A "?demo=1" link seeds a
// sample set in memory for screenshots and trying the filters; demo progress is
// never written to storage, and a plain visit always starts from your real save.

const STORAGE_KEY = 'leonida-platinum-earned-v1';
const SPOILER_KEY = 'leonida-platinum-spoiler-v1';
const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];
const DEMO_IDS = [2, 3, 4, 8, 16, 21, 22, 25, 33, 39, 44];

const params = new URLSearchParams(location.search);
const demoMode = params.get('demo') === '1';

// Screenshot/focus links (?view=tracker etc.) ask CSS to bring one part of the
// page to the top; a normal visit has no view and shows the whole page.
if (params.get('view')) document.body.dataset.view = params.get('view');

const cardsEl = document.getElementById('checklist');
const showingEl = document.getElementById('showingLine');
const searchEl = document.getElementById('searchBox');
const gradeEl = document.getElementById('gradeFilter');
const kindEl = document.getElementById('kindFilter');
const statusEl = document.getElementById('statusFilter');
const spoilerEl = document.getElementById('spoilerToggle');

let trophies = [];
let earned = loadEarned();
let spoilerOn = loadSpoiler();

function loadEarned() {
  if (demoMode) return new Set(DEMO_IDS);
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return new Set(Array.isArray(raw) ? raw.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

function loadSpoiler() {
  if (params.has('spoiler')) return params.get('spoiler') === '1';
  return localStorage.getItem(SPOILER_KEY) === '1';
}

function persist() {
  if (demoMode) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
  localStorage.setItem(SPOILER_KEY, spoilerOn ? '1' : '0');
}

function gradeTotals() {
  const totals = {};
  for (const g of GRADE_ORDER) totals[g] = { got: 0, all: 0 };
  for (const t of trophies) {
    totals[t.grade].all += 1;
    if (earned.has(t.id)) totals[t.grade].got += 1;
  }
  return totals;
}

function renderProgress() {
  const total = trophies.length || 55;
  const pct = total ? Math.round((earned.size / total) * 100) : 0;
  document.getElementById('earnedCount').textContent = String(earned.size);
  document.getElementById('earnedPct').textContent = pct + '%';
  const ring = document.getElementById('ringFill');
  const circumference = 326.7;
  ring.style.strokeDashoffset = String(circumference * (1 - (total ? earned.size / total : 0)));
  const bars = document.getElementById('gradeBars');
  bars.replaceChildren();
  const totals = gradeTotals();
  for (const g of GRADE_ORDER) {
    const row = document.createElement('div');
    row.className = 'grade-bar';
    const name = document.createElement('span');
    name.textContent = g[0].toUpperCase() + g.slice(1);
    const track = document.createElement('span');
    track.className = 'track';
    const fill = document.createElement('span');
    fill.className = 'fill fill-' + g;
    fill.style.display = 'block';
    fill.style.width = totals[g].all ? (totals[g].got / totals[g].all) * 100 + '%' : '0%';
    track.append(fill);
    const count = document.createElement('span');
    count.textContent = totals[g].got + ' / ' + totals[g].all;
    row.append(name, track, count);
    bars.append(row);
  }
}

function isSpoilerHidden(t) {
  return spoilerOn && t.kind === 'story' && !earned.has(t.id);
}

function matchesFilters(t) {
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
  if (statusEl.value === 'earned' && !earned.has(t.id)) return false;
  if (statusEl.value === 'open' && earned.has(t.id)) return false;
  if (statusEl.value === 'missable' && !t.missable) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    if (isSpoilerHidden(t)) return false;
    const haystack = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + t.kind + ' ' + t.grade).toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

function buildCard(t) {
  const card = document.createElement('article');
  card.className = 'card grade-' + t.grade + (earned.has(t.id) ? ' is-earned' : '');
  const hidden = isSpoilerHidden(t);

  const head = document.createElement('div');
  head.className = 'card-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', 'Mark trophy as earned');
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    persist();
    renderAll();
  });
  const title = document.createElement('h3');
  if (hidden) {
    title.textContent = 'Hidden story trophy';
  } else {
    title.textContent = t.name + ' ';
    if (earned.has(t.id)) {
      const done = document.createElement('span');
      done.className = 'done-tag';
      done.textContent = '✓ EARNED';
      title.append(done);
    }
  }
  head.append(box, title);
  card.append(head);

  const pills = document.createElement('div');
  pills.className = 'pills';
  const gradePill = document.createElement('span');
  gradePill.className = 'pill grade-' + t.grade;
  gradePill.textContent = t.grade;
  pills.append(gradePill);
  const kindPill = document.createElement('span');
  kindPill.className = 'pill';
  kindPill.textContent = t.kind;
  pills.append(kindPill);
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'pill missable';
    m.textContent = '⚠ Missable';
    pills.append(m);
  }
  if (t.unconfirmed) {
    const u = document.createElement('span');
    u.className = 'pill unconfirmed';
    u.textContent = 'Unconfirmed';
    pills.append(u);
  }
  card.append(pills);

  if (hidden) {
    const veil = document.createElement('p');
    veil.className = 'spoiler-veil';
    veil.textContent = 'Spoiler shield is on: this story trophy\u2019s name, description and guide stay hidden until you tick it earned — or turn the shield off above.';
    card.append(veil);
    return card;
  }

  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = '\u201C' + t.description + '\u201D';
  card.append(official);

  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = t.guide;
  card.append(guide);

  const src = document.createElement('p');
  src.className = 'card-sources';
  const label = document.createElement('strong');
  label.textContent = 'Sources: ';
  src.append(label, document.createTextNode((t.sources || []).join(', ') + ' — official list + guides, accessed 20 Nov 2026.'));
  card.append(src);
  return card;
}

function renderCards() {
  const visible = trophies.filter(matchesFilters);
  cardsEl.replaceChildren();
  if (!visible.length) {
    const note = document.createElement('p');
    note.className = 'empty-note';
    note.textContent = 'No trophies match those filters. Loosen the search or pick another grade or kind.';
    cardsEl.append(note);
  } else {
    for (const t of visible) cardsEl.append(buildCard(t));
  }
  const suffix = demoMode ? ' · demo view (sample progress, not saved)' : '';
  showingEl.textContent = 'Showing ' + visible.length + ' of ' + trophies.length + ' trophies · ' + earned.size + ' earned' + suffix;
}

function renderAll() {
  renderProgress();
  renderCards();
}

function applyParamFilters() {
  if (params.get('grade')) gradeEl.value = params.get('grade');
  if (params.get('kind')) kindEl.value = params.get('kind');
  if (params.get('status')) statusEl.value = params.get('status');
  if (params.get('q')) searchEl.value = params.get('q');
  spoilerEl.checked = spoilerOn;
}

function exportProgress() {
  const payload = {
    app: 'Leonida Platinum — GTA VI trophy tracker',
    version: 1,
    exported: new Date().toISOString(),
    earnedIds: [...earned].sort((a, b) => a - b),
    earnedNames: trophies.filter((t) => earned.has(t.id)).map((t) => t.name),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importProgress(file) {
  const data = JSON.parse(await file.text());
  const byName = new Map(trophies.map((t) => [t.name.toLowerCase(), t.id]));
  const next = new Set();
  const lists = [data.earnedIds, data.earned, data.earnedNames, Array.isArray(data) ? data : null];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (Number.isInteger(item) && trophies.some((t) => t.id === item)) next.add(item);
      else if (typeof item === 'string' && byName.has(item.toLowerCase())) next.add(byName.get(item.toLowerCase()));
    }
  }
  earned = next;
  persist();
  renderAll();
}

document.getElementById('exportBtn').addEventListener('click', exportProgress);
document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    await importProgress(file);
  } catch {
    showingEl.textContent = 'That import file could not be read as trophy progress JSON. Export a fresh file and try again.';
  }
  event.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  earned = new Set();
  persist();
  renderAll();
});
for (const el of [searchEl, gradeEl, kindEl, statusEl]) {
  el.addEventListener('input', renderCards);
  el.addEventListener('change', renderCards);
}
spoilerEl.addEventListener('change', () => {
  spoilerOn = spoilerEl.checked;
  persist();
  renderCards();
});

async function boot() {
  const response = await fetch('data/trophies.json');
  const doc = await response.json();
  trophies = doc.trophies;
  applyParamFilters();
  renderAll();
}

boot();
