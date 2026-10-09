// Renders assets/icon.svg into the PNG sizes Chrome uses for extension icons
// (Chrome doesn't accept SVG there). Run with `npm run icons` after editing the SVG.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const SIZES = [16, 32, 48, 128];
const root = resolve(import.meta.dirname, '..');
const svg = readFileSync(resolve(root, 'assets/icon.svg'));

for (const size of SIZES) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
  const out = resolve(root, `public/icons/icon-${size}.png`);
  writeFileSync(out, png);
  console.log(`Wrote ${out}`);
}
