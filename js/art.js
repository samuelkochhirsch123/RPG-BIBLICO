/* Canvas renderer: pixel-art assets drawn by us, not copyrighted game sprites. */
window.RPGArt = (() => {
  const images = {};
  const files = {heroes:'assets/personagens.png?v=61',tiles:'assets/terreno.png?v=61',animals:'assets/animais.png?v=61'};
  const themeIndex = {forest:0,desert:1,coastal:2,village:3,river:4,jericho:5};
  const skinIndex = {homem:0,mulher:1,menino:2,menina:3};
  const dirIndex = {down:0,left:1,right:2,up:3};
  const animalIndex = {ovelhas:0,aves:1,bois:2,cabras:3};
  for (const [k,src] of Object.entries(files)) { const img = new Image(); images[k] = img; img.src=src; }
  const rect = (c,x,y,w,h,color) => {c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  function ellipse(c,x,y,rx,ry,color) {c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
  function text(c,t,x,y,size=14,col='#fff3d1') { c.font=`900 ${size}px system-ui, sans-serif`; c.textAlign='center';c.textBaseline='middle';c.lineWidth=3;c.strokeStyle='#21372b';c.strokeText(t,x,y);c.fillStyle=col;c.fillText(t,x,y); }
  function terrain(c,theme,level,view) {
    const idx=themeIndex[theme]??0, tile=32;
    const left=Math.max(0,Math.floor(view.left/tile)-1),right=Math.min(Math.ceil(view.right/tile)+1,40);
    const top=Math.max(0,Math.floor(view.top/tile)-1),bottom=Math.min(Math.ceil(view.bottom/tile)+1,30);
    const palette={forest:'#80a66d',desert:'#cab483',coastal:'#94b19d',village:'#a4ac83',river:'#86aaa0',jericho:'#c5ae81'};
    c.fillStyle=palette[theme]||palette.forest;c.fillRect(0,0,1280,960);
    if(images.tiles.complete&&images.tiles.naturalWidth) {
      const sy=Math.floor(idx/2)*32,sx0=(idx%2)*4;
      for(let y=top;y<bottom;y++)for(let x=left;x<right;x++) {
        const variant=Math.abs((x*29+y*37+x*y*7+level*11) %4);
        c.drawImage(images.tiles,(sx0+variant)*32,sy,32,32,x*32,y*32,32,32);
      }
    }
    // Winding paths show the direction of travel without covering the entire tile texture.
    rect(c,616,450,49,510,theme==='desert'?'#bda073':'#c8ad7c');
    for(let y=480;y<960;y+=32){rect(c,620+(y%3)*3,y,7,3,'#af8d62');rect(c,650-(y%5),y+10,6,3,'#aa8d69');}
    if((theme==='coastal'&&level!==6)||theme==='river'){
      rect(c,0,165,1280,135,'#4d9aab');rect(c,0,165,1280,10,'#3e8499');rect(c,0,292,1280,8,'#bed0aa');
      for(let x=0;x<1280;x+=100){rect(c,x+17,211,40,4,'#a5d9ce');rect(c,x+58,252,24,3,'#7bc5c3');}
      rect(c,590,165,100,135,'#beac7e');
      for(let y=171;y<289;y+=19)rect(c,598,y,84,4,'#d8c69b');
      text(c,'PONTE',640,144,13,'#fff2ca');
    }
  }
  function tree(c,t,theme) {
    const {x,y,size=1}=t; c.save();c.translate(Math.round(x),Math.round(y));c.scale(size,size);
    ellipse(c,7,4,29,12,'#153c3277');rect(c,-7,-46,14,54,'#75563b');rect(c,-4,-43,4,42,'#a1784f');
    const palm=theme==='desert'||theme==='jericho';
    if(palm){rect(c,-26,-78,52,28,'#697f50');rect(c,-36,-65,72,22,'#7b9657');rect(c,-22,-92,44,25,'#a6a76d');rect(c,-29,-51,58,7,'#5c784b');}
    else {rect(c,-27,-72,54,34,'#2e6844');rect(c,-35,-61,69,25,'#397a4a');rect(c,-21,-93,43,30,'#518c51');rect(c,-15,-101,31,18,'#73a967');rect(c,-31,-57,19,14,'#255b40');rect(c,16,-49,16,13,'#2e6947');rect(c,-11,-86,10,6,'#7eb275');}
    c.restore();
  }
  function building(c,theme,level,game) {
    if(level<=1){ // Noah's ark, unfinished stage, then animals arriving, then the new beginning.
      ellipse(c,646,469,173,54,'#233b3355');
      rect(c,497,361,290,106,'#8b5838');rect(c,515,337,257,115,'#ad794a');
      rect(c,498,344,291,16,'#593c29');rect(c,533,312,252,29,'#60412e');
      rect(c,519,297,258,19,'#725034');
      for(let y=355;y<457;y+=20){rect(c,526,y,243,5,'#d5a371');rect(c,534,y+9,230,3,'#96613e');}
      for(let x=541;x<762;x+=48)rect(c,x,353,4,99,'#845435');
      rect(c,612,388,60,82,'#382d26');rect(c,618,393,48,72,'#614631');rect(c,628,399,26,65,'#876342');
      rect(c,639,420,5,5,'#f1cf8b');
      rect(c,499,468,289,13,'#69472f');
      text(c,'A ARCA',643,277,23,'#ffdda5');
      if(level===1 && game?.adventure?.floodSeen){ // rainbow appears after the water challenge
        c.save();c.beginPath();c.arc(640,275,145,Math.PI,0);c.strokeStyle='#f2a28c';c.lineWidth=8;c.stroke();c.beginPath();c.arc(640,275,133,Math.PI,0);c.strokeStyle='#f4d185';c.stroke();c.beginPath();c.arc(640,275,121,Math.PI,0);c.strokeStyle='#9acb96';c.stroke();c.restore();
      }
    } else if(theme==='jericho') {
      ellipse(c,641,532,188,55,'#42372862');
      const collapse=game?.adventure?.wallProgress||0;
      if(collapse>.03){c.save();c.globalAlpha=Math.max(0.05,1-collapse)}
      rect(c,477,301+collapse*135,327,275-collapse*135,'#998363');rect(c,493,310+collapse*155,294,245-collapse*135,'#d5b88d');
      for(let x=476;x<=790;x+=30){rect(c,x,284,23,30,'#ad916c');rect(c,x,546,23,25,'#ae916b');}
      for(let y=310;y<565;y+=33){rect(c,474,y,24,27,'#b29670');rect(c,781,y,24,27,'#b29670');}
      for(let x=530;x<762;x+=70)for(let y=330;y<535;y+=54)rect(c,x,y,33,4,'#b79b77');
      rect(c,603,479,78,96,'#69503a');rect(c,618,495,50,80,'#352f28');
      if(collapse>.03)c.restore();
      if(collapse>.03){for(let i=0;i<34;i++){const x=470+(i*97%350),fall=(collapse*190)*(0.4+(i%5)/7);rect(c,x,515+fall-(i*33%110),11+(i%3)*9,6+(i%4)*5,i%2?'#bf9b72':'#d8bd92')}ellipse(c,640,570,180*collapse,33,'#a58e688a')}
      text(c,'JERICÓ',639,267,22,'#fff1b8');
    } else if(theme==='village') {
      for(let i=0;i<4;i++){const x=301+i*190,y=332+(i%2)*58;
        ellipse(c,x+70,y+96,70,18,'#2e392d44');rect(c,x,y,138,114,'#c8a980');rect(c,x-8,y-13,154,20,'#a97558');rect(c,x+6,y+16,25,29,'#665544');rect(c,x+98,y+17,25,29,'#665544');rect(c,x+54,y+57,31,57,'#634634');
      }
      text(c,'ALDEIA',640,282,21,'#fff3ca');
    } else if(theme==='desert') {
      ellipse(c,640,430,125,30,'#604c3450');rect(c,555,365,170,95,'#b99e72');rect(c,548,350,185,20,'#9b7953');rect(c,618,392,44,68,'#6b4d39');rect(c,584,391,24,22,'#8d6e49');text(c,'JORNADA',640,320,20,'#fff1bc');
    } else if(theme==='coastal'||theme==='river') {
      rect(c,542,355,184,85,'#a9895e');rect(c,560,349,147,12,'#d4b888');rect(c,570,364,8,77,'#6d553d');rect(c,689,364,8,77,'#6d553d');rect(c,627,305,9,75,'#6c5037');rect(c,637,306,60,56,'#ede3ca');rect(c,567,434,138,10,'#694c35');
    } else {
      rect(c,572,346,145,113,'#ae8861');rect(c,560,327,172,22,'#6a5039');rect(c,620,394,46,65,'#594433');
    }
  }
  // Caminho de marcha: visível antes das muralhas e estacas, nos oito pontos da rota.
  function jerichoTrail(c,game){
    const cx=640,cy=433,r=335;
    c.save();
    c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);
    c.strokeStyle='#6f64445c';c.lineWidth=35;c.stroke();
    c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);
    c.strokeStyle='#f7e0a6c9';c.lineWidth=10;c.setLineDash([15,18]);c.stroke();
    c.setLineDash([]);
    // Estacas do percurso com números em ordem: ajudam a manter a direção no celular.
    for(let i=0;i<8;i++){
      const ang=Math.PI/2+i*Math.PI/4;
      const x=cx+Math.cos(ang)*r,y=cy+Math.sin(ang)*r;
      ellipse(c,x,y+7,17,6,'#433d2b88');
      rect(c,x-8,y-19,16,25,'#8c673f');rect(c,x-6,y-24,12,10,'#ecd38e');
      text(c,String(i+1),x,y-33,13,'#fff6cf');
    }
    // Pequena seta à saída: o jogador pode seguir tanto sentido horário como anti-horário.
    c.restore();
  }
  function token(c,x,y,label,complete,t) {
    if(complete)return;
    const bob=Math.round(Math.sin(t/400+x*.01)*4);
    ellipse(c,x+3,y+13,21,7,'#182c2b65');
    rect(c,x-16,y-20+bob,32,30,'#715733');rect(c,x-14,y-18+bob,28,24,'#e0bc7a');
    rect(c,x-11,y-24+bob,22,8,'#f9db99');rect(c,x-6,y-10+bob,12,7,'#f8f0cc');
    text(c,label,x,y-41+bob,12,'#ffebae');
  }
  function animal(c,group,t) {
    if(group.entered)return;
    const bob=Math.round(Math.sin(t/350+group.index)*2);
    const x=group.x,y=group.y;
    const boardingProgress=group.boarding?Math.min(1,group.boardTime/7.5):0;
    const scale=1-boardingProgress*.55;
    c.save();c.translate(x,y);c.scale(scale,scale);
    ellipse(c,2,17,36,12,'#1f302866');
    const img=images.animals;
    if(img.complete&&img.naturalWidth)c.drawImage(img,(animalIndex[group.kind]??0)*64,0,64,48,-43,-24+bob,86,65);
    else {rect(c,-30,-10,60,30,'#e4d3ad');rect(c,9,-22,17,22,'#9c8768')}
    c.restore();
    if(group.boarding)text(c,group.label+' · ENTRANDO...',x,y-43,12,'#ffdf97');
    else if(group.ready)text(c,group.label+' · AÇÃO',x,y-43,13,'#ffdf97');
    else text(c,group.label+' chegando',x,y-43,12,'#fff3d2');
  }
  function drawInterior(c,g,view){
    c.fillStyle='#3b463c';c.fillRect(0,0,1280,960);
    for(let y=0;y<960;y+=34)for(let x=0;x<1280;x+=52){
      rect(c,x,y,49,30,(x/52+y/34)%2?'#594b3d':'#64513d');rect(c,x+5,y+8,28,2,'#776349');
    }
    rect(c,32,28,1216,24,'#a2714c');rect(c,32,28,24,890,'#8a603f');rect(c,1224,28,24,890,'#8a603f');
    for(let x=80;x<1200;x+=165){rect(c,x,54,18,830,'#73543c');rect(c,x+4,61,4,800,'#966f4c')}
    for(let i=0;i<5;i++){rect(c,70,140+i*144,1140,7,'#886440');rect(c,75,146+i*144,1140,3,'#b58653')}
    // Wooden pathway to the exit; small steps as a tactile cue.
    rect(c,571,115,138,730,'#a17850');for(let y=115;y<845;y+=24)rect(c,576,y,127,4,'#c29464');
    rect(c,573,818,135,90,'#4d382c');rect(c,601,829,80,42,'#beaa83');text(c,'SAÍDA',638,889,18,'#fff0bd');
    const a=g.adventure;
    if(g.level===0){
      // Storage bays: visibly fill up after the player delivers each sack.
      for(let i=0;i<a.stalls.length;i++){
        const d=a.stalls[i];rect(c,d.x-98,d.y-75,196,126,'#3c2f28');rect(c,d.x-104,d.y-82,208,10,'#ad824c');rect(c,d.x-100,d.y+40,203,10,'#ad824c');
        for(let j=0;j<3;j++)rect(c,d.x-90+j*65,d.y-70,8,112,'#76583c');
        text(c,d.label,d.x,d.y-111,19,'#ffdea0');
        if(i<g.complete){for(let n=0;n<5;n++){rect(c,d.x-70+n*25,d.y-18-(n%2)*4,28,47,'#b99c62');rect(c,d.x-67+n*25,d.y-14,18,5,'#edce83')}}
        else text(c,'VAZIO',d.x,d.y+3,14,'#a7c6bb');
      }
      if(g.complete<3){
        rect(c,a.cargo.x-44,a.cargo.y-42,88,65,'#a78251');rect(c,a.cargo.x-33,a.cargo.y-51,66,25,'#d2b77e');
        text(c,g.adventure.carrying?'RETIREI':'PEGAR',a.cargo.x,a.cargo.y-85,16,'#ffdea0');
        if(a.carrying){rect(c,g.player.x-20,g.player.y-70,40,31,'#c7a773');rect(c,g.player.x-16,g.player.y-68,32,5,'#e9d09a')}
      }
    }else if(g.level===1){
      for(let i=0;i<a.pens.length;i++){
        const d=a.pens[i],x=d.x,y=d.y;
        rect(c,x-120,y-91,240,158,'#60503d');rect(c,x-120,y-91,240,12,'#c39969');rect(c,x-120,y+52,240,13,'#c39969');
        for(let n=0;n<6;n++){rect(c,x-115+n*42,y-91,7,155,'#aa7c4e');rect(c,x-113+n*42,y-63,4,112,'#d7ae72')}
        text(c,d.label.toUpperCase(),x,y-118,17,'#ffdea0');
        if(d.done){const img=images.animals;if(img.complete&&img.naturalWidth)c.drawImage(img,(animalIndex[d.kind]??0)*64,0,64,48,x-50,y-50,100,79);text(c,'✓ ORGANIZADO',x,y+90,13,'#aee1ae')}
        else text(c,'AÇÃO · ORGANIZAR',x,y+88,13,'#f6e0b9');
      }
    }
    const cX=g.player.x,cY=g.player.y;
    hero(c,cX,cY,g.skin,g.direction,g.pose);
    for(const other of (g.remotePlayers||[])){
      if(other.room!=='inside')continue;
      hero(c,other.x,other.y,other.skin,other.dir,other.pose);
      text(c,other.name,other.x,other.y-77,15,'#ffe2a0');
    }
    // Direction hint at center of floor, near exit.
    text(c,g.level===0?'PREPARE OS DEPÓSITOS':'ORGANIZE OS COMPARTIMENTOS',640,185,20,'#fff2b3');
  }
  function drawFlood(c,g){
    const t=g.animTime/1000;
    rect(c,0,0,1280,960,'#3c8da6');
    for(let y=45;y<960;y+=45)for(let x=0;x<1280;x+=145){rect(c,x+20*Math.sin(t+y*.02),y,85,5,'#95d3d1');rect(c,x+45*Math.sin(t*.5+x*.01),y+15,34,3,'#5eb0b4')}
    // Elevated wooden deck in front of the ark; players can reach its observation window.
    rect(c,555,480,170,475,'#89704b');for(let y=490;y<960;y+=23)rect(c,566,y,145,3,'#c5a679');
    text(c,'OBSERVE OS SINAIS DO DILÚVIO',640,235,18,'#fff1c8');
  }
  function drawSea(c,g){
    const a=g.adventure,p=a.seaProgress||0,t=g.animTime/1000;
    // The entire route begins submerged. The ground is exposed gradually as the water divides.
    rect(c,0,75,1280,385,'#3e90a8');
    for(let y=91;y<451;y+=31)for(let x=0;x<1280;x+=125){rect(c,x+Math.sin(t*2+y*.01+x*.004)*18,y,65,4,'#8acbcc')}
    if(p>0){
      const width=184*p;
      rect(c,640-width/2,76,width,386,'#c9b98f');
      for(let y=80;y<460;y+=24){rect(c,640-width/2+10,y,width-20,3,'#a99571')}
      // The walls of water move to either side as if lifted by wind.
      const edgeL=640-width/2,edgeR=640+width/2;
      rect(c,edgeL-13,76,13,384,'#a7e5dd');rect(c,edgeR,76,13,384,'#a7e5dd');
      for(let y=80;y<460;y+=28){rect(c,edgeL-31-(y%55),y,20,6,'#d5efde');rect(c,edgeR+12+(y%53),y+8,17,6,'#c0eee6')}
      text(c,'TERRA SECA',640,283,18,'#fff0c2');
    }
    // Moses is not the player; simple original pixel art NPC and staff.
    ellipse(c,641,651,26,8,'#223d3666');rect(c,628,621,26,39,'#8f694b');rect(c,628,605,26,23,'#d09a6a');rect(c,624,601,34,9,'#4f3b33');rect(c,666,590,5,70,'#78523a');rect(c,667,583,5,11,'#c3a476');text(c,'MOISÉS',644,570,18,'#fff1c4');
  }
  function drawStorm(c,g){
    const t=g.animTime/1000,a=g.adventure,progress=a.stormProgress||0;
    if(progress<=0)return;
    c.fillStyle=`rgba(5,19,34,${Math.min(.65,progress*.9)})`;c.fillRect(0,0,1280,960);
    for(let i=0;i<13;i++){const y=120+i*52;rect(c,(i*221+Math.sin(t*1.5+i)*70+1280)%1280,y,90,7,'#87b6c8')}
    for(let i=0;i<65;i++){const x=(i*273+t*130)%1280,y=(i*139+t*255)%960;rect(c,x,y,2,21,'#bdd9db')}
    if(progress>.42&&progress<.57){c.fillStyle='rgba(255,255,235,.32)';c.fillRect(0,0,1280,960)}
    if(progress>.78){rect(c,0,0,1280,960,`rgba(215,233,200,${Math.min(.28,(progress-.78)*1.1)})`)}
  }

  function crowd(c,m,t){
    const cx=m.x,cy=m.y;ellipse(c,cx,cy+20,56,17,'#29473575');
    for(let i=0;i<4;i++){
      const x=cx+(i%2)*36-19,y=cy+Math.floor(i/2)*22-12;
      rect(c,x-7,y-11,14,16,['#aa754b','#5c7f8a','#b18176','#7d8a55'][i]);
      rect(c,x-6,y-26,12,13,['#d3a779','#ad8058','#cb966b','#c69868'][i]);
      rect(c,x-7,y-29,14,5,'#543f2e');
    }
    if(m.done){for(let i=0;i<5;i++)rect(c,cx-37+i*17,cy+26+(i%2)*3,12,7,'#edd18b');text(c,'ALIMENTADOS ✓',cx,cy-58,12,'#bcf0ba')}
    else {for(let i=0;i<4;i++)rect(c,cx-30+i*20,cy+27,14,8,'#dfb977');text(c,'DISTRIBUIR · AÇÃO',cx,cy-58,12,'#ffe2a3')}
  }
  function hero(c,x,y,skin,dir,pose){
    ellipse(c,x,y+6,19,7,'#183a315e');
    const img=images.heroes;
    const child=skin==='menino'||skin==='menina';
    const size=child?63:73;
    if(img.complete&&img.naturalWidth) c.drawImage(img,((dirIndex[dir]??0)*2+(pose?1:0))*32,(skinIndex[skin]??0)*48,32,48,Math.round(x-size*.33),Math.round(y-size*.86),Math.round(size*.67),size);
    else {rect(c,x-12,y-24,24,28,'#527ca3');rect(c,x-9,y-48,18,22,'#d4a27a');}
  }
  // A Arca da Aliança em transporte: coberta, com varais visíveis.
  // A procissão em Jericó tem sacerdotes com trombetas, carregadores e povo.
  function npc(c,x,y,i=0,scale=1){
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);
    ellipse(c,0,10,12,4,'#2b33265f');rect(c,-8,-2,7,13,'#433e35');rect(c,2,-2,7,13,'#433e35');
    rect(c,-11,-23,22,22,['#a57957','#668f9b','#a27a81','#79916e','#a58b58'][i%5]);
    rect(c,-8,-37,16,15,['#c69168','#d9ac80','#ba795d'][i%3]);rect(c,-9,-40,18,6,'#544437');
    c.restore();
  }
  function jerichoProcession(c,g){
    const centerX=640,centerY=433,r=335;
    const angle=Math.atan2(g.player.y-centerY,g.player.x-centerX);
    const cw=g.lapDirection||1;
    const pos=k=>({x:centerX+Math.cos(angle-cw*k*.105)*r,y:centerY+Math.sin(angle-cw*k*.105)*r});
    // One set of priests with trumpets, levites carrying the covered Ark, and the people.
    for(let i=0;i<6;i++){
      const p=pos(i+1);npc(c,p.x,p.y,1,.82);
      rect(c,p.x+9,p.y-33,14,3,'#d6b369');rect(c,p.x+20,p.y-37,4,9,'#e2c37f');
    }
    const mid=pos(7.3);ellipse(c,mid.x,mid.y+12,43,10,'#413b316b');
    // Two long carrying poles, and a blue cloth hiding the sacred chest itself.
    rect(c,mid.x-60,mid.y-11,120,8,'#916b45');rect(c,mid.x-57,mid.y+15,114,7,'#ba8d51');
    rect(c,mid.x-31,mid.y-32,62,47,'#204870');rect(c,mid.x-26,mid.y-38,52,10,'#426f9f');
    rect(c,mid.x-28,mid.y-9,56,7,'#375f86');rect(c,mid.x-26,mid.y+8,52,6,'#1a3956');
    for(const k of [6.5,8.1]){const p=pos(k);npc(c,p.x,p.y,2,.9)}
    for(let i=0;i<13;i++){const p=pos(i+9);npc(c,p.x,p.y,i,.75)}
    text(c,'PROCISSÃO · ARCA COBERTA',mid.x,mid.y-61,12,'#fff2c5');
  }
  function seaCrowd(c,g){
    if(g.level!==6)return;
    const a=g.adventure,opened=a.seaOpened&&a.seaMarked;
    for(let i=0;i<14;i++){
      const row=Math.floor(i/3),col=i%3;
      const cx=640+(col-1)*38+(row%2)*8;
      const cy=opened?Math.min(750,g.player.y+100+row*26):720+row*36;
      npc(c,cx,cy,i,.82);
    }
    text(c,'POVO DE ISRAEL',640,800,14,'#fff0b5');
  }
  function escortCrowd(c,g){
    if(g.level!==5)return;const p=g.escort;
    for(let i=0;i<7;i++){const x=p.x+(i%3-1)*30,y=p.y+Math.floor(i/3)*29;npc(c,x,y,i,.8)}
    text(c,'FAMÍLIAS',p.x,p.y-54,14,'#fff1c7');
  }
  function render(c,game,screen){
    const {width,height,dpr,zoom,cameraX,cameraY}=screen;
    c.setTransform(dpr,0,0,dpr,0,0);
    c.clearRect(0,0,width,height);
    c.imageSmoothingEnabled=false;
    c.save();
    c.translate(width/2-cameraX*zoom,height/2-cameraY*zoom);
    c.scale(zoom,zoom);
    const view={left:cameraX-width/(2*zoom),right:cameraX+width/(2*zoom),top:cameraY-height/(2*zoom),bottom:cameraY+height/(2*zoom)};
    const lev=window.BibliaData.levels[game.level];
    if(game.adventure?.room==='inside'){
      drawInterior(c,game,view);c.restore();return;
    }
    terrain(c,lev.theme,game.level,view);
    // Ground features in the wilderness
    for(const pebble of game.decals){ if(pebble.x<view.left-10||pebble.x>view.right+10||pebble.y<view.top-10||pebble.y>view.bottom+10)continue;
      rect(c,pebble.x,pebble.y,pebble.size,pebble.size>2?3:2,lev.theme==='desert'||lev.theme==='jericho'?'#b19a71':'#648d5c');
    }
    
    if(game.level===6)drawSea(c,game);
    else building(c,lev.theme,game.level,game);
    if(lev.type==='laps')jerichoTrail(c,game);
    if(game.level===12||game.level===19)drawStorm(c,game);
    const objects=[];
    if(lev.theme!=='coastal'&&lev.theme!=='river'&&lev.theme!=='jericho'){
      for(const tr of game.trees)if(tr.x>view.left-85&&tr.x<view.right+85&&tr.y>view.top-120&&tr.y<view.bottom+30)objects.push({y:tr.y,draw:()=>tree(c,tr,lev.theme)});
    }
    if(lev.type==='laps')objects.push({y:game.player.y-3,draw:()=>jerichoProcession(c,game)});
    if(game.level===6)objects.push({y:game.player.y-5,draw:()=>seaCrowd(c,game)});
    if(game.level===5)objects.push({y:game.escort.y,draw:()=>escortCrowd(c,game)});
    if(lev.type==='arrive')for(const animalGroup of game.animals)objects.push({y:animalGroup.y,draw:()=>animal(c,animalGroup,game.animTime)});
    else if(lev.type!=='laps')for(const m of game.markers)objects.push({y:m.y,draw:()=>lev.type==='feed'?crowd(c,m,game.animTime):token(c,m.x,m.y,m.label,m.done,game.animTime)});
    for(const other of (game.remotePlayers||[])){
      if(other.room==='inside')continue;
      objects.push({y:other.y,draw:()=>{
        hero(c,other.x,other.y,other.skin,other.dir,other.pose);
        text(c,other.name,other.x,other.y-74,14,'#ffe4a0');
      }});
    }
    objects.push({y:game.player.y,draw:()=>hero(c,game.player.x,game.player.y,game.skin,game.direction,game.pose)});
    objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
    c.restore();
    // Short mission-specific helper: direction to nearest marker if outside camera
    if(game.state==='playing'){
      const target=game.getTarget();
      if(target){const dx=(target.x-cameraX)*zoom,dy=(target.y-cameraY)*zoom;
        if(Math.abs(dx)>width*.39||Math.abs(dy)>height*.39){
          const angle=Math.atan2(dy,dx),r=Math.min(width*.36,height*.33),px=width/2+Math.cos(angle)*r,py=height/2+Math.sin(angle)*r;
          c.save();c.translate(px,py);c.rotate(angle);rect(c,-12,-6,24,12,'#f5d79a');rect(c,6,-11,13,22,'#f5d79a');c.restore();
        }
      }
    }
  }
  function avatar(canvas,skin){const c=canvas.getContext('2d');if(!c)return;c.imageSmoothingEnabled=false;c.clearRect(0,0,32,48);const draw=()=>{if(images.heroes.complete&&images.heroes.naturalWidth)c.drawImage(images.heroes,0,(skinIndex[skin]||0)*48,32,48,0,0,32,48);else{rect(c,5,21,22,15,'#668bb3');rect(c,8,5,16,17,'#cf9d7a')}};if(images.heroes.complete)draw();else images.heroes.addEventListener('load',draw,{once:true});}
  return {render,avatar,images};
})();
