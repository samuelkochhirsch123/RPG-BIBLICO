/* Regras de missões especiais, cenários interiores e animações. */
window.RPGAdventures = Object.freeze({
  create(stage){return {
    room:'outdoor',carrying:false,cargoStep:0,
    stalls:[{x:350,y:385,label:'FENO'},{x:640,y:385,label:'GRÃOS'},{x:930,y:385,label:'ÁGUA'}],
    cargo:{x:640,y:690},exit:{x:640,y:847},
    arkDoor:{x:640,y:492},
    pens:[{x:355,y:355,label:'Ovelhas',kind:'ovelhas',done:false},
          {x:925,y:355,label:'Aves',kind:'aves',done:false},
          {x:355,y:590,label:'Bois',kind:'bois',done:false},
          {x:925,y:590,label:'Cabras',kind:'cabras',done:false}],
    pensDone:0,penCooldown:0,boardingIndex:0,nextReadyAt:0,feedCooldown:0,
    seaOpened:false,seaProgress:0,seaCrossed:false,seaMarked:false,seaDeadline:0,seaPenaltyAt:0,
    floodSeen:false,jerichoHornDone:0,lapDeadline:0,lapMilestone:0,
    stormProgress:0,stormCleared:false,wallProgress:0,
    stageKind:stage.type
  }},
  target(g){
    const a=g.adventure;if(!a)return null;
    if(a.room==='inside'){
      if(g.level===0){if(a.carrying)return a.stalls[a.cargoStep];return a.cargo}
      if(g.level===1)return a.pens.find(p=>!p.done)||null;
      return a.exit;
    }
    if(g.level===0)return a.arkDoor;
    if(g.level===1){
      if(g.complete>=4)return a.arkDoor;
      return g.animals[a.boardingIndex]||null;
    }
    if(g.level===6)return a.seaOpened&&a.seaMarked?{x:640,y:135}:{x:640,y:635};
    return null;
  },
  isRoom(g){return g.adventure?.room==='inside'}
});
