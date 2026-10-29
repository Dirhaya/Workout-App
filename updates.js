// Auto-update while online, defer reload until session/forms are no longer active.
let appRegistration=null,updateWaiting=false,reloadPending=false;
function updateSafe(){return !S.active&&!dialogKey&&tab!=='log'&&tab!=='train'}
function activateWaiting(){if(!appRegistration?.waiting)return;if(!captureDraft())return;if(updateSafe())appRegistration.waiting.postMessage({type:'ACTIVATE_UPDATE'});else if(!updateWaiting){updateWaiting=true;toast('Update downloaded. It will apply after you leave the workout or form.')}}
if('serviceWorker' in navigator&&location.protocol!=='file:'){
 navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>{appRegistration=reg;activateWaiting();reg.addEventListener('updatefound',()=>{const w=reg.installing;if(w)w.addEventListener('statechange',()=>{if(w.state==='installed')activateWaiting()})});reg.update().catch(()=>{})}).catch(()=>toast('Offline setup unavailable; your logs still save locally.'));
 navigator.serviceWorker.addEventListener('controllerchange',()=>{reloadPending=true;if(updateSafe()&&captureDraft())location.reload()});
 setInterval(()=>{if(document.visibilityState==='visible'){appRegistration?.update().catch(()=>{});activateWaiting();if(reloadPending&&updateSafe()&&captureDraft())location.reload()}},60000);
 window.addEventListener('online',()=>appRegistration?.update().catch(()=>{}));
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')appRegistration?.update().catch(()=>{})});
}
