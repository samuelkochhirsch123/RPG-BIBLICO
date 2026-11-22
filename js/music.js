/* Heróis da Fé v6.4 — trilha 100% original, tocada localmente.
   O navegador exige interação para iniciar áudio no iPhone/Android. */
(() => {
  'use strict';
  const scriptUrl=document.currentScript?.src||new URL('js/music.js',document.baseURI).href;
  const assetUrl=new URL('../assets/audio/luz-na-jornada.mp3',scriptUrl).href;
  const el=id=>document.getElementById(id);
  const music=new Audio(assetUrl);
  music.loop=true;
  music.preload='metadata';
  music.playsInline=true;
  const KEY='heroisDaFe.music.v64';
  let pref={enabled:true,volume:38};
  try{
    const p=JSON.parse(localStorage.getItem(KEY)||'null');
    if(p && typeof p==='object'){
      if(typeof p.enabled==='boolean')pref.enabled=p.enabled;
      if(Number.isFinite(p.volume))pref.volume=Math.max(0,Math.min(100,p.volume));
    }
  }catch{}
  let started=false,scene='menu',level=0,fadeId=0,internalVolume=0,hidden=false;
  const factor={menu:.47,paused:.33,playing:1,cutscene:1.07,skill:.65,quiz:.24,learn:.25,stageComplete:.52,gameover:.23,finished:.65,onlineWaiting:.30,onlineScene:.85};
  function desired(){return pref.enabled && !hidden && started ? Math.min(1,(pref.volume/100)*(factor[scene]??.6)):0}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(pref))}catch{}}
  function labels(){
    const a=el('musicHudBtn'),b=el('musicMenuBtn'),status=el('musicStatusText'),range=el('musicVolume');
    if(a){a.textContent=pref.enabled?'♫':'♪';a.classList.toggle('is-muted',!pref.enabled);a.setAttribute('aria-pressed',String(pref.enabled));a.setAttribute('aria-label',pref.enabled?'Desligar música':'Ligar música');a.title=pref.enabled?'Desligar música':'Ligar música'}
    if(b)b.setAttribute('aria-pressed',String(pref.enabled));
    if(status)status.textContent=pref.enabled?'Trilha sonora ligada':'Trilha sonora desligada';
    if(range && document.activeElement!==range)range.value=String(pref.volume);
  }
  function fadeToTarget(){
    if(fadeId)return;
    let last=performance.now();
    function frame(now){
      const dt=Math.min(.06,(now-last)/1000||.016);last=now;
      const target=desired(),delta=target-internalVolume;
      internalVolume=Math.abs(delta)<.006?target:internalVolume+Math.sign(delta)*Math.min(Math.abs(delta),dt*.35);
      music.volume=Math.max(0,Math.min(1,internalVolume));
      if(Math.abs(internalVolume-target)<.006){fadeId=0;if(target===0 && !music.paused)music.pause();return}
      fadeId=requestAnimationFrame(frame);
    }
    fadeId=requestAnimationFrame(frame);
  }
  function begin(){
    if(!pref.enabled)return;
    started=true;
    if(music.paused){
      let promise;
      try{promise=music.play()}
      catch{return}
      if(promise?.catch)promise.catch(err=>{
        // Some Safari sessions require a fresh, explicit tap on the ♫ control.
        started=false;fadeToTarget();
        if(err?.name!=='NotAllowedError'&&err?.name!=='AbortError')console.warn('Trilha sonora:',err?.message||err);
      });
    }
    fadeToTarget();labels();
  }
  function setEnabled(value){
    pref.enabled=!!value;save();labels();
    if(pref.enabled)begin();else fadeToTarget();
  }
  function setScene(value,nextLevel=level){
    scene=String(value||'menu');level=nextLevel;
    // Keep musical volume lower for quizzes and pause screens.
    fadeToTarget();
  }
  function volume(value){
    pref.volume=Math.max(0,Math.min(100,Number(value)||0));save();fadeToTarget();
  }
  function toggle(){setEnabled(!pref.enabled)}
  const hud=el('musicHudBtn'),menu=el('musicMenuBtn'),range=el('musicVolume');
  hud?.addEventListener('click',toggle);
  menu?.addEventListener('click',toggle);
  range?.addEventListener('input',e=>volume(e.target.value));
  document.addEventListener('visibilitychange',()=>{
    hidden=document.hidden;
    if(hidden){music.pause();internalVolume=0;music.volume=0;fadeToTarget();}
    else if(started && pref.enabled)begin();
  });
  window.addEventListener('pagehide',()=>music.pause());
  music.addEventListener('error',()=>{console.warn('Não foi possível carregar o áudio local da trilha.');});
  labels();
  window.RPGMusic={begin,setScene,toggle,setEnabled,volume,isEnabled:()=>pref.enabled,
    getStatus:()=>({enabled:pref.enabled,started,paused:music.paused,volume:music.volume,url:assetUrl})};
})();
