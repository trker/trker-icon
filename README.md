# trker-icon

Open source SVG icon library with 28 free icons for developers. Build custom webfont packs with 8,500+ icons at [trkericon.com](https://trkericon.com).

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Usage

### CDN (quickest)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/trker-icon@latest/dist/trker-icon.css">
```

### Download

Grab `dist/trker-icon.css` and `dist/fonts/` from this repo and include locally:

```html
<link rel="stylesheet" href="path/to/trker-icon.css">
```

### HTML

```html
<i class="ti ti-check"></i>
<i class="ti ti-arrow-left"></i>
<i class="ti ti-bell-jingle"></i>
```

### SVG files

All icons are available as standalone SVGs in `svgs/`:

```html
<img src="svgs/check.svg" width="24" height="24">
```

## Build from source

Clone the repo, install deps, and run the build:

```bash
git clone https://github.com/trker/trker-icon.git
cd trker-icon
npm install
npm run build
```

This generates `dist/trker-icon.css`, `dist/trker-icon.min.css`, and font files under `dist/fonts/`.

## Free icons (28)

| Name | Class |
|------|-------|
| arrow-left | `ti-arrow-left` |
| arrow-right | `ti-arrow-right` |
| bell-jingle | `ti-bell-jingle` |
| check | `ti-check` |
| close | `ti-close` |
| download | `ti-download` |
| eye | `ti-eye` |
| heart | `ti-heart` |
| home | `ti-home` |
| menu | `ti-menu` |
| search | `ti-search` |
| settings | `ti-settings` |
| star | `ti-star` |
| user | `ti-user` |

> Full icon list in `dist/trker-icon.json`

## Premium

8,500+ icons, unlimited custom packs, and CDN hosting at **[trkericon.com](https://trkericon.com)**.

## License

MIT Â© trker-icon