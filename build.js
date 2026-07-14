/* Merges sections/sec_*.html into index.template.html to produce a fully
   static index.html — no client-side fetch() needed to render content.
   Run this after editing any file in sections/ or index.template.html. */
const fs = require('fs');
const path = require('path');

const SECTIONS = [
  'hero', 'about', 'services', 'stack', 'writing',
  'portfolio', 'portfolio-mobile', 'reviews', 'faq', 'catalog', 'experience', 'contact',
];

const root = __dirname;
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

fs.writeFileSync(path.join(root, 'index.html'), html);
console.log('Built index.html from index.template.html + sections/*.html');
