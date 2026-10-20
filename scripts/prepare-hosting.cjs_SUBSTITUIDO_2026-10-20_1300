const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const files = [
  'index.html', 'aluno.html', '404.html', 'styles.css', 'animals.js',
  'app.js', 'cardio-bank.js', 'chefes.js', 'cloud.js', 'firebase-config.js',
  'online.js', 'planilha.js', 'qr.js', 'student.js', 'typography.js', 'menu.js', 'tela-cheia.js'
];
// Only the application and its assets are eligible for publication.
fs.mkdirSync(output, { recursive: true });
for (const entry of fs.readdirSync(output)) {
  fs.rmSync(path.join(output, entry), { recursive: true, force: true });
}
for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}
function copyAssets(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const src = path.join(source, entry.name);
    const dst = path.join(destination, entry.name);
    if (entry.isDirectory()) copyAssets(src, dst);
    else if (entry.isFile()) fs.copyFileSync(src, dst);
  }
}
copyAssets(path.join(root, 'assets'), path.join(output, 'assets'));
console.log('Prepared Hosting package: application files and assets only.');

