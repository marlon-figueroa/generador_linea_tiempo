import { copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join('dist', 'ie-economica', 'browser');

copyFileSync(join(outDir, 'index.html'), join(outDir, '404.html'));
writeFileSync(join(outDir, '.nojekyll'), '');

console.log('GitHub Pages: copiados 404.html y .nojekyll en', outDir);
