const fs=require('fs'), vm=require('vm'), assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../app.js','utf8');
const nodes=new Map(), local=new Map();
function node(id){if(!nodes.has(id))nodes.set(id,{value:'',checked:false,hidden:false,style:{},dataset:{},innerHTML:'',textContent:'',focus(){},select(){},appendChild(){},after(){},querySelector(){return null}});return nodes.get(id)}
const context=vm.createContext({console,Intl,Date,Math,Number,String,Object,Array,Set,Map,JSON,RegExp,Error,Promise,Blob,crypto:require('node:crypto').webcrypto,structuredClone,document:{getElementById:node,querySelector:node,body:{style:{}},querySelectorAll:()=>[],createElement:()=>node('new-element'),addEventListener(){},visibilityState:'visible'},localStorage:{getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v)},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},window:{scrollTo(){}},confirm:()=>true,navigator:{},location:{protocol:'file:'}});
vm.runInContext("globalThis.window=globalThis;globalThis.scrollTo=()=>{};globalThis.addEventListener=()=>{}",context);
vm.runInContext(fs.readFileSync(__dirname+'/../storage.js','utf8'),context);
vm.runInContext(code,context);
for(const f of ['catalog.js','text-import.js','muscles.js','drafts.js','updates.js'])vm.runInContext(fs.readFileSync(__dirname+'/../'+f,'utf8'),context);
vm.runInContext(fs.readFileSync(__dirname+'/../image-import.js','utf8'),context);
vm.runInContext(fs.readFileSync(__dirname+'/../assistant.js','utf8'),context);
const run=s=>vm.runInContext(s,context), set=(id,v)=>node(id).value=String(v);
assert(node('app').innerHTML.length>100);
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

assert(run('Object.keys(E).length >= 80'));
assert.equal(run("parseWorkoutText('Bench press: 3 x 8 at 40 kg, RIR 2')[0].id"),'bench');
assert.equal(run("parseWorkoutText('Bench press: 3 x 8 at 40 kg, RIR 2')[0].weight"),40);
assert.equal(run("parseWorkoutText('Alien lift: 3 x 8 at 40 kg')[0].id"),'');
assert.equal(run("parseWorkoutText('Bench: 3 x 8 at 100 lb')[0].weight"),45.36);
assert.equal(run("parseWorkoutText('Pull-ups: 3 x 5 bodyweight')[0].weight"),0);
assert.equal(run("parseWorkoutText('Plank: 2 x 30 sec bodyweight')[0].unit"),'sec');
assert.equal(run("parseWorkoutText('Bench: 3 x 8')[0].weight"),'');
run("S.logs.push({id:crypto.randomUUID(),title:'Fractional time',date:day(),minutes:49.3833333333,kind:'strength',sets:[{id:'bench',variation:'Flat',weight:40,reps:8,rir:null,done:true}]})");
assert(!run('home()').includes('49.383333'));
assert(run("muscleData('chest').week.length > 0"));
assert(run('validateBackup(S)'));
run("S.exercises['user_123abc']={name:'Custom row',groups:['back'],unit:'reps'};hydrateExercises()");
assert(run("!!E['user_123abc']"));assert(run('validateBackup(S)'));
run("copy=structuredClone(S);copy.exercises['user_123abc'].groups=['fake']");assert(!run('validateBackup(copy)'));
console.log('PASS: expanded catalog, text parser, unknown fields, pounds conversion, seconds, nullable RIR, rounded minutes, muscle attribution and custom-exercise backup validation.');
run("S.active=null;tab='log';logTab='text';dialogKey='';importRows=parseWorkoutText('Bench press: 3 x 8 at 40 kg, RIR 2')");
Object.entries({'import-date':run('day()'),'import-minutes':'30','import-title':'Chest day','workout-text':'Bench press: 3 x 8 at 40 kg, RIR 2','import-id-0':'bench','import-sets-0':3,'import-reps-0':8,'import-weight-0':40,'import-rir-0':2,'import-variation-0':'Flat bench, total kg'}).forEach(([k,v])=>set(k,v));
node('include-0').checked=true;node('import-confirm').checked=true;
const before=run('S.logs.length');run('saveTextWorkout()');assert.equal(run('S.logs.length'),before+1);assert.equal(run('S.logs[S.logs.length-1].sets.length'),3);
run("tab='log';logTab='text';dialogKey='';globalThis.field={id:'workout-text',type:'textarea',value:'Draft workout',readOnly:false};document.querySelectorAll=()=>[field];captureDraft();field.value='';restoreDraft()");
assert.equal(run('field.value'),'Draft workout');assert.equal(run("JSON.parse(localStorage.getItem('arise-v1')).drafts['log:text']['workout-text']"),'Draft workout');
console.log('PASS: reviewed text import saves completed sets; input drafts persist and restore. Built-in exercises:',run("Object.keys(E).filter(x=>!x.startsWith('user_')).length"));

// Synthetic OCR geometry: wrapped names, separate numeric columns and unknown loads.
context.ocrWords=[
{text:'Incline',confidence:95,bbox:{x0:180,x1:260,y0:170,y1:190}},
{text:'Dumbbell',confidence:95,bbox:{x0:270,x1:390,y0:170,y1:190}},
{text:'Bench Press',confidence:95,bbox:{x0:180,x1:400,y0:200,y1:220}},
{text:'0:30',confidence:95,bbox:{x0:550,x1:610,y0:190,y1:210}},
{text:'Band-assisted Pull-up',confidence:95,bbox:{x0:180,x1:500,y0:290,y1:310}},
{text:'0:40',confidence:95,bbox:{x0:550,x1:610,y0:290,y1:310}},
{text:'5:26',confidence:95,bbox:{x0:100,x1:160,y0:20,y1:40}}
];
context.ocrReps=[{text:'8',confidence:90,bbox:{x0:680,x1:710,y0:190,y1:210}},{text:'6',confidence:90,bbox:{x0:680,x1:710,y0:290,y1:310}}];
context.ocrLoads=[{text:'25.0',confidence:90,bbox:{x0:820,x1:880,y0:190,y1:210}}];
run("globalThis.ocrRows=tableRows(ocrWords,ocrReps,ocrLoads,1000,400)");
assert.equal(run('ocrRows.length'),2);
assert.equal(run('ocrRows[0].id'),'dbincline');
assert.equal(run('ocrRows[1].id'),'bandpullup');
assert.equal(run('ocrRows[1].weight'),null);
assert.equal(run('ocrRows[0].seconds'),30);
run("globalThis.ocrDraft={rows:ocrRows,unit:'lb',convention:'unknown'}");
assert.equal(run('screenshotSets(ocrDraft)[0].weight'),11.34);
assert.equal(run('screenshotSets(ocrDraft)[1].weight'),null);
assert.equal(run('screenshotSets(ocrDraft)[0].rir'),null);
assert.throws(()=>run("screenshotSets({...ocrDraft,unit:''})"));
run("ocrRows[0].reps=null");assert.throws(()=>run('screenshotSets(ocrDraft)'));
run("ocrRows[0].reps=8;S.screenshotDraft={...ocrDraft,date:day(),minutes:'',title:'Synthetic import'}");
node('ocr-confirm').checked=true;
const beforeImage=run('S.logs.length');run('saveScreenshotWorkout()');
assert.equal(run('S.logs.length'),beforeImage+1);
assert.equal(run('S.logs.at(-1).durationUnknown'),true);
assert.equal(run('S.logs.at(-1).sets[1].weight'),null);
assert(run('validateBackup(S)'));
assert(run("assistantContext('screenshot garmin').includes('OCR does not infer')"));
run("screenshotBusy=true");assert.equal(run('updateSafe()'),false);run("screenshotBusy=false;assistantBusy=true");assert.equal(run('updateSafe()'),false);run('assistantBusy=false');
for(const pane of ['image','assistant'])run(`logTab='${pane}';go('log')`);
console.log('PASS: OCR grouping, wrapped names, nullable loads, unit/repetition validation, reviewed save, backup and assistant/update guards.');

// Program integration runs against the same state and renderer as the existing app.
vm.runInContext(fs.readFileSync(__dirname+'/../body-map.js','utf8'),context);
vm.runInContext(fs.readFileSync(__dirname+'/../program.js','utf8'),context);
run("document.querySelectorAll=()=>[];S.active=null;S.program={start:weekDays()[0],time:'18:00',swaps:{},notices:true};render()");
assert.equal(run("WEEK_PLAN.filter(q=>q.kind==='strength').length"),3);
assert.equal(run("WEEK_PLAN.filter(q=>q.kind==='run').length"),2);
assert.equal(run("WEEK_PLAN.find(q=>q.key==='b').moves.length"),7);
assert.equal(run("questCalendar().split('BEGIN:VEVENT').length-1"),56);
assert.equal(run("questCalendar().split('BEGIN:VALARM').length-1"),56);
assert(run("runBrief(WEEK_PLAN[4],1).startsWith('Tempo')"));
assert(run("runBrief(WEEK_PLAN[4],2).startsWith('Intervals')"));
assert(run("alternatives('barsquat').includes('airsquat')"));
run("applyAlternative('a',0,'legpress',false)");
assert.equal(run("programMoves(WEEK_PLAN[0])[0]"),'legpress');
run("startQuest('a')");node('familiar').checked=true;node('safeties').checked=true;node('begin-confirm').onclick();
assert.equal(run("S.active.sets.length"),18);
assert.equal(run("S.active.questKey"),'a');
assert.equal(run("S.active.sets[0].id"),'legpress');
assert.equal(run("S.active.sets.at(-1).target"),'3 × 30–60 sec');
assert.match(run('session()'),/Swap ⇄/);
assert.match(run('home()'),/WEEKLY QUESTS/);
assert(!run('anatomy()').includes('undefined'));
for(const pane of ['image','text','quick','history','assistant'])run(`logTab='${pane}';go('log')`);
console.log('PASS: program schedule, 56 calendar alerts, alternating runs, saved alternatives, session targets and screen integration.');
node('assistant-question').value='How do I add a custom exercise?';
run("logTab='assistant';go('log');askAssistant()");
assert(run("assistantMessages.at(-1).text.includes('Create any exercise')"));
assert.equal(run('localAssistant'),null);
assert.equal(run("questTime(WEEK_PLAN[1])"),'06:00');
assert.equal(run("questTime(WEEK_PLAN[0])"),'18:00');
assert(run("questCalendar().includes('DTSTART:')"));
run("S.program.runTime='05:30';S.program.gymTime='19:15'");
assert.equal(run("questTime(WEEK_PLAN[1])"),'05:30');
assert.equal(run("questTime(WEEK_PLAN[0])"),'19:15');
console.log('PASS: instant assistance avoids model loading; run and gym reminder times are independent.');
