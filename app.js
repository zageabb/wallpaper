const $=s=>document.querySelector(s),stage=$("#stage"),svg=$("#overlay"),bg=$("#bg"),group=$("#paths"),regionGroup=$("#regions"),particleGroup=$("#particles");
let project={version:4,background:null,loopSeconds:15,routes:[],regions:[]},draft=[],playing=false,raf=0,start=0,regionMode=false,regionDraft=[],manualTime=0;
const NS="http://www.w3.org/2000/svg", clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const normPoint=e=>{const r=svg.getBoundingClientRect();return [clamp((e.clientX-r.left)/r.width,0,1),clamp((e.clientY-r.top)/r.height,0,1)]};
const svgPts=pts=>pts.map(([x,y])=>`${x*1000},${y*562.5}`).join(" ");
const regionPoints=r=>r.points||(r.box?[[r.box[0],r.box[1]],[r.box[0]+r.box[2],r.box[1]],[r.box[0]+r.box[2],r.box[1]+r.box[3]],[r.box[0],r.box[1]+r.box[3]]]:[]);
const quadPoint=(r,u,v)=>{const p=regionPoints(r),a=p[0],b=p[1],d=p[2],e=p[3];return [((1-u)*(1-v)*a[0]+u*(1-v)*b[0]+u*v*d[0]+(1-u)*v*e[0])*1000,((1-u)*(1-v)*a[1]+u*(1-v)*b[1]+u*v*d[1]+(1-u)*v*e[1])*562.5]};
const quadSvg=(r,uvs)=>uvs.map(([u,v])=>quadPoint(r,u,v).join(",")).join(" ");
const ringPts=(r,cx,cy,rx,ry,n=40)=>Array.from({length:n+1},(_,i)=>{const a=i/n*Math.PI*2;return quadPoint(r,cx+Math.cos(a)*rx,cy+Math.sin(a)*ry)});
const el=(tag,attrs={})=>{const n=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));return n};
function routePath(r,cls,width,opacity=1){return el("polyline",{points:svgPts(r.points),class:cls,stroke:r.colour,"stroke-width":width,opacity})}
function draw(){
 group.innerHTML="";regionGroup.innerHTML="";particleGroup.innerHTML="";
 project.routes.forEach((r,i)=>{
  group.append(routePath(r,"route-bed",r.width*1.15));group.append(routePath(r,"flow-glow",r.width*3,0));group.append(routePath(r,"flow-core",Math.max(1,r.width*.38),0));
  for(let k=0;k<r.packets;k++){const c=el("circle",{r:Math.max(2,r.width*.65),fill:r.colour,class:"energy-packet",opacity:0});c.dataset.route=i;c.dataset.packet=k;particleGroup.append(c)}
 });
 project.regions.forEach((r,i)=>{const g=el("g",{"data-region":i});g.append(el("polygon",{points:svgPts(regionPoints(r)),class:"screen-region"}));regionGroup.append(g)});
 $("#draft").setAttribute("points",svgPts(regionMode?regionDraft:draft));
 $("#routes").innerHTML=project.routes.map((r,i)=>`<div class="route"><i class="swatch" style="background:${r.colour}"></i><span>${r.name}<small>${r.startTime.toFixed(1)}s + ${r.duration.toFixed(1)}s · ${r.speed.toFixed(1)}× · ${r.packets} packets</small></span><button data-del="${i}">×</button></div>`).join("");
 $("#regionList").innerHTML=project.regions.map((r,i)=>{const w=regionWindow(r);return `<div class="region-item"><span>${r.type}<small>${r.wakeMode==="route"?"route arrival":"timeline"} · ${w[0].toFixed(1)}s–${w[1].toFixed(1)}s</small></span><button data-rdel="${i}">×</button></div>`}).join("");
 $("#triggerRoute").innerHTML=`<option value="">None</option>`+project.routes.map((r,i)=>`<option value="${i}">${r.name}</option>`).join("");
 renderAt(manualTime);
}
function regionWindow(r){if(r.wakeMode==="route"){const route=project.routes.find(x=>x.id===r.triggerRouteId);if(route){const arrival=route.startTime+route.duration;return [arrival,Math.min(project.loopSeconds-.25,arrival+Math.max(.5,r.hold||3))]}}return [r.wake,r.sleep]}
function activity(t,on,off){if(off<=on)return 0;if(t<on||t>off)return 0;const fade=Math.min(.5,(off-on)/3);return Math.min(1,(t-on)/fade,(off-t)/fade)}
function renderRegion(g,r,t){
 const [wake,sleep]=regionWindow(r),a=activity(t,wake,sleep);
 g.firstChild.setAttribute("class","screen-region"+(a>.05?" active":""));while(g.children.length>1)g.lastChild.remove();if(a<=0)return;
 const content=el("g",{class:"region-content",opacity:a}), colour=r.colour||"#00b7ff", line=(uvs,attrs={})=>el("polyline",{points:quadSvg(r,uvs),fill:"none",...attrs});
 if(r.type==="bars"){for(let i=0;i<5;i++){const x=.12+i*.16,bh=.2+.055*((i*37+3)%10);content.append(el("polygon",{points:quadSvg(r,[[x,.82],[x+.1,.82],[x+.1,.82-bh],[x,.82-bh]]),fill:colour}))}}
 else if(r.type==="line"){const pts=[];for(let i=0;i<7;i++)pts.push([.08+i*.14,.7-.045*((i*29+2)%10)]);content.append(line(pts,{stroke:colour,"stroke-width":2}));}
 else if(r.type==="area"){const pts=[];for(let i=0;i<7;i++)pts.push([.06+i*.15,.72-.042*((i*31+4)%10)]);content.append(el("polygon",{points:quadSvg(r,[[.06,.82],...pts,[.96,.82]]),fill:colour,"fill-opacity":.24}));content.append(line(pts,{stroke:colour,"stroke-width":2}));}
 else if(r.type==="donut"){const p=.68+.12*Math.sin((t-wake)*.8),outer=ringPts(r,.5,.5,.28,.28),active=outer.slice(0,Math.max(2,Math.floor((outer.length-1)*p)+1));content.append(el("polyline",{points:outer.map(q=>q.join(",")).join(" "),fill:"none",stroke:"#29465c","stroke-width":7}));content.append(el("polyline",{points:active.map(q=>q.join(",")).join(" "),fill:"none",stroke:colour,"stroke-width":7,"stroke-linecap":"round"}));}
 else if(r.type==="map"){for(let i=0;i<6;i++){const [cx,cy]=quadPoint(r,.15+((i*37)%70)/100,.2+((i*53)%60)/100),rr=2.5+1.2*Math.sin(t*2+i);content.append(el("circle",{cx,cy,r:rr,fill:colour,opacity:.65+.3*Math.sin(t*2+i)}))}}
 else if(r.type==="ai"){for(let i=0;i<3;i++){const rr=.34*((((t-wake)*.35+i/3)%1)),pts=ringPts(r,.5,.5,Math.max(.02,rr),Math.max(.02,rr));content.append(el("polyline",{points:pts.map(q=>q.join(",")).join(" "),fill:"none",stroke:colour,"stroke-width":1.5,opacity:1-rr/.34}))}const [cx,cy]=quadPoint(r,.5,.5);content.append(el("circle",{cx,cy,r:4,fill:colour}))}
 else{const [cx,cy]=quadPoint(r,.5,.58),p=regionPoints(r),dx=(p[1][0]-p[0][0])*1000,dy=(p[1][1]-p[0][1])*562.5,angle=Math.atan2(dy,dx)*180/Math.PI,tx=el("text",{x:cx,y:cy,"text-anchor":"middle",fill:"#e8f5ff","font-size":28,"font-family":"system-ui",transform:`rotate(${angle} ${cx} ${cy})`});tx.textContent=Math.round(72+18*Math.sin((t-wake)*1.3))+"%";content.append(tx)}
 g.append(content);
}
function renderAt(t){
 manualTime=((t%project.loopSeconds)+project.loopSeconds)%project.loopSeconds;$("#scrub").value=manualTime;$("#timeOut").textContent=manualTime.toFixed(2)+"s";
 [...group.children].forEach((node,idx)=>{const r=project.routes[Math.floor(idx/3)],kind=idx%3,a=activity(manualTime,r.startTime,Math.min(project.loopSeconds-.25,r.startTime+r.duration+.5));if(kind===1)node.setAttribute("opacity",a*.12*(r.brightness/100));if(kind===2)node.setAttribute("opacity",a*.72*(r.brightness/100))});
 [...particleGroup.children].forEach(c=>{const r=project.routes[+c.dataset.route],path=group.children[(+c.dataset.route)*3+2],len=path.getTotalLength(),elapsed=manualTime-r.startTime,phase=+c.dataset.packet*Math.min(.12,.45/Math.max(1,r.packets-1)),travel=Math.max(.01,r.duration),p=elapsed/travel-phase,visible=p>=0&&p<=1;if(r.reverse)p=1-p;const q=path.getPointAtLength(clamp(p,0,1)*len);c.setAttribute("cx",q.x);c.setAttribute("cy",q.y);c.setAttribute("opacity",visible?(r.brightness/100):0)});
 [...regionGroup.children].forEach((g,i)=>renderRegion(g,project.regions[i],manualTime));
}
function animate(t){if(!playing)return;if(!start)start=t-manualTime*1000;renderAt(((t-start)/1000)%project.loopSeconds);raf=requestAnimationFrame(animate)}
function finish(){if(draft.length<2)return;const tail=.5,minTravel=.5,maxStart=project.loopSeconds-.25-tail-minTravel,startTime=Math.min(+$("#startTime").value,maxStart),duration=Math.min(Math.max(minTravel,+$("#duration").value),project.loopSeconds-.25-tail-startTime);project.routes.push({id:crypto.randomUUID(),name:$("#name").value||`Flow ${project.routes.length+1}`,colour:$("#colour").value,speed:+$("#speed").value,width:+$("#width").value,brightness:+$("#brightness").value,packets:+$("#packetsCount").value,reverse:$("#reverse").checked,startTime,duration,points:[...draft]});draft=[];$("#name").value=`Flow ${project.routes.length+1}`;draw()}
svg.addEventListener("click",e=>{if(regionMode){regionDraft.push(normPoint(e));draw();if(regionDraft.length<4){$("#regionMode").textContent=`Screen corners ${regionDraft.length}/4…`;return}const routeIndex=$("#triggerRoute").value===""?null:+$("#triggerRoute").value,route=routeIndex===null?null:project.routes[routeIndex];project.regions.push({id:crypto.randomUUID(),type:$("#regionType").value,colour:$("#regionColour").value,wakeMode:$("#wakeMode").value==="route"&&route?"route":"time",triggerRouteId:route?.id||null,wake:+$("#wakeTime").value,sleep:Math.max(+$("#wakeTime").value+.5,+$("#sleepTime").value),hold:3,points:[...regionDraft]});regionDraft=[];regionMode=false;$("#regionMode").textContent="Add screen region";draw();return}draft.push(normPoint(e));draw()});
svg.addEventListener("dblclick",e=>{if(!regionMode){e.preventDefault();finish()}});
$("#finish").onclick=finish;$("#newRoute").onclick=()=>{draft=[];draw()};$("#undo").onclick=()=>{draft.pop();draw()};
$("#regionMode").onclick=()=>{regionMode=true;regionDraft=[];draft=[];$("#regionMode").textContent="Screen corners 0/4…";draw()};$("#cancelRegion").onclick=()=>{regionMode=false;regionDraft=[];$("#regionMode").textContent="Add screen region";draw()};
$("#preview").onclick=()=>{playing=!playing;stage.classList.toggle("playing",playing);$("#preview").textContent=playing?"Stop preview":"Preview";if(playing){start=0;raf=requestAnimationFrame(animate)}else cancelAnimationFrame(raf)};
$("#routes").onclick=e=>{if(e.target.dataset.del!==undefined){const deleted=+e.target.dataset.del;const deletedRoute=project.routes[deleted];project.routes.splice(deleted,1);project.regions.forEach(r=>{if(r.wakeMode==="route"&&r.triggerRouteId===deletedRoute?.id){r.wakeMode="time";r.triggerRouteId=null}});draw()}};
$("#regionList").onclick=e=>{if(e.target.dataset.rdel!==undefined){project.regions.splice(+e.target.dataset.rdel,1);draw()}};
$("#scrub").oninput=e=>{if(playing){playing=false;cancelAnimationFrame(raf);$("#preview").textContent="Preview"}renderAt(+e.target.value)};
function loopIssues(){
 const issues=[];
 project.routes.forEach((r,i)=>{if(r.startTime<0||r.startTime+r.duration+.5>project.loopSeconds-.25)issues.push(`Route ${i+1} is active at loop boundary`)});
 project.regions.forEach((r,i)=>{const w=regionWindow(r);if(w[0]<0||w[1]>project.loopSeconds-.25||w[1]<=w[0])issues.push(`Region ${i+1} has an invalid wake window`)});
 return issues;
}
$("#verifyLoop").onclick=()=>{const issues=loopIssues(),s=$("#loopStatus");s.className="status "+(issues.length?"bad":"ok");s.textContent=issues.length?issues.join(" · "):"Verified: all configured activity is dormant before 15.00s";renderAt(0)};
$("#resetTime").onclick=()=>renderAt(0);
const step=d=>{if(playing){playing=false;cancelAnimationFrame(raf);$("#preview").textContent="Preview"}renderAt(manualTime+d/30)};$("#stepBack").onclick=()=>step(-1);$("#stepForward").onclick=()=>step(1);
$("#file").onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{project.background=rd.result;bg.src=rd.result;$("#empty").style.display="none"};rd.readAsDataURL(f)};
[["speed","speedOut",v=>(+v).toFixed(1)+"×"],["width","widthOut",v=>v],["brightness","brightnessOut",v=>v+"%"],["packetsCount","packetsOut",v=>v],["startTime","startOut",v=>(+v).toFixed(1)+"s"],["duration","durationOut",v=>(+v).toFixed(1)+"s"],["wakeTime","wakeOut",v=>(+v).toFixed(1)+"s"],["sleepTime","sleepOut",v=>(+v).toFixed(1)+"s"]].forEach(([id,out,fmt])=>$("#"+id).oninput=e=>$("#"+out).value=fmt(e.target.value));
$("#save").onclick=()=>{const clean={...project,background:null};const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(clean,null,2)],{type:"application/json"}));a.download="wallpaper-project.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
$("#loadProject").onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{const p=JSON.parse(rd.result);const routes=(p.routes||[]).map(r=>({brightness:80,packets:4,reverse:false,startTime:0,duration:6,...r,id:r.id||crypto.randomUUID()}));
const regions=(p.regions||[]).map(r=>{const legacyRoute=Number.isInteger(r.triggerRoute)?routes[r.triggerRoute]:null;return {wakeMode:"time",triggerRouteId:null,hold:3,...r,id:r.id||crypto.randomUUID(),triggerRouteId:r.triggerRouteId||legacyRoute?.id||null,points:r.points||regionPoints(r)}});
project={...project,...p,background:project.background,routes,regions,version:4};draw()};rd.readAsText(f)};
draw();