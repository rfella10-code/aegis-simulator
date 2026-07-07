import { useState, useRef, useEffect } from "react";

/* ═══════════════════════════════════════════════════
   AEGIS — Clinical Simulation Engine v2.0
   Dual-Agent DBT Training Platform
   Actor Agent (client) + Coach Agent (supervisor)
   Parallel inference · Azure AI Foundry architecture
   LIVE — routed through Cloudflare Worker proxy
═══════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// !! CONFIGURATION — FILL THIS IN BEFORE DEPLOYING !!
// Replace with your Cloudflare Worker URL after setup
// ─────────────────────────────────────────────────────────────
constWORKER_URL = "https://aegis-proxy.r-fella10.workers.dev";

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Syne',sans-serif;background:#040812;color:#E8F0FF;-webkit-font-smoothing:antialiased}
    :root{
      --bg:#040812;--glass:rgba(255,255,255,0.04);--gb:rgba(255,255,255,0.08);--gb2:rgba(255,255,255,0.13);
      --cyan:#00D4FF;--cg:rgba(0,212,255,0.28);--cd:rgba(0,212,255,0.12);
      --bio:#00FFB2;--bd:rgba(0,255,178,0.12);
      --amb:#FFB800;--ad:rgba(255,184,0,0.13);
      --ros:#FF4D6A;--rd:rgba(255,77,106,0.13);
      --vio:#A78BFA;--vd:rgba(167,139,250,0.13);
      --tx:#E8F0FF;--tm:rgba(232,240,255,0.42);
      --fd:'Syne',sans-serif;--fm:'IBM Plex Mono',monospace;
    }
    @keyframes orb1{0%,100%{transform:translate(0,0)scale(1)}40%{transform:translate(70px,-50px)scale(1.1)}70%{transform:translate(-30px,60px)scale(.95)}}
    @keyframes orb2{0%,100%{transform:translate(0,0)scale(1)}50%{transform:translate(-60px,70px)scale(1.07)}}
    @keyframes breathe{0%,100%{text-shadow:0 0 24px var(--cg)}50%{text-shadow:0 0 50px var(--cg),0 0 100px rgba(0,212,255,.2)}}
    @keyframes fsu{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes scanBar{0%{left:-40%}100%{left:110%}}
    @keyframes dash{to{stroke-dashoffset:-16}}
    @keyframes ring{0%{opacity:.7;transform:scale(1)}100%{opacity:0;transform:scale(2)}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
    @keyframes agiPulse{0%,100%{opacity:.7}50%{opacity:1}}
    .sc{animation:fsu .5s cubic-bezier(.22,1,.36,1) both}
    .s1{animation:fsu .5s .06s cubic-bezier(.22,1,.36,1) both}
    .s2{animation:fsu .5s .12s cubic-bezier(.22,1,.36,1) both}
    .s3{animation:fsu .5s .18s cubic-bezier(.22,1,.36,1) both}
    .s4{animation:fsu .5s .24s cubic-bezier(.22,1,.36,1) both}
    .s5{animation:fsu .5s .30s cubic-bezier(.22,1,.36,1) both}
    .s6{animation:fsu .5s .36s cubic-bezier(.22,1,.36,1) both}
    .gl{background:var(--glass);border:1px solid var(--gb);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px)}
    .sc-card{cursor:pointer;transition:transform .2s,box-shadow .2s,border-color .2s}
    .sc-card:hover{transform:translateY(-3px)}
    .sc-card.sel{border-color:var(--cyan)!important;box-shadow:0 0 28px var(--cd)!important}
    .tx-btn{background:linear-gradient(135deg,var(--cyan),#006FA8);color:#001520;border:none;font-family:var(--fd);font-weight:800;font-size:14px;border-radius:12px;cursor:pointer;transition:transform .15s,box-shadow .15s;box-shadow:0 0 28px var(--cg);position:relative;overflow:hidden}
    .tx-btn::after{content:'';position:absolute;top:0;bottom:0;width:35%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);animation:scanBar 2.2s ease-in-out infinite}
    .tx-btn:hover{transform:translateY(-2px);box-shadow:0 0 50px var(--cg)}
    .tx-btn:disabled{opacity:.35;cursor:not-allowed;transform:none}
    .tx-btn:disabled::after{display:none}
    .gh-btn{background:var(--glass);border:1px solid var(--gb);color:var(--tm);font-family:var(--fd);font-weight:600;font-size:12px;border-radius:10px;cursor:pointer;transition:all .2s;backdrop-filter:blur(10px)}
    .gh-btn:hover{border-color:var(--cyan);color:var(--cyan);background:var(--cd)}
    .end-btn{background:rgba(255,77,106,.1);border:1px solid rgba(255,77,106,.3);color:var(--ros);font-family:var(--fd);font-weight:700;font-size:12px;border-radius:10px;cursor:pointer;transition:all .2s}
    .end-btn:hover{background:rgba(255,77,106,.2);box-shadow:0 0 18px var(--rd)}
    textarea{font-family:var(--fm);font-size:13px;line-height:1.75;color:var(--tx);background:rgba(0,212,255,.03);border:1px solid var(--gb);border-radius:12px;padding:14px 16px;resize:none;width:100%;outline:none;transition:border-color .2s,box-shadow .2s}
    textarea:focus{border-color:var(--cyan);box-shadow:0 0 0 3px var(--cd)}
    textarea::placeholder{color:rgba(148,163,184,.28)}
    ::-webkit-scrollbar{width:3px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.09);border-radius:99px}
  `}</style>
);

const Mesh = () => (
  <div style={{position:"fixed",inset:0,overflow:"hidden",zIndex:0,background:"#040812"}}>
    <div style={{position:"absolute",width:800,height:800,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,212,255,.09) 0%,transparent 70%)",top:"-15%",left:"-10%",animation:"orb1 24s ease-in-out infinite"}}/>
    <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,255,178,.07) 0%,transparent 70%)",bottom:"5%",right:"-8%",animation:"orb2 28s ease-in-out infinite"}}/>
    <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center,rgba(4,8,18,.3) 0%,rgba(4,8,18,.92) 100%)"}}/>
    <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.025) 2px,rgba(0,0,0,.025) 4px)",pointerEvents:"none"}}/>
  </div>
);

/* ── Static Data ─────────────────────────────────────── */
const SCENARIOS = [
  {
    id:"si", title:"Suicidal Ideation", icon:"⚠",
    clientName:"Jordan", age:16, pronouns:"they/them",
    description:"Brought in after texting 'I want to disappear.' History of superficial self-harm. First crisis presentation.",
    context:"Jordan was brought in by their parent after texting a friend 'I just want to disappear forever.' History of superficial cutting on wrists. Currently denies active plan or intent. Very shut down, not making eye contact. First time in crisis services. Parent is waiting outside.",
    initialAgitation:0.72, riskLevel:"MOD-HIGH", riskColor:"#FF4D6A",
    tags:["Passive SI","Self-Harm Hx","First Presentation"],
    considerations:["Assess lethality without appearing clinical or interrogative","Build rapport before any direct safety questions — validate first","Avoid minimizing. 'At least you don't have a plan' escalates."]
  },
  {
    id:"panic", title:"Acute Panic Episode", icon:"⚡",
    clientName:"Maya", age:15, pronouns:"she/her",
    description:"Found hyperventilating in school bathroom. Dissociating. No prior psychiatric history.",
    context:"Maya was found hyperventilating in the school bathroom. Now in the counselor's office, still very dysregulated — shaking, intermittently dissociating, unable to sit still. No known psychiatric history. Parents have been notified and are en route.",
    initialAgitation:0.88, riskLevel:"HIGH", riskColor:"#FF4D6A",
    tags:["Acute Panic","Dissociation","No Hx"],
    considerations:["TIPP grounding before any verbal processing — she cannot hear you yet","Reduce stimulation: lower voice, slow movement, less is more","Never ask 'why are you panicking?' — focus only on the present moment"]
  },
  {
    id:"substance", title:"Substance Crisis", icon:"🔴",
    clientName:"Darius", age:17, pronouns:"he/him",
    description:"Third substance incident at school. Sober, furious. Considers therapy 'for weak people.'",
    context:"Darius was caught with alcohol at school — third incident this year. Now sober and extremely angry. Parents have been called and he's aware. He views therapy as weakness and is threatening to walk out. Has history of trauma: father incarcerated when he was 9.",
    initialAgitation:0.90, riskLevel:"HIGH", riskColor:"#FF4D6A",
    tags:["Substance","Oppositional","Trauma Hx"],
    considerations:["Motivational Interviewing: explore ambivalence, don't push for change","Acknowledge the anger as valid before any other intervention","Don't lecture about consequences — he knows them and it will escalate"]
  },
  {
    id:"trauma", title:"Trauma Disclosure", icon:"🛡",
    clientName:"Sage", age:14, pronouns:"she/her",
    description:"Disclosed physical abuse today. Mandatory report filed. Terrified and feeling betrayed.",
    context:"Sage disclosed physical abuse by a stepparent to her teacher earlier today. Mandatory report has been filed. She is now in the counselor's office terrified of what happens next, feeling that telling someone 'made everything worse.' Dissociating intermittently. Fears being removed from home.",
    initialAgitation:0.68, riskLevel:"MODERATE", riskColor:"#FFB800",
    tags:["Trauma","Disclosure","Safety Planning"],
    considerations:["She may feel disclosure was a mistake — don't argue, validate the fear","Explain the mandatory report process clearly — reduce uncertainty","Radical genuineness is key here: be real, not clinical"]
  },
  {
    id:"asd_meltdown", title:"ASD Post-Meltdown Crisis", icon:"🧩",
    clientName:"Riley", age:10, pronouns:"they/them",
    description:"10-year-old with ASD Level 1. Post-meltdown after a fire drill. Partially non-verbal, stimming, overwhelmed.",
    context:"Riley has ASD Level 1 and severe sensory sensitivities. A fire drill triggered a full meltdown in the cafeteria. They are now in the school psychologist's office, partially non-verbal, rocking, covering their ears. Parents are 25 minutes away. Riley communicates well when regulated but right now language is minimal. They use visual supports at home.",
    initialAgitation:0.82, riskLevel:"HIGH", riskColor:"#A78BFA",
    tags:["ASD L1","Post-Meltdown","Sensory","Non-Verbal","Ages 8–12"],
    considerations:["SILENCE IS THE FIRST INTERVENTION — say nothing, just lower the sensory input","Do not demand eye contact — it is neurologically painful right now","Your nervous system co-regulates theirs: slow your breath, slow your voice, slow your movement","Wait for the window — when rocking slows, THEN offer a very simple 1-2 word check-in"]
  },
  {
    id:"adhd_explosive", title:"ADHD + ODD Explosive Episode", icon:"⚡",
    clientName:"Kai", age:12, pronouns:"he/him",
    description:"12-year-old with ADHD-Combined and ODD. Explosive rage after losing a classroom privilege. Threatening to elope.",
    context:"Kai has ADHD-Combined Type and Oppositional Defiant Disorder. He erupted after his iPad was confiscated mid-video during math class. Now in the school psychologist's office, still in the peak of the rage cycle — pacing, fists clenched, threatening to run out of the building. He has a documented elopement history. Parents are unreachable. Previous provider was fired by his parents for being 'too soft.'",
    initialAgitation:0.93, riskLevel:"HIGH", riskColor:"#FF4D6A",
    tags:["ADHD","ODD","Elopement Risk","Ages 10–14"],
    considerations:["Physical safety first — be aware of the door; don't block but be present","Match energy briefly, then slowly de-escalate — dramatic calm is more powerful than words","NEVER say 'calm down' — it is the single most escalating phrase possible for this client","Offer control: choices, not commands. 'Do you want to stand or sit?' — tiny autonomy matters enormously"]
  },
  {
    id:"adult_asd_late_dx", title:"Adult ASD — Late Diagnosis & Loss", icon:"🔬",
    clientName:"Devon", age:28, pronouns:"he/him",
    description:"28-year-old just diagnosed ASD Level 1. Partner of 4 years left after disclosure. Grief, identity reconstruction.",
    context:"Devon received his ASD Level 1 diagnosis 3 weeks ago. He disclosed it to his partner of 4 years and she ended the relationship within the week. He's now in your office for the first time — presenting with complex grief, identity confusion ('was anything I felt real?'), and re-reading his entire life history through this new lens. He's highly verbal and intellectualizes easily but is actually in significant emotional pain underneath.",
    initialAgitation:0.55, riskLevel:"MODERATE", riskColor:"#FFB800",
    tags:["ASD L1","Late Diagnosis","Grief","Identity","Adult 25+"],
    considerations:["This is grief AND identity reconstruction simultaneously — honor both without rushing either","Avoid 'at least you have answers now' — it lands as minimization of the loss","He may appear emotionally flat but is not — his affect regulation looks different, not absent","Psychoeducation about ASD can be grounding but NOT in the first session. Relationship first."]
  }
];

const DIFFICULTIES = [
  {id:"novice",label:"NOVICE",desc:"Cooperative. Responds to basic validation. Forgiving of minor errors.",modifier:-0.18,color:"#00FFB2"},
  {id:"intermediate",label:"INTERMEDIATE",desc:"Realistic resistance. Requires solid DBT technique.",modifier:0,color:"#FFB800"},
  {id:"advanced",label:"ADVANCED",desc:"Highly dysregulated. Expert-level DBT required to de-escalate.",modifier:0.10,color:"#FF4D6A"},
];

const CLINICIAN_PROFILES = [
  {id:"child_psych",label:"Child Psychologist",degree:"PsyD / PhD",ageRange:"5–17",color:"#00D4FF",
   specialties:["Pediatric Mental Health","Play Therapy","Trauma-Informed Care","Family Systems"],
   note:"Evaluates against child-adapted DBT and play/expressive therapy standards."},
  {id:"neuro_psych",label:"Neuropsychologist",degree:"PhD / ABPP-CN",ageRange:"All Ages",color:"#A78BFA",
   specialties:["Autism Spectrum","ADHD","2e Assessment","Executive Function","Sensory Integration"],
   note:"Evaluates against neurodiversity-affirming, sensory-informed clinical frameworks."},
  {id:"school_psych",label:"School Psychologist",degree:"EdS / PhD",ageRange:"5–22",color:"#00FFB2",
   specialties:["Crisis Intervention","Threat Assessment","504 / IEP Support","Behavioral Analysis"],
   note:"Evaluates against NASP crisis protocols and school-based intervention standards."},
  {id:"adult_psych",label:"Adult Clinician",degree:"PsyD / PhD / LCSW",ageRange:"18+",color:"#FFB800",
   specialties:["DBT","CBT","Personality Disorders","Life Transitions","Late Diagnosis Support"],
   note:"Evaluates against standard outpatient DBT and evidence-based adult intervention."},
];

const DBT_REF = [
  ["VALIDATION L1-6","Listen actively, reflect, read mind, validate history, radical genuineness, radical equality"],
  ["DEAR MAN","Describe, Express, Assert, Reinforce, Mindful, Appear confident, Negotiate"],
  ["GIVE","Gentle, Interested, Validate, Easy manner — preserves relationship"],
  ["TIPP","Temperature, Intense exercise, Paced breathing, Progressive relaxation"],
  ["FAST","Fair, no Apologies, Stick to values, Truthful — preserves self-respect"],
  ["OPP ACTION","Act opposite to emotion's urge to reduce intensity"],
];

/* ── Helper Components ───────────────────────────────── */
const AgitationMeter = ({ value }) => {
  const color = value>=0.75?"#FF4D6A":value>=0.5?"#FFB800":value>=0.25?"#00D4FF":"#00FFB2";
  const label = value>=0.85?"CRITICAL":value>=0.70?"HIGH":value>=0.50?"MODERATE":value>=0.30?"ELEVATED":"REGULATED";
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
        <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"2px"}}>AGITATION INDEX</div>
        <div style={{fontFamily:"var(--fm)",fontSize:10,color,fontWeight:600,letterSpacing:"1.5px",animation:value>=0.75?"agiPulse 1.1s ease-in-out infinite":"none"}}>{label}</div>
      </div>
      <div style={{height:8,background:"rgba(255,255,255,.05)",borderRadius:4,overflow:"hidden",position:"relative"}}>
        <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(90deg,transparent,transparent 19.8%,rgba(255,255,255,.04) 19.8%,rgba(255,255,255,.04) 20%)"}}/>
        <div style={{height:"100%",width:`${value*100}%`,background:`linear-gradient(to right,${color}55,${color})`,borderRadius:4,transition:"width .9s cubic-bezier(.34,1.56,.64,1)",boxShadow:`0 0 14px ${color}80`}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
        <div style={{fontFamily:"var(--fm)",fontSize:9,color:"rgba(232,240,255,.22)"}}>0.0 calm</div>
        <div style={{fontFamily:"var(--fm)",fontSize:14,color,fontWeight:600}}>{value.toFixed(2)}</div>
        <div style={{fontFamily:"var(--fm)",fontSize:9,color:"rgba(232,240,255,.22)"}}>crisis 1.0</div>
      </div>
    </div>
  );
};

const DBTRing = ({ score }) => {
  const r=38, circ=2*Math.PI*r, offset=circ*(1-score);
  const color=score>=0.82?"#00FFB2":score>=0.68?"#00D4FF":score>=0.52?"#FFB800":"#FF4D6A";
  const label=score>=0.82?"EXPERT":score>=0.68?"PROFICIENT":score>=0.52?"DEVELOPING":"POOR";
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
      <svg width={96} height={96} viewBox="0 0 96 96">
        <circle cx={48} cy={48} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={7}/>
        <circle cx={48} cy={48} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 48 48)"
          style={{transition:"stroke-dashoffset .8s cubic-bezier(.34,1.56,.64,1)",filter:`drop-shadow(0 0 8px ${color})`}}/>
        <text x={48} y={44} textAnchor="middle" fill={color} fontFamily="'IBM Plex Mono',monospace" fontSize={17} fontWeight={600}>{Math.round(score*100)}</text>
        <text x={48} y={60} textAnchor="middle" fill="rgba(232,240,255,.35)" fontFamily="'IBM Plex Mono',monospace" fontSize={10}>/ 100</text>
      </svg>
      <div style={{fontFamily:"var(--fm)",fontSize:9,color,letterSpacing:"2.5px",fontWeight:600}}>{label}</div>
    </div>
  );
};

const Sparkline = ({ data, color="#00D4FF", height=60 }) => {
  if (!data||data.length<2) return null;
  const W=Math.max(260, data.length*36);
  const max=Math.max(...data), min=Math.min(...data), range=max-min||0.1;
  const pts=data.map((v,i)=>{
    const x=(i/(data.length-1))*W;
    const y=height-((v-min)/range)*(height-12)-6;
    return `${x},${y}`;
  }).join(" ");
  const lx=W, ly=height-((data[data.length-1]-min)/range)*(height-12)-6;
  return (
    <div style={{overflowX:"auto",paddingBottom:4}}>
      <svg width={W} height={height} style={{overflow:"visible",display:"block"}}>
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={.25}/>
            <stop offset="100%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        {data.map((_,i)=> i>0 && (
          <line key={i} x1={(i/(data.length-1))*W} y1={0} x2={(i/(data.length-1))*W} y2={height}
            stroke="rgba(255,255,255,.03)" strokeWidth={1}/>
        ))}
        <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"/>
        <circle cx={lx} cy={ly} r={4} fill={color} style={{filter:`drop-shadow(0 0 5px ${color})`}}/>
        {data.map((v,i)=>{
          const x=(i/(data.length-1))*W;
          const y=height-((v-min)/range)*(height-12)-6;
          return <circle key={i} cx={x} cy={y} r={2.5} fill="rgba(0,0,0,.4)" stroke={color} strokeWidth={1}/>;
        })}
      </svg>
    </div>
  );
};

/* ── API Calls ───────────────────────────────────────── */
async function callActor(scenario, difficulty, agitation, apiHistory, clinicianInput) {
  const diffObj = DIFFICULTIES.find(d=>d.id===difficulty);
  const agiLabel = agitation>=0.8?"CRITICAL — near breaking point, may shut down or storm out":
    agitation>=0.6?"HIGH — volatile, testing limits, watching for reasons to disengage":
    agitation>=0.4?"MODERATE — fragile stability, cautiously evaluating clinician":
    "LOWER — beginning to engage, still guarded";

  const system = `You are ${scenario.clientName}, ${scenario.age} years old (${scenario.pronouns}), in an acute psychiatric crisis simulation.

SCENARIO CONTEXT: ${scenario.context}

CURRENT STATE:
Agitation: ${agitation.toFixed(2)}/1.0 — ${agiLabel}
Difficulty: ${difficulty.toUpperCase()}

AGITATION ADJUSTMENT RULES:
DECREASE (effective technique):
- Genuine validation / empathy / reflecting feelings accurately: -0.06 to -0.14
- TIPP grounding or mindfulness cues: -0.05 to -0.11
- DEAR MAN or clear, calm structure: -0.03 to -0.08
- Acknowledging autonomy / giving choice: -0.04 to -0.09

INCREASE (poor technique):
- Confrontation, lecturing, moralizing: +0.08 to +0.18
- Minimizing feelings or dismissing: +0.06 to +0.14
- Clinical coldness or jargon: +0.05 to +0.12
- Unsolicited advice or problem-solving too early: +0.04 to +0.10

${difficulty==="advanced"?"ADVANCED: Only master-level, layered DBT skills de-escalate. Most average responses will escalate slightly.":difficulty==="novice"?"NOVICE: Basic empathy and reflection work. Very forgiving of minor errors.":"INTERMEDIATE: Realistic, nuanced — some techniques work, some don't."}

RESPONSE RULES:
- Authentic adolescent voice. Short (1-3 sentences MAX). Raw and emotionally real.
- Do NOT act like a therapy textbook. Be messy, human, and defensive where appropriate.
- Respond ONLY as valid JSON with no markdown, no extra text:
{"verbal_output":"...","updated_agitation":0.XX,"nonverbal_cues":"brief physical observation"}`;

  const res = await fetch(`${WORKER_URL}/claude`,{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-6",max_tokens:1000,system,
      messages:[...apiHistory.slice(-10),{role:"user",content:clinicianInput}]
    })
  });
  if (!res.ok) throw new Error(`Actor API ${res.status}`);
  const data = await res.json();
  const text = data.content[0].text;
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
    return {
      verbal_output: parsed.verbal_output||"...",
      updated_agitation: Math.max(0, Math.min(1, parsed.updated_agitation ?? agitation)),
      nonverbal_cues: parsed.nonverbal_cues||""
    };
  } catch {
    return {verbal_output:text.slice(0,280), updated_agitation:agitation, nonverbal_cues:""};
  }
}

async function callCoach(scenario, difficulty, agitation, clinicianInput, recentHistory) {
  const system = `You are an expert DBT clinical supervisor evaluating a trainee's live crisis intervention response. Be specific, honest, and clinically rigorous.

SCENARIO: ${scenario.title} — ${scenario.clientName}, ${scenario.age} (${scenario.pronouns})
CONTEXT: ${scenario.context}
CLIENT'S CURRENT AGITATION: ${agitation.toFixed(2)}/1.0
DIFFICULTY: ${difficulty.toUpperCase()}

DBT SKILLS FRAMEWORK TO EVALUATE AGAINST:
- Validation L1-6: Listening/attending, Accurate reflection, Mind-reading, Understanding history basis, Radical genuineness, Treating as equal
- DEAR MAN: Describe, Express, Assert, Reinforce, Mindful, Appear confident, Negotiate
- GIVE: Gentle, Interested, Validate, Easy manner (relationship preservation)
- FAST: Fair, no Apologies, Stick to values, Truthful (self-respect)
- TIPP: Temperature, Intense exercise, Paced breathing, Progressive relaxation
- Opposite Action, Radical Acceptance, Non-judgmental stance, Mindfulness
- Motivational Interviewing: Open questions, Affirm, Reflect, Summarize
- Safety-first language, Trauma-informed approach, Autonomy support

SCORING (be precise, do not inflate):
0.88-1.0: Expert — multiple layered skills, perfect timing, therapeutic alliance advanced
0.72-0.87: Proficient — solid skill use, minor gaps, rapport maintained
0.55-0.71: Developing — basic competency, clear missed opportunities
0.35-0.54: Minimal — some rapport maintained but technique inadequate
0.00-0.34: Harmful — confrontational, rapport-breaking, or counterproductive

TRAINEE STATEMENT: "${clinicianInput}"
RECENT SESSION HISTORY: ${JSON.stringify(recentHistory.slice(-6))}

Respond ONLY as valid JSON (no markdown):
{"dbt_adherence_score":0.XX,"feedback":"specific 1-2 sentence clinical feedback referencing what they did","suggested_intervention":"one concrete specific next step or line to try","skills_detected":["up to 3 specific skills"],"skills_missed":["up to 3 specific missed opportunities"]}`;

  const res = await fetch(`${WORKER_URL}/claude`,{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-6",max_tokens:1000,system,
      messages:[{role:"user",content:"Evaluate this trainee statement now."}]
    })
  });
  if (!res.ok) throw new Error(`Coach API ${res.status}`);
  const data = await res.json();
  const text = data.content[0].text;
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
    return {
      dbt_adherence_score: Math.max(0,Math.min(1, parsed.dbt_adherence_score??0.5)),
      feedback: parsed.feedback||"Evaluation unavailable.",
      suggested_intervention: parsed.suggested_intervention||"Continue building rapport.",
      skills_detected: parsed.skills_detected||[],
      skills_missed: parsed.skills_missed||[]
    };
  } catch {
    return {dbt_adherence_score:0.5,feedback:"Evaluation unavailable.",suggested_intervention:"Continue building rapport.",skills_detected:[],skills_missed:[]};
  }
}

/* ── Main Component ──────────────────────────────────── */
export default function AegisSimulator() {
  const [screen,        setScreen]       = useState("setup");
  const [selectedSc,    setSelectedSc]   = useState(SCENARIOS[0]);
  const [selectedDiff,  setSelectedDiff] = useState("intermediate");
  const [agitation,     setAgitation]    = useState(0.75);
  const [agiHistory,    setAgiHistory]   = useState([]);
  const [conversation,  setConversation] = useState([]);
  const [apiHistory,    setApiHistory]   = useState([]);
  const [adherenceLogs, setAdherenceLogs]= useState([]);
  const [clinInput,     setCliInput]     = useState("");
  const [isProcessing,  setIsProcessing] = useState(false);
  const [isInit,        setIsInit]       = useState(false);
  const [currentCoach,  setCurrentCoach] = useState(null);
  const [report,        setReport]       = useState(null);
  const [error,         setError]        = useState(null);
  const [elapsed,       setElapsed]      = useState(0);
  const [turnCount,     setTurnCount]    = useState(0);
  const [showDbt,       setShowDbt]      = useState(false);
  const [clinProfile,   setClinProfile]  = useState("child_psych");
  const [isHinting,     setIsHinting]    = useState(false);
  const [currentHint,   setCurrentHint]  = useState(null);
  const [showHint,      setShowHint]     = useState(false);
  const [disclaimerAck, setDisclaimerAck]= useState(false);

  const convRef  = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(()=>{
    if(convRef.current) convRef.current.scrollTop=convRef.current.scrollHeight;
  },[conversation]);

  useEffect(()=>{
    if(screen==="simulation"){
      timerRef.current=setInterval(()=>setElapsed(e=>e+1),1000);
    } else { clearInterval(timerRef.current); }
    return ()=>clearInterval(timerRef.current);
  },[screen]);

  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const diff=DIFFICULTIES.find(d=>d.id===selectedDiff);

  /* ── Start simulation ── */
  const startSimulation = async () => {
    const sc=selectedSc;
    const initAgi=Math.max(0,Math.min(1,sc.initialAgitation+diff.modifier));
    setScreen("simulation");
    setAgitation(initAgi); setAgiHistory([initAgi]); setConversation([]);
    setApiHistory([]); setAdherenceLogs([]); setCurrentCoach(null);
    setCurrentHint(null); setShowHint(false);
    setElapsed(0); setTurnCount(0); setError(null); setIsInit(true);

    try {
      const sys=`You are ${sc.clientName}, ${sc.age} (${sc.pronouns}), in acute psychiatric crisis.
Context: ${sc.context}
Initial agitation: ${initAgi.toFixed(2)}/1.0
Generate your OPENING behavioral presentation as the clinician enters the room.
1-2 sentences MAX. Emotionally raw, authentic adolescent voice.
Respond ONLY as valid JSON: {"verbal_output":"...","updated_agitation":${initAgi.toFixed(2)},"nonverbal_cues":"brief physical description"}`;

      const res=await fetch(`${WORKER_URL}/claude`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:sys,messages:[{role:"user",content:"Begin session."}]})
      });
      const data=await res.json();
      const text=data.content?.[0]?.text||"";
      let parsed;
      try{parsed=JSON.parse(text.replace(/```json|```/g,"").trim());}
      catch{parsed={verbal_output:"...",updated_agitation:initAgi,nonverbal_cues:"Refuses eye contact. Extremely tense."};}
      const agi=Math.max(0,Math.min(1,parsed.updated_agitation??initAgi));
      setAgitation(agi);
      setConversation([{id:Date.now(),role:"actor",content:parsed.verbal_output,nonverbal:parsed.nonverbal_cues||"",agitation:agi,coachScore:null}]);
      setApiHistory([{role:"assistant",content:parsed.verbal_output}]);
    } catch(err){
      setError("Initialization error: "+err.message);
      setConversation([{id:Date.now(),role:"actor",content:"...",nonverbal:"Refuses eye contact. Extremely tense.",agitation:initAgi,coachScore:null}]);
    }
    setIsInit(false);
  };

  /* ── Execute turn (parallel inference) ── */
  const executeTurn = async () => {
    if(!clinInput.trim()||isProcessing||isInit) return;
    const input=clinInput.trim();
    setCliInput(""); setIsProcessing(true); setError(null);
    setConversation(h=>[...h,{id:Date.now(),role:"clinician",content:input,agitation,coachScore:null}]);
    const newApiHist=[...apiHistory,{role:"user",content:input}];

    try {
      // ── PARALLEL: Actor + Coach run simultaneously ──
      const [actorResult, coachResult] = await Promise.all([
        callActor(selectedSc, selectedDiff, agitation, apiHistory, input),
        callCoach(selectedSc, selectedDiff, agitation, input, newApiHist)
      ]);

      const newAgi=actorResult.updated_agitation;
      setAgitation(newAgi);
      setAgiHistory(h=>[...h,newAgi]);
      setCurrentCoach(coachResult);
      setAdherenceLogs(l=>[...l,coachResult]);
      setTurnCount(t=>t+1);
      setConversation(h=>[...h,{
        id:Date.now()+1,role:"actor",
        content:actorResult.verbal_output,
        nonverbal:actorResult.nonverbal_cues||"",
        agitation:newAgi,
        coachScore:coachResult.dbt_adherence_score
      }]);
      setApiHistory([...newApiHist,{role:"assistant",content:actorResult.verbal_output}]);
    } catch(err){
      setError(err.message||"Turn failed. Check connection and try again.");
    }
    setIsProcessing(false);
    setTimeout(()=>inputRef.current?.focus(),100);
  };

  /* ── Emergency Hint (STUCK button) ── */
  const callHint = async () => {
    setIsHinting(true); setShowHint(true); setCurrentHint(null);
    const sc=selectedSc;
    const profile=CLINICIAN_PROFILES.find(p=>p.id===clinProfile);
    const recentCtx=conversation.slice(-6).map(m=>
      `${m.role==="clinician"?"CLINICIAN":sc.clientName}: "${m.content}"`
    ).join("\n");

    const system=`You are an expert clinical supervisor providing emergency coaching to a STUCK trainee.

CLINICIAN PROFILE: ${profile.label} (${profile.degree}) — Specialties: ${profile.specialties.join(", ")}
SCENARIO: ${sc.title} — ${sc.clientName}, ${sc.age} (${sc.pronouns})
CLIENT CONTEXT: ${sc.context}
CURRENT AGITATION: ${agitation.toFixed(2)}/1.0
RECENT SESSION:
${recentCtx||"(Session just started — no turns yet)"}

The trainee is stuck and needs immediate, directive guidance. Be a hands-on supervisor.

Give them:
1. EXACTLY what to say right now — word for word, as if you were handing them a script
2. The specific DBT skill/framework you're using and why it fits this moment
3. What to watch for as a signal it's working (or not)

Be highly specific to THIS client and THIS moment. Not generic.

Respond ONLY as valid JSON (no markdown):
{"what_to_say":"exact words to use verbatim","skill_name":"specific DBT skill being applied","why_it_works":"1 sentence clinical rationale for this client right now","watch_for":"specific client behavior or signal to look for"}`;

    try {
      const res=await fetch(`${WORKER_URL}/claude`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system,
          messages:[{role:"user",content:"I'm stuck. What do I do right now?"}]})
      });
      const data=await res.json();
      const text=data.content[0].text;
      let parsed;
      try{parsed=JSON.parse(text.replace(/```json|```/g,"").trim());}
      catch{parsed={what_to_say:"'I can hear how much you're hurting right now. I'm not going anywhere.'",skill_name:"Validation Level 3 — Emotional acknowledgment",why_it_works:"Safety and presence always de-escalate when nothing else works.",watch_for:"Any physical softening — unclenched hands, exhale, eye movement toward you."};}
      setCurrentHint(parsed);
    } catch{
      setCurrentHint({what_to_say:"'I'm here. Take your time. There's no rush.'",skill_name:"Presence + Validation L1",why_it_works:"Silence with presence is powerful when all else feels stuck.",watch_for:"A breath, a shift in body language, any sign of settling."});
    }
    setIsHinting(false);
  };

  /* ── End session & generate report ── */
  const endSession = () => {
    clearInterval(timerRef.current);
    if(adherenceLogs.length===0){setScreen("setup");return;}
    const avgDBT=adherenceLogs.reduce((s,l)=>s+l.dbt_adherence_score,0)/adherenceLogs.length;
    const finalAgi=agiHistory[agiHistory.length-1]??agitation;
    const initAgi=agiHistory[0]??agitation;
    const peakAgi=Math.max(...agiHistory);
    const delta=initAgi-finalAgi;
    const allDet={},allMis={};
    adherenceLogs.forEach(l=>{
      (l.skills_detected||[]).forEach(s=>{allDet[s]=(allDet[s]||0)+1;});
      (l.skills_missed||[]).forEach(s=>{allMis[s]=(allMis[s]||0)+1;});
    });
    const rating=avgDBT>=0.82?"EXPERT":avgDBT>=0.68?"PROFICIENT":avgDBT>=0.52?"DEVELOPING":"NEEDS WORK";
    const ratingCol=avgDBT>=0.82?"#00FFB2":avgDBT>=0.68?"#00D4FF":avgDBT>=0.52?"#FFB800":"#FF4D6A";
    setReport({
      scenario:selectedSc,difficulty:diff,avgDBT,finalAgi,initAgi,peakAgi,delta,
      allDet,allMis,rating,ratingCol,turns:adherenceLogs.length,
      duration:elapsed,agiHistory:[...agiHistory],logs:[...adherenceLogs]
    });
    setScreen("report");
  };

  /* ════════════════════════════════════════
     DISCLAIMER GATE
  ════════════════════════════════════════ */
  const renderDisclaimer = () => (
    <div style={{
      position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",
      background:"rgba(4,8,18,0.92)",backdropFilter:"blur(8px)",padding:"20px",
    }}>
      <div className="gl" style={{
        maxWidth:"460px",borderRadius:"20px",padding:"32px 28px",
        border:"1px solid rgba(255,77,106,0.28)",boxShadow:"0 0 60px rgba(255,77,106,0.1)",
      }}>
        <div style={{fontSize:"11px",fontWeight:800,letterSpacing:"0.14em",color:"var(--ros)",marginBottom:"14px"}}>
          ⚠ CLINICAL TRAINING SIMULATION
        </div>
        <p style={{fontSize:"14px",lineHeight:1.75,color:"var(--tx)",marginBottom:"14px"}}>
          AEGIS is a training simulation built for licensed clinicians and clinical
          students practicing crisis-intervention skills. Scenarios contain realistic,
          emotionally intense psychiatric crisis content, including references to
          self-harm, suicidal ideation, and acute behavioral dysregulation across
          child, adolescent, and adult clinical populations, presented for clinical
          training purposes.
        </p>
        <p style={{fontSize:"13px",lineHeight:1.7,color:"var(--tm)",marginBottom:"22px"}}>
          This tool is not intended for general consumer use and does not provide
          real clinical care. If you or someone you know is in crisis, please contact
          a crisis line or emergency services directly.
        </p>
        <button
          onClick={()=>setDisclaimerAck(true)}
          className="tx-btn"
          style={{width:"100%",padding:"14px",fontSize:"13px",letterSpacing:"0.04em"}}
        >
          <span style={{position:"relative",zIndex:1}}>I UNDERSTAND — ENTER SIMULATION →</span>
        </button>
      </div>
    </div>
  );

  /* ════════════════════════════════════════
     SETUP SCREEN
  ════════════════════════════════════════ */
  const renderSetup = () => (
    <div style={{minHeight:"100vh",position:"relative",zIndex:1,maxWidth:900,margin:"0 auto",padding:"44px 20px 80px"}}>
      {/* Header */}
      <div className="sc" style={{textAlign:"center",marginBottom:50}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,77,106,.1)",border:"1px solid rgba(255,77,106,.25)",borderRadius:999,padding:"5px 16px",marginBottom:24}}>
          <div style={{position:"relative",width:8,height:8}}>
            <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"#FF4D6A",animation:"ring 1.8s ease-out infinite"}}/>
            <div style={{position:"absolute",inset:"1px",borderRadius:"50%",background:"#FF4D6A"}}/>
          </div>
          <span style={{fontFamily:"var(--fm)",fontSize:10,color:"#FF4D6A",letterSpacing:"2.5px"}}>SIMULATION SYSTEM ONLINE</span>
        </div>
        <div style={{fontFamily:"var(--fd)",fontSize:72,fontWeight:800,letterSpacing:"-4px",lineHeight:.9,marginBottom:16,animation:"breathe 5s ease-in-out infinite"}}>
          AEGIS
        </div>
        <div style={{fontFamily:"var(--fm)",fontSize:11,color:"var(--tm)",letterSpacing:"4px",marginBottom:18,textTransform:"uppercase"}}>Clinical Simulation Engine · v2.0</div>
        <div style={{fontFamily:"var(--fm)",fontSize:12,color:"rgba(232,240,255,.32)",maxWidth:500,margin:"0 auto",lineHeight:1.85}}>
          Dual-agent AI platform for DBT crisis intervention training.<br/>
          Real-time supervisory feedback. Authentic adolescent simulation.<br/>
          <span style={{color:"rgba(0,212,255,.5)"}}>Actor Agent + Supervisor Agent — parallel inference per turn.</span>
        </div>
      </div>

      {/* Scenario selector */}
      <div className="s1" style={{marginBottom:28}}>
        <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"2.5px",textTransform:"uppercase",marginBottom:12}}>Select Crisis Scenario</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {SCENARIOS.map(sc=>(
            <div key={sc.id} className={`gl sc-card ${selectedSc.id===sc.id?"sel":""}`}
              style={{borderRadius:18,padding:"18px 20px",borderLeft:`3px solid ${selectedSc.id===sc.id?sc.riskColor:"rgba(255,255,255,.1)"}`,boxShadow:selectedSc.id===sc.id?`0 0 26px ${sc.riskColor}20`:""}}
              onClick={()=>setSelectedSc(sc)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <span style={{fontSize:26}}>{sc.icon}</span>
                <div style={{fontFamily:"var(--fm)",fontSize:9,color:sc.riskColor,background:`${sc.riskColor}18`,padding:"3px 9px",borderRadius:20,border:`1px solid ${sc.riskColor}40`,letterSpacing:"1px"}}>{sc.riskLevel}</div>
              </div>
              <div style={{fontFamily:"var(--fd)",fontSize:15,fontWeight:700,marginBottom:6}}>{sc.title}</div>
              <div style={{fontFamily:"var(--fm)",fontSize:11,color:"var(--tm)",lineHeight:1.7,marginBottom:10}}>{sc.description}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {sc.tags.map(t=>(
                  <span key={t} style={{fontFamily:"var(--fm)",fontSize:9,color:"rgba(232,240,255,.45)",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",padding:"2px 8px",borderRadius:20}}>{t}</span>
                ))}
              </div>
              {selectedSc.id===sc.id&&(
                <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.07)"}}>
                  <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--cyan)",letterSpacing:"1.5px",marginBottom:5}}>INITIAL AGITATION</div>
                  <div style={{height:4,background:"rgba(255,255,255,.05)",borderRadius:99,overflow:"hidden",marginBottom:4}}>
                    <div style={{height:"100%",width:`${sc.initialAgitation*100}%`,background:`linear-gradient(to right,${sc.riskColor}55,${sc.riskColor})`,borderRadius:99}}/>
                  </div>
                  <div style={{fontFamily:"var(--fm)",fontSize:10,color:sc.riskColor}}>{sc.initialAgitation.toFixed(2)} / 1.0</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="s2" style={{marginBottom:24}}>
        <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"2.5px",textTransform:"uppercase",marginBottom:12}}>Difficulty Level</div>
        <div style={{display:"flex",gap:10}}>
          {DIFFICULTIES.map(d=>(
            <div key={d.id} onClick={()=>setSelectedDiff(d.id)} className="gl"
              style={{flex:1,borderRadius:14,padding:"14px 16px",cursor:"pointer",transition:"all .2s",
                borderLeft:`3px solid ${selectedDiff===d.id?d.color:"rgba(255,255,255,.1)"}`,
                background:selectedDiff===d.id?`${d.color}0D`:"",
                boxShadow:selectedDiff===d.id?`0 0 20px ${d.color}25`:""
              }}>
              <div style={{fontFamily:"var(--fd)",fontSize:13,fontWeight:800,color:selectedDiff===d.id?d.color:"var(--tm)",letterSpacing:"1px",marginBottom:5}}>{d.label}</div>
              <div style={{fontFamily:"var(--fm)",fontSize:11,color:"rgba(232,240,255,.4)",lineHeight:1.65}}>{d.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Clinician profile */}
      <div className="s3" style={{marginBottom:24}}>
        <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"2.5px",textTransform:"uppercase",marginBottom:12}}>Your Clinical Role</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {CLINICIAN_PROFILES.map(p=>(
            <div key={p.id} onClick={()=>setClinProfile(p.id)} className="gl"
              style={{borderRadius:14,padding:"14px 16px",cursor:"pointer",transition:"all .2s",
                borderLeft:`3px solid ${clinProfile===p.id?p.color:"rgba(255,255,255,.1)"}`,
                background:clinProfile===p.id?`${p.color}0D`:"",
                boxShadow:clinProfile===p.id?`0 0 18px ${p.color}22`:""}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <div style={{fontFamily:"var(--fd)",fontSize:13,fontWeight:700,color:clinProfile===p.id?p.color:"var(--tx)"}}>{p.label}</div>
                <div style={{fontFamily:"var(--fm)",fontSize:9,color:p.color,background:`${p.color}16`,padding:"2px 8px",borderRadius:20,border:`1px solid ${p.color}40`}}>{p.degree}</div>
              </div>
              <div style={{fontFamily:"var(--fm)",fontSize:9,color:"rgba(232,240,255,.38)",marginBottom:6}}>{p.ageRange} · {p.note}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {p.specialties.map(s=>(
                  <span key={s} style={{fontFamily:"var(--fm)",fontSize:8,color:clinProfile===p.id?p.color:"rgba(232,240,255,.32)",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",padding:"1px 7px",borderRadius:20}}>{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission brief */}
      <div className="gl s4" style={{borderRadius:20,padding:"20px",marginBottom:20}}>
        <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"2px",marginBottom:14}}>MISSION BRIEF</div>
        <div style={{display:"flex",gap:18,alignItems:"flex-start",marginBottom:16}}>
          <div style={{width:54,height:54,borderRadius:14,background:`${selectedSc.riskColor}16`,border:`2px solid ${selectedSc.riskColor}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{selectedSc.icon}</div>
          <div>
            <div style={{fontFamily:"var(--fd)",fontSize:16,fontWeight:700,marginBottom:6}}>{selectedSc.clientName}, {selectedSc.age} · {selectedSc.title}</div>
            <div style={{fontFamily:"var(--fm)",fontSize:12,color:"var(--tm)",lineHeight:1.8}}>{selectedSc.context}</div>
          </div>
        </div>
        <div style={{paddingTop:14,borderTop:"1px solid rgba(255,255,255,.07)"}}>
          <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--cyan)",letterSpacing:"2px",marginBottom:10}}>KEY CLINICAL CONSIDERATIONS</div>
          {selectedSc.considerations.map((c,i)=>(
            <div key={i} style={{display:"flex",gap:8,marginBottom:7,alignItems:"flex-start"}}>
              <div style={{width:16,height:16,borderRadius:4,background:"var(--cd)",border:"1px solid rgba(0,212,255,.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"var(--cyan)",flexShrink:0,marginTop:1}}>→</div>
              <div style={{fontFamily:"var(--fm)",fontSize:11,color:"rgba(232,240,255,.62)",lineHeight:1.65}}>{c}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="s5">
        <button onClick={startSimulation} style={{
          width:"100%",padding:"18px",background:"linear-gradient(135deg,var(--cyan),#006FA8)",
          color:"#001520",border:"none",fontFamily:"var(--fd)",fontWeight:800,fontSize:16,
          borderRadius:16,cursor:"pointer",boxShadow:"0 0 40px rgba(0,212,255,.32)",
          position:"relative",overflow:"hidden",letterSpacing:".5px"
        }}>
          <span style={{position:"relative",zIndex:1}}>INITIALIZE SIMULATION →</span>
          <div style={{position:"absolute",top:0,bottom:0,width:"35%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent)",animation:"scanBar 2.2s ease-in-out infinite"}}/>
        </button>
        <div style={{fontFamily:"var(--fm)",fontSize:10,color:"rgba(232,240,255,.22)",textAlign:"center",marginTop:12,lineHeight:1.7}}>
          Dual-agent parallel inference · Anthropic API · Azure AI Foundry architecture
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════
     SIMULATION SCREEN
  ════════════════════════════════════════ */
  const renderSimulation = () => {
    const sc=selectedSc;
    const agiColor=agitation>=0.75?"#FF4D6A":agitation>=0.5?"#FFB800":"#00FFB2";

    return (
      <div style={{minHeight:"100vh",position:"relative",zIndex:1,display:"flex",flexDirection:"column"}}>

        {/* TOP BAR */}
        <div className="gl" style={{borderBottom:"1px solid rgba(255,255,255,.07)",padding:"11px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",position:"sticky",top:0,zIndex:200}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{fontFamily:"var(--fd)",fontSize:19,fontWeight:800,color:"var(--cyan)",letterSpacing:"-1px",animation:"breathe 5s ease-in-out infinite"}}>AEGIS</div>
            <div style={{width:1,height:22,background:"rgba(255,255,255,.12)"}}/>
            <div>
              <div style={{fontFamily:"var(--fd)",fontSize:13,fontWeight:700}}>{sc.clientName} — {sc.title}</div>
              <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"1.5px",marginTop:1}}>
                {CLINICIAN_PROFILES.find(p=>p.id===clinProfile)?.label} · TURN {turnCount}
              </div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <div style={{fontFamily:"var(--fm)",fontSize:11,color:agiColor,display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:agiColor,animation:"blink 1.2s ease-in-out infinite",boxShadow:`0 0 8px ${agiColor}`}}/>
              {agitation.toFixed(2)} AGI
            </div>
            <div style={{fontFamily:"var(--fm)",fontSize:11,color:"var(--tm)"}}>⏱ {fmt(elapsed)}</div>
            <div style={{fontFamily:"var(--fm)",fontSize:9,color:diff.color,background:`${diff.color}18`,border:`1px solid ${diff.color}40`,padding:"3px 10px",borderRadius:20,letterSpacing:"1px"}}>{diff.label}</div>
            <button className="end-btn" onClick={endSession} style={{padding:"6px 14px"}}>END SESSION</button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div style={{display:"grid",gridTemplateColumns:"1.15fr 0.85fr",gap:12,padding:"14px 16px",flex:1}}>

          {/* LEFT: CLIENT PANEL */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {/* Client header */}
            <div className="gl" style={{borderRadius:18,padding:"16px 18px",borderLeft:`3px solid ${sc.riskColor}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:46,height:46,borderRadius:12,background:`${sc.riskColor}16`,border:`2px solid ${agiColor}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:`0 0 16px ${agiColor}60`,transition:"border-color .5s,box-shadow .5s"}}>{sc.icon}</div>
                  <div>
                    <div style={{fontFamily:"var(--fd)",fontSize:15,fontWeight:700}}>{sc.clientName}, {sc.age}</div>
                    <div style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--tm)"}}>{sc.pronouns} · {sc.title}</div>
                  </div>
                </div>
                <div style={{fontFamily:"var(--fm)",fontSize:9,color:sc.riskColor,background:`${sc.riskColor}18`,border:`1px solid ${sc.riskColor}40`,padding:"3px 10px",borderRadius:20,letterSpacing:"1px"}}>{sc.riskLevel}</div>
              </div>
              <AgitationMeter value={agitation}/>
            </div>

            {/* Conversation */}
            <div className="gl" style={{borderRadius:18,padding:"14px",flex:1,display:"flex",flexDirection:"column",minHeight:340}}>
              <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"2px",marginBottom:10,paddingBottom:8,borderBottom:"1px solid rgba(255,255,255,.07)"}}>SESSION TRANSCRIPT</div>
              <div ref={convRef} style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingRight:3}}>
                {isInit&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px",fontFamily:"var(--fm)",fontSize:11,color:"var(--tm)"}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:"var(--cyan)",animation:"blink 0.8s ease-in-out infinite"}}/>
                    Initializing client simulation...
                  </div>
                )}
                {conversation.map(msg=>(
                  <div key={msg.id} style={{animation:"fadeIn .3s ease"}}>
                    {msg.role==="clinician" ? (
                      <div style={{background:"rgba(0,212,255,.05)",border:"1px solid rgba(0,212,255,.15)",borderRadius:"12px 12px 4px 12px",padding:"11px 14px",marginLeft:24}}>
                        <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--cyan)",letterSpacing:"2px",marginBottom:5}}>CLINICIAN</div>
                        <div style={{fontFamily:"var(--fm)",fontSize:13,lineHeight:1.75,color:"rgba(232,240,255,.9)"}}>{msg.content}</div>
                      </div>
                    ) : (
                      <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:"12px 12px 12px 4px",padding:"11px 14px",marginRight:24}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                          <div style={{fontFamily:"var(--fm)",fontSize:9,color:sc.riskColor,letterSpacing:"2px"}}>{sc.clientName.toUpperCase()}</div>
                          {msg.coachScore!==null&&msg.coachScore!==undefined&&(
                            <div style={{fontFamily:"var(--fm)",fontSize:9,color:msg.coachScore>=0.68?"#00FFB2":msg.coachScore>=0.52?"#FFB800":"#FF4D6A"}}>DBT {Math.round(msg.coachScore*100)}</div>
                          )}
                        </div>
                        <div style={{fontFamily:"var(--fm)",fontSize:13,lineHeight:1.75,color:"rgba(232,240,255,.88)"}}>{msg.content}</div>
                        {msg.nonverbal&&(
                          <div style={{fontFamily:"var(--fm)",fontSize:10,color:"rgba(232,240,255,.32)",fontStyle:"italic",marginTop:6,paddingTop:6,borderTop:"1px solid rgba(255,255,255,.06)"}}>
                            [{msg.nonverbal}]
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {isProcessing&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px",fontFamily:"var(--fm)",fontSize:11,color:"var(--tm)"}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:"var(--amb)",animation:"blink 0.7s ease-in-out infinite"}}/>
                    Parallel inference running — actor + supervisor...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: COACH PANEL */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {/* Supervisor score */}
            <div className="gl" style={{borderRadius:18,padding:"16px 18px",borderLeft:"3px solid rgba(167,139,250,.6)"}}>
              <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--vio)",letterSpacing:"2px",marginBottom:14}}>SUPERVISOR OVERLAY — REAL TIME</div>
              <div style={{display:"flex",alignItems:"center",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
                {currentCoach ? <DBTRing score={currentCoach.dbt_adherence_score}/> : (
                  <div style={{width:96,height:96,borderRadius:"50%",border:"4px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",textAlign:"center",lineHeight:1.65}}>AWAITING<br/>INPUT</div>
                  </div>
                )}
                {adherenceLogs.length>0&&(
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"1.5px",marginBottom:2}}>TURN HISTORY</div>
                    {adherenceLogs.slice(-7).map((l,i)=>{
                      const c=l.dbt_adherence_score>=0.68?"#00FFB2":l.dbt_adherence_score>=0.52?"#FFB800":"#FF4D6A";
                      return (
                        <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:c,boxShadow:`0 0 5px ${c}`,flexShrink:0}}/>
                          <div style={{width:44,height:3,background:"rgba(255,255,255,.05)",borderRadius:99,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${l.dbt_adherence_score*100}%`,background:c,borderRadius:99}}/>
                          </div>
                          <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",minWidth:22}}>{Math.round(l.dbt_adherence_score*100)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Coach feedback or intro */}
            {currentCoach ? (
              <div className="gl" style={{borderRadius:18,padding:"16px 18px",animation:"fadeIn .35s ease",flex:1,display:"flex",flexDirection:"column",gap:12,overflowY:"auto"}}>
                <div style={{borderLeft:"2px solid var(--vio)",paddingLeft:12}}>
                  <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--vio)",letterSpacing:"2px",marginBottom:6}}>CLINICAL FEEDBACK</div>
                  <div style={{fontFamily:"var(--fm)",fontSize:12,color:"rgba(232,240,255,.82)",lineHeight:1.8}}>{currentCoach.feedback}</div>
                </div>
                <div style={{borderRadius:10,background:"rgba(0,212,255,.05)",border:"1px solid rgba(0,212,255,.14)",padding:"12px 14px"}}>
                  <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--cyan)",letterSpacing:"2px",marginBottom:6}}>TRY NEXT</div>
                  <div style={{fontFamily:"var(--fm)",fontSize:12,color:"rgba(232,240,255,.82)",lineHeight:1.75}}>{currentCoach.suggested_intervention}</div>
                </div>
                {currentCoach.skills_detected?.length>0&&(
                  <div>
                    <div style={{fontFamily:"var(--fm)",fontSize:9,color:"#00FFB2",letterSpacing:"1.5px",marginBottom:6}}>✓ DETECTED</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                      {currentCoach.skills_detected.map((s,i)=>(
                        <span key={i} style={{fontFamily:"var(--fm)",fontSize:10,color:"#00FFB2",background:"rgba(0,255,178,.08)",border:"1px solid rgba(0,255,178,.22)",padding:"3px 10px",borderRadius:20}}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {currentCoach.skills_missed?.length>0&&(
                  <div>
                    <div style={{fontFamily:"var(--fm)",fontSize:9,color:"#FFB800",letterSpacing:"1.5px",marginBottom:6}}>△ MISSED</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                      {currentCoach.skills_missed.map((s,i)=>(
                        <span key={i} style={{fontFamily:"var(--fm)",fontSize:10,color:"#FFB800",background:"rgba(255,184,0,.08)",border:"1px solid rgba(255,184,0,.22)",padding:"3px 10px",borderRadius:20}}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Hint card */}
                {showHint&&(
                  <div style={{borderRadius:12,background:"rgba(255,77,106,.06)",border:"1px solid rgba(255,77,106,.25)",padding:"14px",animation:"fadeIn .4s ease"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{fontFamily:"var(--fm)",fontSize:9,color:"#FF4D6A",letterSpacing:"2px"}}>🆘 EMERGENCY HINT</div>
                      <button onClick={()=>setShowHint(false)} style={{color:"rgba(255,77,106,.5)",background:"none",border:"none",cursor:"pointer",fontSize:14}}>×</button>
                    </div>
                    {isHinting?(
                      <div style={{fontFamily:"var(--fm)",fontSize:11,color:"var(--tm)"}}>Generating hint...</div>
                    ):currentHint?(
                      <>
                        <div style={{fontFamily:"var(--fm)",fontSize:9,color:"rgba(255,77,106,.7)",letterSpacing:"1.5px",marginBottom:4}}>SAY THIS NOW</div>
                        <div style={{fontFamily:"var(--fd)",fontSize:13,color:"#FF4D6A",lineHeight:1.7,marginBottom:10,fontStyle:"italic"}}>"{currentHint.what_to_say}"</div>
                        <div style={{fontFamily:"var(--fm)",fontSize:9,color:"rgba(255,255,255,.5)",letterSpacing:"1px",marginBottom:3}}>SKILL: {currentHint.skill_name}</div>
                        <div style={{fontFamily:"var(--fm)",fontSize:11,color:"rgba(232,240,255,.55)",lineHeight:1.65,marginBottom:6}}>{currentHint.why_it_works}</div>
                        <div style={{fontFamily:"var(--fm)",fontSize:9,color:"rgba(255,255,255,.35)",letterSpacing:"1px",marginBottom:3}}>WATCH FOR</div>
                        <div style={{fontFamily:"var(--fm)",fontSize:11,color:"rgba(232,240,255,.45)",lineHeight:1.6}}>{currentHint.watch_for}</div>
                      </>
                    ):null}
                  </div>
                )}
              </div>
            ) : (
              <div className="gl" style={{borderRadius:18,padding:"20px",flex:1,display:"flex",flexDirection:"column",gap:10}}>
                <div style={{fontFamily:"var(--fm)",fontSize:11,color:"var(--tm)",textAlign:"center",lineHeight:1.85,paddingTop:8}}>
                  Supervisor evaluates each response in real time.<br/>
                  <span style={{color:"var(--cyan)"}}>Submit your first response to begin.</span>
                </div>
                <div style={{paddingTop:12,borderTop:"1px solid rgba(255,255,255,.07)"}}>
                  <div onClick={()=>setShowDbt(p=>!p)} style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--vio)",letterSpacing:"2px",cursor:"pointer",display:"flex",justifyContent:"space-between",userSelect:"none"}}>
                    <span>DBT QUICK REFERENCE</span><span>{showDbt?"▲":"▼"}</span>
                  </div>
                  {showDbt&&(
                    <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:7,animation:"fadeIn .3s ease"}}>
                      {DBT_REF.map(([k,v])=>(
                        <div key={k} style={{display:"flex",gap:8}}>
                          <div style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--vio)",minWidth:72,fontWeight:600,flexShrink:0}}>{k}</div>
                          <div style={{fontFamily:"var(--fm)",fontSize:10,color:"rgba(232,240,255,.38)",lineHeight:1.55}}>{v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* INPUT BAR */}
        <div className="gl" style={{borderTop:"1px solid rgba(255,255,255,.07)",padding:"12px 16px",position:"sticky",bottom:0,zIndex:200}}>
          {error&&(
            <div style={{fontFamily:"var(--fm)",fontSize:11,color:"var(--ros)",background:"var(--rd)",border:"1px solid rgba(255,77,106,.28)",borderRadius:10,padding:"7px 14px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>⚠ {error}</span>
              <button onClick={()=>setError(null)} style={{color:"var(--ros)",background:"none",border:"none",cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>
            </div>
          )}
          {showDbt&&(
            <div style={{marginBottom:10,padding:"10px 12px",background:"rgba(167,139,250,.06)",border:"1px solid rgba(167,139,250,.18)",borderRadius:10,display:"flex",flexWrap:"wrap",gap:7,animation:"fadeIn .25s ease"}}>
              {DBT_REF.map(([k,v])=>(
                <div key={k} style={{display:"flex",gap:5,alignItems:"baseline",background:"rgba(167,139,250,.06)",border:"1px solid rgba(167,139,250,.2)",borderRadius:8,padding:"3px 10px"}}>
                  <span style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--vio)",fontWeight:600,whiteSpace:"nowrap"}}>{k}</span>
                  <span style={{fontFamily:"var(--fm)",fontSize:9,color:"rgba(232,240,255,.35)"}}>{v}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"2px"}}>CLINICIAN RESPONSE TERMINAL</div>
                <div style={{fontFamily:"var(--fm)",fontSize:9,color:clinInput.length>580?"var(--ros)":"var(--tm)"}}>{clinInput.length}/600</div>
              </div>
              <textarea ref={inputRef} value={clinInput}
                onChange={e=>e.target.value.length<=600 && setCliInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!isProcessing){e.preventDefault();executeTurn();}}}
                placeholder="Type your clinical response... (Enter to transmit, Shift+Enter for newline)"
                rows={3} disabled={isProcessing||isInit}/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7,paddingBottom:1}}>
              <button className="tx-btn" onClick={executeTurn} disabled={!clinInput.trim()||isProcessing||isInit} style={{padding:"13px 20px",whiteSpace:"nowrap"}}>
                {isProcessing?"RUNNING...":"TRANSMIT →"}
              </button>
              <button onClick={callHint} disabled={isHinting||isInit||conversation.length===0} className="gh-btn"
                style={{padding:"8px 12px",fontSize:11,background:"rgba(255,77,106,.08)",borderColor:"rgba(255,77,106,.28)",color:isHinting?"var(--tm)":"#FF4D6A",whiteSpace:"nowrap"}}>
                {isHinting?"THINKING...":"🆘 STUCK?"}
              </button>
              <button className="gh-btn" onClick={()=>setShowDbt(p=>!p)} style={{padding:"7px 12px",fontSize:11}}>
                DBT REF {showDbt?"▲":"▼"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ════════════════════════════════════════
     REPORT SCREEN
  ════════════════════════════════════════ */
  const renderReport = () => {
    if(!report) return null;
    const r=report;
    const topDet=Object.entries(r.allDet).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const topMis=Object.entries(r.allMis).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const agiColor=r.finalAgi>=0.75?"#FF4D6A":r.finalAgi>=0.5?"#FFB800":"#00FFB2";
    const deltaColor=r.delta>0.08?"#00FFB2":r.delta>=0?"#FFB800":"#FF4D6A";

    return (
      <div style={{minHeight:"100vh",position:"relative",zIndex:1,maxWidth:860,margin:"0 auto",padding:"44px 20px 80px"}}>
        {/* Header */}
        <div className="sc" style={{textAlign:"center",marginBottom:44}}>
          <div style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--tm)",letterSpacing:"3px",marginBottom:20}}>SESSION COMPLETE · AEGIS REPORT</div>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:120,height:120,borderRadius:"50%",background:`${r.ratingCol}12`,border:`3px solid ${r.ratingCol}`,boxShadow:`0 0 44px ${r.ratingCol}44`,marginBottom:20}}>
            <div style={{fontFamily:"var(--fd)",fontSize:13,fontWeight:800,color:r.ratingCol,letterSpacing:"1.5px",textAlign:"center",lineHeight:1.3}}>{r.rating}</div>
          </div>
          <div style={{fontFamily:"var(--fm)",fontSize:12,color:"var(--tm)"}}>{r.scenario.title} · {r.scenario.clientName}, {r.scenario.age} · {r.difficulty.label}</div>
        </div>

        {/* Stats grid */}
        <div className="s1" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(128px,1fr))",gap:10,marginBottom:22}}>
          {[
            ["AVG DBT SCORE",`${Math.round(r.avgDBT*100)}`,"/ 100","var(--vio)"],
            ["AGI CHANGE",r.delta>=0?`↓ ${(r.delta*100).toFixed(0)}%`:`↑ ${(Math.abs(r.delta)*100).toFixed(0)}%`,"",deltaColor],
            ["PEAK AGITATION",r.peakAgi.toFixed(2),"/ 1.0","#FF4D6A"],
            ["FINAL AGITATION",r.finalAgi.toFixed(2),"/ 1.0",agiColor],
            ["TURNS",r.turns,"","var(--cyan)"],
            ["DURATION",`${Math.floor(r.duration/60)}m ${r.duration%60}s`,"","var(--tm)"],
          ].map(([label,val,unit,color])=>(
            <div key={label} className="gl" style={{borderRadius:14,padding:"16px",textAlign:"center"}}>
              <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"1.5px",marginBottom:8,textTransform:"uppercase",lineHeight:1.4}}>{label}</div>
              <div style={{fontFamily:"var(--fm)",fontSize:22,fontWeight:500,color}}>{val}<span style={{fontSize:12,color:"var(--tm)",marginLeft:3}}>{unit}</span></div>
            </div>
          ))}
        </div>

        {/* Agitation trend */}
        <div className="gl s2" style={{borderRadius:20,padding:"20px",marginBottom:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"2px"}}>AGITATION TREND — FULL SESSION</div>
            <div style={{fontFamily:"var(--fm)",fontSize:10,color:deltaColor}}>{r.delta>=0?"De-escalated ↓":"Escalated ↑"} {(Math.abs(r.delta)*100).toFixed(0)}%</div>
          </div>
          <Sparkline data={r.agiHistory} color={r.delta>0.05?"#00FFB2":"#FF4D6A"} height={64}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
            <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)"}}>Session start: {r.initAgi.toFixed(2)}</div>
            <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)"}}>Session end: {r.finalAgi.toFixed(2)}</div>
          </div>
        </div>

        {/* Skills analysis */}
        <div className="s3" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18}}>
          <div className="gl" style={{borderRadius:18,padding:"18px",borderLeft:"3px solid #00FFB2"}}>
            <div style={{fontFamily:"var(--fm)",fontSize:9,color:"#00FFB2",letterSpacing:"2px",marginBottom:14}}>SKILLS APPLIED</div>
            {topDet.length>0 ? topDet.map(([skill,count])=>(
              <div key={skill} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontFamily:"var(--fm)",fontSize:11,color:"rgba(232,240,255,.72)"}}>{skill}</div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:42,height:3,background:"rgba(255,255,255,.05)",borderRadius:99,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(count/r.turns)*100}%`,background:"#00FFB2",borderRadius:99}}/>
                  </div>
                  <div style={{fontFamily:"var(--fm)",fontSize:10,color:"#00FFB2",width:18,textAlign:"right"}}>{count}x</div>
                </div>
              </div>
            )) : <div style={{fontFamily:"var(--fm)",fontSize:11,color:"var(--tm)"}}>None detected</div>}
          </div>
          <div className="gl" style={{borderRadius:18,padding:"18px",borderLeft:"3px solid #FFB800"}}>
            <div style={{fontFamily:"var(--fm)",fontSize:9,color:"#FFB800",letterSpacing:"2px",marginBottom:14}}>GROWTH AREAS</div>
            {topMis.length>0 ? topMis.map(([skill,count])=>(
              <div key={skill} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontFamily:"var(--fm)",fontSize:11,color:"rgba(232,240,255,.72)"}}>{skill}</div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:42,height:3,background:"rgba(255,255,255,.05)",borderRadius:99,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(count/r.turns)*100}%`,background:"#FFB800",borderRadius:99}}/>
                  </div>
                  <div style={{fontFamily:"var(--fm)",fontSize:10,color:"#FFB800",width:18,textAlign:"right"}}>{count}x</div>
                </div>
              </div>
            )) : <div style={{fontFamily:"var(--fm)",fontSize:11,color:"var(--tm)"}}>None recorded</div>}
          </div>
        </div>

        {/* Turn-by-turn */}
        <div className="gl s4" style={{borderRadius:20,padding:"20px",marginBottom:22}}>
          <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"2px",marginBottom:16}}>TURN-BY-TURN BREAKDOWN</div>
          {r.logs.map((l,i)=>{
            const c=l.dbt_adherence_score>=0.68?"#00FFB2":l.dbt_adherence_score>=0.52?"#FFB800":"#FF4D6A";
            const agi=r.agiHistory[i+1]??r.agiHistory[i];
            return (
              <div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderTop:i>0?"1px solid rgba(255,255,255,.06)":"none",alignItems:"flex-start"}}>
                <div style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--tm)",width:20,flexShrink:0,paddingTop:2}}>{i+1}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                    <div style={{fontFamily:"var(--fm)",fontSize:11,color:c,fontWeight:600}}>DBT {Math.round(l.dbt_adherence_score*100)}</div>
                    <div style={{fontFamily:"var(--fm)",fontSize:10,color:"rgba(232,240,255,.32)"}}>→ AGI {agi.toFixed(2)}</div>
                    {(l.skills_detected||[]).slice(0,2).map(s=>(
                      <span key={s} style={{fontFamily:"var(--fm)",fontSize:9,color:"#00FFB2",background:"rgba(0,255,178,.07)",border:"1px solid rgba(0,255,178,.2)",padding:"1px 7px",borderRadius:20}}>{s}</span>
                    ))}
                  </div>
                  <div style={{fontFamily:"var(--fm)",fontSize:11,color:"rgba(232,240,255,.5)",lineHeight:1.65}}>{l.feedback}</div>
                  {l.suggested_intervention&&<div style={{fontFamily:"var(--fm)",fontSize:10,color:"rgba(0,212,255,.55)",marginTop:3}}>Try: {l.suggested_intervention}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="s5" style={{display:"flex",gap:12}}>
          <button className="gh-btn" onClick={()=>{setReport(null);setScreen("setup");}} style={{flex:1,padding:"16px",fontSize:14}}>← New Simulation</button>
          <button onClick={startSimulation} style={{
            flex:2,padding:"16px",background:"linear-gradient(135deg,var(--cyan),#006FA8)",
            color:"#001520",border:"none",fontFamily:"var(--fd)",fontWeight:800,fontSize:14,
            borderRadius:12,cursor:"pointer",boxShadow:"0 0 28px rgba(0,212,255,.3)",
            position:"relative",overflow:"hidden"
          }}>
            <span style={{position:"relative",zIndex:1}}>RETRY SAME SCENARIO →</span>
            <div style={{position:"absolute",top:0,bottom:0,width:"35%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent)",animation:"scanBar 2.2s ease-in-out infinite"}}/>
          </button>
        </div>
      </div>
    );
  };

  /* ── Root ── */
  return (
    <div style={{minHeight:"100vh",fontFamily:"var(--fd)",color:"var(--tx)",position:"relative"}}>
      <Styles/>
      <Mesh/>
      {!disclaimerAck && renderDisclaimer()}
      {disclaimerAck && screen==="setup"      && renderSetup()}
      {disclaimerAck && screen==="simulation" && renderSimulation()}
      {disclaimerAck && screen==="report"     && renderReport()}
    </div>
  );
}
