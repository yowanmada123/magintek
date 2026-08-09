/* Merges sections/sec_*.html into index.template.html to produce a fully
   static index.html — no client-side fetch() needed to render content.
   Also minifies the merged CSS/JS (external files + inline <style>/<script>
   blocks) so the deployed page ships smaller payloads.
   Run this after editing any file in sections/ or index.template.html. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const CleanCSS = require('clean-css');
const { minify: minifyJs } = require('terser');

// Short content hash used as a cache-busting query string (?v=xxxxxxxxxx) so
// css/js can be served with a far-future Cache-Control header — the URL only
// changes when the file's content does.
const hashOf = (content) => crypto.createHash('md5').update(content).digest('hex').slice(0, 10);

const SECTIONS = [
  'hero', 'about', 'services', 'stack', 'writing',
  'portfolio', 'portfolio-mobile', 'reviews', 'faq', 'catalog', 'experience', 'contact',
];

// External assets to minify: [source, minified output, html attr to rewrite]
const CSS_ASSETS = [['css/styles.css', 'css/styles.min.css']];
const JS_ASSETS = [
  ['js/data-md.js', 'js/data-md.min.js'],
  ['js/data-imgs.js', 'js/data-imgs.min.js'],
  ['js/app.js', 'js/app.min.js'],
];

const root = __dirname;

async function build() {
  let html = fs.readFileSync(path.join(root, 'index.template.html'), 'utf-8');

  for (const name of SECTIONS) {
    const placeholder = `<div id="sec-${name}"></div>`;
    if (!html.includes(placeholder)) {
      throw new Error(`Placeholder not found in template: ${placeholder}`);
    }
    const sectionPath = path.join(root, 'sections', `sec_${name}.html`);
    const sectionHtml = fs.readFileSync(sectionPath, 'utf-8').trim();
    html = html.replace(placeholder, sectionHtml);
  }

  // Replace the fetch-based loader with a plain script tag — all content is
  // now inlined above, so app.js just needs to load after it in doc order.
  const loaderRegex = /<!-- SECTION LOADER:[\s\S]*?<\/script>\n?/;
  if (!loaderRegex.test(html)) {
    throw new Error('Section loader block not found in template.');
  }
  html = html.replace(loaderRegex, '<script src="js/app.js"></script>\n');

  // Minify external CSS/JS and point the merged HTML at the .min files.
  for (const [src, out] of CSS_ASSETS) {
    const css = fs.readFileSync(path.join(root, src), 'utf-8');
    const result = new CleanCSS({ level: 2 }).minify(css);
    if (result.errors.length) throw new Error(`CleanCSS errors in ${src}: ${result.errors.join(', ')}`);
    fs.writeFileSync(path.join(root, out), result.styles);
    const versioned = `${out}?v=${hashOf(result.styles)}`;
    html = html.split(`href="${src}"`).join(`href="${versioned}"`);
  }
  for (const [src, out] of JS_ASSETS) {
    const js = fs.readFileSync(path.join(root, src), 'utf-8');
    const result = await minifyJs(js, { format: { comments: false } });
    if (!result.code) throw new Error(`Terser produced no output for ${src}`);
    fs.writeFileSync(path.join(root, out), result.code);
    const versioned = `${out}?v=${hashOf(result.code)}`;
    html = html.split(`src="${src}"`).join(`src="${versioned}"`);
  }

  // Minify inline <style> blocks.
  html = await replaceBlocksAsync(html, /<style>([\s\S]*?)<\/style>/g, (css) => {
    const result = new CleanCSS({ level: 2 }).minify(css);
    return `<style>${result.styles}</style>`;
  });

  // Minify inline <script> blocks (skip JSON-LD and anything with a src).
  html = await replaceBlocksAsync(
    html,
    /<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)([^>]*)>([\s\S]*?)<\/script>/g,
    async (attrs, code) => {
      if (!code.trim()) return `<script${attrs}></script>`;
      const result = await minifyJs(code, { format: { comments: false } });
      return `<script${attrs}>${result.code}</script>`;
    },
    true
  );

  fs.writeFileSync(path.join(root, 'index.html'), html);
  console.log('Built index.html from index.template.html + sections/*.html (minified)');
}

// Runs `fn` on every regex match and substitutes its return value back in.
// `fn` may be async; `hasTwoGroups` controls whether fn(group1, group2) or fn(group1).
async function replaceBlocksAsync(html, regex, fn, hasTwoGroups = false) {
  const matches = [...html.matchAll(regex)];
  let result = html;
  for (const m of matches) {
    const replacement = hasTwoGroups ? await fn(m[1], m[2]) : await fn(m[1]);
    result = result.replace(m[0], replacement);
  }
  return result;
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
