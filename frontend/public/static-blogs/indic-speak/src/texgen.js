#!/usr/bin/env node
/* Render the LaTeX in norm.json to MathML, once, at build time.
 *
 *     node src/texgen.js            # writes src/tex.json
 *
 * The normaliser showcase quotes real LaTeX, and the section prose leans on the
 * source being visible ("nobody says backslash int"), so the written row keeps its
 * raw text. This produces a second, typeset row for it.
 *
 * Output is MathML, not KaTeX's HTML: browsers render it natively, so the page
 * needs no stylesheet and none of KaTeX's 60 font files. KaTeX itself is a
 * build-time dependency only (src/vendor/katex.min.js) and never ships.
 */
const fs = require('fs');
const path = require('path');
const katex = require(path.join(__dirname, 'vendor', 'katex.min.js'));

const SRC = __dirname;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// KaTeX wraps MathML in a presentational span it does not style; drop it.
function mathml(tex) {
  const out = katex.renderToString(tex, { output: 'mathml', throwOnError: true, displayMode: false });
  const m = /^<span class="katex">([\s\S]*)<\/span>$/.exec(out);
  if (!m || !m[1].startsWith('<math')) throw new Error(`unexpected KaTeX output for ${tex}`);
  return m[1];
}

const norm = JSON.parse(fs.readFileSync(path.join(SRC, 'norm.json'), 'utf8'));
const out = {};
let spans = 0;
for (const c of norm.cases) {
  if (!/\$[^$]+\$/.test(c.text)) continue;
  out[c.text] = c.text.replace(/\$([^$]+)\$/g, (_, tex) => { spans++; return mathml(tex.trim()); })
                      .split(/(<math[\s\S]*?<\/math>)/)
                      .map(part => part.startsWith('<math') ? part : esc(part))
                      .join('');
}
// The style samples too: the lecture clip carries an inline expression, and the
// read-along typesets it as one unit while the words inside it are spoken. Keyed
// by the expression itself, source dollars included, so a token run can look it up.
const styles = JSON.parse(fs.readFileSync(path.join(SRC, 'styles.json'), 'utf8'));
for (const group of Object.values(styles)) {
  for (const row of group) {
    const text = row.sample && row.sample.text;
    if (!text) continue;
    for (const m of text.matchAll(/\$([^$]+)\$/g)) { out[m[0]] = mathml(m[1].trim()); spans++; }
  }
}
fs.writeFileSync(path.join(SRC, 'tex.json'), JSON.stringify(out), 'utf8');
console.log(`wrote src/tex.json  ${Object.keys(out).length} lines, ${spans} expressions, ` +
            `${Buffer.byteLength(JSON.stringify(out))} bytes`);
