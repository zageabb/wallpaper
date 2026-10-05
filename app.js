const $=s=>document.querySelector(s),stage=$("#stage"),svg=$("#overlay"),bg=$("#bg"),group=$("#paths"),particleGroup=$("#particles");
let project={version:2,background:null,loopSeconds:15,routes:[]},draft=[],playing=false,raf=0,start=0;
const NS="http://www.w3.org/2000/svg";
const normPoint=e=>{const r=svg.getBoundingClientRect();return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]};
const svgPts=pts=>pts.map(([x,y])=>`${x*1000},${y*562.5}`).join(" ");
const el=(tag,attrs={})=>{const n=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));return n};
function routePath(r,cls,width,opacity=1){return el("polyline",{points:svgPts(r.points),class:cls,stroke:r.colour,"stroke-width":width,opacity})}
function draw(){
 group.innerHTML="";particleGroup.innerHTML="";
 project.routes.forEach((r,i)=>{
  group.append(routePath(r,"route-bed",r.width*1.15));
  group.append(routePath(r,"flow-glow",r.width*3,0));
  group.append(routePath(r,"flow-core",Math.max(1,r.width*.38),0));
  for(let k=0;k<r.packets;k++){const c=el("circle",{r:Math.max(2,r.width*.65),fill:r.colour,class:"energy-packet",opacity:0});c.dataset.route=i;c.dataset.packet=k;particleGroup.append(c)}
 });
 $("#draft").setAttribute("points",svgPts(draft));
 $("#routes").innerHTML=project.routes.map((r,i)=>`<div class="route"><i class="swatch" style="background:${r.colour}"></i><span>${r.name}<small>${r.speed.toFixed(1)}× · ${r.packets} packets · ${r.brightness}%${r.reverse?" · reverse":""}</small></span><button data-del="${i}">×</button></div>`).join("");
}
function animate(t){
 if(!playing)return;
 if(!start)start=t;
 const elapsed=(t-start)/1000;
 [...group.children].forEach((node,idx)=>{
   const r=project.routes[Math.floor(idx/3)],kind=idx%3;
   if(kind===1)node.setAttribute("opacity",.12*(r.brightness/100));
   if(kind===2)node.setAttribute("opacity",.72*(r.brightness/100));
 });
 [...particleGroup.children].forEach(c=>{
  const r=project.routes[+c.dataset.route],path=group.children[(+c.dataset.route)*3+2],len=path.getTotalLength();
  const phase=+c.dataset.packet/r.packets;
  let p=((elapsed*r.speed/6)+phase)%1;if(r.reverse)p=1-p;
  const q=path.getPointAtLength(p*len);c.setAttribute("cx",q.x);c.setAttribute("cy",q.y);
  const envelope=Math.min(1,Math.sin(Math.PI*p)*2.2);
  c.setAttribute("opacity",envelope*(r.brightness/100));
 });
 raf=requestAnimationFrame(animate);
}
function finish(){
 if(draft.length<2)return;
 project.routes.push({name:$("#name").value||`Flow ${project.routes.length+1}`,colour:$("#colour").value,speed:+$("#speed").value,width:+$("#width").value,brightness:+$("#brightness").value,packets:+$("#packetsCount").value,reverse:$("#reverse").checked,points:[...draft]});
 draft=[];$("#name").value=`Flow ${project.routes.length+1}`;draw()
}
svg.addEventListener("click",e=>{draft.push(normPoint(e));draw()});svg.addEventListener("dblclick",e=>{e.preventDefault();finish()});
$("#finish").onclick=finish;$("#newRoute").onclick=()=>{draft=[];draw()};$("#undo").onclick=()=>{draft.pop();draw()};
$("#preview").onclick=()=>{playing=!playing;stage.classList.toggle("playing",playing);$("#preview").textContent=playing?"Stop preview":"Preview";if(playing){start=0;raf=requestAnimationFrame(animate)}else{cancelAnimationFrame(raf);draw()}};
$("#routes").onclick=e=>{if(e.target.dataset.del!==undefined){project.routes.splice(+e.target.dataset.del,1);draw()}};
$("#file").onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{project.background=rd.result;bg.src=rd.result;$("#empty").style.display="none"};rd.readAsDataURL(f)};
[["speed","speedOut",v=>(+v).toFixed(1)+"×"],["width","widthOut",v=>v],["brightness","brightnessOut",v=>v+"%"],["packetsCount","packetsOut",v=>v]].forEach(([id,out,fmt])=>$("#"+id).oninput=e=>$("#"+out).value=fmt(e.target.value));
$("#save").onclick=()=>{const clean={...project,background:null};const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(clean,null,2)],{type:"application/json"}));a.download="wallpaper-project.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
$("#loadProject").onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{const p=JSON.parse(rd.result);project={...project,...p,background:project.background,routes:(p.routes||[]).map(r=>({brightness:80,packets:4,reverse:false,...r}))};draw()};rd.readAsText(f)};
draw();