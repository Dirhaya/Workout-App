/* Compact shared review for OCR and structured Garmin FIT data. */
for(const [name,id] of Object.entries(S.importAliases||{})){
 if(Object.hasOwn(E,id))ALIASES[name]=id;
}
function importProblem(message){
 toast(message);
 const box=$('import-error');
 if(box){box.hidden=false;box.textContent=message;box.scrollIntoView?.({block:'center',behavior:'smooth'})}
}
function importGroupName(row){return normalizeName(row.name||'Unknown exercise')}
function matchImportGroup(name,id){
 if(id&&!Object.hasOwn(E,id))return;
 for(const row of screenshotRows())if(importGroupName(row)===name)row.id=id;
 if(id){S.importAliases=S.importAliases||{};S.importAliases[name]=id;ALIASES[name]=id}
 delete S.drafts['log:image'];persist();render();
}
screenshotReview=function(){
 const d=S.screenshotDraft;if(!d?.rows?.length)return '';
 const groups=new Map();
 d.rows.forEach((row,index)=>{const key=importGroupName(row);if(!groups.has(key))groups.set(key,[]);groups.get(key).push({row,index})});
 return '<div class="divider"></div><h3>Review '+d.rows.length+' sets</h3><p class="tagline">'+(d.importSource==='fit'?'Recorded numbers from your FIT file.':'Read from your screenshots.')+' Missing reps and loads can stay blank. Match each exercise once; the app remembers your matches.</p>'+
 '<div id="import-error" class="note warn" role="alert" hidden></div>'+
 '<div class="fieldrow"><div><label for="ocr-date">Workout date</label><input id="ocr-date" type="date" max="'+day()+'" value="'+esc(d.date)+'" oninput="screenshotMeta(\'date\',this.value)"></div><div><label for="ocr-unit">Load unit</label><select id="ocr-unit" onchange="screenshotMeta(\'unit\',this.value)"><option value="">Unknown / no loads</option><option value="kg" '+(d.unit==='kg'?'selected':'')+'>kg</option><option value="lb" '+(d.unit==='lb'?'selected':'')+'>lb</option></select></div></div>'+
 '<label for="ocr-quest">Weekly quest</label><select id="ocr-quest" onchange="screenshotMeta(\'questKey\',this.value)"><option value="">Regular workout</option>'+
 (typeof WEEK_PLAN==='undefined'?[]:WEEK_PLAN.filter(q=>q.kind==='strength')).map(q=>'<option value="'+q.key+'" '+(d.questKey===q.key?'selected':'')+'>'+esc(q.name)+'</option>').join('')+'</select>'+
 [...groups.entries()].map(([name,items])=>{
  const first=items[0].row;
  return '<section class="import-group"><h3>'+esc(E[first.id]?.name||first.name||'Match this exercise')+' <span class="muted small">· '+items.length+' sets</span></h3>'+
  (!first.id?'<p class="small warn">Match this exercise to update the right muscles.</p>':'<p class="small muted">'+esc(E[first.id].muscles)+'</p>')+
  '<label for="match-'+items[0].index+'">Exercise match · applied to this group</label><select id="match-'+items[0].index+'" onchange="matchImportGroup(\''+name+'\',this.value)">'+exerciseOptions(first.id)+'</select>'+
  '<details '+(items.some(({row})=>row.conflict)?'open':'')+'><summary class="link">Check / edit sets</summary><div class="import-set-head"><span>Keep</span><span>Reps / sec</span><span>Load</span></div>'+
  items.map(({row:r,index:i})=>'<div class="import-set"><input type="checkbox" id="ocr-include-'+i+'" aria-label="Include set '+(i+1)+'" '+(r.include?'checked':'')+' onchange="screenshotRow('+i+',\'include\',this.checked)"><input id="ocr-reps-'+i+'" aria-label="Set '+(i+1)+' reps or seconds" type="number" min="1" max="999" placeholder="Unknown" value="'+(r.reps??'')+'" oninput="screenshotRow('+i+',\'reps\',this.value)"><input id="ocr-weight-'+i+'" aria-label="Set '+(i+1)+' load" type="number" min="0" max="1100" step="0.01" placeholder="Unknown" value="'+(r.weight??'')+'" oninput="screenshotRow('+i+',\'weight\',this.value)"></div>'+(r.conflict?'<p class="small warn">Repeated set number with different readings: excluded until you check it.</p>':'')).join('')+'</details></section>'
 }).join('')+
 '<details><summary class="link">Optional session details</summary><label for="ocr-title">Title</label><input id="ocr-title" value="'+esc(d.title)+'" maxlength="80" oninput="screenshotMeta(\'title\',this.value)"><label for="ocr-minutes">Total minutes (optional)</label><input id="ocr-minutes" type="number" min="0" max="600" placeholder="Unknown" value="'+esc(d.minutes)+'" oninput="screenshotMeta(\'minutes\',this.value)"><label for="ocr-convention">Dumbbell convention</label><select id="ocr-convention" onchange="screenshotMeta(\'convention\',this.value)">'+['unknown','per dumbbell','combined dumbbells'].map(value=>'<option value="'+value+'" '+(d.convention===value?'selected':'')+'>'+value+'</option>').join('')+'</select></details>'+
 '<p class="small muted">Save confirms that these are your completed sets and you checked the exercise matches, date and unit.</p><button class="btn full" onclick="saveScreenshotWorkout()">Save workout & update muscle map</button>';
};
screenshotSets=function(d){
 const included=d.rows.filter(r=>r.include);
 if(!included.length)throw Error('Include at least one completed set.');
 const hasLoads=included.some(r=>r.weight!==null&&r.weight!==''&&r.weight!==undefined);
 if(hasLoads&&!['kg','lb'].includes(d.unit))throw Error('Choose kg or lb above for the recorded loads. Leave load fields blank if they are unknown.');
 return included.map((r,index)=>{
  if(!Object.hasOwn(E,r.id))throw Error('Match “'+(r.name||'Unknown exercise')+'” once above, or exclude its sets.');
  const reps=r.reps===null||r.reps===''||r.reps===undefined?null:Number(r.reps);
  if(reps!==null&&(!Number.isInteger(reps)||reps<1||reps>999))throw Error('Check reps for '+E[r.id].name+', or leave them blank.');
  const weight=r.weight===null||r.weight===''||r.weight===undefined?null:Math.round(Number(r.weight)*(d.unit==='lb'?.45359237:1)*100)/100;
  if(weight!==null&&(!Number.isFinite(weight)||weight<0||weight>500))throw Error('Check load/unit for '+E[r.id].name+'.');
  return {id:r.id,reps,weight,rir:null,variation:(r.variation||'Garmin recorded setup')+(E[r.id].equipment==='Dumbbells'?'; '+(d.convention||'unknown'):''),done:true,durationSeconds:r.seconds??null,sourceLoad:r.weight??null,sourceUnit:d.unit||null};
 });
};
const compactSaveScreenshot=saveScreenshotWorkout;
saveScreenshotWorkout=function(){
 const d=S.screenshotDraft;if(!d)return importProblem('Choose a workout file or screenshots first.');
 // Read current controls at the moment of save, including iOS edits not yet blurred.
 for(const [id,key] of [['ocr-date','date'],['ocr-unit','unit'],['ocr-quest','questKey'],['ocr-title','title'],['ocr-minutes','minutes'],['ocr-convention','convention']]){
  const field=document.getElementById(id);if(field&&field.value!==undefined)d[key]=field.value;
 }
 try{screenshotSets(d)}catch(error){return importProblem(error.message)}
 if(['kg','lb'].includes(d.unit))S.importPrefs={...(S.importPrefs||{}),unit:d.unit};
 return compactSaveScreenshot();
};
let fitWorker=null,fitBusy=false;
function fitStatus(text){const node=$('fit-status');if(node)node.textContent=text}
function importFitRows(payload){
 if(!payload.rows?.length)throw Error('No recorded strength sets were found in this file. Use the strength set-table screenshots instead.');
 if(S.screenshotDraft?.rows?.length&&!confirm('Replace the current import draft with this FIT workout?'))return false;
 const rows=payload.rows.map((r,i)=>({...r,number:i+1,id:identifyExercise(r.name),include:true,confidence:100,variation:'Garmin FIT recorded setup'}));
 mergeScreenshotDraft(rows,'kg',false);
 Object.assign(S.screenshotDraft,{date:payload.date||day(),minutes:payload.minutes??'',importSource:'fit',unit:'kg',imageCount:0});
 delete S.drafts['log:image'];persist();render();return true;
}
async function readFitFile(file){
 if(!file)return;
 if(fitBusy||screenshotBusy||screenshotBatchBusy)return toast('Finish the current import first.');
 if(!/\.fit$/i.test(file.name)||file.size>15000000)return importProblem('Choose a .fit activity under 15 MB. If Garmin downloaded a ZIP, first extract it in Files.');
 fitBusy=true;stopAssistant(false);fitStatus('Reading the activity file on your phone…');
 let timer;
 try{
  const buffer=await file.arrayBuffer();
  const payload=await new Promise((resolve,reject)=>{
   fitWorker=new Worker('./fit-worker.js',{type:'module'});
   timer=setTimeout(()=>reject(Error('The file reader timed out. Check your connection for its first download, then retry.')),45000);
   fitWorker.onmessage=event=>event.data.error?reject(Error(event.data.error)):resolve(event.data);
   fitWorker.onerror=()=>reject(Error('Could not load the Garmin file reader. Try screenshots instead.'));
   fitWorker.postMessage(buffer,[buffer]);
  });
  importFitRows(payload);
 }catch(error){fitStatus(error.message);importProblem(error.message)}
 finally{clearTimeout(timer);fitWorker?.terminate();fitWorker=null;fitBusy=false}
}
const detailedScreenshotPane=screenshotPane;
screenshotPane=function(){
 const review=S.screenshotDraft?.rows?.length;
 return '<section class="card"><h3>Import your workout</h3><p class="small">Most accurate: the original Garmin activity file. No copying text or reading numbers from pixels.</p><label for="garmin-fit">Choose Garmin .FIT file</label><input id="garmin-fit" type="file" accept=".fit" onchange="readFitFile(this.files[0])"><p id="fit-status" class="tagline" role="status"></p><details><summary class="link">Where to get the file</summary><p class="small">In Safari, open Garmin Connect’s website → your activity → settings gear → Export File / Export Original. Extract a ZIP in Files if needed, then choose the .fit file here. Original files may not include later edits made in Connect; confirm exercise matches.</p></details><p class="small">The file is read locally using Garmin’s SDK. Internet is needed to load the reader initially.</p></section><div class="spacer"></div>'+
 (review?'<section class="card">'+screenshotReview()+'</section><details><summary class="link">Use / add screenshots instead</summary>'+detailedScreenshotPane().replace(screenshotReview(),'')+'</details>':'<details><summary class="link">Use screenshots instead</summary>'+detailedScreenshotPane()+'</details>');
};
const fitUpdateSafe=updateSafe;
updateSafe=function(){return !fitBusy&&fitUpdateSafe()};
