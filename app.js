const $=s=>document.querySelector(s), stage=$("#stage"), svg=$("#overlay"), bg=$("#bg"), group=$("#paths");
let project={version:1,background:null,routes:[]}, draft=[], playing=false;
const normPoint=e=>{const r=svg.getBoundingClientRect();return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]};
const svgPts=pts=>pts.map(([x,y])=>`${x*1000},${y*562.5}`).join(" ");
function draw(){
 group.innerHTML="";
 project.routes.forEach((r,i)=>{
  const p=document.createElementNS("http://www.w3.org/2000/svg","polyline");
  p.setAttribute("points",svgPts(r.points));p.setAttribute("class","flow");p.setAttribute("stroke",r.colour);p.setAttribute("stroke-width",r.width);
  p.style.setProperty("--duration",`${6/r.speed}s`);group.appendChild(p);
 });
 $("#draft").setAttribute("points",svgPts(draft));
 $("#routes").innerHTML=project.routes.map((r,i)=>`<div class="route"><i class="swatch" style="background:${r.colour}"></i><span>${r.name}</span><button data-del="${i}">×</button></div>`).join("");
}
svg.addEventListener("click",e=>{draft.push(normPoint(e));draw()});
svg.addEventListener("dblclick",e=>{e.preventDefault();finish()});
function finish(){if(draft.length<2)return;project.routes.push({name:$("#name").value||`Flow ${project.routes.length+1}`,colour:$("#colour").value,speed:+$("#speed").value,width:+$("#width").value,points:draft});draft=[];$("#name").value=`Flow ${project.routes.length+1}`;draw()}
$("#finish").onclick=finish;$("#newRoute").onclick=()=>{draft=[];draw()};$("#undo").onclick=()=>{draft.pop();draw()};
$("#preview").onclick=()=>{playing=!playing;stage.classList.toggle("playing",playing);$("#preview").textContent=playing?"Stop preview":"Preview"};
$("#routes").onclick=e=>{if(e.target.dataset.del!==undefined){project.routes.splice(+e.target.dataset.del,1);draw()}};
$("#file").onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{project.background=rd.result;bg.src=rd.result;$("#empty").style.display="none"};rd.readAsDataURL(f)};
$("#save").onclick=()=>{const clean={...project,background:null};const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(clean,null,2)],{type:"application/json"}));a.download="wallpaper-project.json";a.click();URL.revokeObjectURL(a.href)};
$("#loadProject").onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{const p=JSON.parse(rd.result);project.routes=p.routes||[];draw()};rd.readAsText(f)};
draw();
