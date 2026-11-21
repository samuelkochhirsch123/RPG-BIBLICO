/* Heróis da Fé: navegador, iPhone e Android. Sem bibliotecas externas. */
(() => {
  'use strict';
  const D=window.BibliaData, Art=window.RPGArt;
  const $=id=>document.getElementById(id);
  const app=$('app'),canvas=$('world'),ctx=canvas.getContext('2d',{alpha:false});
  const PI2=Math.PI*2, WIDTH=1280,HEIGHT=960;
  const mobile=matchMedia('(pointer:coarse)').matches || ('ontouchstart' in window && innerWidth<1000);
  const storeKey='heroisDaFe.unlock.v3';
  function getUnlock(){try{return Math.max(0,Math.min(19,parseInt(localStorage.getItem(storeKey)||'0',10)||0))}catch{return 0}}
  function saveUnlock(value){try{localStorage.setItem(storeKey,String(value))}catch{}}
  const G={
    state:'menu',level:0,selectedStage:0,unlocked:getUnlock(),skin:'homem',hearts:3,points:0,
    player:{x:640,y:755},direction:'down',pose:0,walkMs:0,animTime:0,markers:[],animals:[],trees:[],decals:[],
    complete:0,laps:0,lapAngle:null,lapProgress:0,lapDirection:0,
    missionSeconds:0,nextQuestion:60,quizRemaining:60,keys:{},stick:{x:0,y:0},run:false,
    getTarget(){const lvl=D.levels[this.level];if(lvl.type==='laps')return null;
      const candidates=lvl.type==='arrive'?this.animals.filter(g=>!g.entered):this.markers.filter(m=>!m.done);
      return candidates.sort((a,b)=>Math.hypot(a.x-this.player.x,a.y-this.player.y)-Math.hypot(b.x-this.player.x,b.y-this.player.y))[0]||null;
    }
  };
  let lastFrame=0,tinyToastUntil=0,rotationDismissed=false;
  const view={width:innerWidth,height:innerHeight,dpr:1,zoom:1,cameraX:640,cameraY:700};
  const level=D.levels;
  const stopInput=()=>{G.keys={};G.stick={x:0,y:0};G.run=false;$('joystickKnob').style.transform='translate(0px,0px)';$('runBtn').classList.remove('pressed')};
  function rand(n){let v=Math.sin((n+1)*91.71+(G.level+3)*37.33)*45124.337;return v-Math.floor(v)}
  function makeWorld(){
    G.player={x:640,y:755};G.direction='down';G.walkMs=0;G.pose=0;
    G.complete=0;G.laps=0;G.lapAngle=null;G.lapProgress=0;G.lapDirection=0;
    G.missionSeconds=0;G.nextQuestion=60;G.quizRemaining=60;G.animTime=0;
    G.markers=[];G.animals=[];G.trees=[];G.decals=[];
    const stage=level[G.level];
    if(stage.type==='arrive') {
      const kinds=['ovelhas','aves','bois','cabras'];
      const start=[[380,520],[515,860],[895,750],[915,490]];
      const ends=[[470,590],[567,625],[735,625],[826,590]];
      for(let i=0;i<4;i++)G.animals.push({kind:kinds[i],label:stage.items[i],index:i,x:start[i][0],y:start[i][1],goalX:ends[i][0],goalY:ends[i][1],ready:false,entered:false});
    } else if(stage.type!=='laps') {
      for(let i=0;i<stage.count;i++){
        const a=(i/stage.count)*PI2+Math.PI/2;
        G.markers.push({x:640+Math.cos(a)*350,y:440+Math.sin(a)*280,label:stage.items[i]||'Marco',done:false});
      }
    }
    for(let i=0;i<115;i++){
      let x=42+rand(i)*1190,y=70+rand(i+222)*810,size=.8+rand(i+444)*.65;
      if(Math.hypot(x-640,y-450)<230 || Math.hypot(x-640,y-755)<135)continue;
      if(G.markers.some(m=>Math.hypot(x-m.x,y-m.y)<105))continue;
      if(G.animals.some(g=>Math.hypot(x-g.x,y-g.y)<90||Math.hypot(x-g.goalX,y-g.goalY)<105))continue;
      G.trees.push({x,y,size});
    }
    for(let i=0;i<420;i++)G.decals.push({x:rand(i+533)*WIDTH,y:rand(i+843)*HEIGHT,size:rand(i+999)>0.7?4:2});
    view.cameraX=G.player.x;view.cameraY=G.player.y;
  }
  function hud(){
    const stage=level[G.level];
    $('hudChapter').textContent=stage.title;
    $('hudHearts').textContent='♥ '.repeat(G.hearts)+'♡ '.repeat(3-G.hearts);
    $('hudPoints').textContent='✦ '+G.points;
    $('hudLevel').textContent=(G.level+1)+'/20';
    $('missionLabel').textContent=stage.type==='laps'?'JERICÓ · '+(G.laps<6?'DIA '+(G.laps+1):'7º DIA'):'MISSÃO';
    $('missionText').textContent=stage.type==='laps'?`${G.laps}/13 voltas completas · contorne a cidade`:stage.mission;
    $('countLabel').textContent=(stage.type==='laps'?G.laps:G.complete)+'/'+stage.count;
    $('missionFill').style.width=Math.min(100,(stage.type==='laps'?G.laps:G.complete)*100/stage.count)+'%';
  }
  function toast(msg,seconds=2.8){$('statusToast').textContent=msg;$('statusToast').hidden=false;tinyToastUntil=performance.now()+seconds*1000}
  function syncUI(){
    const fullscreen=!!document.fullscreenElement;$('fullscreenBtn').textContent=fullscreen?'⤢':'⛶';$('panelFullscreenExit').hidden=!fullscreen;$('quizFullscreenExit').hidden=!fullscreen;
    $('pauseBtn').textContent=G.state==='paused'?'▶':'Ⅱ';
    $('pauseBtn').disabled=['menu','stageComplete','gameover','finished'].includes(G.state);
    $('missionHud').hidden=['menu','stageComplete','gameover','finished'].includes(G.state);
    $('interactionHint').hidden=G.state!=='playing';
    $('touchControls').hidden=G.state!=='playing';
    $('desktopInstructions').hidden=G.state!=='playing';
    const showRot=mobile && innerHeight>innerWidth && !rotationDismissed && G.state==='playing';
    $('rotationTip').hidden=!showRot;
  }
  function showPanel({title,description,reference='',button='CONTINUAR',showSkins=false,showInstructions=false,allowStages=false,canHome=false}){
    $('mainOverlay').hidden=false;
    $('quizOverlay').hidden=true;
    $('panelTitle').textContent=title;
    $('panelDescription').textContent=description;
    $('panelReference').textContent=reference;
    $('panelReference').hidden=!reference;
    $('primaryBtn').textContent=button;
    $('skinSection').hidden=!showSkins;
    $('instructionsSection').hidden=!showInstructions;
    $('levelPickerBtn').hidden=!allowStages;
    $('mainMenuBtn').hidden=!canHome;
    $('levelPicker').hidden=true;
    $('levelPickerBtn').textContent='Escolher fase';
    syncUI();
  }
  function home(){
    stopInput();G.state='menu';G.level=G.selectedStage;G.hearts=3;
    showPanel({title:'Heróis da Fé',description:'Uma aventura original em pixel art. Explore 20 episódios, conheça as histórias e responda aos desafios bíblicos.',reference:'Antigo Testamento · Jesus · Atos dos Apóstolos',button:'COMEÇAR AVENTURA',showSkins:true,showInstructions:true,allowStages:true});
    hud();
  }
  function startStage(stageIndex=G.level){
    stopInput();G.level=Math.max(0,Math.min(19,stageIndex));makeWorld();
    G.state='playing';$('mainOverlay').hidden=true;$('quizOverlay').hidden=true;$('statusToast').hidden=true;
    hud();syncUI();
    toast(G.level===1?'Os animais chegam sozinhos. Receba os grupos perto da arca.':level[G.level].mission,3);
  }
  function paused(){if(G.state!=='playing')return;stopInput();G.state='paused';showPanel({title:'Jogo pausado',description:level[G.level].story,reference:level[G.level].reference,button:'RETOMAR AVENTURA',canHome:true})}
  function resumed(){G.state='playing';$('mainOverlay').hidden=true;syncUI()}
  function stageDone(){
    G.state='stageComplete';stopInput();G.points+=250;
    const done=G.level,final=done===19;
    G.unlocked=Math.max(G.unlocked,Math.min(19,done+1));saveUnlock(G.unlocked);
    if(final){G.state='finished';showPanel({title:'Jornada concluída!',description:`Você percorreu os 20 episódios. Pontuação: ${G.points}. Esta aventura usa atividades lúdicas inspiradas nas passagens bíblicas.`,reference:'Do Gênesis até Atos',button:'JOGAR NOVAMENTE',canHome:true});}
    else {G.level=done+1;const next=level[G.level];showPanel({title:'Fase concluída!',description:`Próxima aventura: ${next.title}. ${next.story}`,reference:next.reference,button:`CONTINUAR · FASE ${done+2}`,canHome:true})}
    hud();
  }
  function interact(){
    if(G.state!=='playing')return;
    const lvl=level[G.level];
    if(lvl.type==='laps'){toast('Contorne a muralha de Jericó pelo caminho exterior.');return}
    if(lvl.type==='arrive'){
      const group=G.animals.find(a=>!a.entered && Math.hypot(G.player.x-a.x,G.player.y-a.y)<94);
      if(!group){toast('Aproxime-se de um grupo de animais.');return}
      if(!group.ready){toast('Eles estão chegando por conta própria. Aguarde um instante.');return}
      group.entered=true;G.complete++;G.points+=60;
      toast(`${group.label} recebidos! Eles entraram na arca.`,3);
    } else {
      const mark=G.markers.find(m=>!m.done && Math.hypot(G.player.x-m.x,G.player.y-m.y)<84);
      if(!mark){toast('Procure um marco brilhante e aproxime-se.');return}
      mark.done=true;G.complete++;G.points+=50;toast(`${mark.label} concluído!`,2);
    }
    hud();if(G.complete>=lvl.count)stageDone();
  }
  function checkLaps(dx,dy){
    if(G.level!==8||G.state!=='playing')return;
    const x=G.player.x-640,y=G.player.y-433,rad=Math.hypot(x,y);
    if(rad<235||rad>440||Math.abs(dx)+Math.abs(dy)<.08){G.lapAngle=null;return}
    const a=Math.atan2(y,x);
    if(G.lapAngle!==null){
      let change=a-G.lapAngle;
      while(change>Math.PI)change-=PI2;
      while(change< -Math.PI)change+=PI2;
      if(Math.abs(change)<.28){
        if(!G.lapDirection && Math.abs(change)>.005)G.lapDirection=Math.sign(change);
        G.lapProgress=Math.max(0,G.lapProgress+change*G.lapDirection);
        if(G.lapProgress>=PI2-.09){
          G.lapProgress=0;G.lapDirection=0;G.laps++;G.points+=65;
          const msg=G.laps<6?`Dia ${G.laps} concluído. Continue a marcha!`:G.laps===6?'Seis dias concluídos! No sétimo dia são sete voltas.':`Volta ${G.laps-6} de 7 do sétimo dia.`;
          toast(msg,4);hud();
          if(G.laps>=13){stageDone();return}
        }
      }
    }
    G.lapAngle=a;
  }
  function launchQuiz(){
    if(G.state!=='playing')return;
    stopInput();G.state='quiz';G.quizRemaining=60;
    const q=D.questions[G.level];
    $('quizQuestion').textContent=q[0];
    const target=$('quizAnswers');target.replaceChildren();
    q[1].forEach((answerText,i)=>{
      const btn=document.createElement('button');btn.type='button';btn.textContent=String.fromCharCode(65+i)+') '+answerText;
      btn.addEventListener('click',()=>answerQuiz(i===q[2]));target.appendChild(btn);
    });
    $('quizOverlay').hidden=false;$('quizClock').textContent='01:00';$('quizBarFill').style.width='100%';
    syncUI();
  }
  function answerQuiz(correct){
    if(G.state!=='quiz')return;
    $('quizOverlay').hidden=true;
    G.nextQuestion=G.missionSeconds+60;
    if(correct){G.points+=100;toast('Resposta certa! +100 pontos',3)}
    else {G.hearts=Math.max(0,G.hearts-1);toast('Resposta incorreta ou tempo esgotado. −1 coração',3)}
    if(G.hearts===0){
      G.state='gameover';stopInput();
      showPanel({title:'Fim de jogo',description:`Você perdeu os três corações na fase ${G.level+1}. Tente novamente e continue aprendendo!`,reference:level[G.level].reference,button:'TENTAR NOVAMENTE',canHome:true});
      G.hearts=3;
    }else G.state='playing';
    hud();syncUI();
  }
  function update(dt){
    if(G.state==='quiz'){
      G.quizRemaining=Math.max(0,G.quizRemaining-dt);
      const s=Math.ceil(G.quizRemaining);
      $('quizClock').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
      $('quizBarFill').style.width=(G.quizRemaining/60*100)+'%';
      if(G.quizRemaining<=0)answerQuiz(false);
      return;
    }
    if(G.state!=='playing')return;
    G.animTime+=dt*1000;
    G.missionSeconds+=dt;
    if(G.missionSeconds>=G.nextQuestion){launchQuiz();return}
    if(level[G.level].type==='arrive'){
      for(const a of G.animals){if(a.entered||a.ready)continue;
        const dx=a.goalX-a.x,dy=a.goalY-a.y,dist=Math.hypot(dx,dy);
        if(dist<3){a.x=a.goalX;a.y=a.goalY;a.ready=true;continue}
        const step=Math.min(dist,74*dt);a.x+=dx/dist*step;a.y+=dy/dist*step;
      }
    }
    let x=G.stick.x+(G.keys.right?1:0)-(G.keys.left?1:0);
    let y=G.stick.y+(G.keys.down?1:0)-(G.keys.up?1:0);
    const len=Math.hypot(x,y);
    if(len>1){x/=len;y/=len}
    if(len>.12){
      const speed=(G.run||G.keys.shift)?330:197;
      G.player.x=Math.max(25,Math.min(WIDTH-25,G.player.x+x*speed*dt));
      G.player.y=Math.max(40,Math.min(HEIGHT-24,G.player.y+y*speed*dt));
      G.walkMs+=dt*1000;
      G.pose=(Math.floor(G.walkMs/175)%2);
      G.direction=Math.abs(x)>Math.abs(y)?(x>0?'right':'left'):(y>0?'down':'up');
      checkLaps(x,y);
    }else{G.pose=0;G.lapAngle=null}
    const near=G.getTarget();
    const ready=near && Math.hypot(near.x-G.player.x,near.y-G.player.y)<88;
    const hint=$('interactionHint');
    hint.hidden=!ready;
    if(ready)hint.textContent=(level[G.level].type==='arrive'&&!near.ready)?'ANIMAIS A CAMINHO':mobile?'TOQUE EM AÇÃO PARA INTERAGIR':'PRESSIONE E PARA INTERAGIR';
  }
  function resize(){
    const box=app.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
    const w=Math.max(1,box.width),h=Math.max(1,box.height);
    view.width=w;view.height=h;view.dpr=dpr;
    // Stable zoom: avoid any zoom change while the player is walking or the Safari toolbar changes size.
    view.zoom=w<950?1:1.08;
    const cw=Math.round(w*dpr),ch=Math.round(h*dpr);
    if(canvas.width!==cw)canvas.width=cw;
    if(canvas.height!==ch)canvas.height=ch;
    syncUI();
  }
  function frame(t){
    const dt=Math.min(.045,Math.max(0,(t-lastFrame)/1000||.016));lastFrame=t;
    update(dt);
    if(t>tinyToastUntil && !$('statusToast').hidden)$('statusToast').hidden=true;
    const worldWidth=view.width/view.zoom,worldHeight=view.height/view.zoom;
    const cx=worldWidth>=WIDTH?WIDTH/2:Math.min(WIDTH-worldWidth/2,Math.max(worldWidth/2,G.player.x));
    const cy=worldHeight>=HEIGHT?HEIGHT/2:Math.min(HEIGHT-worldHeight/2,Math.max(worldHeight/2,G.player.y));
    const blend=G.state==='playing'?Math.min(1,dt*10):1;
    view.cameraX+=(cx-view.cameraX)*blend;view.cameraY+=(cy-view.cameraY)*blend;
    Art.render(ctx,G,view);
    requestAnimationFrame(frame);
  }
  async function tryLandscapeFullscreen(){
    if(!mobile){if(document.fullscreenElement){try{await document.exitFullscreen()}catch{}}else {try{await app.requestFullscreen?.()}catch{}}syncUI();return}
    let entered=!!document.fullscreenElement;
    if(!entered){try{if(app.requestFullscreen){await app.requestFullscreen();entered=true}}catch{}}
    if(screen.orientation&&typeof screen.orientation.lock==='function'){
      try{await screen.orientation.lock('landscape');rotationDismissed=true;syncUI();return}catch{}
    }
    if(innerHeight>innerWidth){rotationDismissed=false;syncUI();toast('Gire o iPhone ou Android manualmente para jogar na horizontal.',4)}
    else if(!entered)toast('Tela horizontal ativa. O navegador controla o modo de tela cheia.',3);
  }
  function showLevels(){
    const grid=$('levelGrid');grid.replaceChildren();
    level.forEach((stage,i)=>{const b=document.createElement('button');b.type='button';b.textContent=String(i+1).padStart(2,'0');b.title=stage.title;
      if(i>G.unlocked){b.className='locked';b.disabled=true;b.setAttribute('aria-label',`Fase ${i+1} bloqueada`)}
      else {b.className=i===G.selectedStage?'selected':'';b.setAttribute('aria-label',`Selecionar fase ${i+1}: ${stage.title}`);b.onclick=()=>{G.selectedStage=i;G.level=i;G.hearts=3;grid.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');$('panelDescription').textContent=stage.story;$('panelReference').textContent=stage.reference;$('panelReference').hidden=false;hud()}};
      grid.appendChild(b)
    });
    $('levelPicker').hidden=false;$('levelPickerBtn').textContent='Ocultar fases';
  }
  // Controls: game buttons never select text or trigger a long-press callout.
  app.addEventListener('contextmenu',e=>e.preventDefault());
  app.addEventListener('selectstart',e=>e.preventDefault());
  app.addEventListener('dragstart',e=>e.preventDefault());
  app.addEventListener('gesturestart',e=>{if(G.state==='playing')e.preventDefault()},{passive:false});
  app.addEventListener('gesturechange',e=>{if(G.state==='playing')e.preventDefault()},{passive:false});
  app.addEventListener('touchmove',e=>{if(G.state==='playing'&&!e.target.closest('.panel'))e.preventDefault()},{passive:false});
  const joystick=$('joystick'),knob=$('joystickKnob');let joystickPointer=null;
  function moveStick(e){const r=joystick.getBoundingClientRect(),centerX=r.left+r.width/2,centerY=r.top+r.height/2,radius=r.width*.32;
    let x=(e.clientX-centerX)/radius,y=(e.clientY-centerY)/radius;
    const length=Math.max(1,Math.hypot(x,y));x/=length;y/=length;
    G.stick={x,y};knob.style.transform=`translate(${(x*radius).toFixed(1)}px,${(y*radius).toFixed(1)}px)`;
  }
  joystick.addEventListener('pointerdown',e=>{e.preventDefault();if(G.state!=='playing')return;joystickPointer=e.pointerId;joystick.setPointerCapture?.(e.pointerId);moveStick(e)});
  joystick.addEventListener('pointermove',e=>{if(e.pointerId===joystickPointer){e.preventDefault();moveStick(e)}});
  function endStick(e){if(joystickPointer!==e.pointerId)return;joystickPointer=null;G.stick={x:0,y:0};knob.style.transform='translate(0,0)'}
  ['pointerup','pointercancel','lostpointercapture'].forEach(evt=>joystick.addEventListener(evt,endStick));
  const run=$('runBtn');
  run.addEventListener('pointerdown',e=>{e.preventDefault();if(G.state!=='playing')return;G.run=true;run.classList.add('pressed');run.setPointerCapture?.(e.pointerId)});
  function endRun(){G.run=false;run.classList.remove('pressed')}
  ['pointerup','pointercancel','lostpointercapture'].forEach(evt=>run.addEventListener(evt,endRun));
  $('actionBtn').addEventListener('pointerdown',e=>{e.preventDefault();interact()});
  const mapping={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
  window.addEventListener('keydown',e=>{
    const k=e.key.length===1?e.key.toLowerCase():e.key;
    if(mapping[k]&&G.state==='playing'){G.keys[mapping[k]]=true;e.preventDefault()}
    else if(k==='Shift'){G.keys.shift=true}
    else if((k==='e'||k===' ')&&G.state==='playing'){e.preventDefault();if(!e.repeat)interact()}
    else if(k==='p'){e.preventDefault();if(G.state==='playing')paused();else if(G.state==='paused')resumed()}
    else if(k==='f'){e.preventDefault();void tryLandscapeFullscreen()}
    else if(k==='Escape'&&G.state==='playing'&&!document.fullscreenElement){paused()}
  });
  window.addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(mapping[k])G.keys[mapping[k]]=false;if(k==='Shift')G.keys.shift=false});
  window.addEventListener('blur',stopInput);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&G.state==='playing')paused()});
  window.addEventListener('resize',resize);
  if(window.visualViewport)window.visualViewport.addEventListener('resize',()=>{const w=app.getBoundingClientRect().width,h=app.getBoundingClientRect().height;if(Math.abs(w-view.width)>2||Math.abs(h-view.height)>2)resize()});
  document.addEventListener('fullscreenchange',()=>{resize();syncUI()});
  $('dismissRotation').onclick=()=>{rotationDismissed=true;$('rotationTip').hidden=true};
  $('fullscreenBtn').onclick=()=>{void tryLandscapeFullscreen()};
  const leaveFullscreen=()=>{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})};
  $('panelFullscreenExit').onclick=leaveFullscreen;
  $('quizFullscreenExit').onclick=leaveFullscreen;
  $('quizQuit').onclick=()=>{leaveFullscreen();home()};
  $('pauseBtn').onclick=()=>{if(G.state==='playing')paused();else if(G.state==='paused')resumed()};
  $('exitBtn').onclick=()=>{if(document.fullscreenElement){document.exitFullscreen().catch(()=>{})}if(G.state==='playing'||G.state==='paused'||G.state==='quiz'){paused();G.state='paused';showPanel({title:'Sair da aventura?',description:'A fase atual está pausada. Você pode retomá-la ou voltar ao início.',reference:level[G.level].reference,button:'RETOMAR AVENTURA',canHome:true})}else home()};
  $('mainMenuBtn').onclick=home;
  $('levelPickerBtn').onclick=()=>{if($('levelPicker').hidden)showLevels();else{$('levelPicker').hidden=true;$('levelPickerBtn').textContent='Escolher fase'}};
  $('primaryBtn').onclick=()=>{
    if(G.state==='menu'){
      G.points=0;G.hearts=3;G.level=G.selectedStage;startStage();
      if(mobile)void tryLandscapeFullscreen();
    }
    else if(G.state==='paused')resumed();
    else if(G.state==='stageComplete')startStage(G.level);
    else if(G.state==='gameover')startStage(G.level);
    else if(G.state==='finished'){G.hearts=3;G.points=0;G.selectedStage=0;startStage(0)}
  };
  document.querySelectorAll('.skin-option').forEach(b=>b.addEventListener('click',()=>{
    G.skin=b.dataset.skin;document.querySelectorAll('.skin-option').forEach(o=>o.classList.toggle('active',b===o));
  }));
  for(const b of document.querySelectorAll('.skin-option'))Art.avatar(b.querySelector('canvas'),b.dataset.skin);
  makeWorld();home();resize();requestAnimationFrame(frame);
  // Accessible state for automated smoke tests, no server or network access.
  if(new URLSearchParams(location.search).has('teste'))window.RPGTeste={game:G,startStage,stageDone,launchQuiz,answerQuiz,interact,hud};
})();
