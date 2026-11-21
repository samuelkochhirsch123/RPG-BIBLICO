/* Heróis da Fé: navegador, iPhone e Android. Sem bibliotecas externas. */
(() => {
  'use strict';
  const D=window.BibliaData, Art=window.RPGArt, Adv=window.RPGAdventures;
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
    complete:0,laps:0,lapAngle:null,lapProgress:0,lapDirection:0,adventure:null,cinematic:null,
    missionSeconds:0,nextQuestion:60,quizRemaining:60,keys:{},stick:{x:0,y:0},run:false,
    getTarget(){
      const lvl=D.levels[this.level],ad=this.adventure;
      if(lvl.type==='laps')return null;
      const special=Adv.target(this);
      if(special)return special;
      const candidates=lvl.type==='arrive'?this.animals.filter(a=>!a.entered && a.index===ad.boardingIndex):this.markers.filter(m=>!m.done);
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
    G.missionSeconds=0;G.nextQuestion=60;G.quizRemaining=60;G.animTime=0;G.cinematic=null;
    G.markers=[];G.animals=[];G.trees=[];G.decals=[];
    const stage=level[G.level];G.adventure=Adv.create(stage);
    if(stage.type==='arrive') {
      const kinds=['ovelhas','aves','bois','cabras'];
      const start=[[380,520],[515,860],[895,750],[915,490]];
      const ends=[[470,590],[567,625],[735,625],[826,590]];
      for(let i=0;i<4;i++)G.animals.push({kind:kinds[i],label:stage.items[i],index:i,x:start[i][0],y:start[i][1],goalX:ends[i][0],goalY:ends[i][1],ready:false,entered:false,boarding:false,boardTime:0,boardX:0,boardY:0});
    } else if(!['laps','ark','sea','storm'].includes(stage.type)) {
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
    const stage=level[G.level],a=G.adventure;
    $('hudChapter').textContent=stage.title;
    $('hudHearts').textContent='♥ '.repeat(G.hearts)+'♡ '.repeat(3-G.hearts);
    $('hudPoints').textContent='✦ '+G.points;
    $('hudLevel').textContent=(G.level+1)+'/20';
    let done=G.complete,maximum=stage.count,message=stage.mission,label='MISSÃO';
    if(stage.type==='laps'){done=G.laps;message=`${G.laps}/13 voltas · contorne as muralhas`;label=G.laps<6?'JERICÓ · DIA '+(G.laps+1):'JERICÓ · 7º DIA'}
    if(stage.type==='ark'){message=a.room==='inside'?`${G.complete}/3 depósitos preparados · transporte as provisões`:'Entre pela porta da arca para preparar os alimentos';label='PREPARAÇÃO'}
    if(stage.type==='arrive'){
      label=a.room==='inside'?'INTERIOR DA ARCA':'RECEBENDO OS ANIMAIS';
      if(a.room==='inside'){done=a.pensDone;maximum=4;message=`Organize os animais: ${done}/4 compartimentos`}
      else if(G.complete===4)message='Todos entraram! Agora entre na arca e organize os compartimentos';
      else if(a.boardingIndex<4 && G.animals[a.boardingIndex]?.boarding)message=`${G.animals[a.boardingIndex].label} entrando na arca...`;
      else if(a.boardingIndex<4 && a.nextReadyAt>G.missionSeconds)message=`Próximo grupo em ${Math.ceil(a.nextReadyAt-G.missionSeconds)}s · observe a entrada`;
      else message=`Receba cada grupo e espere a animação de entrada · ${G.complete}/4`;
    }
    if(stage.type==='sea')message=a.seaOpened?'Atravesse pelo caminho seco até a outra margem':'Encontre Moisés junto ao mar e fale com ele';
    if(stage.type==='storm')message=a.stormCleared?'A tempestade acalmou!':'Aproxime-se do barco e prepare-se';
    $('missionLabel').textContent=label;
    $('missionText').textContent=message;
    $('countLabel').textContent=done+'/'+maximum;
    $('missionFill').style.width=Math.min(100,done*100/maximum)+'%';
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
    stopInput();G.cinematic=null;$('cinematicOverlay').hidden=true;G.state='menu';G.level=G.selectedStage;G.hearts=3;
    showPanel({title:'Heróis da Fé',description:'Uma aventura original em pixel art. Explore 20 episódios, conheça as histórias e responda aos desafios bíblicos.',reference:'Antigo Testamento · Jesus · Atos dos Apóstolos',button:'COMEÇAR AVENTURA',showSkins:true,showInstructions:true,allowStages:true});
    hud();
  }
  function startStage(stageIndex=G.level){
    stopInput();G.level=Math.max(0,Math.min(19,stageIndex));makeWorld();
    G.state='playing';$('mainOverlay').hidden=true;$('quizOverlay').hidden=true;$('cinematicOverlay').hidden=true;$('statusToast').hidden=true;
    hud();syncUI();
    toast(G.level===1?'Os animais chegam sozinhos, em grupos. Acompanhe a entrada e depois organize os compartimentos.':level[G.level].mission,4);
  }
  function paused(){if(G.state!=='playing')return;stopInput();G.state='paused';showPanel({title:'Jogo pausado',description:level[G.level].story,reference:level[G.level].reference,button:'RETOMAR AVENTURA',canHome:true})}
  function resumed(){G.state='playing';$('mainOverlay').hidden=true;syncUI()}
  function playCinematic(kind,{title,kicker,caption,duration=6,onEnd}={}){
    if(G.state!=='playing')return;
    stopInput();G.state='cutscene';
    G.cinematic={kind,t:0,duration,onEnd};
    $('cineTitle').textContent=title||'UM MOMENTO EXTRAORDINÁRIO';
    $('cineKicker').textContent=kicker||level[G.level].reference;
    $('cineCaption').textContent=caption||'A história continua...';
    $('cineProgress').style.width='0%';$('cinematicOverlay').hidden=false;syncUI();
  }
  function finishCinematic(){
    if(!G.cinematic)return;
    const c=G.cinematic;G.cinematic=null;$('cinematicOverlay').hidden=true;
    G.state='playing';syncUI();
    if(typeof c.onEnd==='function')c.onEnd();
  }
  function transitionInside(){
    G.adventure.room='inside';G.player={x:640,y:776};G.direction='up';
    view.cameraX=640;view.cameraY=690;
    hud();syncUI();
  }
  function transitionOutside(){
    G.adventure.room='outdoor';G.player={x:640,y:568};G.direction='down';
    view.cameraX=640;view.cameraY=640;hud();
  }
  function near(x,y,r=96){return Math.hypot(G.player.x-x,G.player.y-y)<=r}
  function interactArk(){
    const a=G.adventure;
    if(a.room==='outdoor'){
      if(near(640,492,110)){transitionInside();toast('Você entrou na arca. Leve os mantimentos até os depósitos!');}
      else toast('Caminhe até a porta central da arca para entrar.');
      return;
    }
    if(near(640,847,90)){transitionOutside();toast('Você saiu da arca.');return}
    if(a.carrying){
      const stall=a.stalls[a.cargoStep];
      if(near(stall.x,stall.y,98)){
        a.carrying=false;G.complete++;G.points+=85;a.cargoStep++;
        toast(`${stall.label} armazenados com segurança!`,3);hud();
        if(G.complete===3){playCinematic('arkFinish',{title:'A ARCA ESTÁ PREPARADA',kicker:'GÊNESIS 6:21',caption:'Os mantimentos estão organizados para a viagem.',duration:3.8,onEnd:stageDone})}
      }else toast(`Leve as provisões até o depósito: ${stall.label}.`);
      return;
    }
    if(near(a.cargo.x,a.cargo.y,90)){a.carrying=true;toast(`Leve o saco de provisões para ${a.stalls[a.cargoStep].label}.`);hud()}
    else toast('Pegue o saco de provisões no centro da arca.');
  }
  function interactAnimals(){
    const a=G.adventure;
    if(a.room==='inside'){
      if(near(640,847,90)){transitionOutside();toast('Você saiu da arca.');return}
      const pen=a.pens.find(p=>!p.done&&near(p.x,p.y,95));
      if(pen){
        if(a.penCooldown>G.missionSeconds){toast(`Espere ${Math.ceil(a.penCooldown-G.missionSeconds)}s antes de organizar o próximo espaço.`);return}
        pen.done=true;a.pensDone++;a.penCooldown=G.missionSeconds+4;G.points+=75;toast(`Compartimento das ${pen.label.toLowerCase()} organizado!`);hud();
        if(a.pensDone===4)playCinematic('animalFinish',{title:'TODOS ESTÃO A BORDO',kicker:'GÊNESIS 7:8–9',caption:'Os animais chegaram a Noé e foram recebidos na arca.',duration:4.4,onEnd:stageDone});
      }else toast('Vá até um compartimento ainda vazio para organizar os animais.');
      return;
    }
    if(G.complete===4){
      if(near(640,492,110)){transitionInside();toast('Distribua cada grupo em seu compartimento.',3)}
      else toast('Agora aproxime-se da porta e entre na arca.');
      return;
    }
    const group=G.animals[a.boardingIndex];
    if(!group)return;
    if(group.boarding){toast('Observe os animais entrando na arca. Não é possível pular essa animação.');return}
    if(a.nextReadyAt>G.missionSeconds){toast(`O próximo grupo chega em ${Math.ceil(a.nextReadyAt-G.missionSeconds)} segundos.`);return}
    if(!group.ready){toast('Os animais estão vindo por conta própria. Vá ao encontro deles.');return}
    if(!near(group.x,group.y,106)){toast('Aproxime-se do grupo para liberar sua entrada.');return}
    group.boarding=true;group.boardTime=0;group.boardX=group.x;group.boardY=group.y;
    toast(`Você abriu a passagem! Observe ${group.label.toLowerCase()} caminhando até a arca.`,4);
    hud();
  }
  function interactSea(){
    const a=G.adventure;
    if(!a.seaOpened){
      if(!near(640,635,112)){toast('Aproxime-se de Moisés, na margem do mar.');return}
      playCinematic('sea',{kicker:'ÊXODO 14:21–22',title:'O MAR VERMELHO SE ABRE',caption:'Um forte vento soprou, as águas se dividiram e surgiu terra seca.',duration:7,onEnd:()=>{a.seaOpened=true;a.seaProgress=1;toast('O caminho está aberto. Atravesse até a outra margem!',5);hud()}});
    }else toast('Passe entre as muralhas de água e chegue à outra margem.');
  }
  function interactStorm(){
    const a=G.adventure;
    if(!near(640,535,115)){toast('Aproxime-se do barco para embarcar.');return}
    if(a.stormCleared)return;
    playCinematic('storm',{kicker:'MARCOS 4:35–41',title:'SILÊNCIO! AQUIETAI-VOS!',caption:'O vento sopra, as ondas crescem... e então acontece a calmaria.',duration:8,onEnd:()=>{a.stormCleared=true;stageDone()}});
  }
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
    if(lvl.type==='ark'){interactArk();return}
    if(lvl.type==='arrive'){interactAnimals();return}
    if(lvl.type==='sea'){interactSea();return}
    if(lvl.type==='storm'){interactStorm();return}
    if(lvl.type==='laps'){toast('Contorne a muralha de Jericó pelo caminho exterior.');return}
    if(lvl.type==='feed' && G.missionSeconds<G.adventure.feedCooldown){toast(`Aguarde ${Math.ceil(G.adventure.feedCooldown-G.missionSeconds)}s para distribuir ao próximo grupo.`);return}
    const mark=G.markers.find(m=>!m.done && near(m.x,m.y,84));
    if(!mark){toast('Procure um marco brilhante e aproxime-se.');return}
    mark.done=true;G.complete++;G.points+=50;
    if(lvl.type==='feed'){G.adventure.feedCooldown=G.missionSeconds+4;toast('Alimento entregue! Jesus alimentou a multidão. Siga para outro grupo.',3)}
    else toast(`${mark.label} concluído!`,2);
    hud();if(G.complete>=lvl.count){if(lvl.type==='feed')playCinematic('bread',{kicker:'JOÃO 6:11–13',title:'TODOS COMERAM E FICARAM SATISFEITOS',caption:'Jesus multiplicou os pães e os peixes para a multidão.',duration:4.8,onEnd:stageDone});else stageDone();}
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
          if(G.laps>=13){playCinematic('jericho',{kicker:'JOSUÉ 6:20',title:'AS MURALHAS CAÍRAM',caption:'O povo gritou e a muralha caiu. A vitória veio do Senhor.',duration:7,onEnd:stageDone});return}
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
    if(G.state==='cutscene'){
      const c=G.cinematic;if(!c)return;
      c.t=Math.min(c.duration,c.t+dt);G.animTime+=dt*1000;
      if(c.kind==='sea')G.adventure.seaProgress=Math.min(1,Math.max(0,(c.t-.9)/(c.duration-1.4)));
      if(c.kind==='jericho')G.adventure.wallProgress=Math.min(1,Math.max(0,(c.t-1)/(c.duration-1.5)));
      if(c.kind==='storm')G.adventure.stormProgress=c.t/c.duration;
      $('cineProgress').style.width=(c.t/c.duration*100)+'%';
      if(c.t>=c.duration)finishCinematic();
      return;
    }
    if(G.state==='quiz'){
      G.quizRemaining=Math.max(0,G.quizRemaining-dt);
      const s=Math.ceil(G.quizRemaining);
      $('quizClock').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
      $('quizBarFill').style.width=(G.quizRemaining/60*100)+'%';
      if(G.quizRemaining<=0)answerQuiz(false);
      return;
    }
    if(G.state!=='playing')return;
    G.animTime+=dt*1000;G.missionSeconds+=dt;
    if(G.missionSeconds>=G.nextQuestion){launchQuiz();return}
    const lvl=level[G.level],adv=G.adventure;
    if(lvl.type==='arrive'&&adv.room==='outdoor'&&adv.boardingIndex<4){
      const a=G.animals[adv.boardingIndex];
      if(a.boarding){
        a.boardTime+=dt;
        const p=Math.min(1,a.boardTime/7.5),ease=p*p*(3-2*p);
        a.x=a.boardX+(640-a.boardX)*ease;
        a.y=a.boardY+(444-a.boardY)*ease;
        if(p>=1){
          a.boarding=false;a.entered=true;G.complete++;G.points+=100;
          adv.boardingIndex++;adv.nextReadyAt=G.missionSeconds+11;
          toast(`${a.label} entraram na arca. Próximo grupo em 11 segundos.`,4);hud();
        }
      } else if(G.missionSeconds>=adv.nextReadyAt && !a.ready){
        const dx=a.goalX-a.x,dy=a.goalY-a.y,dist=Math.hypot(dx,dy);
        if(dist<3){a.x=a.goalX;a.y=a.goalY;a.ready=true;toast(`Os ${a.label.toLowerCase()} chegaram! Aproxime-se e toque em AÇÃO.`,3)}
        else {const step=Math.min(dist,54*dt);a.x+=dx/dist*step;a.y+=dy/dist*step}
      }
      if(Math.floor(G.missionSeconds)!==Math.floor(G.missionSeconds-dt))hud();
    }
    let x=G.stick.x+(G.keys.right?1:0)-(G.keys.left?1:0);
    let y=G.stick.y+(G.keys.down?1:0)-(G.keys.up?1:0);
    const len=Math.hypot(x,y);
    if(len>1){x/=len;y/=len}
    if(len>.12){
      const speed=(G.run||G.keys.shift)?330:197;
      let nx=Math.max(25,Math.min(WIDTH-25,G.player.x+x*speed*dt));
      let ny=Math.max(40,Math.min(HEIGHT-24,G.player.y+y*speed*dt));
      if(lvl.type==='sea'&&adv.room==='outdoor'){
        if(!adv.seaOpened && ny<425)ny=425;
        if(adv.seaOpened && (ny<414 && ny>120) && Math.abs(nx-640)>79){nx=Math.max(562,Math.min(718,nx));}
      }
      G.player.x=nx;G.player.y=ny;
      G.walkMs+=dt*1000;G.pose=(Math.floor(G.walkMs/175)%2);
      G.direction=Math.abs(x)>Math.abs(y)?(x>0?'right':'left'):(y>0?'down':'up');
      checkLaps(x,y);
      if(lvl.type==='sea'&&adv.seaOpened&&G.player.y<130){G.complete=1;hud();playCinematic('crossing',{title:'A TRAVESSIA FOI CONCLUÍDA',kicker:'ÊXODO 14:29',caption:'O povo passou pelo mar em terra seca.',duration:3.5,onEnd:stageDone});return}
    }else{G.pose=0;G.lapAngle=null}
    const target=G.getTarget();
    const ready=target && near(target.x,target.y,95);
    const hint=$('interactionHint');hint.hidden=!ready;
    if(ready){
      if(lvl.type==='arrive'&&adv.room==='outdoor'&&adv.boardingIndex<4){
        const a=G.animals[adv.boardingIndex];
        hint.textContent=a.boarding?'ANIMAIS ENTRANDO...':adv.nextReadyAt>G.missionSeconds?`PRÓXIMO EM ${Math.ceil(adv.nextReadyAt-G.missionSeconds)}s`:a.ready?(mobile?'AÇÃO · ABRIR PASSAGEM':'E · ABRIR PASSAGEM'):'ANIMAIS CHEGANDO';
      }else hint.textContent=mobile?'TOQUE EM AÇÃO PARA INTERAGIR':'PRESSIONE E PARA INTERAGIR';
    }
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
    let cx=worldWidth>=WIDTH?WIDTH/2:Math.min(WIDTH-worldWidth/2,Math.max(worldWidth/2,G.player.x));
    let cy=worldHeight>=HEIGHT?HEIGHT/2:Math.min(HEIGHT-worldHeight/2,Math.max(worldHeight/2,G.player.y));
    if(G.cinematic){
      if(G.cinematic.kind==='sea'||G.cinematic.kind==='crossing'){cx=640;cy=310}
      if(G.cinematic.kind==='jericho'){cx=640;cy=430}
      if(G.cinematic.kind==='storm'){cx=640;cy=410}
      if(G.cinematic.kind==='animalFinish'||G.cinematic.kind==='arkFinish'){cx=640;cy=470}
    }
    const blend=(G.state==='playing'?Math.min(1,dt*10):G.state==='cutscene'?Math.min(1,dt*2.1):1);
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
  $('skipCutscene').onclick=()=>{if(G.state==='cutscene')finishCinematic()};
  $('dismissRotation').onclick=()=>{rotationDismissed=true;$('rotationTip').hidden=true};
  $('fullscreenBtn').onclick=()=>{void tryLandscapeFullscreen()};
  const leaveFullscreen=()=>{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})};
  $('panelFullscreenExit').onclick=leaveFullscreen;
  $('quizFullscreenExit').onclick=leaveFullscreen;
  $('quizQuit').onclick=()=>{leaveFullscreen();home()};
  $('pauseBtn').onclick=()=>{if(G.state==='playing')paused();else if(G.state==='paused')resumed()};
  $('exitBtn').onclick=()=>{if(document.fullscreenElement){document.exitFullscreen().catch(()=>{})}if(G.state==='playing'||G.state==='paused'||G.state==='quiz'||G.state==='cutscene'){G.cinematic=null;$('cinematicOverlay').hidden=true;paused();G.state='paused';showPanel({title:'Sair da aventura?',description:'A fase atual está pausada. Você pode retomá-la ou voltar ao início.',reference:level[G.level].reference,button:'RETOMAR AVENTURA',canHome:true})}else home()};
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
  if(new URLSearchParams(location.search).has('teste'))window.RPGTeste={game:G,startStage,stageDone,launchQuiz,answerQuiz,interact,hud,update,playCinematic,finishCinematic};
})();
