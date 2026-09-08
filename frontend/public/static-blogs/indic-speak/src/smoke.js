/* Minimal DOM shim: runs page.js as the browser would, to catch runtime errors and
 * assert the widgets actually populate. Not a renderer -- layout is not checked. */
const fs = require('fs');
const PAGE = process.argv[2] || '/projects/data/ttsteam/ashwin/gemma-tts/blog/indic-speak.html';
const TECHNICAL = /technical/.test(PAGE);
const html = fs.readFileSync(PAGE, 'utf8');
// Everything after the last </script> in <head> plus the body: searching `html`
// for a class name also finds it in the inlined CSS, and indexOf() then reports
// the stylesheet's position rather than the markup's.
const MARKUP = html.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '');
const DATA = html.match(/<script id="page-data" type="application\/json">([\s\S]*?)<\/script>/)[1];
const HERO = html.match(/<script id="hero-data" type="application\/json">([\s\S]*?)<\/script>/)[1];
const grab = (id) => {
  const m = html.match(new RegExp(`<script id="${id}" type="application/json">([\\s\\S]*?)</script>`));
  return m ? m[1] : null;
};
const CLIPS = grab('clip-data');
const PARAMS = grab('param-data');
const NORM = grab('norm-data');
const WAVES = grab('wave-data');
const API = grab('api-data');
const MEDIA = grab('media-data');
// Blobs added after this harness was written. Without a stub the widget that
// reads one bails out here and gets no coverage at all.
const STYLE = grab('style-data');
const WALL = grab('wall-data');
const TEX = grab('tex-data');
const AB = grab('ab-data');
const SCRIPT = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));

// A tallying stand-in for CanvasRenderingContext2D: enough surface for the voice
// canvas widgets to paint, and a count of what they painted.
const CTXS = [];
class Ctx2D {
  constructor() {
    CTXS.push(this); this.rects = 0; this.fills = 0; this.lines = 0; this.blits = 0; this.styles = new Set(); }
  set fillStyle(v) { this.styles.add(String(v)); }
  get fillStyle() { return ''; }
  fillRect() { this.rects++; }
  fillText() { this.texts=(this.texts||0)+1; }
  measureText(s) { return { width: String(s).length * 7 }; }
  arc() { this.arcs=(this.arcs||0)+1; }
  createRadialGradient() { this.grads=(this.grads||0)+1; return { addColorStop() {} }; }
  createLinearGradient() { this.grads=(this.grads||0)+1; return { addColorStop() {} }; }
  stroke() { this.strokes=(this.strokes||0)+1; }
  fill() { this.fills++; }
  lineTo() { this.lines++; }
  drawImage() { this.blits++; }
  setTransform() {} clearRect() {} save() {} restore() {}
  beginPath() {} rect() {} clip() {} moveTo() {} closePath() {}
}
let created = 0;
class El {
  constructor(tag) {
    this.tagName = (tag || 'div').toUpperCase(); this.children = []; this.attrs = {};
    this.style = {}; this.dataset = {}; this._text = ''; this._html = '';
    this.listeners = {}; this.classes = new Set(); created++;
  }
  get className() { return [...this.classes].join(' '); }
  set className(v) { this.classes = new Set(String(v).split(/\s+/).filter(Boolean)); }
  get classList() {
    const s = this.classes;
    return {
      add: (...c) => c.forEach((x) => s.add(x)),
      remove: (...c) => c.forEach((x) => s.delete(x)),
      toggle: (c, on) => (on === undefined ? (s.has(c) ? s.delete(c) : s.add(c)) : on ? s.add(c) : s.delete(c)),
      contains: (c) => s.has(c),
    };
  }
  get id() { return this.attrs.id || this._id || ''; }
  // Form controls read .value. A range input takes it from the markup; a <select>
  // reports its selected option, so model that rather than returning ''.
  get value() {
    if (this.tagName === 'SELECT') {
      const opts = this.children.filter((c) => c.tagName === 'OPTION');
      const sel = opts.find((o) => o.selected) || opts[0];
      return sel ? sel.value : '';
    }
    return this.attrs.value ?? '';
  }
  set value(v) { this.attrs.value = String(v); }
  get selected() { return !!this._selected; }
  set selected(v) { this._selected = !!v; }
  set id(v) { this._id = v; this.attrs.id = v; }
  get textContent() { return this._text; }
  set textContent(v) { this._text = String(v); this.children = []; }
  get innerHTML() { return this._html; }
  // Crude flat parse so querySelector after an innerHTML assignment resolves,
  // the way it would once the browser has parsed the markup.
  set innerHTML(v) {
    this._html = String(v); this.children = [];
    for (const m of this._html.matchAll(/<([a-zA-Z][\w-]*)((?:\s+[\w-]+="[^"]*")*)/g)) {
      const c = new El(m[1]);
      const cls = /class="([^"]*)"/.exec(m[2] || '');
      if (cls) c.className = cls[1];
      this.children.push(c);
    }
  }
  setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'class') this.className = v; }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  removeAttribute(k) { delete this.attrs[k]; }
  appendChild(c) { (c._frag ? c.children : [c]).forEach((x) => this.children.push(x)); return c; }
  insertBefore(c, ref) { const i = this.children.indexOf(ref); this.children.splice(i < 0 ? 0 : i, 0, c); return c; }
  addEventListener(t, fn) { (this.listeners[t] = this.listeners[t] || []).push(fn); }
  dispatchEvent(e) { (this.listeners[e.type] || []).forEach((fn) => fn.call(this, e)); return true; }
  getBoundingClientRect() { return { width: 700, height: 665, top: 0, left: 0 }; }
  // No WebGL in the shim, which is the point: this exercises the fallback path a
  // browser without WebGL takes, and asserts the 2D envelope is still built.
  // A 2D context is real enough to record, so a canvas widget runs here and its
  // draw calls can be counted rather than taken on trust.
  getContext(kind) {
    if (kind !== '2d') return null;
    if (!this._ctx) this._ctx = new Ctx2D();
    return this._ctx;
  }
  click() { this.dispatchEvent(new Event('click')); }
  scrollIntoView() {}
  _all(pred, out = []) { this.children.forEach((c) => { if (pred(c)) out.push(c); c._all(pred, out); }); return out; }
  querySelectorAll(sel) {
    const cls = sel.replace(/^\./, '');
    const list = this._all((c) => c.classes.has(cls));
    list.forEach = Array.prototype.forEach.bind(list);
    return list;
  }
  querySelector(sel) {
    if (sel.startsWith('.')) return this.querySelectorAll(sel)[0] || null;
    const tag = sel.toUpperCase();
    return this._all((c) => c.tagName === tag)[0] || null;
  }
}
const mk = (tag) => new El(tag);
const byId = {};
function stub(id) { if (!byId[id]) { byId[id] = mk('div'); byId[id].id = id; } return byId[id]; }
// A widget only runs when its container is in the markup, which is how one script
// serves both posts. The shim honours that: an id absent from this page's HTML
// resolves to null, exactly as it would in the browser.
const inPage = (id) => new RegExp(`id="${id}"`).test(html);

// The h1 and the data blob carry their real content from the page; everything
// else is a fresh stub.
const heroTitleMatch = /<h1([^>]*)id="heroTitle"([^>]*)>([\s\S]*?)<\/h1>/.exec(html);
const heroTitleAttrs = heroTitleMatch[1] + heroTitleMatch[2];
const heroTitleSource = heroTitleMatch[3];
const heroTitleText = heroTitleSource.replace(/<[^>]+>/g, '');
stub('heroTitle')._text = heroTitleText;
for (const key of ['start', 'end']) {
  const m = new RegExp(`data-accent-${key}="(\\d+)"`).exec(heroTitleAttrs);
  if (m) stub('heroTitle').dataset['accent' + key[0].toUpperCase() + key.slice(1)] = m[1];
}
const heroAccentText = /data-accent-text="([^"]+)"/.exec(heroTitleAttrs);
if (heroAccentText) stub('heroTitle').dataset.accentText = heroAccentText[1];
stub('bibtex')._text = 'bibtex';
// The budget widget is on the technical post only.
const budMatch = /id="budRange"[^>]*value="(\d+)"/.exec(html);
if (budMatch) {
  stub('budRange').attrs.value = budMatch[1];
  // stub() makes divs; the voice picker has to actually be a <select> for its
  // .value to resolve through the selected option.
  byId['budVoice'] = mk('select');
  byId['budVoice'].id = 'budVoice';
}
// page-data has to carry the real blob; everything else is a fresh stub.
stub('page-data')._text = DATA;
stub('hero-data')._text = HERO;
if (CLIPS) stub('clip-data')._text = CLIPS;
if (PARAMS) stub('param-data')._text = PARAMS;
if (NORM) stub('norm-data')._text = NORM;
if (WAVES) stub('wave-data')._text = WAVES;
if (API) stub('api-data')._text = API;
if (MEDIA) stub('media-data')._text = MEDIA;
if (STYLE) stub('style-data')._text = STYLE;
if (WALL) stub('wall-data')._text = WALL;
if (TEX) stub('tex-data')._text = TEX;
if (AB) stub('ab-data')._text = AB;

// Selectors page.js resolves against the document.
const sections = [...html.matchAll(/<section id="([^"]+)" data-toc=/g)].map((m) => m[1]).map((id) => {
  const s = mk('section'); s.id = id; s.setAttribute('data-toc', 'Label ' + id); return s;
});
const named = {
  '#tokenField .tf-grid': stub('tf-grid'),
  '#abTabs': stub('abTabs'),
  '#normTabs': stub('normTabs'),
  '#normPanels': stub('normPanels'),
  '#abPanels': stub('abPanels'),
  '#tocPills ul': stub('pills-ul'),
  '#recTable tbody': stub('rec-tbody'),
  '#evalTable tbody': stub('eval-tbody'),
};
const docLists = {
  '.research-prose > section[data-toc]': sections,
  '.research-prose > section, .chart-card, .editorial-card, .research-feature-grid': [mk('section'), mk('figure')],
};

const observed = [];
global.IntersectionObserver = class {
  constructor(cb) { this.cb = cb; }
  observe(el) { observed.push([this.cb, el]); }
  unobserve() {} disconnect() {}
};
global.performance = { now: () => 1000 };
global.Event = class { constructor(t) { this.type = t; } };
// Fires synchronously, but caps RE-ENTRANCY rather than total calls: a loop that
// reschedules itself from inside its own callback would otherwise recurse until
// the stack blows, while a global call budget starves whichever widget asks
// second. Depth-capping runs every independent caller and cuts each loop at
// three frames, which is enough to inspect what it drew.
let rafDepth = 0;
global.requestAnimationFrame = (fn) => {
  if (rafDepth > 2) return 0;
  rafDepth++;
  try { fn(performance.now()); } finally { rafDepth--; }
  return 0;
};
global.matchMedia = () => ({ matches: false });
global.navigator = { clipboard: { writeText: () => Promise.resolve() } };
global.setTimeout = (fn) => 0;
const document = {
  documentElement: { scrollTop: 0, scrollHeight: 8000, clientHeight: 900 },
  getElementById: (id) => {
    // A blob's own <script id="..."> is in the markup too, so this one check covers
    // both the widget containers and the data.
    if (!inPage(id)) return null;
    if (id === 'tocRail') { const r = stub(id); if (!r.children.length) r.appendChild(mk('ul')); return r; }
    return stub(id);
  },
  querySelector: (sel) => {
    if (named[sel]) return named[sel];
    const m = /\.lang-tab\[data-lang="([^"]+)"\]/.exec(sel);
    if (m) return stub('clipTabs').children.find((c) => c.dataset.lang === m[1]) || null;
    return sel.startsWith('#') ? stub(sel.slice(1).split(' ')[0]) : mk('div');
  },
  querySelectorAll: (sel) => {
    const l = docLists[sel] || [];
    l.forEach = Array.prototype.forEach.bind(l);
    return l;
  },
  createElement: mk,
  createTextNode: (s) => { const n = mk('#text'); n._text = s; return n; },
  createElementNS: (ns, tag) => mk(tag),
  createDocumentFragment: () => { const f = mk('frag'); f._frag = true; return f; },
  addEventListener: () => {},
};
global.document = document;
global.window = { matchMedia: global.matchMedia, addEventListener: () => {}, scrollTo: () => {}, scrollY: 0, requestAnimationFrame: global.requestAnimationFrame };

// Containment the page's markup provides and the shim must mirror.
stub('tocRail').appendChild(mk('ul'));
const atlasSvg = mk('svg');
atlasSvg.appendChild(stub('langDots'));
stub('atlasMap').appendChild(atlasSvg);

try {
  new Function(SCRIPT)();
} catch (e) {
  console.log('RUNTIME ERROR:', e.message, '\n', e.stack.split('\n').slice(1, 4).join('\n'));
  process.exit(1);
}

// Card weight is a design rule, not a preference: the tan frame marks the one
// exhibit per page worth stopping at, so more than two means it has gone back
// to being wallpaper.
// Match class TOKENS, not a prefix: `chart-card-header`, `-note`, `-title` and
// `-subtitle` all start with `chart-card`, and `editorial-card arch-card` is a
// list rather than a bare value. Both mistakes were made here.
const tan = (MARKUP.match(/class="[^"]*"/g) || [])
  .map((a) => a.slice(7, -1).trim().split(/\s+/))
  .filter((cls) => (cls.includes('chart-card') || cls.includes('editorial-card'))
                   && !cls.includes('quiet')).length;
const D = JSON.parse(DATA);
const checks = [];

const t = (name, got, want) => checks.push([name, got, want, got === want]);
const heroData = JSON.parse(HERO);
t('at most two full-weight tan cards', tan <= 2, true);
// The hero keeps one visual idea: the scripts, as letters, with the ripple born
// from the featured one -- no bar field and no tile field.
t('hero uses the script letters and the ripple', /id="heroGlyph"/.test(html) && /id="heroRipple"/.test(html) && !/id="heroBars"|id="tokenField"/.test(html), true);
t('no tile-field CSS survives', /\.tf-(cell|row|grid|scan)/.test(html), false);
t('hero promise names the listening idea', /class="hero-promise"/.test(html) && /voice|speech/i.test(html), true);
t('hero avoids the old token dashboard', /class="hero-live"|generating frame/.test(html), false);
// The hero's audio button was removed deliberately: listening now happens in the
// hook section, and the hero offers the demo instead.
t('hero has no audio play button', /id="heroPlay"/.test(MARKUP), false);
t('envelope values', heroData.amp.length === heroData.bars, true);
// The featured letter is a real first vowel and the caption is a language name
// from the language table, so the hero cannot disagree with the rest of the post.
t('hero letter is one script glyph', [...stub('heroGlyphA').textContent].length, 1);
t('hero letter opens on Devanagari', stub('heroGlyphA').textContent, '\u0905');
// The hero carries four links and no audio button: demo, try it out, HF, GitHub.
// The collaboration is a partner row inside the card with each organisation's own
// mark, not a line of text in the eyebrow. Both assets must be real files.
t('hero names both partners with their marks',
  /hero-partner[\s\S]*?bodhan_mark\.svg[\s\S]*?Bodhan AI/.test(MARKUP) &&
  /hero-partner[\s\S]*?logo_ai4bharat\.png[\s\S]*?AI4Bharat/.test(MARKUP), true);
// The eyebrow labels the kind of post ("Announcement" / "Technical report"); the
// collaboration lives in the partner row, not here.
t('eyebrow is the post kind, not the byline',
  /hero-eyebrow">(?:Announcement|Technical report)/.test(MARKUP) &&
  !/hero-eyebrow">Bodhan/.test(MARKUP), true);
t('hero carries five link chips',
  ((MARKUP.match(/<nav class="hero-links"[\s\S]*?<\/nav>/) || [''])[0]
    .match(/research-link-chip/g) || []).length, 5);
t('demo chip and its panel present', /id="heroDemoOpen"/.test(MARKUP) && /id="heroDemo"/.test(MARKUP), true);
// "Before starting the blog" means before the prose, not before the dek: the dek
// is part of the hero's own statement and the bar cut it in half there.
// A control whose asset is missing must say so, never open a broken player.
const media = MEDIA ? JSON.parse(MEDIA) : {};
t('demo pending until the video exists',
  !!media.demo || /id="heroDemoOpen" data-pending="1"/.test(MARKUP), true);
t('copy foregrounds punctuation and pauses', /punctuation directs the performance|punctuation shapes timing, pauses/i.test(html), true);
// Every clip needs a real waveform for its player. Only the capability post has
// clips, so only it carries the envelopes.
if (WAVES) {
  const waveData = JSON.parse(WAVES);
  t('waveforms for every clip', Object.keys(waveData.clips).length >= 80, true);
  t('waveform bars are digits', Object.values(waveData.clips).every((c) => /^[1-9]+$/.test(c.e)), true);
  t('waveform length matches the bar count', Object.values(waveData.clips).every((c) => c.e.length === waveData.bars), true);
  if (CLIPS) {
    t('every player src has an envelope', JSON.parse(CLIPS).ab.concat(JSON.parse(CLIPS).voices)
      .every((c) => !!waveData.clips[c.file]), true);
  }
}
t('no default audio controls', /audio controls/.test(html), false);
const heroWords = stub('heroTitle').children.filter((c) => c.tagName === 'SPAN');
t('hero title words', heroWords.length, heroTitleText.trim().split(/\s+/).length);
t('hero words in view', heroWords.filter((c) => c.classes.has('in-view')).length, heroWords.length);
t('hero title has an accent', heroWords.some((c) => c.classes.has('hero-title-accent') ||
  c._all((n) => n.classes.has('hero-title-accent')).length > 0), true);
t('hero words carry no trailing space', heroWords.every((c) => c.textContent === c.textContent.trim()), true);
t('spaces between words', stub('heroTitle').children.filter((c) => c.tagName === '#TEXT' && c.textContent === ' ').length, heroWords.length - 1);
const tocCount = (html.match(/data-toc="/g) || []).length;
t('toc rail ticks', stub('tocRail').querySelectorAll('.toc-tick').length, tocCount);
t('toc pills', stub('pills-ul').children.length, tocCount);
t('every section has a toc entry', tocCount >= 5, true);
// ── the voice, clip and recommendation widgets: capability post only
if (!TECHNICAL) {
  const vs = stub('vsChart');
  t('voice points plotted', vs.children.filter((c) => c.classes.has('vs-pt')).length, Object.keys(D.voices).length);
  t('every voice labelled once', vs._all((c) => c.classes.has('vs-label')).length, Object.keys(D.voices).length);
  t('every voice point is playable', vs._all((c) => c.classes.has('vs-ring')).length, Object.keys(D.voices).length);
  t('hero carries model parameters', /<span class="v">3\.36B<\/span><span class="k">parameters<\/span>/.test(MARKUP), true);
  t('cb-native', stub('cb-native').textContent, '4.94');
  t('rec table rows', (stub('rec-tbody').innerHTML.match(/<tr[ >]/g) || []).length, 24);
  t('scored group first', stub('rec-tbody').innerHTML.indexOf('Scored in the benchmark') <
    stub('rec-tbody').innerHTML.indexOf('Supported, not yet scored'), true);
  t('every scored language before every unscored one', (() => {
    const inner = stub('rec-tbody').innerHTML;
    const cut = inner.indexOf('Supported, not yet scored');
    const scored = D.languages.filter((l) => l.benchmarked).map((l) => l.name);
    const rest = D.languages.filter((l) => !l.benchmarked).map((l) => l.name);
    return scored.every((n) => inner.indexOf('>' + n + '<') < cut) &&
           rest.every((n) => inner.indexOf('>' + n + '<') > cut);
  })(), true);
  t('clip tabs', stub('clipTabs').children.length, 10);
  t('clip panels', stub('clipPanels').children.length, 10);
  // Contexts are rows and emotions are chips; the contract's fourteen is the sum.
  // 13 values, not the contract's 14: bare `news` is hidden behind the two named
  // news registers. src/apigen.py owns that shortlist and still exports all
  // fourteen. Counted as <code> elements rather than cards, because AIR and TV
  // share one card while remaining two separate values a caller can send.
  // One style is on stage at a time, so the rail is what carries the full list:
  // 12 entries for 13 values, because AIR and TV share one entry. Counted by class
  // rather than by child count -- the rail also holds the two group headings.
  t('style menu', stub('styleMenu').children
    .filter(function (c) { return c.className.indexOf('style-pick') >= 0; }).length, 12);
  t('style rail groups', stub('styleMenu').children
    .filter(function (c) { return c.className.indexOf('sx-group') >= 0; }).length, 2);
  t('style values in the data', JSON.parse(STYLE).context.concat(JSON.parse(STYLE).emotion)
    .reduce(function (n, r) { return n + r.values.length; }, 0), 13);
  t('longform audio', stub('longform').innerHTML.includes('audio/ta_Arun_ponniyin_selvan_ch1.mp3'), true);
  t('top cross names', stub('cb-top').textContent.startsWith('Anagha (Marathi)'), true);
}
// ── the whole performance block, including the three-number card, is on the
//    capability post: it is what a reader wants and it is not architecture
if (!TECHNICAL) {
  t('eval table rows', (stub('eval-tbody').innerHTML.match(/<tr>/g) || []).length, 11);
  // per row: label, bar, two axis-break cuts, interval line, two caps, rate dot, value = 9
// plus 4 gridlines x (line + tick), plus the mean line and its label
t('eval chart nodes', stub('evalChart').children.length,
  D.eval_lang.length * 9 + 4 * 2 + 2);
t('eval chart axis is truncated, and says so',
  /starts at 85%/.test(html) && /85 to 100 percent/.test(html), true);
// The chart must be on a true 0-100 axis with intervals, never a diverging
// bar off the mean: that drew a 1.6-point spread as if it ranked the languages.
t('eval chart is absolute scale, not mean-relative', /Above the mean|Below the mean/.test(html), false);
t('eval chart shows confidence intervals', /confidence interval/.test(html), true);
  t('fail rate', stub('mn-fail').textContent, '0.70%');
}
// ── the normaliser examples appear on both posts
t('normaliser examples shared', /normTabs/.test(html), true);

// architecture visuals and the budget widget — technical post only
if (TECHNICAL) {
const vb = stub('vocabBand');
t('vocabulary band drawn to scale', vb.children.filter((c) => c.tagName === 'RECT').length, 5);
t('audio band is the widest added region', (() => {
  const rects = vb.children.filter((c) => c.tagName === 'RECT').map((r) => +r.attrs.width);
  // text is widest overall; among the added regions the audio band must dominate
  return rects[3] > rects[2] && rects[3] > rects[4];
})(), true);
const fl = stub('flowDiagram');
// Each stage is one <g> so it animates as a unit, and the diagram also carries the
// sentence going in and the waveform coming out, so everything is counted by class
// rather than by tag -- a rect is now a stage box, the pill, or one of thirty bars.
const flBy = (cls) => fl.children.filter((c) => c.className.indexOf(cls) >= 0);
const flCards = flBy('fl-card');
t('flow has six stages', flCards.length, 6);
t('every stage has a box', flCards.every((g) =>
  (g.children || []).some((k) => k.tagName === 'RECT' && k.className.indexOf('fl-box') >= 0)), true);
t('flow has five connectors', flBy('fl-wire').length, 5);
t('every wire is drawable', flBy('fl-wire')
  .every((c) => c.attrs.pathLength === '1' && /animation-delay/.test(c.attrs.style || '')), true);
// One pulse per wire, plus the lead in and the exit out.
t('every wire and both leads pulse', flBy('fl-pulse').length, 5 + 2);
t('the loop is phased, not scheduled in JS', flBy('fl-pulse')
  .every((c) => /animation-duration:9\.4s;animation-delay:/.test(c.attrs.style || '')), true);
t('waveform out is drawn from the measured envelope',
  (flBy('fl-wave')[0] || { children: [] }).children.length, 30);
t('flow names Vocos last', flCards.reduce((a, g) => a.concat((g.children || [])
  .filter((k) => k.tagName === 'TEXT')), []).map((e) => e.textContent).includes('Vocos'), true);

const fd = stub('frameDiagram');
t('frame diagram viewBox', fd.getAttribute('viewBox'), '0 0 760 204');
t('seven frame tiles + three bracket rows', fd.children.filter((c) => c.tagName === 'RECT').length, 7 + 1 + 2 + 4);
t('budget voice list', stub('budVoice').children.length, Object.keys(D.voices).length);
// The whole point of the widget: the number follows the chosen voice's pace.
const budChars = +/id="budRange"[^>]*value="(\d+)"/.exec(html)[1];
const budCps = D.voices['Amit'].cps;
const budTok = Math.ceil((budChars / budCps) * 24000 / 2048) * 7;
t('budget tokens follow the voice pace', stub('budTokens').textContent, budTok.toLocaleString('en-US'));
t('budget formula shows the division', /chars &divide;/.test(stub('budFormula').innerHTML), true);
}

// cross-lingual A/B — capability post only
if (!TECHNICAL) {
const clipData = JSON.parse(CLIPS);
const abLangs = [...new Set(clipData.ab.map((c) => c.lang))];
t('A/B tabs', stub('abTabs').children.length, abLangs.length);
t('A/B panels', stub('abPanels').children.length, abLangs.length);
t('every A/B language has two readings', clipData.ab.length, abLangs.length * 2);
t('every A/B reading scored 5', clipData.ab.every((c) => c.judge === 5), true);
t('each A/B language has exactly one native reading',
  abLangs.every((l) => clipData.ab.filter((c) => c.lang === l && c.native).length === 1), true);
t('native flag agrees with the voice language',
  clipData.ab.every((c) => c.native === (c.voice_lang === c.lang)), true);
t('both readings in a pair share one sentence',
  abLangs.every((l) => new Set(clipData.ab.filter((c) => c.lang === l).map((c) => c.text)).size === 1), true);
t('every voice has a sample', clipData.voices.length, Object.keys(D.voices).length);
t('samples are short', clipData.voices.every((c) => c.dur > 4 && c.dur < 14), true);
}
if (TECHNICAL) {
t('param total is the sum of its parts', JSON.parse(PARAMS).total,
  Object.values(JSON.parse(PARAMS).components).reduce((a, b) => a + b, 0));
}

// normaliser showcase — capability post only
if (!TECHNICAL) {
const normData = JSON.parse(NORM);
t('normaliser tabs', stub('normTabs').children.length, normData.groups.length);
t('normaliser panels', stub('normPanels').children.length, normData.groups.length);
const normPanels = stub('normPanels').children;
t('normaliser opens with one example per tab', normPanels.every((p) =>
  p.children.filter((c) => c.classes.has('norm-case')).length === 1), true);
t('remaining examples are folded per tab', normPanels.every((p) =>
  p.children.some((c) => c.tagName === 'DETAILS' && c.classes.has('norm-details'))), true);
t('every example was actually normalised', normData.cases.every((c) => c.spoken !== c.text), true);
t('maths examples present', normData.cases.filter((c) => c.group === 'Mathematics').length >= 5, true);
t('hindi number_lang changes the reading', normData.hindi.default !== normData.hindi.forced, true);
t('hindi panel rendered', /number_lang/.test(stub('normHindi').innerHTML), true);
}
const secs = [...html.matchAll(/<section id="([^"]+)" data-toc=/g)].map((m) => m[1]);
if (TECHNICAL) {
  t('technical post is architecture and API', secs.join(','), 'model,stack,why,api,limitations,outlook');
  t('no benchmark chart on the technical post', /id="evalChart"/.test(html), false);
  t('carries the API section', /id="api"/.test(html), true);
  // The parameter list must be exhaustive AND free of duplicates: the contract's
  // alias rows and its one nested override are folded into the row they stand
  // for, so nine parameters come out of twelve contract rows.
  const api = JSON.parse(API);
  t('nine parameters, no duplicates', api.params.length, 9);
  t('parameter names are unique',
    new Set(api.params.map((p) => p.name)).size, api.params.length);
  t('aliases are folded, never rows',
    api.params.every((p) => !['text', 'speaker', 'nvext.repetition_penalty'].includes(p.name)), true);
  t('the two aliases are attributed',
    api.params.find((p) => p.name === 'prompt').alias.includes('text') &&
    api.params.find((p) => p.name === 'voice_clone_id').alias.includes('speaker'), true);
  t('the nested override is folded into repetition_penalty',
    api.params.find((p) => p.name === 'repetition_penalty').alias.includes('nvext.repetition_penalty'), true);
  t('every parameter says what it does', api.params.every((p) => !!p.what), true);
  // The shim's innerHTML parse makes a child per TAG, so children.length counts
  // cells and codes too; count the rows in the generated markup instead.
  t('every table row rendered',
    (stub('apiParams').innerHTML.match(/<tr>/g) || []).length, api.params.length);
  t('every caveat rendered',
    (stub('apiCaveats').innerHTML.match(/class="api-caveat"/g) || []).length, api.caveats.length);
  // Caveats are interface behaviours. A score or a rate belongs in the evaluation
  // section, and this post carries no benchmark charts at all.
  t('no results leak into the caveats',
    api.caveats.every((c) => !/\b\d+(\.\d+)?\s*%|judge|score|accuracy|WER|CER\b/i.test(c.body)), true);
  t('every parameter caveat names a real parameter',
    api.caveats.every((c) => c.param === null || api.params.some((p) => p.name === c.param)), true);
  t('four act markers carry the arc', (html.match(/class="act-label"/g) || []).length, 4);
} else {
  // Hook, line, sinker: the post opens on something audible, argues in the
  // middle, and closes on limits and next steps. Assert the whole arc, because
  // the order IS the design here -- a section drifting up or down breaks it.
  // The arc, in reading order: hear it, then the problem the model exists for,
  // then the range it solves it with, then the proof, the edges and what is next.
  t('capability post runs hook, line, sinker', secs.join(','),
    'hear,capabilities,voices,under-the-hood,evaluation,limitations,outlook');
  t('the hook is the first section', secs[0], 'hear');
  t('four act markers carry the arc', (html.match(/class="act-label"/g) || []).length, 4);
  t('carries the performance block', /id="evalChart"/.test(html), true);
}
t('no vendor endpoint named', /sarvam/i.test(html), false);
t('no training-data claims', /440,000|63,000 hours|hours of internal/.test(html), false);
t('snac decoder not claimed', /replaces SNAC's own decoder for everything/.test(html), false);

// interactions — the clip and voice widgets live on the capability post
if (!TECHNICAL) {
const tab = stub('clipTabs').children[3];
tab.dispatchEvent(new Event('click'));
t('tab click activates one', stub('clipPanels').children.filter((p) => p.classes.has('is-active')).length, 1);
const pt = stub('vsChart').children.filter((c) => c.classes.has('vs-pt'))[3];
pt.dispatchEvent(new Event('mouseenter'));
t('point hover fills tooltip', stub('vsTip').innerHTML.length > 60, true);
t('tooltip names a voice', /tt-lang/.test(stub('vsTip').innerHTML), true);
observed.forEach(([cb, el]) => cb([{ isIntersecting: true, target: el }]));
stub('copyCite').dispatchEvent(new Event('click'));

}


let bad = 0;
checks.forEach(([n, got, want, ok]) => { if (!ok) { bad++; console.log(`FAIL ${n}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`); } });
console.log(bad ? `\n${bad}/${checks.length} checks failed` : `all ${checks.length} checks passed (${created} shim nodes)`);
process.exit(bad ? 1 : 0);
