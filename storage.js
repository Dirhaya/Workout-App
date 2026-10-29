/* Storage boundary. Never overwrite a record that failed to parse. */
const AppStorage=(()=>{
  const KEY='arise-v1', RECOVERY='arise-v1-recovery';
  let blocked=false;
  function read(){
    try {
      const raw=localStorage.getItem(KEY);
      if(!raw)return null;
      const data=JSON.parse(raw);
      if(!data||data.version!==1||!Array.isArray(data.logs)||!Array.isArray(data.custom)||!Array.isArray(data.goals))throw Error('Unsupported saved data');
      return data;
    }catch(e){blocked=true;return null}
  }
  function write(data){
    if(blocked)return false;
    try{localStorage.setItem(KEY,JSON.stringify(data));return true}
    catch{return false}
  }
  function isBlocked(){return blocked}
  function exportRecovery(){
    const raw=localStorage.getItem(KEY);return raw||localStorage.getItem(RECOVERY)||'';
  }
  function clearBlock(){blocked=false}
  return {read,write,isBlocked,exportRecovery,clearBlock}
})();
