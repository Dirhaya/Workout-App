const fs=require('fs'), vm=require('vm'), assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../index.html','utf8').match(/<script>([\s\S]*)<\/script>/)[1];
const nodes=new Map(), local=new Map();
function node(id){if(!nodes.has(id))nodes.set(id,{value:'',checked:false,hidden:false,style:{},dataset:{},innerHTML:'',textContent:'',focus(){},select(){},querySelector(){return null}});return nodes.get(id)}
const context=vm.createContext({console,Intl,Date,Math,Number,String,Object,Array,Set,Map,JSON,RegExp,Error,Promise,Blob,crypto:require('node:crypto').webcrypto,structuredClone,document:{getElementById:node,querySelector:node,body:{style:{}},querySelectorAll:()=>[]},localStorage:{getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v)},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},window:{scrollTo(){}},confirm:()=>true,navigator:{},location:{protocol:'file:'}});
vm.runInContext(code,context);
const run=s=>vm.runInContext(s,context), set=(id,v)=>node(id).value=String(v);
assert.match(node('app').innerHTML,/Your next level, Sultan/);
for(const tab of ['home','train','log','progress']){run(`go('${tab}')`);assert(node('app').innerHTML.length>100)}
for(const pane of ['suggested','assess','custom'])run(`trainingTab='${pane}';go('train')`);
for(const pane of ['quick','garmin','history'])run(`logTab='${pane}';go('log')`);
for(const pane of ['stats','goals','history'])run(`progressTab='${pane}';go('progress')`);
run('profile()');
Object.entries({pname:'Sultan',page:22,pweight:80,pexperience:'new',ppain:'no',pdays:3,pminutes:30,pfocus:'hybrid',plow:140,phigh:155,pmethod:'LTHR'}).forEach(([id,v])=>set(id,v));
run('saveProfile()');assert(run('ready()'));assert(run('validateBackup(S)'));
run("start('upper')");node('familiar').checked=true;node('begin-confirm').onclick();
assert.equal(run('S.active.sets.length'),4);
for(let i=0;i<4;i++){set('weight-'+i,0);set('reps-'+i,i===3?20:8);set('rir-'+i,2);run(`saveSet(${i})`)}
assert.equal(run('S.active.sets.filter(s=>s.done).length'),4);
set('session-date',run('day()'));set('session-duration',22);set('session-notes','Controlled');run('finish()');
assert.equal(run('benchmarkCoverage()'),4);assert.equal(run('xp()'),100);assert(run('validateBackup(S)'));
run('restCheck();saveRest()');assert.equal(run('xp()'),100);
run("logTab='garmin';go('log')");set('garmintext','Distance\n3.1 mi\nMoving Time\n24:10\nElapsed Time\n30:12\nAvg HR\n145 bpm');run('parseGarmin()');
assert.equal(node('distance').value,'4.99');assert.equal(node('duration').value,'30:12');assert.equal(node('hr').value,'145');
set('kind','run');set('log-date',run('day()'));set('duration','25:00');set('distance',5);set('hr',148);set('zonepct',93);set('rpe',5);set('conditions','Flat, cool');set('log-notes','');node('continuous').checked=true;node('quick-form').dataset.screenshot='true';run('saveQuick(false)');
assert(run('runGoalStatus(S.logs[S.logs.length-1])'));assert.equal(run('xp()'),100);assert(run('validateBackup(S)'));
run("S.p.zoneHigh='156'");assert(!run('runGoalStatus(S.logs[S.logs.length-1])'));run("S.p.zoneHigh='155'");
run('globalThis.copy=structuredClone(S)');assert(run('validateBackup(copy)'));run('copy.p.age=\'" onfocus="alert(1)\'');assert(!run('validateBackup(copy)'));
run('copy=structuredClone(S);copy.logs[0].id="bad-id"');assert(!run('validateBackup(copy)'));
run('copy=structuredClone(S);copy.logs[copy.logs.length-1].distance="<img>"');assert(!run('validateBackup(copy)'));
run("trainingTab='suggested';go('train');start('a')");node('familiar').checked=true;node('begin-confirm').onclick();assert.equal(run('S.active.sets.length'),12);assert(run('validateBackup(S)'));
set('weight-0',0);set('reps-0',10);set('rir-0',2);run('draftSet(0,"reps","10");draftSet(0,"rir","2")');assert(run('validateBackup(S)'));
assert.equal(run('parseTime("5:00")'),300);assert(Number.isNaN(run('parseTime("5:99")')));assert.equal(run('paceText(299.9)'),'5:00');
console.log('PASS: all screens rendered; profile; assessment; session save; daily XP cap; Garmin parser / elapsed-time priority; zone goal / zone-change guard; backup round-trip; invalid-backup rejection; regular session draft; time parsing.');
