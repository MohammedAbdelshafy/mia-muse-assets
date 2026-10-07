const KEY="mia-static-demo-v1";
let state=JSON.parse(localStorage.getItem(KEY)||"null")||{credits:25,profile:null};
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const suggestions={
  "Research":"Research the competitive landscape for my business and outline three opportunities.",
  "Work on App":"Inspect my app and propose the highest-value improvement.",
  "Create":"Create a visual campaign concept for a new product launch.",
  "Outreach":"Draft a personalized introduction for an authorized business contact.",
  "Operate":"Plan a repeatable weekly operations workflow for my team."
};
function save(){localStorage.setItem(KEY,JSON.stringify(state));$("#creditCount").textContent=state.credits}
function openOnboarding(){if(state.profile){location.hash="mission";$("#missionInput").focus();return}$("#onboarding").classList.remove("hidden")}
function closeOnboarding(){$("#onboarding").classList.add("hidden")}
$$("[data-open-onboarding]").forEach(b=>b.addEventListener("click",openOnboarding));
$$("[data-close-onboarding]").forEach(b=>b.addEventListener("click",closeOnboarding));
$("#enterMia").addEventListener("click",()=>{
  state.profile={name:$("#name").value.trim()||"Operator",email:$("#email").value.trim(),presentation:$("#presentation").value,tone:$("#tone").value,industry:$("#industry").value.trim()};
  save();closeOnboarding();location.hash="mission";$("#missionInput").focus();$("#miaState").textContent="LISTENING";
  setTimeout(()=>$("#miaState").textContent="IDLE",900);
});
$$(".quick button").forEach(b=>b.addEventListener("click",()=>{$("#missionInput").value=suggestions[b.dataset.mission]}));
$$(".world-card").forEach(b=>b.addEventListener("click",()=>{
  $("#missionInput").value="Build a "+b.dataset.world+" mission for my business and give me the highest-leverage next three actions.";
  location.hash="mission";$("#missionInput").focus()
}));
function categoryFor(prompt){
 const s=prompt.toLowerCase();
 if(/outreach|email|send|contact|message|publish|deploy|delete|remove/.test(s))return"OUTREACH";
 if(/image|video|creative|design|campaign/.test(s))return"CREATE";
 if(/app|code|build|github|repository|test/.test(s))return"CODE";
 if(/operate|workflow|automation|process/.test(s))return"OPERATIONS";
 if(/finance|budget|expense/.test(s))return"FINANCE";
 if(/strategy|priority|roadmap/.test(s))return"STRATEGY";
 return"RESEARCH"
}
function resultFor(prompt,category){
 if(category==="OUTREACH")return"Draft prepared for human review.\n\nHi [Name],\nI noticed [verified professional context]. We are exploring ways to make everyday workflows more efficient with Mia AI. If relevant, would you be open to a brief conversation?\n\nNothing was sent. Verify every placeholder and authorize the target before use.";
 if(category==="CREATE")return"Creative concept prepared.\n\nDirection: a calm digital operator in a precision-lit environment.\nPalette: graphite, soft white, restrained cyan.\nSuggested deliverables: one campaign image, three social crops, one motion concept.\n\nNo media provider was called.";
 if(category==="CODE")return"App improvement proposal.\n\n1. Inspect the connected project.\n2. Identify the highest-value improvement.\n3. Review the change and tests.\n4. Approve deployment only after verification.\n\nNo repository was accessed in this demo.";
 return"Mission brief prepared.\n\n1. Define the goal, audience and constraints.\n2. Gather authorized information and verify sources.\n3. Compare options by impact, effort and risk.\n4. Return the next three actions.\n\nThis is a local demo. No live research or external execution occurred."
}
async function run(){
 if(!state.profile){openOnboarding();return}
 if(!state.credits){alert("Your 25 demo credits are complete.");return}
 const prompt=$("#missionInput").value.trim();
 if(!prompt){$("#missionInput").focus();return}
 state.credits--;save();$("#miaState").textContent="THINKING";
 const feed=$("#missionFeed");feed.innerHTML="";
 const phases=["CHAT","INTERNET","SPACE","WORLD","OUTCOME"];
 for(let i=0;i<phases.length;i++){
   await new Promise(r=>setTimeout(r,650));
   $$(".phase-track span").forEach((s,j)=>s.classList.toggle("active",j===i));
   const d=document.createElement("div");d.className="step";
   d.innerHTML="<strong>"+phases[i]+"</strong> mission telemetry updated";
   feed.appendChild(d)
 }
 const category=categoryFor(prompt);
 $("#miaState").textContent=category==="OUTREACH"?"APPROVAL REQUIRED":"SUCCESS";
 const box=document.createElement("div");box.className="result";
 const title=document.createElement("div");title.className="mission-result-title";title.textContent=category+" · LOCAL DEMO";
 box.appendChild(title);
 const body=document.createElement("div");body.textContent=resultFor(prompt,category);box.appendChild(body);
 feed.appendChild(box);
 if(category==="OUTREACH"){
   const a=document.createElement("div");a.className="step";
   a.innerHTML="<strong>SAFETY</strong> External action blocked until human approval.";
   feed.appendChild(a)
 }
}
$("#runMission").addEventListener("click",run);
$("#creditCount").textContent=state.credits;
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeOnboarding()});
if("speechSynthesis" in window){
 const speak=document.createElement("button");speak.textContent="🔊 Hear Mia";speak.className="secondary";speak.style.marginTop="18px";
 speak.addEventListener("click",()=>speechSynthesis.speak(new SpeechSynthesisUtterance("Hi. I'm Mia. Give me a mission and I'll show you how the workflow unfolds.")));
 $(".hero-copy").appendChild(speak)
}