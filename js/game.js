/* Heróis da Fé: navegador, iPhone e Android. Sem bibliotecas externas. */
(() => {
  'use strict';
  const D=window.BibliaData, Art=window.RPGArt, Adv=window.RPGAdventures, Physics=window.RPGPhysics, Online=window.RPGOnline;
  const $=id=>document.getElementById(id);
  const app=$('app'),canvas=$('world'),ctx=canvas.getContext('2d',{alpha:false});
  const PI2=Math.PI*2, WIDTH=1280,HEIGHT=960;
  const mobile=matchMedia('(pointer:coarse)').matches || ('ontouchstart' in window && innerWidth<1000);
  const storeKey='heroisDaFe.unlock.v6';const scoreKey='heroisDaFe.records.v6';
  function getUnlock(){try{return Math.max(0,Math.min(19,parseInt(localStorage.getItem(storeKey)||localStorage.getItem('heroisDaFe.unlock.v3')||'0',10)||0))}catch{return 0}}
  function saveUnlock(value){try{localStorage.setItem(storeKey,String(value))}catch{}}
  const G={
    state:'menu',level:0,selectedStage:0,unlocked:getUnlock(),skin:'homem',hearts:3,points:0,remotePlayers:[],
    player:{x:640,y:755},direction:'down',pose:0,walkMs:0,animTime:0,markers:[],animals:[],trees:[],decals:[],
    complete:0,laps:0,lapAngle:null,lapProgress:0,lapDirection:0,adventure:null,cinematic:null,
    coopStats:{},coopLast:null,coopActor:null,coopQueue:[],coopLaps:{},coopHorn:null,
    missionSeconds:0,nextQuestion:60,questionDeck:[],lastQuestionText:'',quizRemaining:60,quizLimit:60,quizPayload:null,skill:null,modeHard:false,penalties:0,stageLimit:220,lapClock:0,introPlayed:false,escort:{x:640,y:755,far:0},keys:{},stick:{x:0,y:0},run:false,
    getTarget(){
      const lvl=D.levels[this.level],ad=this.adventure;
      if(lvl.type==='laps')return null;
      const special=Adv.target(this);
      if(special)return special;
      const freeChoice=window.RPGOnline?.info().active;
      const candidates=lvl.type==='arrive'?this.animals.filter(a=>!a.entered && a.index===ad.boardingIndex):((freeChoice||lvl.type==='feed')?this.markers.filter(m=>!m.done):[this.markers[this.complete]].filter(Boolean));
      return candidates.sort((a,b)=>Math.hypot(a.x-this.player.x,a.y-this.player.y)-Math.hypot(b.x-this.player.x,b.y-this.player.y))[0]||null;
    }
  };
  let lastFrame=0,tinyToastUntil=0,rotationDismissed=false,onlineSession=0,guestSession=0,guestQuizClock=0,guestWaiting=false,guestCutsceneSeen='',guestCoopSeen='',guestHornSeen='',lastGuestActionAt=-1000;
  const view={width:innerWidth,height:innerHeight,dpr:1,zoom:1,cameraX:640,cameraY:700};
  const level=D.levels;
  const stopInput=()=>{G.keys={};G.stick={x:0,y:0};G.run=false;$('joystickKnob').style.transform='translate(0px,0px)';$('runBtn').classList.remove('pressed')};
  function rand(n){let v=Math.sin((n+1)*91.71+(G.level+3)*37.33)*45124.337;return v-Math.floor(v)}
  function makeWorld(){
    G.player={x:640,y:755};G.direction='down';G.walkMs=0;G.pose=0;lastGuestActionAt=-1000;
    G.complete=0;G.laps=0;G.lapAngle=null;G.lapProgress=0;G.lapDirection=0;
    G.coopStats={};G.coopLast=null;G.coopActor=null;G.coopQueue=[];G.coopLaps={};G.coopHorn=null;
    G.missionSeconds=0;G.nextQuestion=60;G.quizRemaining=60;G.animTime=0;G.cinematic=null;G.skill=null;G.penalties=0;G.stageLimit=level[G.level].limit||240;G.lapClock=0;G.escort={x:640,y:755,far:0};
    G.markers=[];G.animals=[];G.trees=[];G.decals=[];G.questionDeck=[];
    const stage=level[G.level];G.adventure=Adv.create(stage);
    if(stage.type==='arrive') {
      const kinds=['ovelhas','aves','bois','cabras'];
      const start=[[380,520],[515,860],[895,750],[915,490]];
      const ends=[[470,590],[567,625],[735,625],[826,590]];
      for(let i=0;i<4;i++)G.animals.push({kind:kinds[i],label:stage.items[i],index:i,x:start[i][0],y:start[i][1],goalX:ends[i][0],goalY:ends[i][1],ready:false,entered:false,boarding:false,boardTime:0,boardX:0,boardY:0});
    } else if(!['laps','ark','sea'].includes(stage.type)) {
      for(let i=0;i<stage.count;i++){
        const a=(i/stage.count)*PI2+Math.PI/2;
        const spot=Physics.safeMarker(640+Math.cos(a)*350,440+Math.sin(a)*280,{level:G.level,adventure:G.adventure});
        G.markers.push({x:spot.x,y:spot.y,label:stage.items[i]||'Marco',done:false});
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
    $('hudHearts').textContent='♥ '.repeat(G.hearts)+'♡ '.repeat((G.modeHard?2:3)-G.hearts);
    $('hudPoints').textContent='✦ '+G.points;
    $('hudLevel').textContent=(G.level+1)+'/20';
    let done=G.complete,maximum=stage.count,message=stage.mission,label='MISSÃO';const timerLeft=Math.max(0,Math.ceil(G.stageLimit-G.missionSeconds));
    if(stage.type==='laps'){done=G.laps;const pct=Math.min(100,Math.floor(G.lapProgress/PI2*100));message=`${G.laps}/7 voltas no 7º dia · volta atual ${pct}% · siga as estacas`;label='JERICÓ · 7º DIA'}
    if(stage.type==='escort'){message=`${G.complete}/3 grupos guiados · fique perto do povo`}
    if(stage.type==='knowledge'||stage.type==='granary'||stage.type==='story'){message=`${G.complete}/${stage.count} etapas bíblicas · fale com o próximo personagem`}
    if(stage.type==='fishing'||stage.type==='rhythm'||stage.type==='shipwreck'||stage.type==='storm'){message=`${G.complete}/${stage.count} desafios de precisão concluídos`}
    if(stage.type==='ark'){message=a.room==='inside'?`${G.complete}/3 depósitos preparados · transporte as provisões`:'Entre pela porta da arca para preparar os alimentos';label='PREPARAÇÃO'}
    if(stage.type==='arrive'){
      label=a.room==='inside'?'INTERIOR DA ARCA':'RECEBENDO OS ANIMAIS';
      if(a.room==='inside'){done=a.pensDone;maximum=4;message=`Organize os animais: ${done}/4 compartimentos`}
      else if(G.complete===4)message='Todos entraram! Agora entre na arca e organize os compartimentos';
      else if(a.boardingIndex<4 && G.animals[a.boardingIndex]?.boarding)message=`${G.animals[a.boardingIndex].label} entrando na arca...`;
      else if(a.boardingIndex<4 && a.nextReadyAt>G.missionSeconds)message=`Próximo grupo em ${Math.ceil(a.nextReadyAt-G.missionSeconds)}s · observe a entrada`;
      else message=`Receba cada grupo e espere a animação de entrada · ${G.complete}/4`;
    }
    if(stage.type==='sea')message=a.seaOpened?(a.seaMarked?'Guie os israelitas pelo caminho seco até a outra margem':'Complete os três sinais de orientação com a mira'):'Encontre Moisés junto ao mar e fale com ele';
    if(stage.type==='storm')message=a.stormCleared?'A tempestade acalmou!':'Aproxime-se do barco e prepare-se';
    $('missionLabel').textContent=label;
    $('missionText').textContent=message+` · ⏳ ${timerLeft}s`;
    $('countLabel').textContent=done+'/'+maximum;
    $('missionFill').style.width=Math.min(100,done*100/maximum)+'%';
    const team=$('coopTeam');
    if(team){const active=isOnline();team.hidden=!active;if(active){const vals=Object.values(G.coopStats||{}).sort((a,b)=>b.tasks-a.tasks);team.textContent=vals.length?'EQUIPE · '+vals.map(x=>`${x.name}: ${x.tasks}`).join(' · '):'EQUIPE · Cada jogador pode concluir tarefas';}}
  }
  function toast(msg,seconds=2.8){$('statusToast').textContent=msg;$('statusToast').hidden=false;tinyToastUntil=performance.now()+seconds*1000}
  function isOnline(){return !!Online?.info().active}
  function isGuest(){return isOnline() && !Online.info().host}
  function currentActor(){if(G.coopActor)return G.coopActor;const info=Online?.info();return {uid:info?.uid||'solo',name:info?.name||'Jogador'}}
  function celebrateCoop(detail){
    if(!isOnline()||!Online.info().host)return;
    const {uid,name}=currentActor();const stat=G.coopStats[uid]||{name,tasks:0};
    stat.name=String(name||'Jogador').slice(0,18);stat.tasks++;
    G.coopStats[uid]=stat;
    G.coopLast={id:Date.now()+'-'+Math.random().toString(36).slice(2,7),uid,name:stat.name,detail};
    hud();
  }
  const SKILL_INFOS={fishing:['Puxe a rede no momento certo','Alinhe-se à bóia móvel e lance a rede.'],rhythm:['Acompanhe o ritmo do louvor','Sincronize com o sinal luminoso. A oração e o louvor estão em Atos 16:25.'],shipwreck:['Enfrente as ondas','Mantenha a embarcação na rota em meio às ondas.'],storm:['Mantenha o barco estável','Oriente a tripulação durante a tempestade.']};
  function selectedMarker(){
    const candidates=G.markers.filter(m=>!m.done&&near(m.x,m.y,98));
    if(!candidates.length)return null;
    return candidates.sort((a,b)=>Math.hypot(a.x-G.player.x,a.y-G.player.y)-Math.hypot(b.x-G.player.x,b.y-G.player.y))[0];
  }
  async function sendGuestTask(details){
    // Atualize a posição primeiro: depois da corrida o Firebase pode estar até
    // 240 ms atrasado, e a tarefa seria recusada por estar fora da área.
    const now=performance.now();if(now-lastGuestActionAt<450)return;
    lastGuestActionAt=now;
    try{
      await Online.position({x:G.player.x,y:G.player.y,dir:G.direction,pose:G.pose,room:G.adventure?.room||'outdoor'},true);
      await Online.command('interact',details);
    }catch(err){toast('Não foi possível sincronizar esta ação. Tente novamente.',3)}
  }
  function guestInteract(){
    const stage=level[G.level],a=G.adventure;
    if(stage.type==='laps'){toast('Marche junto à muralha: suas voltas também contam para a equipe.',2.8);return}
    // Cada convidado responde à sua própria pergunta ou mira antes de concluir a tarefa.
    const special=stage.type==='ark'||stage.type==='arrive'||stage.type==='sea'||(stage.type==='storm'&&G.complete>=stage.count);
    if(special){
      if(stage.type==='sea'&&a.seaOpened&&!a.seaMarked){
        startSkill(()=>{void sendGuestTask({task:'sea-signal',stage:G.level,session:guestSession})},3,
          {title:'Sinalize a travessia',hint:'Complete três sinais de orientação. Deus abriu o mar; você auxilia o povo.',secs:G.modeHard?24:35});return;
      }
      void sendGuestTask({task:'world',stage:G.level,session:guestSession});return;
    }
    const mark=selectedMarker();if(!mark){toast('Aproxime-se de uma tarefa ainda não concluída.',2);return}
    const complete=()=>{void sendGuestTask({task:'marker',index:G.markers.indexOf(mark),stage:G.level,session:guestSession})};
    const taskIndex=G.markers.indexOf(mark);
    const custom=D.stageChallenges?.[G.level]?.[taskIndex];
    if(['knowledge','granary','story'].includes(stage.type)){
      askQuestion(custom||D.questions[G.level],complete,G.modeHard?26:40);return;
    }
    if(SKILL_INFOS[stage.type]){
      const info=SKILL_INFOS[stage.type];startSkill(complete,G.modeHard?3:2,{title:info[0],hint:info[1],secs:G.modeHard?20:28});return;
    }
    if(['route','investigate','escort'].includes(stage.type) && taskIndex%2===1){
      askQuestion(D.questions[G.level],complete,G.modeHard?25:38);return;
    }
    complete();
  }
  function updateOnlinePlayers(players,selfId){
    const previous=new Map(G.remotePlayers.map(p=>[p.uid,p]));
    G.remotePlayers=Object.entries(players||{}).filter(([uid])=>uid!==selfId).map(([uid,p])=>({uid,name:String(p.name||'Jogador').slice(0,18),skin:p.skin||'homem',x:Number(p.x)||640,y:Number(p.y)||755,dir:p.dir||'down',pose:p.pose?1:0,room:p.room||'outdoor'}));
    if(isOnline()&&Online.info().host&&G.state==='playing'&&G.level===8){
      for(const p of G.remotePlayers){const before=previous.get(p.uid);if(before&&p.room==='outdoor'){
        const dx=p.x-before.x,dy=p.y-before.y;
        if(Math.hypot(dx,dy)>1)checkLaps(dx,dy,p,p.uid);
      }}
    }
    const list=$('onlinePlayers');list.replaceChildren();
    const ids=Object.keys(players||{});$('onlinePlayerCount').textContent=ids.length+'/4';
    for(const uid of ids){const p=players[uid],li=document.createElement('li');li.textContent=(p.skin==='menina'?'♀ ':p.skin==='mulher'?'♀ ':p.skin==='menino'?'♂ ':'♂ ')+(p.name||'Jogador');
      const label=document.createElement('span');label.textContent=uid===selfId?'VOCÊ': 'JOGADOR';li.append(label);list.append(li)}
  }
  function onlineStateData(){
    return {session:onlineSession,stage:G.level,mode:G.state,complete:G.complete,laps:G.laps,lapProgress:G.lapProgress,
      points:G.points,missionSeconds:Math.round(G.missionSeconds*10)/10,stageLimit:G.stageLimit,
      adventure:G.adventure,markers:G.markers,animals:G.animals,escort:G.escort,
      cinematic:G.cinematic?{kind:G.cinematic.kind,t:G.cinematic.t,duration:G.cinematic.duration}:null,
      title:$('cineTitle').textContent,kicker:$('cineKicker').textContent,caption:$('cineCaption').textContent,
      leaderHearts:G.hearts,coopStats:G.coopStats,coopLast:G.coopLast,coopHorn:G.coopHorn,updatedAt:Date.now()};
  }
  function onlineApplyState(state){
    if(!isGuest()||!state||!Number.isInteger(state.stage)||state.stage<0||state.stage>19)return;
    // A tela de conclusão mostra o próximo capítulo antes do líder iniciá-lo.
    if(state.mode==='stageComplete'||state.mode==='finished'||state.mode==='gameover'){
      if(!guestWaiting){guestWaiting=true;stopInput();G.state='onlineWaiting';
        G.unlocked=Math.max(G.unlocked,Math.min(19,state.stage));saveUnlock(G.unlocked);void Online.saveProgress(G.unlocked,Number(state.points)||0);
        showPanel({title:state.mode==='gameover'?'Equipe sem vidas':state.mode==='finished'?'Jornada concluída!':'Fase concluída!',
          description:'O líder inicia o próximo capítulo. Durante as fases, todos podem cumprir tarefas e desafios. Aguarde a equipe.',
          reference:'Multiplayer · sala '+Online.info().room,button:'AGUARDE O LÍDER',canHome:true});
        $('primaryBtn').disabled=true;
      }
      return;
    }
    if(state.session!==guestSession || G.level!==state.stage){
      guestSession=state.session;G.level=state.stage;makeWorld();G.hearts=G.modeHard?2:3;
      G.state='playing';guestWaiting=false;guestQuizClock=0;guestCutsceneSeen='';
      // Ao começar uma fase nova, nenhuma tela da fase anterior pode permanecer aberta.
      $('mainOverlay').hidden=true;$('onlineOverlay').hidden=true;$('quizOverlay').hidden=true;
      $('aimOverlay').hidden=true;$('learnOverlay').hidden=true;$('cinematicOverlay').hidden=true;
      G.cinematic=null;$('primaryBtn').disabled=false;syncUI();
      guestCoopSeen='';guestHornSeen='';lastGuestActionAt=-1000;toast('Missão em equipe! Cada jogador pode concluir tarefas.',4);
    }
    const oldRoom=G.adventure?.room||'outdoor',newRoom=state.adventure?.room||'outdoor';
    if(oldRoom!==newRoom){G.player=newRoom==='inside'?{x:640,y:776}:{x:640,y:568};stopInput()}
    G.complete=Number(state.complete)||0;G.laps=Number(state.laps)||0;G.lapProgress=Number(state.lapProgress)||0;
    G.points=Number(state.points)||0;G.missionSeconds=Number(state.missionSeconds)||0;G.stageLimit=Number(state.stageLimit)||220;
    G.adventure=state.adventure||G.adventure;G.markers=state.markers||[];G.animals=state.animals||[];
    G.escort=state.escort||G.escort;
    G.coopStats=state.coopStats||{};G.coopLast=state.coopLast||null;G.coopHorn=state.coopHorn||null;
    if(G.coopLast&&G.coopLast.id!==guestCoopSeen){
      guestCoopSeen=G.coopLast.id;
      toast((G.coopLast.uid===Online.info().uid?'Você':G.coopLast.name)+' · '+G.coopLast.detail,3.2);
    }
    if(G.coopHorn&&G.coopHorn.uid===Online.info().uid&&guestHornSeen!==G.coopHorn.id&&G.state==='playing'){
      guestHornSeen=G.coopHorn.id;
      const horn=G.coopHorn;
      startSkill(()=>{void sendGuestTask({task:'horn-success',hornId:horn.id,stage:G.level,session:guestSession})},horn.final?3:2,
        {title:horn.final?'TOQUE FINAL DAS TROMBETAS':'TOQUE DAS TROMBETAS',hint:'Acerte o ritmo dos sacerdotes de Jericó.',secs:G.modeHard?19:29,
          fail:()=>{void sendGuestTask({task:'horn-fail',hornId:horn.id,stage:G.level,session:guestSession})}});
    }
    // Os convidados assistem à missão no próprio mapa. A tela cinematográfica do
    // anfitrião NUNCA deve ocupar a tela nem impedir AÇÃO / movimento dos amigos.
    // O velho estado onlineScene podia ficar preso quando uma notificação atrasava.
    G.cinematic=null;
    $('cinematicOverlay').hidden=true;
    if(G.state==='onlineScene')G.state='playing';
    if(state.mode==='cutscene'){
      const id=String(state.session)+':'+String(state.stage)+':'+String(state.cinematic?.kind||state.title||'cena');
      if(id!==guestCutsceneSeen){
        guestCutsceneSeen=id;
        // Aviso pequeno na parte inferior, não uma máscara sobre o personagem.
        toast((state.title||'Cena bíblica acontecendo')+' · acompanhe a aventura!',4.5);
      }
    }else guestCutsceneSeen='';
    hud();syncUI();
  }
  // O líder apenas mantém uma cópia consistente da missão. TODOS executam tarefas;
  // cada interação dos convidados é aplicada automaticamente sem aprovação manual.
  function onlineCommand(uid,command,p){
    if(!isOnline()||!Online.info().host||command.kind!=='interact')return;
    if(!p||!Number.isFinite(Number(p.x))||!Number.isFinite(Number(p.y)))return;
    if(command.stage!==G.level||command.session!==onlineSession)return;
    if(G.state!=='playing'){
      if(['cutscene','quiz','learn','skill','paused'].includes(G.state)){
        if(G.coopQueue.length<30)G.coopQueue.push({uid,command,p,created:Date.now()});
      }
      return;
    }
    applyCoopCommand(uid,command,p);
  }
  function applyCoopCommand(uid,command,p){
    if(command.stage!==G.level||command.session!==onlineSession||G.state!=='playing')return;
    const name=String(p.name||'Jogador').slice(0,18);
    const before=G.player,oldDirection=G.direction;
    const previousActor=G.coopActor,oldRoom=G.adventure?.room;
    // O servidor recebe coordenadas atualizadas; validamos novamente a proximidade.
    G.player={x:Math.max(25,Math.min(1255,Number(p.x))),y:Math.max(41,Math.min(936,Number(p.y)))};
    G.coopActor={uid,name};
    try{
      if(command.task==='marker'){
        const i=Number(command.index),mark=G.markers[i];
        if(Number.isInteger(i)&&i>=0&&i<G.markers.length&&!mark.done&&near(mark.x,mark.y,130)&&G.adventure?.room==='outdoor'){
          if(level[G.level].type==='escort'&&Math.hypot(G.escort.x-G.player.x,G.escort.y-G.player.y)>205)return;
          if(level[G.level].type==='feed')G.adventure.feedCooldown=G.missionSeconds+2;
          concludeMarker(mark,level[G.level].type==='feed'?60:80);
        }
      } else if(command.task==='sea-signal'){
        if(G.level===6&&G.adventure.seaOpened&&!G.adventure.seaMarked){
          G.adventure.seaMarked=true;G.stageLimit+=40;G.points+=100;
          celebrateCoop('sinalizou a travessia do mar');hud();
        }
      } else if(command.task==='horn-success'||command.task==='horn-fail'){
        if(G.level===8&&G.coopHorn?.id===command.hornId&&G.coopHorn.uid===uid){
          const last=G.coopHorn.final;G.coopHorn=null;
          if(command.task==='horn-success'){
            celebrateCoop('tocou a trombeta');
            if(last)playCinematic('jericho',{kicker:'JOSUÉ 6:20',title:'AS MURALHAS CAÍRAM',caption:'Os sacerdotes tocaram, o povo gritou e a muralha caiu.',duration:7,onEnd:stageDone});
          }else{G.laps=Math.max(0,G.laps-1);G.lapProgress=0;toast('Ritmo perdido: refaçam esta volta.',3)}
          hud();
        }
      } else if(command.task==='world'){
        // O mesmo botão AÇÃO funciona para Noé, entrada dos animais e Moisés.
        // O anfitrião não precisa clicar nada para o pedido do convidado funcionar.
        if((p.room||'outdoor')!==oldRoom)return;
        interact();
      }
    } finally {
      G.coopActor=previousActor;G.direction=oldDirection;
      G.player=oldRoom===G.adventure?.room?before:(G.adventure?.room==='inside'?{x:640,y:776}:{x:640,y:568});
      if(isOnline()&&Online.info().host)void Online.snapshot(onlineStateData(),true);
    }
  }
  function drainCoopQueue(){
    if(!isOnline()||!Online.info().host||G.state!=='playing'||!G.coopQueue.length)return;
    const queue=G.coopQueue.splice(0);
    for(let i=0;i<queue.length;i++){
      const job=queue[i];if(G.state!=='playing'){G.coopQueue.unshift(...queue.slice(i));break}
      if(Date.now()-job.created<125000)applyCoopCommand(job.uid,job.command,job.p);
    }
  }
  function onlineHooks(){return {
    onPlayers:updateOnlinePlayers,onState:onlineApplyState,onCommand:onlineCommand,
    onProfile:profile=>{if(profile&&Number.isInteger(profile.unlocked)){G.unlocked=Math.max(G.unlocked,profile.unlocked);saveUnlock(G.unlocked)}},
    onStatus:status=>{if(status==='playing'&&!Online.info().host){$('onlineHint').textContent='O líder começou. Carregando a aventura...';$('onlineStart').hidden=true}},
    onLost:reason=>{$('onlineOverlay').hidden=true;G.remotePlayers=[];guestWaiting=false;guestCutsceneSeen='';$('primaryBtn').disabled=false;home();toast(reason,6)},
    onError:msg=>{if(!$('onlineOverlay').hidden)$('onlineError').textContent=msg;else toast('Conexão online: '+msg,5)}
  }}
  function onlineLobby(){
    const info=Online.info();$('onlineSetup').hidden=true;$('onlineLobby').hidden=false;
    $('onlineRoomCode').textContent=info.room;$('onlineError').textContent='';
    $('onlineDescription').textContent=info.host?'Você criou a sala. Todos poderão realizar tarefas; você só inicia os capítulos.':'Você entrou! Poderá cumprir missões e desafios como todos os outros.';
    $('onlineHint').textContent=info.host?'Convide os amigos! Cada pessoa pode concluir objetivos e contribuir com o grupo.':'Prepare-se: Ação, perguntas e desafios funcionam para você também.';
    $('onlineStart').hidden=!info.host;$('onlineStart').disabled=false;
    updateOnlinePlayers(info.players,info.uid);
  }
  function openOnline(){
    if(G.state!=='menu')home();
    $('mainOverlay').hidden=true;$('onlineOverlay').hidden=false;
    $('onlineSetup').hidden=isOnline();$('onlineLobby').hidden=!isOnline();
    $('onlineCreate').disabled=false;$('onlineJoin').disabled=false;
    $('onlineError').textContent=Online.configured()?'':'É necessário preencher firebase-config.js no site antes de usar o online.';
    if(isOnline())onlineLobby();
  }
  function guestMovement(dt){
    if(G.state==='quiz'){
      G.quizRemaining=Math.max(0,G.quizRemaining-dt);const s=Math.ceil(G.quizRemaining);
      $('quizClock').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
      $('quizBarFill').style.width=(G.quizRemaining/G.quizLimit*100)+'%';
      if(G.quizRemaining<=0)answerQuiz(false);return;
    }
    // Defesa adicional: mesmo com uma sincronização incompleta, o convidado não
    // fica preso atrás da cutscene.
    if(G.state==='onlineScene')G.state='playing';
    if(!$('cinematicOverlay').hidden)$('cinematicOverlay').hidden=true;
    if(G.state!=='playing')return;
    G.animTime+=dt*1000;guestQuizClock+=dt;
    if(guestQuizClock>=60){guestQuizClock=0;launchQuiz();return}
    let x=G.stick.x+(G.keys.right?1:0)-(G.keys.left?1:0),y=G.stick.y+(G.keys.down?1:0)-(G.keys.up?1:0);
    const len=Math.hypot(x,y);if(len>1){x/=len;y/=len}
    if(len>.12){const speed=(G.run||G.keys.shift)?330:197;
      const collision=Physics.move(G.player.x,G.player.y,x*speed*dt,y*speed*dt,G);
      G.player.x=collision.x;G.player.y=collision.y;G.walkMs+=dt*1000;
      G.pose=Math.floor(G.walkMs/175)%2;
      G.direction=Math.abs(x)>Math.abs(y)?(x>0?'right':'left'):(y>0?'down':'up');
    }else G.pose=0;
    const target=G.getTarget();$('interactionHint').hidden=!(target&&near(target.x,target.y,95));
  }
  function syncUI(){
    window.RPGMusic?.setScene(G.state,G.level);
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
    $('skinSection').hidden=!showSkins;$('difficultyPrefs').hidden=!showSkins;
    $('instructionsSection').hidden=!showInstructions;
    $('levelPickerBtn').hidden=!allowStages;
    $('onlineOpenBtn').hidden=!showSkins;
    $('mainMenuBtn').hidden=!canHome;
    $('levelPicker').hidden=true;
    $('levelPickerBtn').textContent='Escolher fase';
    syncUI();
  }
  function home(){
    window.RPGMusic?.setScene('menu');
    if(isOnline()){void Online.leave();G.remotePlayers=[];guestWaiting=false;$('onlineOverlay').hidden=true;}
    $('primaryBtn').disabled=false;guestSession=0;guestWaiting=false;guestCutsceneSeen='';
    stopInput();G.cinematic=null;G.skill=null;$('cinematicOverlay').hidden=true;$('aimOverlay').hidden=true;$('learnOverlay').hidden=true;G.state='menu';G.level=G.selectedStage;G.hearts=G.modeHard?2:3;
    showPanel({title:'Heróis da Fé',description:'20 histórias bíblicas com desafios de estratégia, agilidade, perguntas e missões em pixel art. Errar pode fazer você perder.',reference:'Antigo Testamento · Jesus · Atos dos Apóstolos',button:'COMEÇAR AVENTURA',showSkins:true,showInstructions:true,allowStages:true});
    hud();showRecords();
  }
  function startStage(stageIndex=G.level){
    window.RPGMusic?.begin();
    stopInput();G.level=Math.max(0,Math.min(19,stageIndex));G.hearts=G.modeHard?2:3;makeWorld();
    G.state='playing';$('mainOverlay').hidden=true;$('quizOverlay').hidden=true;$('cinematicOverlay').hidden=true;$('aimOverlay').hidden=true;$('learnOverlay').hidden=true;$('statusToast').hidden=true;
    hud();syncUI();
    if(isOnline()&&Online.info().host){onlineSession++;G.coopQueue=[];void Online.snapshot(onlineStateData(),true)}
    toast(G.level===8?'Jericó: os seis primeiros dias aparecem na cena. Você joga as sete voltas do sétimo dia.':G.level===1?'Os animais vêm por conta própria. Cada entrada leva tempo e você organizará os compartimentos.':level[G.level].mission,6);if(G.level===8)playCinematic('introJericho',{title:'OS SEIS PRIMEIROS DIAS',kicker:'JOSUÉ 6:12–14',caption:'O povo marchou uma volta por dia. Agora chegou o sétimo dia: serão sete voltas.',duration:5,onEnd:()=>{G.lapClock=G.missionSeconds}});
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
  function recordMedal(stage,grade){try{const data=JSON.parse(localStorage.getItem(scoreKey)||'{}');if(!data[stage]||grade>data[stage]){data[stage]=grade;localStorage.setItem(scoreKey,JSON.stringify(data))}}catch{}}
  function showRecords(){try{const data=JSON.parse(localStorage.getItem(scoreKey)||'{}');let gold=Object.values(data).filter(x=>x===3).length;let cleared=Object.keys(data).length;$('recordText').textContent=`Progresso local: ${cleared}/20 fases com medalha · ${gold} ouro`;}catch{$('recordText').textContent='O progresso é salvo neste navegador.'}}
  function loseHeart(reason){if(['gameover','finished','menu'].includes(G.state))return;G.hearts=Math.max(0,G.hearts-1);G.penalties++;hud();if(G.hearts===0){G.state='gameover';stopInput();G.skill=null;$('aimOverlay').hidden=true;$('quizOverlay').hidden=true;$('learnOverlay').hidden=true;$('cinematicOverlay').hidden=true;showPanel({title:'GAME OVER',description:`${reason} · Você chegou à fase ${G.level+1}. Recomece deste capítulo e tente melhorar sua estratégia.`,reference:level[G.level].reference,button:'TENTAR NOVAMENTE',canHome:true});return}toast(`${reason} · −1 coração (${G.hearts} restantes)`,4)}
  function showLearning(title,explanation,reference,onEnd){G.state='learn';stopInput();$('learnOverlay').hidden=false;$('learnTitle').textContent=title;$('learnExplanation').textContent=explanation;$('learnReference').textContent=reference;$('learnContinue').onclick=()=>{$('learnOverlay').hidden=true;if(G.state!=='learn')return;G.state='playing';syncUI();if(onEnd)onEnd()};syncUI()}
  function questionForStage(){const group=D.stageChallenges?.[G.level];return group?.[G.complete]||null}
  function shuffle(items){
    for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]]}
    return items;
  }
  function pickPeriodicQuestion(){
    const extras=D.extraQuestions?.[G.level]||[];
    const scripted=D.stageChallenges?.[G.level]||[];
    const candidates=[D.questions[G.level],...extras,...scripted];
    if(!G.questionDeck.length){
      G.questionDeck=shuffle(candidates.map((_,i)=>i));
      if(candidates[G.questionDeck[0]]?.[0]===G.lastQuestionText && G.questionDeck.length>1){
        const first=G.questionDeck.shift();G.questionDeck.push(first);
      }
    }
    const q=candidates[G.questionDeck.shift()];G.lastQuestionText=q[0];return q;
  }
  function randomizeOptions(q){
    const indices=shuffle(q[1].map((_,i)=>i));
    return [q[0],indices.map(i=>q[1][i]),indices.indexOf(q[2]),q[3]];
  }
  function askQuestion(q,success,limit=40){if(G.state!=='playing')return;
    q=randomizeOptions(q);
    stopInput();G.state='quiz';G.quizRemaining=limit;G.quizLimit=limit;G.quizPayload={q,success};$('quizQuestion').textContent=q[0];const target=$('quizAnswers');target.replaceChildren();q[1].forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.textContent=String.fromCharCode(65+i)+') '+t;b.onclick=()=>answerQuiz(i===q[2]);target.appendChild(b)});$('quizOverlay').hidden=false;const sec=Math.ceil(limit);$('quizClock').textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');$('quizBarFill').style.width='100%';syncUI()
  }
  function concludeMarker(mark,points=70){if(mark.done)return;mark.done=true;G.complete=isOnline()?G.markers.filter(m=>m.done).length:G.complete+1;G.points+=points;celebrateCoop('concluiu '+mark.label);hud();if(G.complete>=level[G.level].count){const stage=level[G.level];if(stage.type==='story')playCinematic('scene',{title:'UMA HISTÓRIA DE AMOR',kicker:'LUCAS 22–23',caption:'A cruz faz parte da história que aponta para a ressurreição.',duration:6,onEnd:stageDone});else if(stage.type==='shipwreck')playCinematic('storm',{title:'TODOS CHEGARAM À TERRA',kicker:'ATOS 27:44',caption:'Mesmo depois do naufrágio, todos chegaram vivos à terra.',duration:5.6,onEnd:stageDone});else if(stage.type==='rhythm')playCinematic('scene',{title:'PORTAS ABERTAS',kicker:'ATOS 16:25–34',caption:'O terremoto aconteceu, e o carcereiro ouviu a mensagem.',duration:5.3,onEnd:stageDone});else if(stage.type==='storm')playCinematic('storm',{title:'SILÊNCIO! AQUIETAI-VOS!',kicker:'MARCOS 4:39',caption:'Jesus repreendeu o vento e o mar, e tudo se acalmou.',duration:6,onEnd:stageDone});else if(stage.type==='feed')playCinematic('bread',{kicker:'JOÃO 6:11–13',title:'TODOS FICARAM SATISFEITOS',caption:'Jesus multiplicou os pães e os peixes para a multidão.',duration:5,onEnd:stageDone});else stageDone()}else toast('Etapa concluída! Siga o próximo marco.',2.8)}
  function startSkill(purpose,goal,onFinish,{title='Desafio de precisão',hint='Acompanhe o sinal em movimento e alinhe a mira.',secs=25,fail}={}){
    stopInput();G.state='skill';G.skill={purpose,goal,index:0,time:secs,initial:secs,miss:0,retX:.5,retY:.5,phase:0,fail,title,hint};$('aimOverlay').hidden=false;$('aimTitle').textContent=title;$('aimDescription').textContent=hint;$('aimKicker').textContent=level[G.level].reference;$('aimLearning').hidden=true;drawSkill();syncUI()
  }
  function skillTarget(){const sk=G.skill;if(!sk)return {x:.5,y:.5};const v=sk.phase+sk.index*1.77;return {x:.5+Math.sin(v*1.45)*(.28+(G.modeHard?.07:0)),y:.5+Math.cos(v*1.21)*(.26+(G.modeHard?.04:0))}}
  function drawSkill(){const sk=G.skill;if(!sk)return;const target=skillTarget();$('aimTarget').style.left=(target.x*100)+'%';$('aimTarget').style.top=(target.y*100)+'%';$('aimReticle').style.left=(sk.retX*100)+'%';$('aimReticle').style.top=(sk.retY*100)+'%';$('aimCount').textContent=`ALVO ${sk.index+1} DE ${sk.goal}`;$('aimTime').textContent=`${Math.ceil(sk.time)}s`;$('aimErrors').textContent=`ERROS ${sk.miss}/3`;}
  function failSkill(){const sk=G.skill;if(!sk)return;const onFail=sk.fail;G.skill=null;$('aimOverlay').hidden=true;G.state='playing';loseHeart('Desafio de habilidade não concluído');if(typeof onFail==='function')onFail();if(G.state==='gameover')return;syncUI()}
  function fireSkill(){const sk=G.skill;if(G.state!=='skill'||!sk)return;const p=skillTarget(),distance=Math.hypot((p.x-sk.retX)*1.3,p.y-sk.retY);const radius=G.modeHard?.09:.145;if(distance>radius){sk.miss++;if(sk.miss>=3)failSkill();else{toast('A mira passou longe! Tente antecipar o movimento.');drawSkill()}return}sk.index++;G.points+=40;if(sk.index>=sk.goal){const purpose=sk.purpose;G.skill=null;$('aimOverlay').hidden=true;G.state='playing';syncUI();G.points+=80;purpose();}else{sk.phase+=.7;sk.time+=5;sk.retX=.5;sk.retY=.5;toast('Alvo acertado! Continue.',1.5);drawSkill()}}
  function interactArk(){
    const a=G.adventure;
    if(a.room==='outdoor'){
      if(near(640,492,110)){transitionInside();celebrateCoop('abriu a entrada da arca');toast('Você entrou na arca. Leve os mantimentos até os depósitos!');}
      else toast('Caminhe até a porta central da arca para entrar.');
      return;
    }
    if(near(640,847,90)){transitionOutside();toast('Você saiu da arca.');return}
    if(isOnline()){
      a.carriers ||= {};
      const actor=currentActor();let assigned=a.carriers[actor.uid];
      if(assigned!==undefined&&assigned!==null){
        const stall=a.stalls[assigned];
        if(stall?.done){delete a.carriers[actor.uid];return}
        if(stall&&near(stall.x,stall.y,98)){
          stall.done=true;delete a.carriers[actor.uid];G.complete++;G.points+=85;
          celebrateCoop('entregou '+stall.label.toLowerCase()+' ao depósito');hud();
          if(G.complete>=3)playCinematic('arkFinish',{title:'A ARCA ESTÁ PREPARADA',kicker:'GÊNESIS 6:21',caption:'Os mantimentos estão organizados para a viagem.',duration:3.8,onEnd:stageDone});
        }else toast('Leve as provisões ao depósito '+(stall?.label||'indicado')+'.');
        return;
      }
      if(near(a.cargo.x,a.cargo.y,90)){
        const occupied=new Set(Object.values(a.carriers));
        const free=a.stalls.findIndex((item,i)=>!item.done&&!occupied.has(i));
        if(free<0){toast('Todos os depósitos já têm alguém responsável. Ajude nas outras tarefas!');return}
        a.carriers[actor.uid]=free;toast('Você pegou '+a.stalls[free].label.toLowerCase()+'. Leve ao depósito.',3);
      }else toast('Aproxime-se das provisões no centro da arca.');
      return;
    }
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
        if(!isOnline()&&a.penCooldown>G.missionSeconds){toast(`Espere ${Math.ceil(a.penCooldown-G.missionSeconds)}s antes de organizar o próximo espaço.`);return}
        pen.done=true;a.pensDone++;a.penCooldown=G.missionSeconds+4;G.points+=75;celebrateCoop('organizou o espaço das '+pen.label.toLowerCase());toast(`Compartimento das ${pen.label.toLowerCase()} organizado!`);hud();
        if(a.pensDone===4)playCinematic('animalFinish',{title:'TODOS ESTÃO A BORDO',kicker:'GÊNESIS 7:8–9',caption:'Os animais chegaram a Noé e foram recebidos na arca.',duration:4.4,onEnd:stageDone});
      }else toast('Vá até um compartimento ainda vazio para organizar os animais.');
      return;
    }
    if(G.complete===4){
      if(near(640,492,110)){transitionInside();celebrateCoop('abriu os compartimentos');toast('Distribua cada grupo em seu compartimento.',3)}
      else toast('Agora aproxime-se da porta e entre na arca.');
      return;
    }
    const group=G.animals[a.boardingIndex];
    if(!group)return;
    if(group.boarding){toast('Observe os animais entrando na arca. Não é possível pular essa animação.');return}
    if(a.nextReadyAt>G.missionSeconds){toast(`O próximo grupo chega em ${Math.ceil(a.nextReadyAt-G.missionSeconds)} segundos.`);return}
    if(!group.ready){toast('Os animais estão vindo por conta própria. Vá ao encontro deles.');return}
    if(!near(group.x,group.y,106)){toast('Aproxime-se do grupo para liberar sua entrada.');return}
    group.boarding=true;group.boardTime=0;group.boardX=group.x;group.boardY=group.y;celebrateCoop('recebeu '+group.label.toLowerCase());
    toast(`Você abriu a passagem! Observe ${group.label.toLowerCase()} caminhando até a arca.`,4);
    hud();
  }
  function interactSea(){
    const a=G.adventure;
    if(!a.seaOpened){
      if(!near(640,635,112)){toast('Aproxime-se de Moisés, na margem do mar.');return}
      celebrateCoop('encontrou Moisés');playCinematic('sea',{kicker:'ÊXODO 14:21–22',title:'O MAR VERMELHO SE ABRE',caption:'Um forte vento soprou, as águas se dividiram e surgiu terra seca.',duration:7,onEnd:()=>{a.seaOpened=true;a.seaProgress=1;toast('As águas se abriram! Sinalize a passagem para as famílias.',5);hud()}});
    }else if(!a.seaMarked){startSkill(()=>{a.seaMarked=true;G.stageLimit+=40;G.points+=100;celebrateCoop('sinalizou a travessia do mar');toast('Passagem sinalizada! Atravesse com o povo pela terra seca.',5);hud()},3,{title:'Sinalize a travessia',hint:'Acerte 3 pontos seguros em movimento. Deus abriu o mar; este é um desafio de orientação.',secs:G.modeHard?24:35});}else toast('Acompanhe as famílias pelo caminho seco e chegue à outra margem.');
  }
  function interactStorm(){
    const a=G.adventure;
    if(!near(640,535,115)){toast('Aproxime-se do barco para embarcar.');return}
    if(a.stormCleared)return;
    playCinematic('storm',{kicker:'MARCOS 4:35–41',title:'SILÊNCIO! AQUIETAI-VOS!',caption:'O vento sopra, as ondas crescem... e então acontece a calmaria.',duration:8,onEnd:()=>{a.stormCleared=true;stageDone()}});
  }
  function stageDone(){
    G.state='stageComplete';stopInput();G.points+=250;const medal=G.penalties===0?3:G.penalties<=2?2:1;recordMedal(G.level,medal);showRecords();
    const done=G.level,final=done===19;
    G.unlocked=Math.max(G.unlocked,Math.min(19,done+1));saveUnlock(G.unlocked);
    if(isOnline()&&Online.info().host)void Online.saveProgress(G.unlocked,G.points);
    if(final){G.state='finished';showPanel({title:'Jornada concluída!',description:`Você percorreu os 20 episódios. Pontuação: ${G.points}. Esta aventura usa atividades lúdicas inspiradas nas passagens bíblicas.`,reference:'Do Gênesis até Atos',button:'JOGAR NOVAMENTE',canHome:true});}
    else {G.level=done+1;const next=level[G.level];showPanel({title:'Fase concluída!',description:`Medalha ${['','BRONZE','PRATA','OURO'][medal]}! Próxima aventura: ${next.title}. ${next.story}`,reference:next.reference,button:`CONTINUAR · FASE ${done+2}`,canHome:true})}
    hud();
    if(isOnline()&&Online.info().host)void Online.snapshot(onlineStateData(),true);
  }
  function interact(){
    if(G.state!=='playing')return;
    if(isGuest()){guestInteract();return;}
    const lvl=level[G.level];
    if(lvl.type==='ark'){interactArk();return}
    if(lvl.type==='arrive'){interactAnimals();return}
    if(lvl.type==='sea'){interactSea();return}
    if(lvl.type==='storm'&&G.complete>=lvl.count){interactStorm();return}
    if(lvl.type==='laps'){toast('Siga a trilha marcada. Ao concluir certas voltas, acerte o ritmo das trombetas.');return}
    if(!isOnline()&&lvl.type==='feed' && G.missionSeconds<G.adventure.feedCooldown){toast(`Próxima entrega em ${Math.ceil(G.adventure.feedCooldown-G.missionSeconds)}s.`);return}
    const mark=(isOnline()?selectedMarker():(lvl.type==='feed'?G.markers.find(m=>!m.done&&near(m.x,m.y,85)):G.markers[G.complete]));
    if(!mark||mark.done||!near(mark.x,mark.y,90)){toast('Aproxime-se do próximo marco brilhante.');return}
    const idx=isOnline()?G.markers.indexOf(mark):G.complete;
    const custom=isOnline()?D.stageChallenges?.[G.level]?.[idx]:questionForStage();
    if(['knowledge','granary','story'].includes(lvl.type)){
      const q=custom||[D.questions[G.level][0],D.questions[G.level][1],D.questions[G.level][2],D.questions[G.level][3]];
      askQuestion(q,()=>concludeMarker(mark),G.modeHard?26:40);return
    }
    if(['fishing','rhythm','shipwreck','storm'].includes(lvl.type)){
      const info=SKILL_INFOS[lvl.type];
      startSkill(()=>concludeMarker(mark),G.modeHard?3:2,{title:info[0],hint:info[1],secs:G.modeHard?20:28});return
    }
    if(lvl.type==='feed')G.adventure.feedCooldown=G.missionSeconds+5;
    if(lvl.type==='escort' && Math.hypot(G.escort.x-G.player.x,G.escort.y-G.player.y)>155){toast('Espere as famílias chegarem! Não deixe o povo para trás.');return}
    if(['route','investigate','escort'].includes(lvl.type) && (idx%2===1)){
      const q=D.questions[G.level];askQuestion([q[0],q[1],q[2],q[3]],()=>concludeMarker(mark),G.modeHard?25:38);return
    }
    if(lvl.type==='feed')toast('Alimento distribuído! Vá ao próximo grupo.',2.5);
    concludeMarker(mark,lvl.type==='feed'?60:80);
  }

  // Jericó: o percurso é a trilha marcada pelas oito estacas, não a parede do edifício.
  // Trilha com ampla tolerância para joysticks e telas pequenas. Só conta movimento
  // angular contínuo no mesmo sentido: ficar andando para frente e para trás não pontua.
  function coopLapCompleted(uid){
    G.laps++;G.lapProgress=0;G.points+=65;
    const actor=Online.info().players?.[uid]||{};
    const prev=G.coopActor;G.coopActor={uid,name:actor.name||(uid===Online.info().uid?Online.info().name:'Jogador')};
    celebrateCoop('completou uma volta em Jericó ('+G.laps+'/7)');G.coopActor=prev;
    toast('A equipe concluiu '+G.laps+'/7 voltas!',3);hud();
    if([2,4,6,7].includes(G.laps)){
      const final=G.laps===7;
      if(uid===Online.info().uid){
        startSkill(()=>{celebrateCoop('tocou a trombeta');if(final)playCinematic('jericho',{kicker:'JOSUÉ 6:20',title:'AS MURALHAS CAÍRAM',caption:'Os sacerdotes tocaram, o povo gritou e a muralha caiu.',duration:7,onEnd:stageDone});else toast('Toque das trombetas concluído!',3)},final?3:2,
          {title:final?'O TOQUE FINAL DAS TROMBETAS':'O TOQUE DAS TROMBETAS',hint:'Acerte o ritmo dos sacerdotes diante da arca.',secs:G.modeHard?19:29,fail:()=>{G.laps=Math.max(0,G.laps-1);hud()}});
      }else{
        G.coopHorn={id:Date.now()+'-'+Math.random().toString(36).slice(2,6),uid,final,created:Date.now()};
        toast('O jogador que fechou a volta fará o toque da trombeta!',3);
        void Online.snapshot(onlineStateData(),true);
      }
    }else if(G.laps>=7){playCinematic('jericho',{kicker:'JOSUÉ 6:20',title:'AS MURALHAS CAÍRAM',caption:'O povo gritou e a muralha caiu. A vitória veio do Senhor.',duration:7,onEnd:stageDone})}
  }
  function checkLaps(dx,dy,actor=G.player,uid=null){
    if(G.level!==8||G.state!=='playing')return;
    if(isOnline()&&Online.info().host){
      if(G.coopHorn)return;
      uid ||= Online.info().uid;
      const t=G.coopLaps[uid]||{angle:null,progress:0,direction:0};G.coopLaps[uid]=t;
      const x=actor.x-640,y=actor.y-433,rad=Math.hypot(x,y);
      if(rad<205||rad>500||Math.abs(dx)+Math.abs(dy)<.05){t.angle=null;return}
      const a=Math.atan2(y,x);
      if(t.angle!==null){
        let delta=a-t.angle;while(delta>Math.PI)delta-=PI2;while(delta< -Math.PI)delta+=PI2;
        if(Math.abs(delta)<.28){
          if(!t.direction&&Math.abs(delta)>.003)t.direction=Math.sign(delta);
          t.progress=Math.max(0,t.progress+delta*t.direction);
          G.lapProgress=Math.max(G.lapProgress,t.progress);
          if(t.progress>=PI2-.07){t.progress=0;t.direction=0;t.angle=a;coopLapCompleted(uid);return}
        }
      }
      t.angle=a;return;
    }
    // Sozinho: mantém o sistema original de progresso contínuo.
    const x=G.player.x-640,y=G.player.y-433,rad=Math.hypot(x,y);
    if(rad<205||rad>500||Math.abs(dx)+Math.abs(dy)<.05){G.lapAngle=null;return}
    const a=Math.atan2(y,x);
    if(G.lapAngle!==null){
      let change=a-G.lapAngle;
      while(change>Math.PI)change-=PI2;while(change< -Math.PI)change+=PI2;
      if(Math.abs(change)<.28){
        if(!G.lapDirection&&Math.abs(change)>.003)G.lapDirection=Math.sign(change);
        const previousBucket=Math.floor(G.lapProgress/PI2*20);
        G.lapProgress=Math.max(0,G.lapProgress+change*G.lapDirection);
        if(G.lapProgress>=PI2-.07){
          G.lapProgress=0;G.lapDirection=0;G.laps++;G.points+=65;
          toast(`Volta ${G.laps} de 7 no sétimo dia. Continue junto à procissão!`,4);hud();
          if([2,4,6,7].includes(G.laps)){const isLast=G.laps===7;startSkill(()=>{if(isLast)playCinematic('jericho',{kicker:'JOSUÉ 6:20',title:'AS MURALHAS CAÍRAM',caption:'Os sacerdotes tocaram, o povo gritou e a muralha caiu.',duration:7,onEnd:stageDone});else toast('Toque das trombetas concluído! Continue a marcha.',3)},isLast?3:2,{title:isLast?'O TOQUE FINAL DAS TROMBETAS':'O TOQUE DAS TROMBETAS',hint:'Acerte o ritmo dos sacerdotes que caminhavam diante da Arca da Aliança.',secs:G.modeHard?19:29,fail:()=>{G.laps=Math.max(0,G.laps-1);G.lapProgress=0;hud()}});return}
          if(G.laps>=7){playCinematic('jericho',{kicker:'JOSUÉ 6:20',title:'AS MURALHAS CAÍRAM',caption:'O povo gritou e a muralha caiu. A vitória veio do Senhor.',duration:7,onEnd:stageDone});return}
        }else if(previousBucket!==Math.floor(G.lapProgress/PI2*20))hud();
      }
    }
    G.lapAngle=a;
  }
  function launchQuiz(){if(G.state!=='playing')return;const q=pickPeriodicQuestion();askQuestion(q,()=>{G.points+=100;},60)}
  function answerQuiz(correct){if(G.state!=='quiz')return;const payload=G.quizPayload||{};const q=payload.q||D.questions[G.level];$('quizOverlay').hidden=true;G.nextQuestion=G.missionSeconds+60;G.quizPayload=null;G.state='playing';if(!correct){loseHeart('Resposta errada ou tempo esgotado');if(G.state==='gameover')return}const explanation=q[3]||level[G.level].story;showLearning(correct?'Resposta correta!':'Aprenda com esta resposta',explanation,level[G.level].reference,correct?payload.success:null)}
  function update(dt){
    if(isGuest()){guestMovement(dt);return;}
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
    if(G.state==='skill'){const sk=G.skill;if(sk){sk.time-=dt;sk.phase+=dt*(G.modeHard?2.2:1.6);drawSkill();if(sk.time<=0)failSkill();}return}
    if(G.state==='quiz'){
      G.quizRemaining=Math.max(0,G.quizRemaining-dt);
      const s=Math.ceil(G.quizRemaining);
      $('quizClock').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
      $('quizBarFill').style.width=(G.quizRemaining/G.quizLimit*100)+'%';
      if(G.quizRemaining<=0)answerQuiz(false);
      return;
    }
    if(G.state!=='playing')return;
    drainCoopQueue();
    if(G.coopHorn&&Date.now()-G.coopHorn.created>55000){G.coopHorn=null;G.laps=Math.max(0,G.laps-1);G.lapProgress=0;toast('Toque não concluído: repitam a volta.',4)}
    G.animTime+=dt*1000;G.missionSeconds+=dt;
    if(G.missionSeconds>G.stageLimit){G.stageLimit=G.missionSeconds+(G.modeHard?90:120);loseHeart('Tempo limite da missão esgotado');if(G.state==='gameover')return;}
    if(Math.floor(G.missionSeconds)%2===0 && Math.floor(G.missionSeconds)!==Math.floor(G.missionSeconds-dt))hud();
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
    if(lvl.type==='escort'){
      const guide=isOnline()&&Online.info().host?[G.player,...G.remotePlayers.filter(p=>p.room==='outdoor')].sort((a,b)=>Math.hypot(a.x-G.escort.x,a.y-G.escort.y)-Math.hypot(b.x-G.escort.x,b.y-G.escort.y))[0]:G.player;
      const d=Math.hypot(guide.x-G.escort.x,guide.y-G.escort.y);
      if(d>36){let move=Math.min(d-36,dt*(G.modeHard?164:187));G.escort.x+=(guide.x-G.escort.x)/d*move;G.escort.y+=(guide.y-G.escort.y)/d*move}
      if(d>198){G.escort.far+=dt;if(G.escort.far>(G.modeHard?4:7)){G.escort.far=0;loseHeart('Você se afastou demais das famílias');if(G.state==='gameover')return}}
      else G.escort.far=Math.max(0,G.escort.far-dt*2)
    }
    let x=G.stick.x+(G.keys.right?1:0)-(G.keys.left?1:0);
    let y=G.stick.y+(G.keys.down?1:0)-(G.keys.up?1:0);
    const len=Math.hypot(x,y);
    if(len>1){x/=len;y/=len}
    if(len>.12){
      const speed=(G.run||G.keys.shift)?330:197;
      // Colisões apenas com construções, muralhas e água profunda.
      // O ciclo da caminhada segue mesmo se o personagem pressionar a parede.
      const collision=Physics.move(G.player.x,G.player.y,x*speed*dt,y*speed*dt,G);
      G.player.x=collision.x;G.player.y=collision.y;
      // Paredes, muralhas e água bloqueiam o movimento sem interromper a animação
      // e sem mostrar notificações repetidas por colisão.
      G.walkMs+=dt*1000;G.pose=(Math.floor(G.walkMs/175)%2);
      G.direction=Math.abs(x)>Math.abs(y)?(x>0?'right':'left'):(y>0?'down':'up');
      checkLaps(x,y);
      if(lvl.type==='sea'&&adv.seaOpened&&adv.seaMarked&&G.player.y<130){G.complete=3;hud();playCinematic('crossing',{title:'A TRAVESSIA FOI CONCLUÍDA',kicker:'ÊXODO 14:29',caption:'O povo passou pelo mar em terra seca.',duration:3.5,onEnd:stageDone});return}
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
    if(isOnline() && Online.info().status==='playing'){
      void Online.position({x:G.player.x,y:G.player.y,dir:G.direction,pose:G.pose,room:G.adventure?.room||'outdoor'});
      if(Online.info().host)void Online.snapshot(onlineStateData());
    }
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
  window.addEventListener('keydown',e=>{if(G.state==='skill'){if(e.code==='Space'||e.key==='Enter'){fireSkill();e.preventDefault();return}if(G.skill&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){const sk=G.skill;sk.retX=Math.max(.06,Math.min(.94,sk.retX+(e.key==='ArrowLeft'?-.045:e.key==='ArrowRight'?.045:0)));sk.retY=Math.max(.06,Math.min(.94,sk.retY+(e.key==='ArrowUp'?-.045:e.key==='ArrowDown'?.045:0)));drawSkill();e.preventDefault();return}}
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
  $('skipCutscene').onclick=()=>{if(isGuest())return;if(G.state==='cutscene')finishCinematic()};
  $('dismissRotation').onclick=()=>{rotationDismissed=true;$('rotationTip').hidden=true};
  $('fullscreenBtn').onclick=()=>{void tryLandscapeFullscreen()};
  const leaveFullscreen=()=>{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})};
  $('panelFullscreenExit').onclick=leaveFullscreen;
  $('quizFullscreenExit').onclick=leaveFullscreen;
  $('quizQuit').onclick=()=>{leaveFullscreen();home()};$('aimExit').onclick=()=>{leaveFullscreen();home()};
  $('pauseBtn').onclick=()=>{if(G.state==='playing')paused();else if(G.state==='paused')resumed()};
  $('exitBtn').onclick=()=>{if(document.fullscreenElement){document.exitFullscreen().catch(()=>{})}if(G.state==='playing'||G.state==='paused'||G.state==='quiz'||G.state==='cutscene'){G.cinematic=null;$('cinematicOverlay').hidden=true;paused();G.state='paused';showPanel({title:'Sair da aventura?',description:'A fase atual está pausada. Você pode retomá-la ou voltar ao início.',reference:level[G.level].reference,button:'RETOMAR AVENTURA',canHome:true})}else home()};
  $('onlineOpenBtn').onclick=openOnline;
  const onlineNick=()=>$('onlineNick').value.trim().slice(0,18)||'Jogador';
  function onlineBusy(isBusy){$('onlineCreate').disabled=isBusy;$('onlineJoin').disabled=isBusy;
    $('onlineCreate').textContent=isBusy?'CONECTANDO...':'CRIAR SALA';}
  $('onlineCreate').onclick=async()=>{
    onlineBusy(true);$('onlineError').textContent='';
    try{await Online.create(onlineNick(),G.skin,onlineHooks());onlineLobby()}
    catch(e){$('onlineError').textContent=e.message}
    finally{onlineBusy(false)}
  };
  $('onlineJoin').onclick=async()=>{
    onlineBusy(true);$('onlineError').textContent='';
    try{await Online.join($('onlineCode').value,onlineNick(),G.skin,onlineHooks());onlineLobby()}
    catch(e){$('onlineError').textContent=e.message}
    finally{onlineBusy(false)}
  };
  $('onlineCopy').onclick=async()=>{
    const code=Online.info().room;
    try{await navigator.clipboard.writeText(code);$('onlineHint').textContent='Código '+code+' copiado! Envie aos seus amigos.'}
    catch{$('onlineHint').textContent='Compartilhe este código: '+code}
  };
  $('onlineStart').onclick=async()=>{
    window.RPGMusic?.begin();
    $('onlineError').textContent='';$('onlineStart').disabled=true;
    try{await Online.start();$('onlineOverlay').hidden=true;
      G.points=0;G.level=G.selectedStage;startStage();
      if(mobile)void tryLandscapeFullscreen();}
    catch(e){$('onlineError').textContent=e.message;$('onlineStart').disabled=false}
  };
  $('onlineBack').onclick=()=>{if(isOnline())void Online.leave();G.remotePlayers=[];$('onlineOverlay').hidden=true;home()};
  $('mainMenuBtn').onclick=home;
  $('challengeMode').onchange=e=>{G.modeHard=e.target.checked;G.hearts=G.modeHard?2:3;hud()};
  $('aimFire').onclick=fireSkill;
  const aimBoard=$('aimBoard');const aimFromPointer=e=>{if(!G.skill)return;const r=aimBoard.getBoundingClientRect();G.skill.retX=Math.min(.94,Math.max(.06,(e.clientX-r.left)/r.width));G.skill.retY=Math.min(.94,Math.max(.06,(e.clientY-r.top)/r.height));drawSkill()};
  aimBoard.addEventListener('pointerdown',e=>{if(!G.skill)return;e.preventDefault();aimBoard.setPointerCapture(e.pointerId);aimFromPointer(e)});aimBoard.addEventListener('pointermove',e=>{if(G.skill&&e.buttons)aimFromPointer(e)});
  showRecords();
  $('levelPickerBtn').onclick=()=>{if($('levelPicker').hidden)showLevels();else{$('levelPicker').hidden=true;$('levelPickerBtn').textContent='Escolher fase'}};
  $('primaryBtn').onclick=()=>{
    if(['menu','paused','stageComplete','gameover','finished'].includes(G.state))window.RPGMusic?.begin();
    if(G.state==='menu'){
      G.points=0;G.hearts=G.modeHard?2:3;G.level=G.selectedStage;startStage();
      if(mobile)void tryLandscapeFullscreen();
    }
    else if(G.state==='paused')resumed();
    else if(G.state==='stageComplete')startStage(G.level);
    else if(G.state==='gameover')startStage(G.level);
    else if(G.state==='finished'){G.hearts=G.modeHard?2:3;G.points=0;G.selectedStage=0;startStage(0)}
  };
  document.querySelectorAll('.skin-option').forEach(b=>b.addEventListener('click',()=>{
    G.skin=b.dataset.skin;document.querySelectorAll('.skin-option').forEach(o=>o.classList.toggle('active',b===o));
  }));
  for(const b of document.querySelectorAll('.skin-option'))Art.avatar(b.querySelector('canvas'),b.dataset.skin);
  makeWorld();home();resize();requestAnimationFrame(frame);
  // Accessible state for automated smoke tests, no server or network access.
  if(new URLSearchParams(location.search).has('teste'))window.RPGTeste={game:G,startStage,stageDone,launchQuiz,answerQuiz,interact,hud,update,playCinematic,finishCinematic,pickPeriodicQuestion,physics:Physics,onlineStateData,onlineApplyState,onlineCommand,onlineHooks,guestMovement,guestInteract,applyCoopCommand,drainCoopQueue,checkLaps,celebrateCoop};
})();
