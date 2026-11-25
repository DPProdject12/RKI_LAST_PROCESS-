// Быстрая проверка структуры и синтаксиса. Это не браузерный E2E-тест.
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/);
assert(script, 'Встроенный скрипт не найден');
new vm.Script(script[1], {filename:'index.html'});
console.log('✓ Синтаксис JavaScript');
for (const id of ['main','nav','missionList','overlay','resetBtn','soundToggle']) {
  assert(html.includes(`id="${id}"`), `Нет элемента ${id}`);
}
console.log('✓ Основные элементы интерфейса');
for (const fn of ['welcome','memory','files','permissions','sync','launch','hint','persist','finalReport','failure']) {
  assert(new RegExp(`function\\s+${fn}\\s*\\(`).test(script[1]), `Нет функции ${fn}`);
}
console.log('✓ Экраны, подсказки, сохранение и финал присутствуют');
assert(html.includes('prefers-reduced-motion'));
assert(html.includes('viewport'));
console.log('✓ Адаптивность и уменьшение движения: правила присутствуют');
console.log('Готово. Интерактивность и отображение требуют проверки в браузере.');
