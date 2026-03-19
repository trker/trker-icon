const fs   = require('fs');
const path = require('path');
const outlineStroke = require('svg-outline-stroke');

const ROOT     = __dirname;
const SVG_DIR  = path.join(ROOT, 'svgs');
const DIST_DIR = path.join(ROOT, 'dist');
const TMP_DIR  = path.join(ROOT, '.tmp-svgs');
const NAME     = 'trker-icon';
const PREFIX   = 'trker';

if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });
if (!fs.existsSync(TMP_DIR))  fs.mkdirSync(TMP_DIR,  { recursive: true });

const svgFiles = fs.readdirSync(SVG_DIR).filter(f => f.endsWith('.svg')).sort();
if (!svgFiles.length) { console.error('No SVGs found in', SVG_DIR); process.exit(1); }
console.log(`Found ${svgFiles.length} SVGs`);

async function preprocessSvgs() {
    for (const file of svgFiles) {
        const raw = fs.readFileSync(path.join(SVG_DIR, file), 'utf8');
        try {
            // Convert stroke paths to filled paths
            const outlined = await outlineStroke(raw, { optCurves: true, steps: 4, round: 2 });
            fs.writeFileSync(path.join(TMP_DIR, file), outlined);
        } catch (e) {
            // Fallback: just copy as-is
            fs.writeFileSync(path.join(TMP_DIR, file), raw);
        }
    }
}

const icons = {};
svgFiles.forEach((file, i) => {
    icons[path.basename(file, '.svg')] = { file: path.join(TMP_DIR, file), codepoint: 0xe001 + i };
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
    const p = PREFIX; const n = NAME;
    let css = '';
    css += `@font-face {\n  font-family: '${n}';\n  src: url('fonts/${n}.woff2') format('woff2'),\n       url('fonts/${n}.woff') format('woff'),\n       url('fonts/${n}.ttf') format('truetype');\n  font-weight: normal;\n  font-style: normal;\n  font-display: block;\n}\n\n`;
    css += `.${p} {\n  font-family: '${n}' !important;\n  speak: never;\n  font-style: normal;\n  font-weight: normal;\n  font-variant: normal;\n  text-transform: none;\n  line-height: 1;\n  display: inline-block;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\n`;
    Object.entries(icons).forEach(([name, { codepoint }]) => { css += `.${p}-${name}::before { content: "\\${codepoint.toString(16)}"; }\n`; });
    css += '\n/* Sizing */\n';
    css += `.${p}-xs { font-size: 0.75em; }\n.${p}-sm { font-size: 0.875em; }\n.${p}-lg { font-size: 1.33em; }\n.${p}-2x { font-size: 2em; }\n.${p}-3x { font-size: 3em; }\n.${p}-4x { font-size: 4em; }\n.${p}-5x { font-size: 5em; }\n\n`;
    css += `/* Fixed Width */\n.${p}-fw { width: 1.25em; text-align: center; }\n\n`;
    css += `/* Rotate & Flip */\n.${p}-rotate-90  { transform: rotate(90deg); }\n.${p}-rotate-180 { transform: rotate(180deg); }\n.${p}-rotate-270 { transform: rotate(270deg); }\n.${p}-flip-h     { transform: scaleX(-1); }\n.${p}-flip-v     { transform: scaleY(-1); }\n\n`;
    css += `/* Border */\n.${p}-border        { padding: 0.2em 0.25em; border: 0.08em solid; border-radius: 0.1em; }\n.${p}-border-circle { padding: 0.2em 0.25em; border: 0.08em solid; border-radius: 50%; }\n.${p}-border-square { padding: 0.2em 0.25em; border: 0.08em solid; border-radius: 0; }\n\n`;
    css += `/* Pull */\n.${p}-pull-left  { float: left;  margin-right: 0.3em; }\n.${p}-pull-right { float: right; margin-left: 0.3em; }\n\n`;
    css += `/* Stack */\n.${p}-stack     { display: inline-block; height: 2em; width: 2em; line-height: 2em; vertical-align: middle; position: relative; }\n.${p}-stack-1x  { position: absolute; width: 100%; text-align: center; line-height: inherit; }\n.${p}-stack-2x  { position: absolute; width: 100%; text-align: center; line-height: inherit; font-size: 2em; }\n\n`;
    css += `/* Animations */\n@keyframes ${p}-spin   { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }\n@keyframes ${p}-pulse  { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }\n@keyframes ${p}-beat   { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }\n@keyframes ${p}-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-25%); } }\n@keyframes ${p}-shake  { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-15deg); } 75% { transform: rotate(15deg); } }\n@keyframes ${p}-fade   { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }\n\n`;
    css += `.${p}-spin   { animation: ${p}-spin   1s linear infinite; }\n.${p}-pulse  { animation: ${p}-pulse  2s ease-in-out infinite; }\n.${p}-beat   { animation: ${p}-beat   0.8s ease-in-out infinite; }\n.${p}-bounce { animation: ${p}-bounce 1s ease infinite; }\n.${p}-shake  { animation: ${p}-shake  0.5s ease-in-out infinite; }\n.${p}-fade   { animation: ${p}-fade   2s ease-in-out infinite; }\n`;
    return css;
}

function minify(css) {
    return css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').replace(/\s*([{}:;,])\s*/g,'$1').replace(/;}/g,'}').trim();
}

async function main() {
    console.log('Converting stroke paths to filled paths...');
    await preprocessSvgs();

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

    // Cleanup tmp
    fs.readdirSync(TMP_DIR).forEach(f => fs.unlinkSync(path.join(TMP_DIR, f)));
    fs.rmdirSync(TMP_DIR);

    console.log(`\nDone! ${svgFiles.length} icons built.`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
