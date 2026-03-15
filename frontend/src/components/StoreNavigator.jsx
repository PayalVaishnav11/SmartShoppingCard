// src/components/StoreNavigator.jsx
import { useEffect, useRef, useState, useCallback } from "react";

// ── Grid ─────────────────────────────────────────────────
const COLS = 32, ROWS = 24;
const CELL = { FLOOR: 0, WALL: 1, SECTION: 2 };

const SECTIONS = [
  { id:"entrance",    name:"Entrance",          emoji:"🚪", color:"#34d399", aisle:"Main Door",     cells:[[2,21],[3,21],[4,21],[5,21],[6,21]],                                                                          nav:[4,20] },
  { id:"checkout",    name:"Checkout",          emoji:"💳", color:"#c084fc", aisle:"Checkout Zone", cells:[[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1]],                                                       nav:[5,2]  },
  { id:"fruits",      name:"Fruits & Veg",      emoji:"🍎", color:"#a3e635", aisle:"Aisle A",       cells:[[1,3],[2,3],[3,3],[4,3],[1,4],[2,4],[3,4],[4,4],[1,5],[2,5],[3,5],[4,5]],                                     nav:[2,4]  },
  { id:"dairy",       name:"Dairy & Eggs",      emoji:"🥛", color:"#38bdf8", aisle:"Aisle B",       cells:[[1,8],[2,8],[3,8],[4,8],[1,9],[2,9],[3,9],[4,9]],                                                             nav:[2,9]  },
  { id:"bakery",      name:"Bakery",            emoji:"🍞", color:"#fbbf24", aisle:"Aisle C",       cells:[[1,13],[2,13],[3,13],[4,13],[1,14],[2,14],[3,14],[4,14]],                                                     nav:[2,13] },
  { id:"meat",        name:"Meat & Seafood",    emoji:"🥩", color:"#f87171", aisle:"Aisle D",       cells:[[1,17],[2,17],[3,17],[4,17],[1,18],[2,18],[3,18],[4,18]],                                                     nav:[2,17] },
  { id:"snacks",      name:"Snacks",            emoji:"🍿", color:"#fb923c", aisle:"Aisle E",       cells:[[8,3],[9,3],[10,3],[11,3],[8,4],[9,4],[10,4],[11,4]],                                                         nav:[9,4]  },
  { id:"beverages",   name:"Beverages",         emoji:"🥤", color:"#06b6d4", aisle:"Aisle F",       cells:[[8,8],[9,8],[10,8],[11,8],[8,9],[9,9],[10,9],[11,9]],                                                         nav:[9,9]  },
  { id:"frozen",      name:"Frozen Foods",      emoji:"🧊", color:"#818cf8", aisle:"Aisle G",       cells:[[8,13],[9,13],[10,13],[11,13],[8,14],[9,14],[10,14],[11,14]],                                                 nav:[9,13] },
  { id:"canned",      name:"Canned & Dry",      emoji:"🥫", color:"#d97706", aisle:"Aisle H",       cells:[[8,17],[9,17],[10,17],[11,17],[8,18],[9,18],[10,18],[11,18]],                                                 nav:[9,17] },
  { id:"personal",    name:"Personal Care",     emoji:"🧴", color:"#ec4899", aisle:"Aisle I",       cells:[[15,3],[16,3],[17,3],[18,3],[15,4],[16,4],[17,4],[18,4]],                                                     nav:[16,4] },
  { id:"cleaning",    name:"Cleaning",          emoji:"🧹", color:"#14b8a6", aisle:"Aisle J",       cells:[[15,8],[16,8],[17,8],[18,8],[15,9],[16,9],[17,9],[18,9]],                                                     nav:[16,9] },
  { id:"baby",        name:"Baby Products",     emoji:"🍼", color:"#f0abfc", aisle:"Aisle K",       cells:[[15,13],[16,13],[17,13],[18,13],[15,14],[16,14],[17,14],[18,14]],                                             nav:[16,13]},
  { id:"petfood",     name:"Pet Supplies",      emoji:"🐾", color:"#a78bfa", aisle:"Aisle L",       cells:[[15,17],[16,17],[17,17],[18,17],[15,18],[16,18],[17,18],[18,18]],                                             nav:[16,17]},
  { id:"electronics", name:"Electronics",       emoji:"📱", color:"#00d4ff", aisle:"Aisle M",       cells:[[22,3],[23,3],[24,3],[25,3],[26,3],[22,4],[23,4],[24,4],[25,4],[26,4],[22,5],[23,5],[24,5],[25,5],[26,5]],    nav:[24,4] },
  { id:"stationary",  name:"Stationery",        emoji:"📚", color:"#fbbf24", aisle:"Aisle N",       cells:[[22,8],[23,8],[24,8],[25,8],[22,9],[23,9],[24,9],[25,9]],                                                     nav:[23,9] },
  { id:"pharmacy",    name:"Pharmacy",          emoji:"💊", color:"#4ade80", aisle:"Aisle O",       cells:[[22,13],[23,13],[24,13],[25,13],[22,14],[23,14],[24,14],[25,14]],                                             nav:[23,13]},
  { id:"sports",      name:"Sports & Fitness",  emoji:"⚽", color:"#fb7185", aisle:"Aisle P",       cells:[[22,17],[23,17],[24,17],[25,17],[22,18],[23,18],[24,18],[25,18]],                                             nav:[23,17]},
];

const PRODUCTS = [
  {name:"Apple",section:"fruits"},{name:"Banana",section:"fruits"},{name:"Mango",section:"fruits"},
  {name:"Orange",section:"fruits"},{name:"Tomato",section:"fruits"},{name:"Potato",section:"fruits"},
  {name:"Onion",section:"fruits"},{name:"Spinach",section:"fruits"},{name:"Carrot",section:"fruits"},
  {name:"Broccoli",section:"fruits"},{name:"Grapes",section:"fruits"},
  {name:"Milk",section:"dairy"},{name:"Butter",section:"dairy"},{name:"Cheese",section:"dairy"},
  {name:"Yogurt",section:"dairy"},{name:"Eggs",section:"dairy"},{name:"Paneer",section:"dairy"},
  {name:"Bread",section:"bakery"},{name:"Bun",section:"bakery"},{name:"Cake",section:"bakery"},
  {name:"Cookies",section:"bakery"},{name:"Muffin",section:"bakery"},
  {name:"Chicken",section:"meat"},{name:"Fish",section:"meat"},{name:"Mutton",section:"meat"},
  {name:"Prawns",section:"meat"},{name:"Sausage",section:"meat"},
  {name:"Chips",section:"snacks"},{name:"Popcorn",section:"snacks"},{name:"Biscuits",section:"snacks"},
  {name:"Chocolate",section:"snacks"},{name:"Nuts",section:"snacks"},{name:"Candy",section:"snacks"},
  {name:"Water",section:"beverages"},{name:"Juice",section:"beverages"},{name:"Soda",section:"beverages"},
  {name:"Tea",section:"beverages"},{name:"Coffee",section:"beverages"},{name:"Cola",section:"beverages"},
  {name:"Energy Drink",section:"beverages"},{name:"Coconut Water",section:"beverages"},
  {name:"Ice Cream",section:"frozen"},{name:"Frozen Pizza",section:"frozen"},{name:"Frozen Fries",section:"frozen"},
  {name:"Rice",section:"canned"},{name:"Dal",section:"canned"},{name:"Pasta",section:"canned"},
  {name:"Sugar",section:"canned"},{name:"Salt",section:"canned"},{name:"Flour",section:"canned"},
  {name:"Shampoo",section:"personal"},{name:"Soap",section:"personal"},{name:"Toothpaste",section:"personal"},
  {name:"Deodorant",section:"personal"},{name:"Face Wash",section:"personal"},
  {name:"Detergent",section:"cleaning"},{name:"Dishwash",section:"cleaning"},{name:"Bleach",section:"cleaning"},
  {name:"Diapers",section:"baby"},{name:"Baby Food",section:"baby"},{name:"Baby Wipes",section:"baby"},
  {name:"Dog Food",section:"petfood"},{name:"Cat Food",section:"petfood"},{name:"Pet Treats",section:"petfood"},
  {name:"Headphones",section:"electronics"},{name:"Charger",section:"electronics"},{name:"Power Bank",section:"electronics"},
  {name:"USB Cable",section:"electronics"},{name:"Earphones",section:"electronics"},{name:"Speaker",section:"electronics"},
  {name:"Smart Watch",section:"electronics"},{name:"Tablet",section:"electronics"},
  {name:"Notebook",section:"stationary"},{name:"Pen",section:"stationary"},{name:"Book",section:"stationary"},
  {name:"Pencil",section:"stationary"},
  {name:"Paracetamol",section:"pharmacy"},{name:"Vitamins",section:"pharmacy"},{name:"Bandage",section:"pharmacy"},
  {name:"First Aid",section:"pharmacy"},{name:"Cough Syrup",section:"pharmacy"},
  {name:"Football",section:"sports"},{name:"Yoga Mat",section:"sports"},{name:"Dumbbells",section:"sports"},
  {name:"Cricket Bat",section:"sports"},{name:"Skipping Rope",section:"sports"},
];

function buildGrid(){
  const g=Array.from({length:ROWS},()=>Array(COLS).fill(CELL.FLOOR));
  for(let c=0;c<COLS;c++){g[0][c]=CELL.WALL;g[ROWS-1][c]=CELL.WALL;}
  for(let r=0;r<ROWS;r++){g[r][0]=CELL.WALL;g[r][COLS-1]=CELL.WALL;}
  SECTIONS.forEach(s=>s.cells.forEach(([c,r])=>{if(r>=0&&r<ROWS&&c>=0&&c<COLS)g[r][c]=CELL.SECTION;}));
  return g;
}

function getSectionAt(c,r){return SECTIONS.find(s=>s.cells.some(([sc,sr])=>sc===c&&sr===r));}

function searchCatalog(q){
  if(!q.trim())return[];
  const lq=q.toLowerCase(),results=[],seen=new Set();
  PRODUCTS.forEach(p=>{
    if(p.name.toLowerCase().includes(lq)){
      const sec=SECTIONS.find(s=>s.id===p.section);
      const k=`p:${p.name}`;
      if(!seen.has(k)){seen.add(k);results.push({type:"product",label:p.name,section:sec});}
    }
  });
  SECTIONS.forEach(sec=>{
    if(sec.name.toLowerCase().includes(lq)||sec.id.includes(lq)){
      const k=`s:${sec.id}`;
      if(!seen.has(k)){seen.add(k);results.push({type:"section",label:sec.name,section:sec});}
    }
  });
  return results.slice(0,7);
}

function aStar(grid,start,goal){
  const[sc,sr]=start,[gc,gr]=goal;
  const R=grid.length,C=grid[0].length;
  const walk=(c,r)=>{
    if(c<0||c>=C||r<0||r>=R)return false;
    const v=grid[r][c];
    return v!==CELL.WALL;
  };
  const key=(c,r)=>`${c},${r}`;
  const open=[{f:Math.abs(sc-gc)+Math.abs(sr-gr),c:sc,r:sr}];
  const g={[key(sc,sr)]:0},came={};
  while(open.length){
    open.sort((a,b)=>a.f-b.f);
    const{c,r}=open.shift();
    if(c===gc&&r===gr){
      const path=[];let cur=key(c,r);
      while(cur){const[cc,cr]=cur.split(",").map(Number);path.unshift([cc,cr]);cur=came[cur];}
      return path;
    }
    for(const[dc,dr]of[[1,0],[-1,0],[0,1],[0,-1]]){
      const nc=c+dc,nr=r+dr;
      if(!walk(nc,nr))continue;
      const t=(g[key(c,r)]||0)+1;
      if(t<(g[key(nc,nr)]??Infinity)){
        came[key(nc,nr)]=key(c,r);g[key(nc,nr)]=t;
        open.push({f:t+Math.abs(nc-gc)+Math.abs(nr-gr),c:nc,r:nr});
      }
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────
export default function StoreNavigator({onBack}){
  const canvasRef=useRef(null);
  const animRef=useRef(null);
  const stRef=useRef({
    grid:buildGrid(),
    playerPos:[4,20],
    destination:null,
    path:null,
    pathAnim:0,
    pulse:0,
    scale:1,
  });

  const[query,setQuery]=useState("");
  const[suggs,setSuggs]=useState([]);
  const[dest,setDest]=useState(null);
  const[arrived,setArrived]=useState(false);
  const[lastSection,setLastSection]=useState(null);
  const[hovSec,setHovSec]=useState(null);

  const draw=useCallback(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext("2d");
    const s=stRef.current;
    const cs=Math.min((canvas.width-16)/COLS,(canvas.height-16)/ROWS)*s.scale;
    const ox=(canvas.width-cs*COLS)/2,oy=(canvas.height-cs*ROWS)/2;
    const tc=(c,r)=>[ox+c*cs,oy+r*cs];

    ctx.fillStyle="#07101c";ctx.fillRect(0,0,canvas.width,canvas.height);

    // dot grid
    for(let r=1;r<ROWS-1;r++)for(let c=1;c<COLS-1;c++){
      if(s.grid[r][c]===CELL.FLOOR){
        const[x,y]=tc(c+0.5,r+0.5);
        ctx.fillStyle="rgba(255,255,255,0.018)";ctx.fillRect(x,y,1,1);
      }
    }

    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        const[x,y]=tc(c,r);
        const ct=s.grid[r][c];
        if(ct===CELL.WALL){
          ctx.fillStyle="#0c1a2b";ctx.fillRect(x,y,cs,cs);
          ctx.fillStyle="rgba(0,0,0,0.4)";ctx.fillRect(x,y,cs,1);ctx.fillRect(x,y,1,cs);
        } else if(ct===CELL.SECTION){
          const sec=getSectionAt(c,r);
          if(sec){
            const isSec=s.destination?.id===sec.id;
            const isHov=hovSec?.id===sec.id;
            let a=isSec?(0.22+0.18*Math.abs(Math.sin(s.pulse*2))):isHov?0.2:0.1;
            ctx.fillStyle=sec.color+Math.round(a*255).toString(16).padStart(2,"0");
            ctx.fillRect(x,y,cs,cs);
            ctx.strokeStyle=sec.color+(isSec?"bb":"33");
            ctx.lineWidth=isSec?1.2:0.4;
            ctx.strokeRect(x+0.5,y+0.5,cs-1,cs-1);
          }
        }
      }
    }

    // labels
    SECTIONS.forEach(sec=>{
      if(cs<7)return;
      const cs2=sec.cells.map(([c])=>c),rs2=sec.cells.map(([,r])=>r);
      const minC=Math.min(...cs2),maxC=Math.max(...cs2),minR=Math.min(...rs2),maxR=Math.max(...rs2);
      const[cx,cy]=tc((minC+maxC+1)/2,(minR+maxR+1)/2);
      const rw=(maxC-minC+1)*cs,rh=(maxR-minR+1)*cs;
      const es=Math.max(6,Math.min(cs*0.85,17));
      ctx.font=`${es}px serif`;ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillText(sec.emoji,cx-rw/2+cs/2,cy-rh/2+cs/2);
      if(cs>14&&rw>38){
        const fs=Math.max(5,Math.min(cs*0.36,10));
        ctx.font=`500 ${fs}px system-ui`;ctx.fillStyle=sec.color;ctx.globalAlpha=0.8;
        const words=sec.name.split(" ");let line="",lines=[];
        words.forEach(w=>{const t=line+(line?" ":"")+w;if(ctx.measureText(t).width>rw-6&&line){lines.push(line);line=w;}else line=t;});
        if(line)lines.push(line);
        const lh=fs+1.5,sy=cy-(lines.length-1)*lh/2+es/2+2;
        lines.forEach((l,i)=>ctx.fillText(l,cx-rw/2+rw/2,sy+i*lh));
        ctx.globalAlpha=1;
      }
    });

    // path
    if(s.path&&s.path.length>1){
      ctx.save();
      // glow halo
      ctx.shadowColor="#00d4ff";ctx.shadowBlur=10;
      ctx.strokeStyle="rgba(0,212,255,0.18)";ctx.lineWidth=cs*0.6;
      ctx.lineCap="round";ctx.lineJoin="round";ctx.setLineDash([]);
      ctx.beginPath();
      s.path.forEach(([c,r],i)=>{const[x,y]=tc(c+0.5,r+0.5);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
      ctx.stroke();
      // animated dashes
      ctx.shadowBlur=14;ctx.strokeStyle="#00d4ff";ctx.lineWidth=Math.max(1.5,cs*0.2);
      ctx.setLineDash([cs*0.5,cs*0.28]);ctx.lineDashOffset=-s.pathAnim*(cs/11);
      ctx.beginPath();
      s.path.forEach(([c,r],i)=>{const[x,y]=tc(c+0.5,r+0.5);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
      ctx.stroke();
      // white center
      ctx.shadowBlur=0;ctx.strokeStyle="rgba(255,255,255,0.65)";ctx.lineWidth=Math.max(0.7,cs*0.06);
      ctx.setLineDash([cs*0.28,cs*0.5]);ctx.lineDashOffset=-s.pathAnim*(cs/7);
      ctx.beginPath();
      s.path.forEach(([c,r],i)=>{const[x,y]=tc(c+0.5,r+0.5);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
      ctx.stroke();
      ctx.restore();

      // destination pin
      if(s.destination){
        const[gc,gr]=s.destination.nav;
        const[px,py]=tc(gc+0.5,gr+0.5);
        const sz=Math.max(5,cs*0.5);
        ctx.save();ctx.shadowColor=s.destination.color;ctx.shadowBlur=20;
        ctx.fillStyle=s.destination.color;
        ctx.beginPath();ctx.arc(px,py-sz*0.55,sz*0.42,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.moveTo(px-sz*0.35,py-sz*0.55);ctx.lineTo(px+sz*0.35,py-sz*0.55);ctx.lineTo(px,py+sz*0.1);ctx.closePath();ctx.fill();
        ctx.restore();
      }
    }

    // player
    const[pc,pr]=s.playerPos;
    const[plx,ply]=tc(pc+0.5,pr+0.5);
    const pr2=Math.max(4,cs*0.34);
    const p2=0.5+0.5*Math.abs(Math.sin(s.pulse*2));
    ctx.save();
    ctx.shadowColor="#22c55e";ctx.shadowBlur=20*p2;
    ctx.beginPath();ctx.arc(plx,ply,pr2*1.9,0,Math.PI*2);
    ctx.strokeStyle=`rgba(34,197,94,${0.12*p2})`;ctx.lineWidth=1.5;ctx.stroke();
    ctx.beginPath();ctx.arc(plx,ply,pr2*1.35,0,Math.PI*2);
    ctx.strokeStyle=`rgba(34,197,94,${0.25*p2})`;ctx.lineWidth=1;ctx.stroke();
    const gg=ctx.createRadialGradient(plx-pr2*0.3,ply-pr2*0.3,0,plx,ply,pr2);
    gg.addColorStop(0,"#86efac");gg.addColorStop(1,"#15803d");
    ctx.fillStyle=gg;ctx.beginPath();ctx.arc(plx,ply,pr2,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,0.75)";ctx.lineWidth=1;ctx.stroke();
    if(cs>12){
      ctx.font=`bold ${Math.max(5,cs*0.24)}px system-ui`;
      ctx.fillStyle="#fff";ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.shadowBlur=0;ctx.fillText("YOU",plx,ply);
    }
    ctx.restore();
  },[hovSec]);

  const startAnim=useCallback(()=>{
    if(animRef.current)return;
    const tick=()=>{
      stRef.current.pathAnim=(stRef.current.pathAnim+0.55)%40;
      stRef.current.pulse+=0.04;
      draw();
      animRef.current=requestAnimationFrame(tick);
    };
    animRef.current=requestAnimationFrame(tick);
  },[draw]);

  const stopAnim=useCallback(()=>{
    if(animRef.current){cancelAnimationFrame(animRef.current);animRef.current=null;}
    draw();
  },[draw]);

  useEffect(()=>{
    const resize=()=>{
      const c=canvasRef.current;if(!c)return;
      c.width=c.parentElement.clientWidth;
      c.height=c.parentElement.clientHeight;
      draw();
    };
    resize();
    window.addEventListener("resize",resize);
    return()=>window.removeEventListener("resize",resize);
  },[draw]);

  useEffect(()=>{draw();},[draw,hovSec]);

  // ── Navigate — ALWAYS from current player position ───
  const navigateTo=useCallback((section,label)=>{
    const path=aStar(stRef.current.grid,stRef.current.playerPos,section.nav);
    stRef.current.destination=section;
    stRef.current.path=path;
    setDest({section,label:label||section.name});
    setArrived(false);
    setQuery(label||section.name);
    setSuggs([]);
    startAnim();
  },[startAnim]);

  // ── Arrived — teleport player dot to destination ─────
  const markArrived=useCallback(()=>{
    if(!stRef.current.destination)return;
    const sec=stRef.current.destination;
    stRef.current.playerPos=[...sec.nav]; // ← player moves to current section
    stRef.current.destination=null;
    stRef.current.path=null;
    setLastSection(sec);
    setDest(null);
    setArrived(true);
    setQuery("");
    stopAnim();
    setTimeout(()=>setArrived(false),3500);
  },[stopAnim]);

  const clearNav=useCallback(()=>{
    stRef.current.destination=null;
    stRef.current.path=null;
    setDest(null);setQuery("");setSuggs([]);setArrived(false);
    stopAnim();
  },[stopAnim]);

  const handleSearch=e=>{
    const v=e.target.value;setQuery(v);
    setSuggs(v.trim()?searchCatalog(v):[]);
  };

  const getCell=e=>{
    const canvas=canvasRef.current,rect=canvas.getBoundingClientRect(),s=stRef.current;
    const cs=Math.min((canvas.width-16)/COLS,(canvas.height-16)/ROWS)*s.scale;
    const ox=(canvas.width-cs*COLS)/2,oy=(canvas.height-cs*ROWS)/2;
    const c=Math.floor((e.clientX-rect.left-ox)/cs),r=Math.floor((e.clientY-rect.top-oy)/cs);
    if(c>=0&&c<COLS&&r>=0&&r<ROWS)return{c,r,sec:getSectionAt(c,r)};
    return null;
  };

  const onMouseMove=e=>{const cell=getCell(e);setHovSec(cell?.sec||null);};
  const onMouseLeave=()=>setHovSec(null);
  const onClick=e=>{const cell=getCell(e);if(cell?.sec&&cell.sec.id!=="entrance")navigateTo(cell.sec);};
  const onWheel=e=>{e.preventDefault();stRef.current.scale=Math.min(3,Math.max(0.5,stRef.current.scale*(e.deltaY<0?1.12:0.9)));draw();};

  return(
    <div style={S.root}>
      <div style={S.canvasWrap}>
        <canvas ref={canvasRef} style={S.canvas}
          onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
          onClick={onClick} onWheel={onWheel}
        />
      </div>

      {/* ── Top search bar ── */}
      <div style={S.topBar}>
        {onBack&&<button style={S.backBtn} onClick={onBack}>← Back</button>}
        <div style={S.searchRow}>
          <div style={S.searchBox}>
            <span style={{opacity:0.4,fontSize:"0.95rem"}}>🔍</span>
            <input
              style={S.searchInput}
              value={query}
              onChange={handleSearch}
              onFocus={()=>query.trim()&&setSuggs(searchCatalog(query))}
              placeholder="Search a product or aisle…"
              autoComplete="off"
            />
            {query&&<button style={S.xBtn} onClick={clearNav}>✕</button>}
          </div>
          {suggs.length>0&&(
            <div style={S.dropdown}>
              {suggs.map((r,i)=>(
                <div key={i} style={S.suggRow}
                  onClick={()=>navigateTo(r.section,r.label)}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                >
                  <span style={{fontSize:"1.05rem"}}>{r.section.emoji}</span>
                  <div>
                    <div style={{fontSize:"0.87rem",fontWeight:500,color:"#f1f5f9"}}>{r.label}</div>
                    <div style={{fontSize:"0.7rem",color:"#475569"}}>{r.section.aisle}</div>
                  </div>
                  <span style={{marginLeft:"auto",color:"#00d4ff",fontSize:"0.75rem",flexShrink:0}}>→</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom navigation card ── */}
      {dest&&!arrived&&(
        <div style={S.navCard}>
          <div style={S.navCardInner}>
            <div style={S.navFrom}>
              {lastSection
                ? <><span style={{color:lastSection.color}}>{lastSection.emoji} {lastSection.name}</span> → </>
                : <>🚪 Entrance → </>
              }
            </div>
            <div style={S.navTo}>
              <span style={{color:dest.section.color,fontSize:"1.2rem",marginRight:6}}>{dest.section.emoji}</span>
              <div>
                <div style={S.navLabel}>{dest.label}</div>
                <div style={S.navAisle}>{dest.section.aisle}</div>
              </div>
            </div>
          </div>
          <div style={S.navActions}>
            <button style={S.arrivedBtn} onClick={markArrived}>✓ I'm here</button>
            <button style={S.cancelBtn} onClick={clearNav}>✕</button>
          </div>
        </div>
      )}

      {/* ── Arrived toast ── */}
      {arrived&&(
        <div style={S.toast}>
          <span style={{fontSize:"1.1rem"}}>✓</span>
          You arrived at {lastSection?.name}! Search for your next item.
        </div>
      )}

      {/* ── Minimal legend ── */}
      <div style={S.legend}>
        <LegDot color="#22c55e" label="You"/>
        <LegDot color="#00d4ff" label="Route" square/>
        <LegDot color="#f59e0b" label="Destination"/>
      </div>

      {/* ── Zoom ── */}
      <div style={S.zoom}>
        <ZBtn onClick={()=>{stRef.current.scale=Math.min(3,stRef.current.scale*1.18);draw();}}>＋</ZBtn>
        <ZBtn onClick={()=>{stRef.current.scale=Math.max(0.4,stRef.current.scale*0.85);draw();}}>－</ZBtn>
        <ZBtn onClick={()=>{stRef.current.scale=1;draw();}}>⌖</ZBtn>
      </div>
    </div>
  );
}

const LegDot=({color,label,square})=>(
  <div style={{display:"flex",alignItems:"center",gap:6,fontSize:"0.7rem",color:"#475569"}}>
    <span style={{width:9,height:9,borderRadius:square?2:"50%",background:color,display:"inline-block",flexShrink:0}}/>
    {label}
  </div>
);

const ZBtn=({onClick,children})=>(
  <button onClick={onClick} style={S.zBtn}>{children}</button>
);

const S={
  root:{position:"relative",width:"100%",height:"100vh",overflow:"hidden",background:"#07101c",fontFamily:"system-ui,sans-serif"},
  canvasWrap:{position:"absolute",inset:0},
  canvas:{display:"block",width:"100%",height:"100%",cursor:"crosshair"},

  topBar:{position:"absolute",top:16,left:"50%",transform:"translateX(-50%)",width:"min(500px,88vw)",zIndex:20,display:"flex",flexDirection:"column",gap:8,alignItems:"stretch"},
  backBtn:{alignSelf:"flex-start",background:"rgba(7,16,28,0.88)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:9,color:"#64748b",fontSize:"0.82rem",padding:"7px 13px",cursor:"pointer",backdropFilter:"blur(12px)",letterSpacing:"0.02em"},
  searchRow:{display:"flex",flexDirection:"column",gap:0},
  searchBox:{display:"flex",alignItems:"center",gap:10,background:"rgba(7,16,28,0.92)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:13,padding:"11px 16px",backdropFilter:"blur(20px)",boxShadow:"0 8px 40px rgba(0,0,0,0.55)"},
  searchInput:{flex:1,background:"none",border:"none",outline:"none",color:"#f1f5f9",fontSize:"0.93rem"},
  xBtn:{background:"none",border:"none",color:"#334155",cursor:"pointer",fontSize:"0.82rem",padding:"0 2px"},
  dropdown:{background:"rgba(7,16,28,0.96)",border:"1px solid rgba(255,255,255,0.07)",borderTop:"none",borderRadius:"0 0 12px 12px",overflow:"hidden",backdropFilter:"blur(20px)",boxShadow:"0 20px 50px rgba(0,0,0,0.65)"},
  suggRow:{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.03)",transition:"background 0.12s"},

  navCard:{position:"absolute",bottom:20,left:"50%",transform:"translateX(-50%)",width:"min(460px,86vw)",background:"rgba(7,16,28,0.93)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,backdropFilter:"blur(24px)",boxShadow:"0 -2px 40px rgba(0,0,0,0.5)",zIndex:20},
  navCardInner:{flex:1,minWidth:0},
  navFrom:{fontSize:"0.68rem",color:"#334155",marginBottom:4,letterSpacing:"0.03em"},
  navTo:{display:"flex",alignItems:"center"},
  navLabel:{fontSize:"0.98rem",fontWeight:700,color:"#f1f5f9",lineHeight:1.2},
  navAisle:{fontSize:"0.72rem",color:"#475569",marginTop:1},
  navActions:{display:"flex",gap:7,flexShrink:0},
  arrivedBtn:{background:"#22c55e",border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:"0.85rem",padding:"10px 16px",cursor:"pointer",boxShadow:"0 0 18px rgba(34,197,94,0.35)",whiteSpace:"nowrap"},
  cancelBtn:{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,color:"#475569",fontSize:"0.85rem",padding:"10px 12px",cursor:"pointer"},

  toast:{position:"absolute",bottom:20,left:"50%",transform:"translateX(-50%)",background:"rgba(20,50,30,0.92)",border:"1px solid rgba(34,197,94,0.35)",borderRadius:12,color:"#86efac",padding:"12px 20px",fontSize:"0.87rem",fontWeight:500,backdropFilter:"blur(14px)",zIndex:20,display:"flex",alignItems:"center",gap:8,whiteSpace:"nowrap",boxShadow:"0 0 30px rgba(34,197,94,0.15)"},

  legend:{position:"absolute",bottom:20,left:16,display:"flex",flexDirection:"column",gap:5,background:"rgba(7,16,28,0.78)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:9,padding:"9px 11px",backdropFilter:"blur(10px)"},

  zoom:{position:"absolute",bottom:20,right:16,display:"flex",flexDirection:"column",gap:5},
  zBtn:{width:36,height:36,background:"rgba(7,16,28,0.82)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:"#64748b",fontSize:"1rem",cursor:"pointer",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center"},
};

