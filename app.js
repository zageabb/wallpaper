const $=s=>document.querySelector(s),stage=$("#stage"),svg=$("#overlay"),bg=$("#bg"),group=$("#paths"),regionGroup=$("#regions"),particleGroup=$("#particles");
let project={version:3,background:null,loopSeconds:15,routes:[],regions:[]},draft=[],playing=false,raf=0,start=0,regionMode=false,regionStart=null,manualTime=0;
const NS="http://www.w3.org/2000/svg", clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const normPoint=e=>{const r=svg.getBoundingClientRect();return [clamp((e.clientX-r.left)/r.width,0,1),clamp((e.clientY-r.top)/r.height,0,1)]};
const svgPts=pts=>pts.map(([x,y])=>`${x*1000},${y*562.5}`).join(" ");
const el=(tag,attrs={})=>{const n=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));return n};
function routePath(r,cls,width,opacity=1){return el("polyline",{points:svgPts(r.points),class:cls,stroke:r.colour,"stroke-width":width,opacity})}
function draw(){
 group.innerHTML="";regionGroup.innerHTML="";particleGroup.innerHTML="";
 project.routes.forEach((r,i)=>{
  group.append(routePath(r,"route-bed",r.width*1.15));group.append(routePath(r,"flow-glow",r.width*3,0));group.append(routePath(r,"flow-core",Math.max(1,r.width*.38),0));
  for(let k=0;k<r.packets;k++){const c=el("circle",{r:Math.max(2,r.width*.65),fill:r.colour,class:"energy-packet",opacity:0});c.dataset.route=i;c.dataset.packet=k;particleGroup.append(c)}
 });
 project.regions.forEach((r,i)=>{const [x,y,w,h]=r.box;const g=el("g",{"data-region":i});g.append(el("rect",{x:x*1000,y:y*562.5,width:w*1000,height:h*562.5,rx:4,class:"screen-region"}));regionGroup.append(g)});
 $("#draft").setAttribute("points",svgPts(draft));
 $("#routes").innerHTML=project.routes.map((r,i)=>`<div class="route"><i class="swatch" style="background:${r.colour}"></i><span>${r.name}<small>${r.startTime.toFixed(1)}s + ${r.duration.toFixed(1)}s · ${r.speed.toFixed(1)}× · ${r.packets} packets</small></span><button data-del="${i}">×</button></div>`).join("");
 $("#regionList").innerHTML=project.regions.map((r,i)=>{const w=regionWindow(r);return `<div class="region-item"><span>${r.type}<small>${r.wakeMode==="route"?"route arrival":"timeline"} · ${w[0].toFixed(1)}s–${w[1].toFixed(1)}s</small></span><button data-rdel="${i}">×</button></div>`}).join("");
 $("#triggerRoute").innerHTML=`<option value="">None</option>`+project.routes.map((r,i)=>`<option value="${i}">${r.name}</option>`).join("");
 renderAt(manualTime);
}
function regionWindow(r){if(r.wakeMode==="route"&&Number.isInteger(r.triggerRoute)){const route=project.routes[r.triggerRoute];if(route){const arrival=route.startTime+route.duration*.82;return [arrival,Math.min(project.loopSeconds-.25,arrival+Math.max(1,r.hold||3))]}}return [r.wake,r.sleep]}
function activity(t,on,off){if(off<=on)return 0;if(t<on||t>off)return 0;const fade=Math.min(.5,(off-on)/3);return Math.min(1,(t-on)/fade,(off-t)/fade)}
function renderRegion(g,r,t){
 const a=activity(t,r.wake,r.sleep),box=r.box,x=box[0]*1000,y=box[1]*562.5,w=box[2]*1000,h=box[3]*562.5;
 g.firstChild.setAttribute("class","screen-region"+(a>.05?" active":""));while(g.children.length>1)g.lastChild.remove();if(a<=0)return;
 const content=el("g",{class:"region-content",opacity:a}), colour=r.colour||"#00b7ff";
 if(r.type==="bars"){for(let i=0;i<5;i++){const bw=w*.1,gap=w*.06,bh=h*(.2+.55*((i*37+3)%10)/10);content.append(el("rect",{x:x+w*.12+i*(bw+gap),y:y+h*.82-bh,width:bw,height:bh,rx:2,fill:colour}))}}
 else if(r.type==="line"){const pts=[];for(let i=0;i<7;i++)pts.push([x+w*(.08+i*.14),y+h*(.7-.45*((i*29+2)%10)/10)]);content.append(el("polyline",{points:pts.map(p=>p.join(",")).join(" "),fill:"none",stroke:colour,"stroke-width":2}));}
 else if(r.type==="area"){const pts=[];for(let i=0;i<7;i++)pts.push([x+w*(.06+i*.15),y+h*(.72-.42*((i*31+4)%10)/10)]);const poly=[[x+w*.06,y+h*.82],...pts,[x+w*.96,y+h*.82]];content.append(el("polygon",{points:poly.map(p=>p.join(",")).join(" "),fill:colour,"fill-opacity":.24}));content.append(el("polyline",{points:pts.map(p=>p.join(",")).join(" "),fill:"none",stroke:colour,"stroke-width":2}));}
 else if(r.type==="donut"){const radius=Math.min(w,h)*.28,cx=x+w/2,cy=y+h/2,circ=2*Math.PI*radius,p=.68+.12*Math.sin((t-wake)*.8);content.append(el("circle",{cx,cy,r:radius,fill:"none",stroke:"#29465c","stroke-width":Math.max(3,radius*.22)}));content.append(el("circle",{cx,cy,r:radius,fill:"none",stroke:colour,"stroke-width":Math.max(3,radius*.22),"stroke-dasharray":`${circ*p} ${circ}`,"stroke-linecap":"round",transform:`rotate(-90 ${cx} ${cy})`}));}
 else if(r.type==="map"){for(let i=0;i<6;i++){const cx=x+w*(.15+((i*37)%70)/100),cy=y+h*(.2+((i*53)%60)/100),rr=Math.max(2,Math.min(w,h)*(.025+.012*Math.sin(t*2+i)));content.append(el("circle",{cx,cy,r:rr,fill:colour,opacity:.65+.3*Math.sin(t*2+i)}))}}
 else if(r.type==="ai"){const cx=x+w/2,cy=y+h/2,maxR=Math.min(w,h)*.34;for(let i=0;i<3;i++){const rr=maxR*((((t-wake)*.35+i/3)%1));content.append(el("circle",{cx,cy,r:Math.max(2,rr),fill:"none",stroke:colour,"stroke-width":1.5,opacity:1-rr/maxR}))}content.append(el("circle",{cx,cy,r:Math.max(3,maxR*.14),fill:colour}))}
 else{const tx=el("text",{x:x+w/2,y:y+h*.62,"text-anchor":"middle",fill:"#e8f5ff","font-size":Math.max(12,h*.35),"font-family":"system-ui"});tx.textContent=Math.round(72+18*Math.sin((t-wake)*1.3))+"%";content.append(tx)}
 g.append(content);
}
function renderAt(t){
 manualTime=((t%project.loopSeconds)+project.loopSeconds)%project.loopSeconds;$("#scrub").value=manualTime;$("#timeOut").textContent=manualTime.toFixed(2)+"s";
 [...group.children].forEach((node,idx)=>{const r=project.routes[Math.floor(idx/3)],kind=idx%3,a=activity(manualTime,r.startTime,r.startTime+r.duration);if(kind===1)node.setAttribute("opacity",a*.12*(r.brightness/100));if(kind===2)node.setAttribute("opacity",a*.72*(r.brightness/100))});
 [...particleGroup.children].forEach(c=>{const r=project.routes[+c.dataset.route],a=activity(manualTime,r.startTime,r.startTime+r.duration),path=group.children[(+c.dataset.route)*3+2],len=path.getTotalLength(),phase=+c.dataset.packet/r.packets;let local=Math.max(0,manualTime-r.startTime),p=((local*r.speed/6)+phase)%1;if(r.reverse)p=1-p;const q=path.getPointAtLength(p*len);c.setAttribute("cx",q.x);c.setAttribute("cy",q.y);c.setAttribute("opacity",a*(r.brightness/100))});
 [...regionGroup.children].forEach((g,i)=>renderRegion(g,project.regions[i],manualTime));
}
function animate(t){if(!playing)return;if(!start)start=t-manualTime*1000;renderAt(((t-start)/1000)%project.loopSeconds);raf=requestAnimationFrame(animate)}
function finish(){if(draft.length<2)return;project.routes.push({name:$("#name").value||`Flow ${project.routes.length+1}`,colour:$("#colour").value,speed:+$("#speed").value,width:+$("#width").value,brightness:+$("#brightness").value,packets:+$("#packetsCount").value,reverse:$("#reverse").checked,startTime:+$("#startTime").value,duration:+$("#duration").value,points:[...draft]});draft=[];$("#name").value=`Flow ${project.routes.length+1}`;draw()}
svg.addEventListener("click",e=>{if(regionMode){const p=normPoint(e);if(!regionStart){regionStart=p;return}const x=Math.min(regionStart[0],p[0]),y=Math.min(regionStart[1],p[1]),w=Math.abs(p[0]-regionStart[0]),h=Math.abs(p[1]-regionStart[1]);if(w>.01&&h>.01)project.regions.push({type:$("#regionType").value,colour:$("#regionColour").value,wakeMode:$("#wakeMode").value,triggerRoute:$("#triggerRoute").value===""?null:+$("#triggerRoute").value,wake:+$("#wakeTime").value,sleep:+$("#sleepTime").value,hold:3,box:[x,y,w,h]});regionStart=null;regionMode=false;$("#regionMode").textContent="Add screen region";draw();return}draft.push(normPoint(e));draw()});
svg.addEventListener("dblclick",e=>{if(!regionMode){e.preventDefault();finish()}});
$("#finish").onclick=finish;$("#newRoute").onclick=()=>{draft=[];draw()};$("#undo").onclick=()=>{draft.pop();draw()};
$("#regionMode").onclick=()=>{regionMode=true;regionStart=null;draft=[];$("#regionMode").textContent="Click 2 corners…"};$("#cancelRegion").onclick=()=>{regionMode=false;regionStart=null;$("#regionMode").textContent="Add screen region"};
$("#preview").onclick=()=>{playing=!playing;stage.classList.toggle("playing",playing);$("#preview").textContent=playing?"Stop preview":"Preview";if(playing){start=0;raf=requestAnimationFrame(animate)}else cancelAnimationFrame(raf)};
$("#routes").onclick=e=>{if(e.target.dataset.del!==undefined){project.routes.splice(+e.target.dataset.del,1);draw()}};
$("#regionList").onclick=e=>{if(e.target.dataset.rdel!==undefined){project.regions.splice(+e.target.dataset.rdel,1);draw()}};
$("#scrub").oninput=e=>{if(playing){playing=false;cancelAnimationFrame(raf);$("#preview").textContent="Preview"}renderAt(+e.target.value)};
function loopIssues(){
 const issues=[];
 project.routes.forEach((r,i)=>{if(r.startTime<0||r.startTime+r.duration>project.loopSeconds-.25)issues.push(`Route ${i+1} is active at loop boundary`)});
 project.regions.forEach((r,i)=>{const w=regionWindow(r);if(w[0]<0||w[1]>project.loopSeconds-.25||w[1]<=w[0])issues.push(`Region ${i+1} has an invalid wake window`)});
 return issues;
}
$("#verifyLoop").onclick=()=>{const issues=loopIssues(),s=$("#loopStatus");s.className="status "+(issues.length?"bad":"ok");s.textContent=issues.length?issues.join(" · "):"Verified: all configured activity is dormant before 15.00s";renderAt(0)};
$("#resetTime").onclick=()=>renderAt(0);
const step=d=>{if(playing){playing=false;cancelAnimationFrame(raf);$("#preview").textContent="Preview"}renderAt(manualTime+d/30)};$("#stepBack").onclick=()=>step(-1);$("#stepForward").onclick=()=>step(1);
$("#file").onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{project.background=rd.result;bg.src=rd.result;$("#empty").style.display="none"};rd.readAsDataURL(f)};
[["speed","speedOut",v=>(+v).toFixed(1)+"×"],["width","widthOut",v=>v],["brightness","brightnessOut",v=>v+"%"],["packetsCount","packetsOut",v=>v],["startTime","startOut",v=>(+v).toFixed(1)+"s"],["duration","durationOut",v=>(+v).toFixed(1)+"s"],["wakeTime","wakeOut",v=>(+v).toFixed(1)+"s"],["sleepTime","sleepOut",v=>(+v).toFixed(1)+"s"]].forEach(([id,out,fmt])=>$("#"+id).oninput=e=>$("#"+out).value=fmt(e.target.value));
$("#save").onclick=()=>{const clean={...project,background:null};const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(clean,null,2)],{type:"application/json"}));a.download="wallpaper-project.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
$("#loadProject").onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{const p=JSON.parse(rd.result);project={...project,...p,background:project.background,routes:(p.routes||[]).map(r=>({brightness:80,packets:4,reverse:false,startTime:0,duration:6,...r})),regions:(p.regions||[]).map(r=>({wakeMode:"time",triggerRoute:null,hold:3,...r}))};draw()};rd.readAsText(f)};
draw();