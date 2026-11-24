/* Decode off the UI thread with the official, pinned Garmin FIT SDK. */
self.onmessage=async event=>{
 try{
  const {Decoder,Stream,Profile}=await import('https://cdn.jsdelivr.net/npm/@garmin/fitsdk@21.222.0/src/index.js');
  const decoder=new Decoder(Stream.fromArrayBuffer(event.data));
  if(!decoder.isFIT()||!decoder.checkIntegrity())throw Error('The FIT file is incomplete or corrupt. Export it again.');
  const {messages,errors}=decoder.read({convertTypesToStrings:true,convertDateTimesToDates:true,mergeHeartRates:false});
  if(errors?.length)throw Error('The activity could not be decoded completely. Please export it again.');
  const first=value=>Array.isArray(value)?value[0]:value;
  const words=value=>String(value||'').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[_-]/g,' ').trim();
  const rows=(messages.setMesgs||[]).filter(set=>set.setType==='active'||set.setType===1).map(set=>{
   const rawCategory=first(set.category),subtype=first(set.categorySubtype);
   const category=typeof rawCategory==='string'?rawCategory:Profile.types.exerciseCategory?.[rawCategory];
   const names=Profile.types[(category||'')+'ExerciseName'];
   const specific=typeof subtype==='string'?subtype:names?.[subtype];
   return {name:specific?words(specific):'Unknown exercise '+(category?'('+words(category)+')':''),sourceNumber:null,reps:Number.isInteger(set.repetitions)&&set.repetitions>0?set.repetitions:null,weight:typeof set.weight==='number'&&Number.isFinite(set.weight)?set.weight:null,seconds:typeof set.duration==='number'?set.duration:null};
  });
  const session=messages.sessionMesgs?.[0]||{};
  const start=session.startTime;
  const date=start instanceof Date&&!isNaN(start)?new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(start):null;
  self.postMessage({rows,date,minutes:typeof session.totalElapsedTime==='number'?Math.round(session.totalElapsedTime/60*100)/100:null});
 }catch(error){self.postMessage({error:String(error.message||error)})}
};
