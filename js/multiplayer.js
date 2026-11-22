/* Firebase Realtime Database / Authentication. Usado SOMENTE ao clicar em modo online.
   Sala de 2–4 participantes. O anfitrião é autoridade da missão e dos checkpoints.
   Não transmite mensagens pessoais; apelidos são públicos para quem souber o código. */
(() => {
  'use strict';
  const S = { room:'', uid:'', host:false, name:'', skin:'homem', players:{}, status:'', active:false,
    hooks:{}, unsub:[], sdk:null, auth:null, db:null, playerRef:null, roomRef:null, lastPos:0, lastState:0,
    lastCommands:{}, busy:false };
  const CHARS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function roomCode(){const a=new Uint8Array(6);crypto.getRandomValues(a);return Array.from(a,b=>CHARS[b%CHARS.length]).join('')}
  function validConfig(){const c=window.RPG_FIREBASE_CONFIG||{};return !!(c.apiKey&&c.authDomain&&c.databaseURL&&c.projectId&&c.appId&&!Object.values(c).some(x=>String(x).includes('COLE_')||String(x).includes('SEU-PROJETO')))}
  function errorMessage(err){const c=String(err?.code||''),m=String(err?.message||'');if(c.includes('auth/operation-not-allowed'))return 'Ative o provedor Anônimo em Firebase Authentication.';if(c.includes('permission-denied'))return 'O Firebase negou o acesso. Publique as regras do arquivo database.rules.json.';if(c.includes('auth/unauthorized-domain'))return 'Autorize o domínio do GitHub Pages em Firebase Authentication.';if(c.includes('network'))return 'Não foi possível acessar a internet. Confira a conexão.';return m.slice(0,180)||'Erro ao conectar ao Firebase.'}
  async function initialize(){
    if(!validConfig())throw Error('Firebase ainda não configurado. Preencha firebase-config.js antes de criar a sala.');
    if(S.sdk)return;
    const ver='11.10.0',cdn=`https://www.gstatic.com/firebasejs/${ver}`;
    const [app,auth,db]=await Promise.all([import(`${cdn}/firebase-app.js`),import(`${cdn}/firebase-auth.js`),import(`${cdn}/firebase-database.js`)]);
    const firebaseApp=app.getApps().length?app.getApp():app.initializeApp(window.RPG_FIREBASE_CONFIG);
    S.sdk=db;S.auth=auth.getAuth(firebaseApp);S.db=db.getDatabase(firebaseApp,window.RPG_FIREBASE_CONFIG.databaseURL);
    if(!S.auth.currentUser)await auth.signInAnonymously(S.auth);
    S.uid=S.auth.currentUser.uid;
    try{const snap=await db.get(db.ref(S.db,'profiles/'+S.uid));if(snap.exists())S.hooks.onProfile?.(snap.val())}catch{}
  }
  function playerData(name,skin){return {name:String(name).trim().replace(/[<>]/g,'').slice(0,18)||'Jogador',skin:['homem','mulher','menino','menina'].includes(skin)?skin:'homem',x:640,y:755,dir:'down',pose:0,room:'outdoor',updatedAt:Date.now()}}
  const node=(...parts)=>S.sdk.ref(S.db,`rooms/${S.room}/${parts.join('/')}`.replace(/\/$/,''));
  async function attach({isHost}={}){
    S.active=true;S.host=!!isHost;S.lastPos=0;S.lastState=0;S.lastCommands={};
    const db=S.sdk;
    S.unsub.push(db.onValue(node('players'),snap=>{S.players=snap.val()||{};S.hooks.onPlayers?.(S.players,S.uid)}));
    S.unsub.push(db.onValue(node('status'),snap=>{const status=snap.val();if(!status){if(S.active)lost('A sala foi encerrada ou o líder desconectou.');return}S.status=status;S.hooks.onStatus?.(status)}));
    S.unsub.push(db.onValue(node('state'),snap=>{const value=snap.val();if(value&&!S.host)S.hooks.onState?.(value)}));
    if(S.host){
      S.unsub.push(db.onValue(node('commands'),snap=>{
        const commands=snap.val()||{};
        for(const [uid,command] of Object.entries(commands)){
          if(!command||uid===S.uid||!S.players[uid])continue;
          const sequence=Number(command.sequence)||0;
          if(sequence && sequence<= (S.lastCommands[uid]||0))continue;
          S.lastCommands[uid]=sequence;
          S.hooks.onCommand?.(uid,command,S.players[uid]);
          db.remove(node('commands',uid)).catch(()=>{});
        }
      }));
    }
  }
  async function create(name,skin,hooks){
    if(S.active)throw Error('Saia da sala atual antes de criar outra.');
    S.hooks=hooks||{};S.busy=true;
    try{
      await initialize();S.name=playerData(name,skin).name;S.skin=skin;
      const db=S.sdk;
      for(let attempt=0;attempt<6;attempt++){
        S.room=roomCode();
        const room=db.ref(S.db,'rooms/'+S.room);
        const initial={hostUid:S.uid,status:'lobby',createdAt:Date.now(),players:{[S.uid]:playerData(name,skin)}};
        const result=await db.runTransaction(room,existing=>existing?undefined:initial,{applyLocally:false});
        if(!result.committed)continue;
        S.roomRef=room;S.playerRef=db.ref(S.db,'rooms/'+S.room+'/players/'+S.uid);
        await db.onDisconnect(room).remove();
        await attach({isHost:true});
        return S.room;
      }
      throw Error('Não foi possível gerar um código de sala. Tente novamente.');
    }catch(e){S.room='';throw Error(errorMessage(e))}finally{S.busy=false}
  }
  async function join(code,name,skin,hooks){
    if(S.active)throw Error('Saia da sala atual antes de entrar em outra.');
    S.hooks=hooks||{};S.busy=true;
    try{
      await initialize();S.room=String(code).trim().toUpperCase().replace(/\s/g,'');
      if(!/^[A-HJ-NP-Z2-9]{6}$/.test(S.room))throw Error('Digite um código de seis caracteres válido.');
      const db=S.sdk,room=db.ref(S.db,'rooms/'+S.room),snap=await db.get(room);
      if(!snap.exists())throw Error('Sala não encontrada. Confira o código.');
      const data=snap.val();
      if(data.status!=='lobby')throw Error('Essa sala já começou. Entre na próxima partida.');
      if(Object.keys(data.players||{}).length>=4&&!data.players?.[S.uid])throw Error('Sala cheia: o limite é quatro jogadores.');
      S.name=playerData(name,skin).name;S.skin=skin;
      S.playerRef=db.ref(S.db,'rooms/'+S.room+'/players/'+S.uid);
      await db.set(S.playerRef,playerData(name,skin));
      await db.onDisconnect(S.playerRef).remove();
      await attach({isHost:false});
      return S.room;
    }catch(e){S.room='';throw Error(errorMessage(e))}finally{S.busy=false}
  }
  async function start(){if(!S.active||!S.host)throw Error('Somente o líder pode iniciar a partida.');await S.sdk.set(node('status'),'playing');S.status='playing'}
  function safePosition(p){let x=Number(p.x),y=Number(p.y);return {x:Number.isFinite(x)?Math.max(20,Math.min(1260,Math.round(x))):640,y:Number.isFinite(y)?Math.max(40,Math.min(940,Math.round(y))):755}}
  async function position(p,force=false){
    if(!S.active||S.status!=='playing')return;
    const now=performance.now();if(!force&&now-S.lastPos<240)return;S.lastPos=now;
    const pos=safePosition(p);const data={name:S.name,skin:S.skin,...pos,dir:['up','down','left','right'].includes(p.dir)?p.dir:'down',pose:p.pose?1:0,room:p.room==='inside'?'inside':'outdoor',updatedAt:Date.now()};
    try{await S.sdk.set(S.playerRef,data)}catch(e){S.hooks.onError?.(errorMessage(e))}
  }
  async function snapshot(state,force=false){
    if(!S.active||!S.host||S.status!=='playing')return;
    const now=performance.now();if(!force&&now-S.lastState<800)return;S.lastState=now;
    try{await S.sdk.set(node('state'),state)}catch(e){S.hooks.onError?.(errorMessage(e))}
  }
  async function saveProgress(unlocked,points){
    if(!S.active||!S.uid)return;
    const db=S.sdk,profile=db.ref(S.db,'profiles/'+S.uid);
    try{
      await db.runTransaction(profile,existing=>({
        unlocked:Math.max(0,Math.min(19,Math.max(Number(existing?.unlocked)||0,Number(unlocked)||0))),
        bestScore:Math.max(0,Number(existing?.bestScore)||0,Number(points)||0),
        skin:S.skin||'homem',updatedAt:Date.now()
      }),{applyLocally:false});
    }catch(e){S.hooks.onError?.('Progresso online: '+errorMessage(e))}
  }
  let sequence=0;
  async function command(kind,details={}){
    if(!S.active||S.host||S.status!=='playing')return;
    sequence++;const serial=Date.now()*100+(sequence%100);try{await S.sdk.set(node('commands',S.uid),{kind,sequence:serial,at:Date.now(),...Object.fromEntries(Object.entries(details||{}).filter(([k])=>['task','index','stage','session','hornId'].includes(k)))})}catch(e){S.hooks.onError?.(errorMessage(e))}
  }
  function lost(reason){if(!S.active)return;const hooks=S.hooks;cleanup();hooks.onLost?.(reason)}
  function cleanup(){for(const un of S.unsub){try{un()}catch{}}S.unsub=[];S.active=false;S.status='';S.room='';S.host=false;S.players={};S.hooks={};S.lastPos=0;S.lastState=0;S.roomRef=null;S.playerRef=null}
  async function leave(){
    if(!S.active)return;const db=S.sdk,room=S.roomRef,player=S.playerRef,host=S.host;
    cleanup();
    try{if(host){await db.remove(room);await db.onDisconnect(room).cancel()}else{await db.remove(player);await db.onDisconnect(player).cancel()}}catch{}
  }
  function configureHooks(hooks){S.hooks=hooks||{}}
  window.RPGOnline={create,join,start,position,snapshot,command,saveProgress,leave,configureHooks,errorMessage,configured:validConfig,info:()=>({active:S.active,host:S.host,uid:S.uid,room:S.room,players:S.players,status:S.status,name:S.name})};
})();
