/* Canvas renderer: pixel-art assets drawn by us, not copyrighted game sprites. */
window.RPGArt = (() => {
  const images = {};
  const files = {heroes:'assets/personagens.png',tiles:'assets/terreno.png',animals:'assets/animais.png'};
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
    if(theme==='coastal'||theme==='river'){
      rect(c,0,165,1280,135,'#4d9aab');rect(c,0,165,1280,10,'#3e8499');rect(c,0,292,1280,8,'#bed0aa');
      for(let x=0;x<1280;x+=100){rect(c,x+17,211,40,4,'#a5d9ce');rect(c,x+58,252,24,3,'#7bc5c3');}
      rect(c,590,165,100,135,'#beac7e');
      for(let y=171;y<289;y+=19)rect(c,598,y,84,4,'#d8c69b');
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
  function building(c,theme,level) {
    if(level<=2){ // Noah's ark, unfinished stage, then animals arriving, then the new beginning.
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
      if(level===2){ // rainbow as covenant sign
        c.save();c.beginPath();c.arc(640,275,145,Math.PI,0);c.strokeStyle='#f2a28c';c.lineWidth=8;c.stroke();c.beginPath();c.arc(640,275,133,Math.PI,0);c.strokeStyle='#f4d185';c.stroke();c.beginPath();c.arc(640,275,121,Math.PI,0);c.strokeStyle='#9acb96';c.stroke();c.restore();
      }
    } else if(theme==='jericho') {
      ellipse(c,641,532,188,55,'#42372862');
      rect(c,477,301,327,275,'#998363');rect(c,493,310,294,245,'#d5b88d');
      for(let x=476;x<=790;x+=30){rect(c,x,284,23,30,'#ad916c');rect(c,x,546,23,25,'#ae916b');}
      for(let y=310;y<565;y+=33){rect(c,474,y,24,27,'#b29670');rect(c,781,y,24,27,'#b29670');}
      for(let x=530;x<762;x+=70)for(let y=330;y<535;y+=54)rect(c,x,y,33,4,'#b79b77');
      rect(c,603,479,78,96,'#69503a');rect(c,618,495,50,80,'#352f28');text(c,'JERICÓ',639,267,22,'#fff1b8');
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
    ellipse(c,x+2,y+17,36,12,'#1f302866');
    const img=images.animals;
    if(img.complete&&img.naturalWidth)c.drawImage(img,(animalIndex[group.kind]??0)*64,0,64,48,Math.round(x-43),Math.round(y-24+bob),86,65);
    else {rect(c,x-30,y-10,60,30,'#e4d3ad');rect(c,x+9,y-22,17,22,'#9c8768');}
    if(group.ready)text(c,group.label+' · AÇÃO',x,y-39,13,'#ffdf97');
    else text(c,group.label+' chegando',x,y-39,12,'#fff3d2');
  }
  function hero(c,x,y,skin,dir,pose){
    ellipse(c,x,y+6,19,7,'#183a315e');
    const img=images.heroes;
    const child=skin==='menino'||skin==='menina';
    const size=child?63:73;
    if(img.complete&&img.naturalWidth) c.drawImage(img,((dirIndex[dir]??0)*2+(pose?1:0))*32,(skinIndex[skin]??0)*48,32,48,Math.round(x-size*.33),Math.round(y-size*.86),Math.round(size*.67),size);
    else {rect(c,x-12,y-24,24,28,'#527ca3');rect(c,x-9,y-48,18,22,'#d4a27a');}
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
    terrain(c,lev.theme,game.level,view);
    // Ground features in the wilderness
    for(const pebble of game.decals){ if(pebble.x<view.left-10||pebble.x>view.right+10||pebble.y<view.top-10||pebble.y>view.bottom+10)continue;
      rect(c,pebble.x,pebble.y,pebble.size,pebble.size>2?3:2,lev.theme==='desert'||lev.theme==='jericho'?'#b19a71':'#648d5c');
    }
    building(c,lev.theme,game.level);
    const objects=[];
    if(lev.theme!=='coastal'&&lev.theme!=='river'&&lev.theme!=='jericho'){
      for(const tr of game.trees)if(tr.x>view.left-85&&tr.x<view.right+85&&tr.y>view.top-120&&tr.y<view.bottom+30)objects.push({y:tr.y,draw:()=>tree(c,tr,lev.theme)});
    }
    if(lev.type==='arrive')for(const animalGroup of game.animals)objects.push({y:animalGroup.y,draw:()=>animal(c,animalGroup,game.animTime)});
    else if(lev.type==='laps'){
      for(let i=0;i<8;i++){const angle=i*Math.PI/4;const x=640+Math.cos(angle)*335,y=433+Math.sin(angle)*335;
        objects.push({y,draw:()=>{ellipse(c,x,y+5,13,6,'#47392480');rect(c,x-9,y-19,18,25,'#a17e57');rect(c,x-6,y-23,12,7,'#d8b883');}});
      }
    } else for(const m of game.markers)objects.push({y:m.y,draw:()=>token(c,m.x,m.y,m.label,m.done,game.animTime)});
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
