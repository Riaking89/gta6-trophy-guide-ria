// Vice City Trophy Tracker — an offline checklist for all 55 GTA VI trophies.
// Progress lives in localStorage; export/import moves it as a JSON file.
// No network at run time: the only fetch is the trophy list beside this file.

const STORE_KEY = 'vice-city-trophy-tracker-v2';
const DATA_URL = 'data/trophies.json';

const els = {
  list: document.getElementById('trophy-list'),
  progressBar: document.getElementById('progress-fill'),
  progressText: document.getElementById('progress-text'),
  search: document.getElementById('search'),
  grade: document.getElementById('grade-filter'),
  kind: document.getElementById('kind-filter'),
  stage: document.getElementById('stage-filter'),
  missable: document.getElementById('missable-filter'),
  spoiler: document.getElementById('spoiler-toggle'),
  exportBtn: document.getElementById('export-btn'),
  importInput: document.getElementById('import-input'),
  resetBtn: document.getElementById('reset-btn'),
  roadmap: document.getElementById('roadmap'),
  empty: document.getElementById('empty-state'),
  detail: document.getElementById('detail'),
  detailClose: document.getElementById('detail-close'),
};

const STAGES = [
  { n: 1, title: 'Stage 1 — Story first', blurb: 'Play Chapters 1–4 and the final mission. Do the Chapter 1 balcony meditation before the chapter ends — it is the one missable trophy.' },
  { n: 2, title: 'Stage 2 — Side missions & strangers', blurb: 'Finish the five side-character strands, the 8 stranger strands, Bret\u2019s hunt and the 18 meditation spots.' },
  { n: 3, title: 'Stage 3 — Activities & challenges', blurb: 'Races, ranges, stunts, challenges and the combat feats. Most of these count while you play naturally.' },
  { n: 4, title: 'Stage 4 — Cleanup & platinum', blurb: 'Collectibles, money grinds, exploring all 52 areas, then 100% completion and the platinum.' },
];

const KIND_LABELS = {
  story: 'Story', side: 'Side mission', activities: 'Activity',
  collectibles: 'Collectible', combat: 'Combat', exploration: 'Exploration',
  money: 'Money', misc: 'Misc',
};

let trophies = [];
let earned = new Set(loadStored());
let openDetail = null;

function loadStored() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort()));
}

function gradeRank(grade) {
  return { platinum: 0, gold: 1, silver: 2, bronze: 3 }[grade] ?? 4;
}

function spoilerHidden(t) {
  return t.spoiler && !els.spoiler.checked && !earned.has(t.name);
}

function visible(t) {
  const q = els.search.value.trim().toLowerCase();
  if (els.grade.value !== 'all' && t.grade !== els.grade.value) return false;
  if (els.kind.value === 'online') return false; // the game lists no online trophies
  if (els.kind.value !== 'all' && t.kind !== els.kind.value) return false;
  if (els.stage.value !== 'all' && t.stage !== Number(els.stage.value)) return false;
  if (els.missable.checked && !t.missable) return false;
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
  return true;
}

function card(t) {
  const li = document.createElement('article');
  li.className = 'card grade-' + t.grade + (earned.has(t.name) ? ' earned' : '');
  li.dataset.name = t.name;

  const tick = document.createElement('input');
  tick.type = 'checkbox';
  tick.checked = earned.has(t.name);
  tick.setAttribute('aria-label', 'Mark ' + (spoilerHidden(t) ? 'this story trophy' : t.name) + ' as earned');
  tick.addEventListener('change', () => {
    if (tick.checked) earned.add(t.name);
    else earned.delete(t.name);
    persist();
    render();
  });

  const head = document.createElement('div');
  head.className = 'card-head';
  const name = document.createElement('h3');
  name.textContent = spoilerHidden(t) ? 'Hidden story trophy' : t.name;
  const badge = document.createElement('span');
  badge.className = 'grade-badge';
  badge.textContent = t.grade;
  head.append(name, badge);

  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = spoilerHidden(t) ? 'Earn this story trophy to reveal its name and description.' : t.description;

  const meta = document.createElement('p');
  meta.className = 'meta';
  const bits = [KIND_LABELS[t.kind] || t.kind, 'Stage ' + t.stage];
  if (t.missable) bits.push('MISSABLE');
  meta.textContent = bits.join(' · ');

  const open = document.createElement('button');
  open.type = 'button';
  open.className = 'guide-btn';
  open.textContent = 'Read the guide';
  open.addEventListener('click', () => showDetail(t));

  li.append(tick, head, desc, meta, open);
  return li;
}

function showDetail(t) {
  openDetail = t;
  const d = els.detail;
  d.querySelector('.detail-name').textContent = spoilerHidden(t) ? 'Hidden story trophy' : t.name;
  d.querySelector('.detail-grade').textContent = t.grade;
  d.querySelector('.detail-desc').textContent = spoilerHidden(t) ? 'Earn this story trophy to reveal its description.' : t.description;
  const steps = d.querySelector('.detail-steps');
  steps.replaceChildren();
  for (const s of t.steps || []) {
    const li = document.createElement('li');
    li.textContent = s;
    steps.append(li);
  }
  d.querySelector('.detail-guide').textContent = t.guide;
  const srcs = d.querySelector('.detail-sources');
  srcs.replaceChildren();
  for (const s of t.sources || []) {
    const li = document.createElement('li');
    li.textContent = s;
    srcs.append(li);
  }
  d.querySelector('.detail-warn').hidden = !t.missable;
  d.hidden = false;
}

function closeDetail() {
  openDetail = null;
  els.detail.hidden = true;
}

function renderRoadmap() {
  els.roadmap.replaceChildren();
  for (const s of STAGES) {
    const inStage = trophies.filter((t) => t.stage === s.n);
    const done = inStage.filter((t) => earned.has(t.name)).length;
    const section = document.createElement('section');
    section.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = s.title + ' — ' + done + '/' + inStage.length;
    const p = document.createElement('p');
    p.textContent = s.blurb;
    const bar = document.createElement('div');
    bar.className = 'mini-bar';
    const fill = document.createElement('div');
    fill.className = 'mini-fill';
    fill.style.width = (inStage.length ? (done / inStage.length) * 100 : 0) + '%';
    bar.append(fill);
    section.append(h, p, bar);
    els.roadmap.append(section);
  }
}

function render() {
  const shown = trophies.filter(visible);
  els.list.replaceChildren(...shown.map(card));
  els.empty.hidden = shown.length !== 0 || trophies.length === 0;
  if (els.kind.value === 'online') els.empty.textContent = 'No online trophies: GTA VI lists 0 online trophies, so this filter is empty on purpose.';
  else els.empty.textContent = 'No trophies match these filters. Clear the search or widen a filter.';
  const done = trophies.filter((t) => earned.has(t.name)).length;
  els.progressText.textContent = done + ' of ' + trophies.length + ' earned' + (done === trophies.length && trophies.length ? ' — platinum time!' : '');
  els.progressBar.style.width = (trophies.length ? (done / trophies.length) * 100 : 0) + '%';
  renderRoadmap();
  if (openDetail) {
    const stillThere = trophies.find((t) => t.name === openDetail.name);
    if (stillThere) showDetail(stillThere);
    else closeDetail();
  }
}

function download(filename, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

els.search.addEventListener('input', render);
els.grade.addEventListener('change', render);
els.kind.addEventListener('change', render);
els.stage.addEventListener('change', render);
els.missable.addEventListener('change', render);
els.spoiler.addEventListener('change', render);
els.detailClose.addEventListener('click', closeDetail);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !els.detail.hidden) closeDetail();
});
els.exportBtn.addEventListener('click', () => download('gta6-trophy-progress.json', JSON.stringify([...earned].sort(), null, 2)));
els.importInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (!Array.isArray(parsed)) throw new Error('not an array');
    const names = new Set(trophies.map((t) => t.name));
    earned = new Set(parsed.filter((x) => typeof x === 'string' && names.has(x)));
    persist();
    render();
  } catch {
    alert('That file is not a trophy progress export from this guide.');
  }
  e.target.value = '';
});
els.resetBtn.addEventListener('click', () => {
  if (confirm('Clear all earned trophies? This cannot be undone.')) {
    earned = new Set();
    persist();
    render();
  }
});

const data = await (await fetch(DATA_URL)).json();
trophies = [...data.trophies].sort((a, b) => gradeRank(a.grade) - gradeRank(b.grade) || a.id - b.id);
render();
