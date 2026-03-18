const fs   = require('fs');
const path = require('path');

const ROOT     = __dirname;
const SVG_DIR  = path.join(ROOT, 'svgs');
const DIST_DIR = path.join(ROOT, 'dist');
const NAME     = 'trker-icon';
const PREFIX   = 'ti';

if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });

const svgFiles = fs.readdirSync(SVG_DIR).filter(f => f.endsWith('.svg')).sort();
if (!svgFiles.length) { console.error('No SVGs found in', SVG_DIR); process.exit(1); }
console.log(`Found ${svgFiles.length} SVGs`);

const icons = {};
svgFiles.forEach((file, i) => {
    icons[path.basename(file, '.svg')] = { file: path.join(SVG_DIR, file), codepoint: 0xe001 + i };
});

function buildSvgFont() {
    return new Promise(async (resolve, reject) => {
        const { SVGIcons2SVGFontStream } = await import('svgicons2svgfont');
        const chunks = [];
        const stream = new SVGIcons2SVGFontStream({ fontName: NAME, fontHeight: 1000, normalize: true, log: () => {} });
        stream.on('data', d => chunks.push(Buffer.isBuffer(d) ? d : Buffer.from(d)));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
        Object.entries(icons).forEach(([name, { file, codepoint }]) => {
            const glyph = fs.createReadStream(file);
            glyph.metadata = { unicode: [String.fromCodePoint(codepoint)], name };
            stream.write(glyph);
        });
        stream.end();
    });
}

function buildCss() {
    const face = `@font-face {
  font-family: '${NAME}';
  src: url('fonts/${NAME}.woff2') format('woff2'),
       url('fonts/${NAME}.woff') format('woff'),
       url('fonts/${NAME}.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
.${PREFIX} {
  font-family: '${NAME}' !important;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: inline-block;
}
`;
    const classes = Object.entries(icons)
        .map(([n, { codepoint }]) => `.${PREFIX}-${n}::before { content: "\\${codepoint.toString(16)}"; }`)
        .join('\n');
    return face + '\n' + classes + '\n';
}

function minify(css) {
    return css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').replace(/\s*([{}:;,])\s*/g,'$1').replace(/;}/g,'}').trim();
}

async function main() {
    console.log('Building SVG font...');
    const svgFont = await buildSvgFont();

    console.log('Converting to TTF...');
    const svg2ttf = require('svg2ttf');
    const ttf = Buffer.from(svg2ttf(svgFont.toString(), {}).buffer);

    console.log('Converting to WOFF2...');
    const ttf2woff2 = require('ttf2woff2').default;
    const woff2 = ttf2woff2(ttf);

    console.log('Converting to WOFF...');
    const ttf2woff = require('ttf2woff');
    const woff = Buffer.from(ttf2woff(ttf).buffer);

    const fontsDir = path.join(DIST_DIR, 'fonts');
    if (!fs.existsSync(fontsDir)) fs.mkdirSync(fontsDir, { recursive: true });

    fs.writeFileSync(path.join(fontsDir, `${NAME}.ttf`),   ttf);
    fs.writeFileSync(path.join(fontsDir, `${NAME}.woff2`), woff2);
    fs.writeFileSync(path.join(fontsDir, `${NAME}.woff`),  woff);
    console.log('Fonts -> dist/fonts/');

    const css = buildCss();
    fs.writeFileSync(path.join(DIST_DIR, `${NAME}.css`),     css);
    fs.writeFileSync(path.join(DIST_DIR, `${NAME}.min.css`), minify(css));
    console.log('CSS   -> dist/');

    const map = {};
    Object.entries(icons).forEach(([n,{codepoint}]) => map[n] = codepoint.toString(16));
    fs.writeFileSync(path.join(DIST_DIR, `${NAME}.json`), JSON.stringify(map, null, 2));
    console.log('JSON  -> dist/');

    console.log(`\nDone! ${svgFiles.length} icons built.`);
}

main().catch(e => { console.error(e.message); process.exit(1); });