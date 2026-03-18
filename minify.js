const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'dist', 'trker-icon.css');
const minPath = path.join(__dirname, 'dist', 'trker-icon.min.css');

if (!fs.existsSync(cssPath)) {
    console.error('dist/trker-icon.css not found. Run build:font first.');
    process.exit(1);
}

let css = fs.readFileSync(cssPath, 'utf8');
let min = css
    .replace(/\/\*[\s\S]*?\*\//g, '')   // remove comments
    .replace(/\s+/g, ' ')               // collapse whitespace
    .replace(/\s*([{}:;,>~+])\s*/g, '') // remove spaces around symbols
    .replace(/;}/g, '}')               // remove trailing semicolons
    .trim();

fs.writeFileSync(minPath, min, 'utf8');
console.log('Minified: dist/trker-icon.min.css');
