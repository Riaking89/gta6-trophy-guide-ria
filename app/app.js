// GTA VI trophy guide + tracker: loads app/data/trophies.json, renders the 55 trophies with
// their official names, descriptions and grades, and keeps the reader's checklist in
// localStorage. No network at run time beyond the app's own files; export/import move the
// checklist as a JSON file. All guide text comes from data/trophies.json, written for this
// entry in our own words with a cited source beside each trophy.
const STATE_KEY = 'gta6-trophy-guide-v1';
const DATA_URL = 'data/trophies.json';

const listEl = document.getElementById('trophyList');
const metaEl = document.getElementById('listMeta');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('gradeFilter');
const kindEl = document.getElementById('kindFilter');
const stageEl = document.getElementById('stageFilter');
const spoilerEl = document.getElementById('spoilerToggle');
const earnedOnlyEl = document.getElementById('earnedOnly');

let trophies = [];
let earned = new Set();
let spoilersHidden = true;

function loadSavedState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STATE_KEY) ?? '{}');
    if (Array.isArray(saved.earned)) earned = new Set(saved.earned.filter((id) => Number.isInteger(id)));
    if (typeof saved.spoilersHidden === 'boolean') spoilersHidden = saved.spoilersHidden;
  } catch {
    earned = new Set();
  }
  spoilerEl.checked = spoilersHidden;
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify({ earned: [...earned].sort((a, b) => a - b), spoilersHidden }));
}

async function loadTrophyData() {
  const response = await fetch(DATA_URL);
  const doc = await response.json();
  trophies = doc.trophies;
  document.getElementById('totalCount').textContent = String(trophies.length);
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  const labels = {
    story: 'Story', side: 'Side missions', collectibles: 'Collectibles', activities: 'Activities',
    robbery: 'Robbery', economy: 'Money & property', misc: 'Other', platinum: 'Platinum',
  };
  return labels[kind] ?? kind;
}

function stageLabel(stage) {
  return ['Stage 1 — Story', 'Stage 2 — 100%', 'Stage 3 — Clean-up', 'Platinum'][stage - 1] ?? '';
}

function trophyIsHidden(trophy) {
  return spoilersHidden && trophy.spoiler && !earned.has(trophy.id);
}

function trophyMatchesFilters(trophy) {
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  if (kindEl.value === 'missable') {
    if (!trophy.missable) return false;
  } else if (kindEl.value === 'online') {
    return false; // the list has no online trophies: everything is single-player
  } else if (kindEl.value !== 'all' && trophy.kind !== kindEl.value) {
    return false;
  }
  if (stageEl.value !== 'all' && String(trophy.stage) !== stageEl.value) return false;
  if (earnedOnlyEl.checked && !earned.has(trophy.id)) return false;
  return true;
}

function buildSourceLinks(sources) {
  const wrap = document.createElement('p');
  wrap.className = 'sources';
  wrap.append(document.createTextNode('Sources: '));
  sources.forEach((source, index) => {
    if (index > 0) wrap.append(document.createTextNode(' · '));
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = source.name;
    wrap.append(link);
  });
  return wrap;
}

function buildTrophyCard(trophy) {
  const card = document.createElement('article');
  card.className = 'trophy';
  card.dataset.trophyId = String(trophy.id);
  if (earned.has(trophy.id)) card.classList.add('earned');

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.id);
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(trophy.id);
    else earned.delete(trophy.id);
    saveState();
    renderProgress();
    renderTrophyList();
  });
  const title = document.createElement('div');
  title.className = 'trophy-title';
  const name = document.createElement('div');
  name.className = 'name';
  const official = document.createElement('div');
  official.className = 'official';
  if (trophyIsHidden(trophy)) {
    name.textContent = 'Hidden story trophy';
    official.textContent = 'Story trophy — its name and description stay hidden until you earn it.';
  } else {
    name.textContent = trophy.name;
    official.textContent = trophy.description;
  }
  title.append(name, official);
  const badge = document.createElement('span');
  badge.className = `grade ${trophy.grade}`;
  badge.textContent = gradeLabel(trophy.grade);
  head.append(box, title, badge);

  const tags = document.createElement('div');
  tags.className = 'tags';
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = kindLabel(trophy.kind);
  const stageTag = document.createElement('span');
  stageTag.className = 'tag stage-tag';
  stageTag.textContent = stageLabel(trophy.stage);
  tags.append(kindTag, stageTag);
  if (trophy.missable) {
    const miss = document.createElement('span');
    miss.className = 'tag missable';
    miss.textContent = '⚠ Missable';
    tags.append(miss);
  }

  const body = document.createElement('div');
  body.className = 'guide-body';
  if (trophyIsHidden(trophy)) {
    const hidden = document.createElement('p');
    hidden.className = 'guide-text';
    hidden.textContent = 'Guide hidden until earned — tick the trophy (or turn off “Hide story spoilers”) to reveal it.';
    body.append(hidden);
  } else {
    const guide = document.createElement('p');
    guide.className = 'guide-text';
    guide.textContent = trophy.guide;
    body.append(guide);
    if (Array.isArray(trophy.steps) && trophy.steps.length > 0) {
      const steps = document.createElement('ol');
      steps.className = 'steps';
      for (const step of trophy.steps) {
        const li = document.createElement('li');
        li.textContent = step;
        steps.append(li);
      }
      body.append(steps);
    }
    if (Array.isArray(trophy.sources) && trophy.sources.length > 0) {
      body.append(buildSourceLinks(trophy.sources));
    }
  }

  head.addEventListener('click', (event) => {
    if (event.target === box) return;
    body.hidden = !body.hidden;
  });
  card.append(head, tags, body);
  return card;
}

function renderProgress() {
  document.getElementById('earnedCount').textContent = String(earned.size);
  const total = trophies.length || 55;
  document.getElementById('barFill').style.width = `${Math.round((earned.size / total) * 100)}%`;
  const counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const trophy of trophies) {
    counts[trophy.grade][1] += 1;
    if (earned.has(trophy.id)) counts[trophy.grade][0] += 1;
  }
  document.getElementById('gradeCounts').textContent =
    `Platinum ${counts.platinum[0]}/${counts.platinum[1]} · Gold ${counts.gold[0]}/${counts.gold[1]} · Silver ${counts.silver[0]}/${counts.silver[1]} · Bronze ${counts.bronze[0]}/${counts.bronze[1]}`;
}

function renderTrophyList() {
  listEl.replaceChildren();
  const shown = trophies.filter(trophyMatchesFilters);
  if (shown.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = kindEl.value === 'online'
      ? 'No online trophies — the whole list is single-player (PowerPyx). Every one of the 55 can be earned offline.'
      : 'No trophies match these filters.';
    listEl.append(empty);
  } else {
    for (const trophy of shown) listEl.append(buildTrophyCard(trophy));
  }
  const earnedShown = shown.filter((trophy) => earned.has(trophy.id)).length;
  metaEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies · ${earnedShown} earned in this view`;
}

function exportProgress() {
  const payload = { app: 'gta6-trophy-guide-ria', exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b) };
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importProgress(file) {
  if (!file) return;
  try {
    const doc = JSON.parse(await file.text());
    const ids = Array.isArray(doc) ? doc : doc.earned;
    if (!Array.isArray(ids)) throw new Error('not a progress file');
    const valid = new Set(trophies.map((trophy) => trophy.id));
    earned = new Set(ids.filter((id) => valid.has(id)));
    saveState();
    renderProgress();
    renderTrophyList();
  } catch {
    metaEl.textContent = 'Import failed: that file is not a progress export from this guide.';
  }
}

function resetProgress() {
  if (!window.confirm('Clear every tick on this checklist?')) return;
  earned = new Set();
  saveState();
  renderProgress();
  renderTrophyList();
}

function setAllGuides(open) {
  for (const body of listEl.querySelectorAll('.guide-body')) body.hidden = !open;
}

searchEl.addEventListener('input', renderTrophyList);
gradeEl.addEventListener('change', renderTrophyList);
kindEl.addEventListener('change', renderTrophyList);
stageEl.addEventListener('change', renderTrophyList);
earnedOnlyEl.addEventListener('change', renderTrophyList);
spoilerEl.addEventListener('change', () => {
  spoilersHidden = spoilerEl.checked;
  saveState();
  renderTrophyList();
});
document.getElementById('exportBtn').addEventListener('click', exportProgress);
document.getElementById('importFile').addEventListener('change', (event) => {
  importProgress(event.target.files[0]);
  event.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', resetProgress);
document.getElementById('expandAll').addEventListener('click', () => setAllGuides(true));
document.getElementById('collapseAll').addEventListener('click', () => setAllGuides(false));

loadSavedState();
await loadTrophyData();
renderProgress();
renderTrophyList();
