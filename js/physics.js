/* Física de colisão dos pés do personagem. Árvores são atravessáveis.
   As construções e muralhas são sólidas; água profunda só tem passagem nas pontes
   ou pelo corredor seco aberto na história de Moisés. */
window.RPGPhysics = (() => {
  const radius = 12;
  const rects = (level, room, adventure) => {
    if (room === 'inside') return [];
    if (level <= 1) return [{x1:497,y1:300,x2:788,y2:480,type:'wall'}];
    if (level === 8 && (adventure?.wallProgress ?? 0) < .82)
      return [{x1:471,y1:285,x2:806,y2:577,type:'wall'}];
    const theme = window.BibliaData?.levels[level]?.theme;
    if (theme === 'village') return Array.from({length:4},(_,i)=>{
      const x=301+i*190,y=332+(i%2)*58;
      return {x1:x-8,y1:y-13,x2:x+146,y2:y+114,type:'wall'};
    });
    if (theme === 'desert') return [{x1:548,y1:340,x2:733,y2:462,type:'wall'}];
    return [];
  };
  const rectHit = (px,py,r) => {
    const closestX = Math.max(r.x1,Math.min(px,r.x2));
    const closestY = Math.max(r.y1,Math.min(py,r.y2));
    return (px-closestX)**2+(py-closestY)**2 < radius*radius;
  };
  function obstacleAt(x,y,ctx) {
    if(!Number.isFinite(x)||!Number.isFinite(y))return 'wall';
    if(x<25||x>1255||y<41||y>936)return 'wall';
    const room=ctx.adventure?.room;
    if(room==='inside') return null;
    for(const r of rects(ctx.level,room,ctx.adventure))if(rectHit(x,y,r))return r.type;
    const theme=window.BibliaData?.levels[ctx.level]?.theme;
    if(ctx.level===6){
      // O mar ocupa y=75..460. O corredor seco só aparece depois da abertura.
      if(y>75-radius && y<460+radius){
        const a=ctx.adventure||{};
        const dry=a.seaOpened&&a.seaMarked&&(a.seaProgress??0)>.95&&x>=640-91+radius&&x<=640+91-radius;
        if(!dry)return 'water';
      }
    } else if(theme==='coastal'||theme==='river'){
      // A água atravessa horizontalmente o mapa; o passadiço central já era desenhado.
      if(y>165-radius && y<300+radius && !(x>=590+radius&&x<=690-radius))return 'water';
    }
    return null;
  }
  function move(x,y,dx,dy,ctx) {
    let hit=null;
    // Subpassos impedem que a corrida atravesse paredes finas.
    const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/6));
    for(let i=0;i<steps;i++){
      const stepX=dx/steps,stepY=dy/steps;
      const ox=obstacleAt(x+stepX,y,ctx);
      if(!ox)x+=stepX; else hit ||= ox;
      const oy=obstacleAt(x,y+stepY,ctx);
      if(!oy)y+=stepY; else hit ||= oy;
    }
    return {x,y,hit};
  }
  // Ajusta pontos de missão colocados por mapas antigos sobre uma construção.
  function safeMarker(x,y,ctx){
    if(!obstacleAt(x,y,ctx))return {x,y};
    for(const dist of [70,125,185,240])for(const [dx,dy] of [[0,dist],[dist,0],[-dist,0],[0,-dist],[dist,dist],[-dist,dist]]){
      const tx=x+dx,ty=y+dy;
      if(!obstacleAt(tx,ty,ctx))return {x:tx,y:ty};
    }
    return {x,y};
  }
  return {move,obstacleAt,safeMarker,rects,radius};
})();
