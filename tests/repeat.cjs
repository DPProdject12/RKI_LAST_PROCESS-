const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const listeners={}; let now=1000;
const element=()=>({innerHTML:'',textContent:'',style:{},className:'',addEventListener(){},dataset:{},value:'',querySelector(){return element()}});
const dom={};
const document={getElementById(id){return dom[id]??=element()},querySelector(){return element()},addEventListener(type,fn){(listeners[type]??=[]).push(fn)},createElement:element,body:{appendChild(){}}};
const store={};const localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]};
const ctx={document,localStorage,performance:{now:()=>now},console,setTimeout(){},clearTimeout(){},navigator:{},window:{},structuredClone};
vm.createContext(ctx);
// Убираем только первоначальный render; остальные функции используем как в игре.
vm.runInContext(js.replace(/render\(\);\s*$/, ''),ctx);
vm.runInContext('render=()=>{};setAssistant=()=>{};audio=()=>{};',ctx);
const run=x=>vm.runInContext(x,ctx);
run("s=fresh();s.syncStep=0;act({dataset:{act:'sync-b'}})");assert.equal(run('s.syncStep'),0);
run("act({dataset:{act:'sync-a'}});act({dataset:{act:'sync-a'}})");assert.equal(run('s.syncStep'),1);
run("s.completed=['memory','files','permissions','sync'];s.gameLaunched=false;act({dataset:{act:'launch-game'}})");const n=run('s.log.length');run("act({dataset:{act:'launch-game'}})");assert.equal(run('s.log.length'),n);
assert.equal(listeners.keydown.length,1);assert.equal(listeners.click.length,1);
// Проверка быстрых повторов на реальном делегированном обработчике.
run('var calls=0;act=()=>{calls++}');const click=(act)=>listeners.click[0]({target:{closest:()=>({dataset:{act},disabled:false})}});
click('sync-conflict');now+=50;click('sync-conflict');assert.equal(run('calls'),1);now+=401;click('sync-conflict');assert.equal(run('calls'),2);
click('hint');click('hint');assert.equal(run('calls'),4);
console.log('✓ Повторные действия, последовательность синхронизации, повторный запуск и обработчики');
