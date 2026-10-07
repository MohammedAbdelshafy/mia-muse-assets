const KEY="mia-static-demo-v2";
const API_BASE=(window.MIA_API_BASE||"https://mia-ai-world.hatchable.site/api").replace(/\/$/,"");
let state=JSON.parse(localStorage.getItem(KEY)||"null")||{credits:25,profile:null,backend:false,selectedPower:null};

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

let brain={version:"unknown",powers:[]};
async function loadBrain(){
  try{
    const r=await fetch("./mia-brain.json",{cache:"no-store"});
    if(r.ok){brain=await r.json();}
  }catch(e){}
  renderBrain();
}
function renderBrain(){
  const grid=$("#miaBrainGrid");
  if(!grid)return;
  grid.innerHTML="";
  (brain.powers||[]).forEach((p,i)=>{
    const card=document.createElement("button");
    card.className="brain-card";
    card.type="button";
    card.dataset.capability=p.name;
    card.innerHTML='<span class="brain-index">'+String(i+1).padStart(2,"0")+'</span><strong>'+p.name+'</strong><small>'+p.workflow+'</small><em>'+p.adapters+'</em>';
    card.addEventListener("click",()=>{
      state.selectedPower=p.name;
      save();
      const prompt="Use the Mia power \""+p.name+"\". Execute this workflow: "+p.workflow+". Route through these adapters when available: "+p.adapters+". Do the smallest safe verified step, then return evidence and the next action.";
      $("#missionInput").value=prompt;
      $(".brain-card").forEach(x=>x.classList.remove("selected"));
      card.classList.add("selected");
      location.hash="mission";
      $("#missionInput")?.focus();
    });
    grid.appendChild(card);
  });
  if($("#brainCount"))$("#brainCount").textContent=(brain.powers||[]).length;
}
\nconst suggestions={
  "Research":"Research the competitive landscape for my business and outline three opportunities.",
  "Work on App":"Inspect my app and propose the highest-value improvement you can safely verify.",
  "Create":"Create a visual campaign concept for a new product launch.",
  "Outreach":"Draft a personalized introduction for an authorized business contact.",
  "Operate":"Plan a repeatable weekly operations workflow for my team."
};

function save(){
  localStorage.setItem(KEY,JSON.stringify(state));
  if($("#creditCount")) $("#creditCount").textContent=state.credits;
}
function openOnboarding(){
  if(state.profile){location.hash="mission";$("#missionInput")?.focus();return}
  $("#onboarding")?.classList.remove("hidden");
}
function closeOnboarding(){$("#onboarding")?.classList.add("hidden");}
function addStatusChip(){
  if(!$(".backend-status")){
    const el=document.createElement("div");
    el.className="backend-status";
    el.style.cssText="margin-top:12px;display:inline-flex;gap:8px;align-items:center;padding:8px 11px;border:1px solid rgba(255,255,255,.08);border-radius:999px;background:rgba(255,255,255,.035);font-size:.68rem;letter-spacing:.08em;color:#aaa9a4";
    el.innerHTML='<span class="status-dot" style="width:7px;height:7px;border-radius:50%;display:inline-block;background:#777"></span><span class="status-text">BACKEND CHECKING</span>';
    $(".hero-copy")?.appendChild(el);
  }
}
function setBackendStatus(ok){
  state.backend=ok;save();addStatusChip();
  const chip=$(".backend-status"),dot=chip?.querySelector(".status-dot"),text=chip?.querySelector(".status-text");
  if(!chip)return;
  if(ok){dot.style.background="#6ef2aa";dot.style.boxShadow="0 0 10px #6ef2aa";text.textContent="LIVE BACKEND CONNECTED";}
  else{dot.style.background="#f0b45d";dot.style.boxShadow="0 0 10px #f0b45d";text.textContent="DEMO BACKEND FALLBACK";}
}
async function api(path,options={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),5000);
  try{
    return await fetch(API_BASE+path,{...options,signal:controller.signal,headers:{"content-type":"application/json",...(options.headers||{})}});
  }finally{clearTimeout(timer);}
}
async function checkBackend(){
  addStatusChip();
  try{const r=await api("/health",{headers:{}});setBackendStatus(r.ok);return r.ok}
  catch(e){setBackendStatus(false);return false}
}

$$( "[data-open-onboarding]" ).forEach(b=>b.addEventListener("click",openOnboarding));
$$( "[data-close-onboarding]" ).forEach(b=>b.addEventListener("click",closeOnboarding));

$("#enterMia")?.addEventListener("click",async()=>{
  state.profile={
    name:$("#name")?.value.trim()||"Operator",
    email:$("#email")?.value.trim()||"",
    presentation:$("#presentation")?.value||"Woman",
    tone:$("#tone")?.value||"Calm & precise",
    industry:$("#industry")?.value.trim()||""
  };
  save();closeOnboarding();location.hash="mission";$("#missionInput")?.focus();
  loadBrain();
  checkBackend();
});

$$( ".quick button" ).forEach(b=>b.addEventListener("click",()=>{
  $("#missionInput").value=suggestions[b.dataset.mission]||b.dataset.mission;
}));
$$( ".world-card" ).forEach(b=>b.addEventListener("click",()=>{
  $("#missionInput").value="Build a "+b.dataset.world+" mission for my business and give me the highest-leverage next three actions.";
  location.hash="mission";$("#missionInput")?.focus();
}));

function categoryFor(prompt){
  const s=prompt.toLowerCase();
  if(/outreach|email|send|contact|message|publish|deploy|delete|remove|lead/.test(s))return"OUTREACH";
  if(/image|video|creative|design|campaign|avatar/.test(s))return"CREATE";
  if(/app|code|build|github|repository|test/.test(s))return"CODE";
  if(/operate|workflow|automation|process/.test(s))return"OPERATIONS";
  if(/finance|budget|expense/.test(s))return"FINANCE";
  if(/strategy|priority|roadmap/.test(s))return"STRATEGY";
  return"RESEARCH";
}
function localResult(prompt,category){
  if(category==="OUTREACH")return"OUTREACH PLAN\n1. Verify the authorized business target.\n2. Draft a truthful, personalized message.\n3. Queue it for review.\n4. Nothing is sent until you approve it.";
  if(category==="CREATE")return"CREATIVE PLAN\n1. Convert the request into a visual brief.\n2. Choose a connected media provider.\n3. Generate only when the provider is actually available.\n4. Review before publishing.";
  if(category==="CODE")return"BUILD PLAN\n1. Inspect the connected project.\n2. Identify the highest-value safe improvement.\n3. Implement and test it.\n4. Show the change and stop before deployment unless approved.";
  return"MISSION PLAN\n1. Define the goal and evidence standard.\n2. Gather authorized information.\n3. Verify important claims.\n4. Return the strongest findings and next actions.\n\nThis fallback is demo-safe and does not claim live research.";
}
async function run(){
  if(!state.profile){openOnboarding();return}
  if(!state.credits){alert("Your 25 demo credits are complete.");return}
  const prompt=$("#missionInput").value.trim();
  if(!prompt){$("#missionInput").focus();return}

  state.credits--;save();
  $("#miaState").textContent="THINKING";
  const feed=$("#missionFeed");feed.innerHTML="";

  let mission=null;
  try{
    const mr=await api("/mission",{method:"POST",body:JSON.stringify({prompt,capability:state.selectedPower||null,brain_version:brain.version||null})});
    if(mr.ok)mission=await mr.json();
  }catch(e){}

  const phases=["CHAT","INTERNET","SPACE","WORLD","OUTCOME"];
  for(let i=0;i<phases.length;i++){
    await new Promise(r=>setTimeout(r,420));
    $$(".phase-track span").forEach((s,j)=>s.classList.toggle("active",j===i));
    const d=document.createElement("div");d.className="step";
    d.innerHTML="<strong>"+phases[i]+"</strong> mission telemetry updated";
    feed.appendChild(d);
  }

  const category=mission?.mission?.type||categoryFor(prompt);
  if(mission?.mission?.approval_required){
    const d=document.createElement("div");d.className="step";
    d.innerHTML="<strong>APPROVAL</strong> External action is blocked until human approval.";
    feed.appendChild(d);
  }

  let answer="";
  try{
    const r=await api("/ask",{method:"POST",body:JSON.stringify({prompt})});
    const data=await r.json();
    answer=data.text||localResult(prompt,category);
  }catch(e){answer=localResult(prompt,category)}

  $("#miaState").textContent=category==="OUTREACH"?"APPROVAL REQUIRED":"SUCCESS";
  const box=document.createElement("div");box.className="result";
  const title=document.createElement("div");title.className="mission-result-title";title.textContent=(state.selectedPower?state.selectedPower+" · ":"")+category+" · "+(state.backend?"CONNECTED":"DEMO");
  box.appendChild(title);
  const body=document.createElement("div");body.textContent=answer;box.appendChild(body);
  feed.appendChild(box);
  if(category==="OUTREACH"){
    const a=document.createElement("div");a.className="step";
    a.innerHTML="<strong>SAFETY</strong> Nothing was sent. Human approval is still required.";
    feed.appendChild(a);
  }
}
$("#runMission")?.addEventListener("click",run);
$("#creditCount").textContent=state.credits;

$("#leadForm")?.addEventListener("submit",async e=>{
  e.preventDefault();
  const leadStatus=$("#status"),data=Object.fromEntries(new FormData(e.currentTarget));
  leadStatus.textContent="Creating your Mia World brief…";
  try{
    const r=await api("/interest",{method:"POST",body:JSON.stringify(data)});
    const j=await r.json();
    if(r.ok){leadStatus.textContent="Received. Your world brief is queued.";e.currentTarget.reset()}
    else leadStatus.textContent=j.error||"Please try again.";
  }catch(e){
    leadStatus.textContent="Offline demo saved locally. Connect Mia's backend to submit the brief.";
    localStorage.setItem("mia_last_interest",JSON.stringify(data));
  }
});

document.addEventListener("keydown",e=>{if(e.key==="Escape")closeOnboarding()});
if("speechSynthesis"in window){
  const speak=document.createElement("button");
  speak.textContent="🔊 Hear Mia";speak.className="secondary";speak.style.marginTop="18px";
  speak.addEventListener("click",()=>speechSynthesis.speak(new SpeechSynthesisUtterance("Hi. I'm Mia. Give me a mission and I'll show you how the workflow unfolds.")));
  $(".hero-copy")?.appendChild(speak);
}

loadBrain();
checkBackend();
