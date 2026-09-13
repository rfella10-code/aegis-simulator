import { useState, useRef, useEffect } from "react";

/* ═══════════════════════════════════════════════════
   AEGIS — Crisis De-escalation Simulation Engine v3.1
   Multi-Role Dual-Agent Training Platform
   Roles: Clinician (DBT) · Police Officer (CIT/ICAT) · Corrections Officer
   Actor Agent (subject) + Coach Agent (supervisor)
   Parallel inference · Cloudflare edge proxy · Azure-ready abstraction
   Demo: Anthropic API backend · Training simulation only
═══════════════════════════════════════════════════ */

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
    .orbA{animation:orb1 24s ease-in-out infinite;will-change:transform}
    .orbB{animation:orb2 28s ease-in-out infinite;will-change:transform}
    .breathe-t{animation:breathe 5s ease-in-out infinite}
    /* ── Mobile performance mode: touch devices skip backdrop blur + ambient
       animation so scrolling stays smooth. Desktop keeps the full effect. ── */
    @media (hover:none) and (pointer:coarse){
      .orbA,.orbB,.breathe-t{animation:none}
      .gl{backdrop-filter:none;-webkit-backdrop-filter:none;background:rgba(9,14,26,.88)}
      .tx-btn::after{display:none}
    }
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

/* ── AEGIS Logo Mark ─────────────────────────────────
   Inline SVG recreation of the brand mark: orbital rings
   (cyan → violet gradient), white A, violet core dot.
   Scales crisply at any size; no image asset required. */
const AegisLogo = ({ size=64, glow=true }) => (
  <svg width={size} height={size} viewBox="0 0 100 100"
    style={glow?{filter:"drop-shadow(0 0 10px rgba(0,212,255,.35)) drop-shadow(0 0 22px rgba(167,139,250,.22))"}:{}}
    aria-label="AEGIS logo" role="img">
    <defs>
      <linearGradient id="aegisRing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00D4FF"/>
        <stop offset="55%" stopColor="#5B8CFF"/>
        <stop offset="100%" stopColor="#A78BFA"/>
      </linearGradient>
      <linearGradient id="aegisRing2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#A78BFA"/>
        <stop offset="100%" stopColor="#00D4FF"/>
      </linearGradient>
    </defs>
    {/* outer orbital ring — broken arcs */}
    <g fill="none" strokeLinecap="round">
      <circle cx="50" cy="50" r="45" stroke="url(#aegisRing)" strokeWidth="2.6"
        strokeDasharray="150 22 60 51" transform="rotate(-64 50 50)"/>
      <circle cx="50" cy="50" r="38" stroke="url(#aegisRing2)" strokeWidth="2.2"
        strokeDasharray="118 30 52 39" transform="rotate(38 50 50)"/>
    </g>
    {/* orbital nodes */}
    <circle cx="50" cy="5"  r="2.4" fill="#00D4FF"/>
    <circle cx="88" cy="70" r="2.1" fill="#5B8CFF"/>
    <circle cx="13" cy="66" r="2.1" fill="#A78BFA"/>
    <circle cx="26" cy="20" r="1.7" fill="#A78BFA"/>
    {/* the A — chevron with feet */}
    <g stroke="#FFFFFF" strokeWidth="8.5" strokeLinecap="butt" fill="none">
      <path d="M 33 70 L 50 30 L 67 70"/>
    </g>
    <rect x="27" y="66" width="10" height="6" fill="#FFFFFF"/>
    <rect x="63" y="66" width="10" height="6" fill="#FFFFFF"/>
    {/* violet core */}
    <circle cx="50" cy="57" r="6.5" fill="#8B5CF6"/>
  </svg>
);

const WORKER_URL = "https://aegis-proxy.r-fella10.workers.dev";
// Environment auto-detect:
// - Inside a Claude artifact (claude.ai preview), only api.anthropic.com is reachable,
//   so calls go direct (the artifact sandbox supplies credentials).
// - Everywhere else (Vercel live deploy), calls route through the Cloudflare Worker,
//   which injects the API key server-side and handles CORS.
const IS_ARTIFACT = typeof window !== "undefined" && /claude/i.test(window.location.hostname);
const DIRECT_URL = "https://api.anthropic.com/v1/messages";

// Worker route auto-discovery: different proxy builds expose the endpoint on
// different paths. On the first live call we try each candidate and remember
// whichever one actually answers, so the app self-heals if the route changes.
const ROUTE_CANDIDATES = ["/claude","","/api","/api/claude","/v1/messages","/messages","/chat","/proxy","/anthropic"];
let RESOLVED_URL = null;

async function callAPI(body){
  if (IS_ARTIFACT) {
    const res = await fetch(DIRECT_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    if(!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  }
  const tryOne = async (url) => fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});

  if (RESOLVED_URL) {
    const res = await tryOne(RESOLVED_URL);
    if (res.ok) return res.json();
    if (res.status !== 404) throw new Error(`API ${res.status}`);
    RESOLVED_URL = null; // route changed — rediscover
  }
  let lastStatus = 0;
  for (const path of ROUTE_CANDIDATES) {
    const url = `${WORKER_URL}${path}`;
    let res;
    try { res = await tryOne(url); } catch { continue; }
    if (res.ok) { RESOLVED_URL = url; return res.json(); }
    lastStatus = res.status;
    if (res.status !== 404) throw new Error(`API ${res.status}`); // real error, not a wrong path
  }
  throw new Error(`No working proxy route (last status ${lastStatus})`);
}

// ─────────────────────────────────────────────────────────────
// !! ACCESS CODE — change this before sharing the app !!
// Simple shared-passcode gate. Protects API credits from
// unauthorized/drive-by usage. Not full auth — swap for
// Supabase or similar if this becomes an institutional tool.
const ACCESS_CODE = "AEGIS2026";
// ─────────────────────────────────────────────────────────────

const Mesh = () => (
  <div style={{position:"fixed",inset:0,overflow:"hidden",zIndex:0,background:"#040812"}}>
    <div className="orbA" style={{position:"absolute",width:800,height:800,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,212,255,.09) 0%,transparent 70%)",top:"-15%",left:"-10%"}}/>
    <div className="orbB" style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,255,178,.07) 0%,transparent 70%)",bottom:"5%",right:"-8%"}}/>
    <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center,rgba(4,8,18,.3) 0%,rgba(4,8,18,.92) 100%)"}}/>
    <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.025) 2px,rgba(0,0,0,.025) 4px)",pointerEvents:"none"}}/>
  </div>
);

/* ══════════════════════════════════════════════════════
   ROLE DEFINITIONS — cascading Role → Scenario → Difficulty
   Each role carries its own scenarios, evaluation framework,
   actor behavior rules, terminology, and quick reference.
══════════════════════════════════════════════════════ */
const ROLES = [
  {
    id:"clinician", label:"CLINICIAN", icon:"🧠", color:"#00D4FF",
    tagline:"Behavioral health crisis intervention · DBT framework",
    respLabel:"CLINICIAN",
    terminalLabel:"CLINICIAN RESPONSE TERMINAL",
    scoreLabel:"DBT", refLabel:"DBT REF",
    feedbackLabel:"CLINICAL FEEDBACK",
    considerationsLabel:"KEY CLINICAL CONSIDERATIONS",
    subjectNoun:"client",
    settingLine:"in an acute psychiatric crisis simulation",
    supervisorRole:"an expert DBT clinical supervisor evaluating a trainee's live crisis intervention response",
    voiceNote:"Authentic voice for your AGE and life stage. A 6-year-old speaks in fragments; a teen is raw and defensive; an older adult may be formal, dismissive, or understated. Short (1-3 sentences MAX). Emotionally real.",
    actorRules:`AGITATION ADJUSTMENT RULES:
DECREASE (effective technique):
- Genuine validation / empathy / reflecting feelings accurately: -0.06 to -0.14
- TIPP grounding or mindfulness cues: -0.05 to -0.11
- DEAR MAN or clear, calm structure: -0.03 to -0.08
- Acknowledging autonomy / giving choice: -0.04 to -0.09

INCREASE (poor technique):
- Confrontation, lecturing, moralizing: +0.08 to +0.18
- Minimizing feelings or dismissing: +0.06 to +0.14
- Clinical coldness or jargon: +0.05 to +0.12
- Unsolicited advice or problem-solving too early: +0.04 to +0.10`,
    framework:`DBT SKILLS FRAMEWORK TO EVALUATE AGAINST:
- Validation L1-6: Listening/attending, Accurate reflection, Mind-reading, Understanding history basis, Radical genuineness, Treating as equal
- DEAR MAN: Describe, Express, Assert, Reinforce, Mindful, Appear confident, Negotiate
- GIVE: Gentle, Interested, Validate, Easy manner (relationship preservation)
- FAST: Fair, no Apologies, Stick to values, Truthful (self-respect)
- TIPP: Temperature, Intense exercise, Paced breathing, Progressive relaxation
- Opposite Action, Radical Acceptance, Non-judgmental stance, Mindfulness
- Motivational Interviewing: Open questions, Affirm, Reflect, Summarize
- Safety-first language, Trauma-informed approach, Autonomy support`,
    reference:[
      ["VALIDATION L1-6","Listen actively, reflect, read mind, validate history, radical genuineness, radical equality"],
      ["DEAR MAN","Describe, Express, Assert, Reinforce, Mindful, Appear confident, Negotiate"],
      ["GIVE","Gentle, Interested, Validate, Easy manner — preserves relationship"],
      ["TIPP","Temperature, Intense exercise, Paced breathing, Progressive relaxation"],
      ["FAST","Fair, no Apologies, Stick to values, Truthful — preserves self-respect"],
      ["OPP ACTION","Act opposite to emotion's urge to reduce intensity"],
    ],
    scenarios:[
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
      },
      {
        id:"child_mutism", title:"Early Childhood Acute Withdrawal", icon:"🧸",
        clientName:"Emmy", age:6, pronouns:"she/her",
        description:"6-year-old refusing to speak since witnessing a violent domestic incident 3 days ago. Communicating only through nods and a stuffed rabbit.",
        context:"Emmy witnessed a violent domestic incident between her parents 3 days ago. Police were involved and her father was removed from the home. She has not spoken a full sentence since. She's in your office clutching a stuffed rabbit, will nod or shake her head, and occasionally whispers to the rabbit. Mother reports Emmy was previously talkative and outgoing. She startles at loud sounds and has refused to sleep alone.",
        initialAgitation:0.60, riskLevel:"MODERATE", riskColor:"#FF9F0A",
        tags:["Early Childhood","Acute Trauma","Selective Withdrawal","Ages 4–8"],
        considerations:["Get physically low — sit on the floor or a small chair; towering over her maintains threat","The rabbit is her voice right now — talk TO the rabbit, let answers come through it","Play and parallel activity BEFORE any direct questions — drawing or blocks lower the demand","Never ask her to describe what she saw — your job today is safety and rapport, not disclosure"]
      },
      {
        id:"college_crisis", title:"College Burnout & Passive SI", icon:"🎓",
        clientName:"Nia", age:21, pronouns:"she/her",
        description:"Junior pre-med, first-generation student. Failed organic chemistry, hiding it from family. 'Everyone would be better off if I just wasn't here.'",
        context:"Nia is a first-generation college junior on a pre-med track carrying her family's expectations. She failed organic chemistry this semester and has been hiding it, skipping classes for 3 weeks, and sleeping 12+ hours a day. She came to the counseling center after telling her roommate 'everyone would be better off if I just wasn't here.' She denies a plan but describes feeling like 'a fraud who wasted everyone's sacrifices.' High-functioning presentation masking significant depression.",
        initialAgitation:0.58, riskLevel:"MOD-HIGH", riskColor:"#FF6B35",
        tags:["Passive SI","Academic Crisis","First-Gen","Ages 18–24"],
        considerations:["The family-expectation weight IS the clinical content — validate the burden before problem-solving the grades","Assess SI directly but normalize first: high-functioning presenters minimize when asked bluntly","'Fraud' language signals impostor-shame spiral — Validation L4 (given her history, this makes sense) lands well","Do not rush to solutions about school. The academic problem is solvable; she can't see that while drowning."]
      },
      {
        id:"geriatric_grief", title:"Older Adult — Bereavement & Purpose Loss", icon:"🕰",
        clientName:"Walter", age:71, pronouns:"he/him",
        description:"71-year-old widower, 4 months after losing his wife of 48 years. Stopped his cardiac meds 'because there's no point.' Brought in by his daughter.",
        context:"Walter lost his wife of 48 years to cancer 4 months ago. His daughter brought him in after discovering he'd stopped taking his cardiac medications, saying 'there's no point anymore.' He is polite but dismissive — 'I don't need a therapist, I need my wife back.' He denies active suicidal intent but the medication noncompliance is a passive self-harm pattern. He was a machinist for 45 years; his identity was built on being useful and providing. He now describes his days as 'waiting.'",
        initialAgitation:0.48, riskLevel:"MOD-HIGH", riskColor:"#FF6B35",
        tags:["Bereavement","Passive Self-Harm","Med Noncompliance","Ages 65+"],
        considerations:["Respect the dismissiveness — his generation often reads therapy as weakness; don't fight that frame, work within it","The medication refusal is the clinical priority — it's passive SI wearing practical clothing","Purpose and usefulness are his language — explore roles (grandfather, mentor, craftsman) rather than feelings vocabulary first","Grief at 48 years of marriage is not pathology — normalize the depth while addressing the danger"]
      }
    ]
  },
  {
    id:"police", label:"POLICE OFFICER", icon:"🚔", color:"#FFB800",
    tagline:"Field crisis response · CIT / ICAT framework",
    respLabel:"OFFICER",
    terminalLabel:"OFFICER RESPONSE TERMINAL",
    scoreLabel:"CIT", refLabel:"CIT REF",
    feedbackLabel:"SUPERVISOR FEEDBACK",
    considerationsLabel:"KEY TACTICAL CONSIDERATIONS",
    subjectNoun:"subject",
    settingLine:"during a police crisis-response training simulation",
    supervisorRole:"a veteran Crisis Intervention Team (CIT) instructor and field training supervisor evaluating an officer's live de-escalation response",
    voiceNote:"Authentic adult voice matching the scenario. Short (1-3 sentences MAX). Raw, unpredictable where realistic, emotionally real.",
    actorRules:`AGITATION ADJUSTMENT RULES:
DECREASE (effective technique):
- Calm, respectful tone / introducing self / using the subject's name: -0.05 to -0.12
- Active listening: paraphrasing, emotional labeling, minimal encouragers: -0.06 to -0.14
- Giving time and space, slowing the encounter down: -0.05 to -0.11
- Offering realistic choices / explaining what happens next honestly: -0.04 to -0.10
- Acknowledging distress or grievance as understandable: -0.05 to -0.12

INCREASE (poor technique):
- Shouted or stacked commands, threats of arrest or force: +0.10 to +0.20
- Crowding, rushing, or closing distance too fast: +0.07 to +0.15
- Dismissing, mocking, or arguing with the subject: +0.07 to +0.16
- Lying about outcomes or making promises that can't be kept: +0.06 to +0.13
- Ignoring signs of intoxication or mental health crisis: +0.05 to +0.12`,
    framework:`LAW ENFORCEMENT CRISIS DE-ESCALATION FRAMEWORK:\nCIT-informed communication principles and ICAT-informed decision-making/tactical considerations.
- Active Listening Skills: minimal encouragers, paraphrasing, emotional labeling, mirroring, open-ended questions, effective pauses
- Behavioral Change Stairway: Active Listening → Empathy → Rapport → Influence → Behavioral Change (in that order — influence before rapport fails)
- LEED principles: Listen, Empathize, and Explain with Equity and Dignity
- Tactical elements: use of time, distance, and space; slowing the encounter; one primary communicator
- Procedural justice: giving voice, neutrality, respectful treatment, transparent explanation of process
- Crisis recognition: distinguishing intoxication, psychosis, and emotional crisis; adjusting communication accordingly
- Command discipline: calm single directives over stacked/shouted commands; avoiding premature hands-on escalation
- Honest, realistic framing of next steps; no false promises`,
    reference:[
      ["ACTIVE LISTEN","Minimal encouragers, paraphrase, label emotions, mirror, open questions, pauses"],
      ["STAIRWAY","Listening → Empathy → Rapport → Influence → Behavior change — in order"],
      ["LEED","Listen, Empathize, Explain with Equity and Dignity"],
      ["TIME+DIST","Slow it down. Create space. Distance buys decision time."],
      ["ONE VOICE","One primary communicator — stacked commands escalate"],
      ["PROC JUSTICE","Give voice, stay neutral, show respect, explain the process"],
    ],
    scenarios:[
      {
        id:"intox", title:"Intoxicated & Combative", icon:"🍺",
        clientName:"Ray", age:42, pronouns:"he/him",
        description:"Heavily intoxicated outside a bar at closing. Refusing to leave, escalating with bystanders. Manager wants him trespassed.",
        context:"Ray has been drinking heavily since the afternoon after learning his hours were cut. Bar staff cut him off and asked him to leave; he's now in the parking lot, unsteady, yelling at bystanders who are filming him. The manager wants him removed. He has no weapon visible and hasn't touched anyone, but he's loud, profane, and getting closer to a bystander. Backup is two minutes out.",
        initialAgitation:0.82, riskLevel:"HIGH", riskColor:"#FF4D6A",
        tags:["Intoxication","Public Disturbance","Bystanders"],
        considerations:["Intoxication slows processing — one short instruction at a time, then wait","Move the audience, not just the subject — bystanders and cameras fuel escalation","Offer a face-saving exit: a ride, a call to family, a way out that isn't surrender"]
      },
      {
        id:"psychosis", title:"Mental Health Crisis Call", icon:"🌀",
        clientName:"Elena", age:34, pronouns:"she/her",
        description:"Experiencing auditory hallucinations in a store parking lot. Family called 911. Frightened, pacing, not aggressive.",
        context:"Elena's sister called 911 after Elena stopped taking her medication two weeks ago. Elena is pacing in a supermarket parking lot, talking back to voices only she can hear, and believes people in the store were sent to follow her. She is frightened, not aggressive, but startles easily and has refused to get in her sister's car. The sister is nearby and anxious to help.",
        initialAgitation:0.76, riskLevel:"MOD-HIGH", riskColor:"#FF4D6A",
        tags:["Psychosis","Med Non-Adherence","Family On Scene"],
        considerations:["Don't argue with the delusion and don't play along — respond to the fear underneath it","Slow, announced movements; keep hands visible; reduce sirens/radio noise if possible","Use the sister as a resource, but control the scene — one voice talking to Elena"]
      },
      {
        id:"welfare", title:"Welfare Check — Despondent Subject", icon:"🕯",
        clientName:"Marcus", age:51, pronouns:"he/him",
        description:"Sister requested welfare check after alarming texts. Recently lost job and marriage. On his porch, hopeless, wants to be left alone.",
        context:"Marcus's sister called after he sent texts saying goodbye and that 'everyone would be better off.' He lost his job three months ago and his divorce finalized last week. He's sitting on his front porch, hasn't been drinking, and is calm but flat and hopeless. He says he's fine and wants everyone to leave him alone. No weapons visible. Mobile crisis team is 20 minutes out.",
        initialAgitation:0.64, riskLevel:"MODERATE", riskColor:"#FFB800",
        tags:["Welfare Check","Hopelessness","Crisis Team Pending"],
        considerations:["Slow everything down — your job is connection and time, not resolution","Ask directly and calmly about his safety; directness doesn't plant ideas, it shows you can handle the answer","Don't rush toward a transport decision — keep him engaged until the crisis team arrives"]
      },
      {
        id:"domestic", title:"Domestic Disturbance — Escalated Party", icon:"🏠",
        clientName:"Tina", age:29, pronouns:"she/her",
        description:"Neighbors called about shouting. Partner is separated with another officer. Tina is furious, distrustful of police, and mid-crisis.",
        context:"Neighbors reported a loud argument. On arrival, no visible injuries and both parties deny physical contact. Your partner has separated the boyfriend into the kitchen. Tina is in the living room, furious, crying, and hostile toward police — a prior call two years ago ended with her arrest, which was later dropped. She's yelling that you always take his side and demanding everyone leave. Two children are asleep upstairs.",
        initialAgitation:0.85, riskLevel:"HIGH", riskColor:"#FF4D6A",
        tags:["Domestic","Police Distrust","Children Present"],
        considerations:["Her distrust is grounded in a real prior experience — acknowledge it instead of defending the badge","Lower your voice as hers rises; volume matching escalates","Explain every step before you do it — transparency is de-escalation with police-distrustful subjects"]
      },
      {
        id:"peer_intervention", title:"Peer Intervention — Escalated Officer", icon:"🛑",
        clientName:"Officer Reyes", age:36, pronouns:"he/him",
        description:"Your partner is adrenaline-flooded after a foot pursuit — screaming at a handcuffed suspect, ignoring your radio calls, one step from a career-ending line. Crowd is filming. You must intervene.",
        context:"Officer Reyes just finished a two-block foot pursuit of a suspect who swung at him before being taken down. The suspect is now cuffed and seated on the curb, but Reyes is still adrenaline-flooded — screaming inches from the suspect's face, hasn't holstered his anger, and just shoved off your first light attempt to redirect him. A crowd of about fifteen is filming. Your department has a duty-to-intervene policy: if he crosses the line, you both own it — legally and professionally. He is your friend of eight years. TRAINING NOTE: the subject in this scenario is a fellow officer in an acute stress response, not a civilian in crisis — peer intervention tactics apply.",
        initialAgitation:0.88, riskLevel:"HIGH", riskColor:"#FF4D6A",
        tags:["Peer Intervention","Duty To Intervene","Acute Stress","Shared Liability"],
        considerations:["Adrenaline is physiology, not attitude — his hearing is literally narrowed right now; use his first name, close and calm, possibly a hand on the shoulder","Redirect to a TASK, don't debate: 'Danny — I've got him. Crowd control, I need you on the crowd.' A job gives the adrenaline somewhere to go","Never shame or lecture him in front of the suspect and cameras — public correction escalates; the honest conversation about what almost happened comes later, in private","Duty to intervene is not optional — hesitating to protect a friendship is how two careers end instead of zero; stepping in IS having his back"]
      }
    ]
  },
  {
    id:"corrections", label:"CORRECTIONS OFFICER", icon:"🔐", color:"#A78BFA",
    tagline:"Facility de-escalation · directive communication framework",
    respLabel:"C.O.",
    terminalLabel:"CORRECTIONS OFFICER RESPONSE TERMINAL",
    scoreLabel:"DE-ESC", refLabel:"DE-ESC REF",
    feedbackLabel:"SUPERVISOR FEEDBACK",
    considerationsLabel:"KEY FACILITY CONSIDERATIONS",
    subjectNoun:"individual",
    settingLine:"during a correctional facility de-escalation training simulation",
    supervisorRole:"a senior corrections training officer and crisis negotiation instructor evaluating a corrections officer's live de-escalation response",
    voiceNote:"Authentic adult voice matching the scenario and setting. Short (1-3 sentences MAX). Guarded, street-smart where realistic, emotionally real.",
    actorRules:`AGITATION ADJUSTMENT RULES:
DECREASE (effective technique):
- Calm, level, respectful tone — treating the individual with dignity: -0.06 to -0.13
- Active listening and acknowledging the grievance or distress: -0.06 to -0.14
- Offering realistic choices within facility rules: -0.05 to -0.11
- Tactical patience — giving time instead of forcing immediate compliance: -0.05 to -0.12
- Following through honestly on what you say you'll do: -0.04 to -0.10

INCREASE (poor technique):
- Threats, ultimatums, or immediate force posturing: +0.10 to +0.20
- Disrespect, mockery, or power-struggle language: +0.08 to +0.17
- Dismissing medical or mental health complaints: +0.07 to +0.15
- Making promises that can't be kept inside facility rules: +0.06 to +0.13
- Escalating volume to match the individual's volume: +0.05 to +0.12`,
    framework:`CORRECTIONAL DE-ESCALATION FRAMEWORK TO EVALUATE AGAINST:
- Active listening: paraphrasing, emotional labeling, acknowledging grievances without necessarily agreeing
- Calm directive communication: clear, single, respectful directives — not stacked threats
- Dignity and respect: avoiding humiliation and power struggles; face-saving compliance paths
- Choices within rules: offering realistic options the officer can actually deliver
- Tactical patience: using time as a tool when no immediate safety threat exists
- Crisis recognition: distinguishing manipulation from genuine mental health crisis, withdrawal, or medical emergency — and erring toward safety
- Honest follow-through: never promising what facility rules can't deliver
- Team awareness: knowing when to slow down, when to call mental health staff, when to disengage and reassess`,
    reference:[
      ["ACTIVE LISTEN","Paraphrase, label the emotion, acknowledge the grievance — agreement not required"],
      ["ONE DIRECTIVE","One clear, calm, respectful directive at a time — never stacked threats"],
      ["DIGNITY","No humiliation, no power struggles — leave a face-saving path to compliance"],
      ["REAL CHOICES","Offer only options you can actually deliver within facility rules"],
      ["PATIENCE","If no immediate threat, time is your strongest tool"],
      ["RECOGNIZE","Withdrawal, psychosis, and medical crisis can look like defiance — err toward safety"],
    ],
    scenarios:[
      {
        id:"refusal", title:"Cell-Front Refusal", icon:"🚪",
        clientName:"DeShawn", age:26, pronouns:"he/him",
        description:"Refusing to cuff up for a scheduled transport. Agitated, pacing his cell. Mental health flags in his file.",
        context:"DeShawn is refusing to cuff up for transport to a court appearance. He's pacing his cell, punching his palm, saying the last transport crew 'roughed him up' and he's not going anywhere with them. His file shows PTSD and a prior use-of-force incident during transport eight months ago. Court is in 90 minutes. Your sergeant wants him moved but a cell extraction team is a last resort.",
        initialAgitation:0.80, riskLevel:"HIGH", riskColor:"#FF4D6A",
        tags:["Refusal","PTSD Hx","Prior UOF"],
        considerations:["His fear is anchored to a real prior incident — acknowledge it before asking for compliance","Explain exactly who is transporting and what will happen, step by step","A face-saving path matters: let compliance be his decision, not his defeat"]
      },
      {
        id:"withdrawal", title:"Withdrawal Crisis — Intake", icon:"💊",
        clientName:"Kyle", age:31, pronouns:"he/him",
        description:"Early opioid withdrawal in intake holding. Sweating, agitated, demanding medical now. Other detainees watching.",
        context:"Kyle was booked six hours ago and is entering opioid withdrawal — sweating, shaking, nauseous, pacing the intake holding area. He's escalating: banging on the door, demanding to see medical 'right now or I'll make you take me.' Medical staff are backed up and 30 minutes out. Four other detainees in the holding area are getting restless and starting to echo him.",
        initialAgitation:0.87, riskLevel:"HIGH", riskColor:"#FF4D6A",
        tags:["Withdrawal","Medical","Group Dynamics"],
        considerations:["His symptoms are real and frightening — dismissing them as drug-seeking escalates everyone","Give a concrete, honest timeline and check back when you say you will","Manage the audience: separating him or lowering the group temperature may matter more than his words"]
      },
      {
        id:"seghousing", title:"Restrictive Housing Decompensation", icon:"🧩",
        clientName:"Andre", age:38, pronouns:"he/him",
        description:"Three days in restrictive housing. Covering his cell window, yelling overnight, expressing hopelessness. Refusing meals today.",
        context:"Andre has been in restrictive housing for 3 days following a fight. The change has been rapid: yelling through the night, covering his cell window with paper this morning, and refusing both meals today. Through the door he says 'nothing matters anymore' and tells you to stop pretending anyone cares. He has no prior mental health flags, which makes decompensation this fast even more concerning. Mental health staff can be called but he's refused to speak to them twice.",
        initialAgitation:0.70, riskLevel:"MOD-HIGH", riskColor:"#FF4D6A",
        tags:["Restrictive Housing","Decompensation","Meal Refusal"],
        considerations:["Decompensation this rapid without prior flags is a red flag, not an attitude problem — isolation effects begin in days, not weeks","Your goal is connection and a mental health referral he'll accept — not rule enforcement","Small genuine gestures land heavily in isolation: use his name, remember details, follow through"]
      },
      {
        id:"tier_talkdown", title:"Tier Talk-Down — Active Suicide Threat", icon:"🆘",
        clientName:"Luis", age:34, pronouns:"he/him",
        description:"On the third-tier walkway with a braided sheet, threatening to end his life after devastating news from home. You are first on scene; emergency response is activated.",
        context:"Luis learned an hour ago that his wife filed for divorce and is seeking full custody of his kids. He is now on the third-tier walkway holding a braided bedsheet and saying he is done. You are the first officer on scene. The emergency response protocol is activated: mental health staff and backup are en route (minutes out), the tier below is being cleared, and your only job right now is to keep him talking and keep distance until the crisis team arrives. He is not threatening anyone else. TRAINING NOTE FOR SIMULATION: portray despair, anger, and ambivalence through dialogue and simple nonverbal cues only — never describe self-harm actions, positioning, or method detail. The scene holds still while the conversation happens.",
        initialAgitation:0.92, riskLevel:"CRITICAL", riskColor:"#FF4D6A",
        tags:["Active Suicide Threat","Crisis Negotiation","ERP Activated","Talk-Down"],
        considerations:["Your job is time and connection, not resolution — every minute of talking is the intervention working","Listen for ambivalence — 'I'm done' next to 'my kids' is the opening; the part of him mentioning his kids is the part that wants to live","Do not rush, lunge, bargain with things you can't deliver, or debate whether life is worth living — reflect the pain, ask about the kids, stay honest about what happens next (safety watch, mental health, a phone call is possible LATER through proper channels)","In a real facility this is an emergency response protocol event — this simulation trains only the verbal engagement window before the crisis team arrives"]
      }
    ]
  }
];

/* ── Clinician sub-profiles (clinical track only) ──────
   Drives the cascading Role → Profile → Scenario selectors. */
const CLINICIAN_PROFILES = [
  {id:"child_psych",label:"Child Psychologist",degree:"PsyD / PhD",ageRange:"5–17",color:"#00D4FF",
   specialties:["Pediatric Mental Health","Play Therapy","Trauma-Informed Care","Family Systems"],
   note:"Evaluates against child-adapted DBT and play/expressive therapy standards.",
   evaluatorFocus:["developmentally appropriate language","co-regulation","trauma-informed rapport","caregiver/system awareness","play or expressive communication where appropriate"]},
  {id:"neuro_psych",label:"Neuropsychologist",degree:"PhD / ABPP-CN",ageRange:"All Ages",color:"#A78BFA",
   specialties:["Autism Spectrum","ADHD","2e Assessment","Executive Function","Sensory Integration"],
   note:"Evaluates against neurodiversity-affirming, sensory-informed clinical frameworks.",
   evaluatorFocus:["sensory load reduction","neurodiversity-affirming language","co-regulation before verbal demand","executive-function-aware pacing","masking and shutdown awareness"]},
  {id:"school_psych",label:"School Psychologist",degree:"EdS / PhD",ageRange:"5–22",color:"#00FFB2",
   specialties:["Crisis Intervention","Threat Assessment","504 / IEP Support","Behavioral Analysis"],
   note:"Evaluates against NASP crisis protocols and school-based intervention standards.",
   evaluatorFocus:["NASP-aligned crisis response steps","safety and threat screening","de-escalation within the school context","system coordination with staff and caregivers","reintegration planning"]},
  {id:"adult_psych",label:"Adult Clinician",degree:"PsyD / PhD / LCSW",ageRange:"18+",color:"#FFB800",
   specialties:["DBT","CBT","Personality Disorders","Life Transitions","Late Diagnosis Support"],
   note:"Evaluates against standard outpatient DBT and evidence-based adult intervention.",
   evaluatorFocus:["DBT/MI skill fidelity","collaborative autonomy support","direct and calibrated risk assessment","life-stage and identity awareness","realistic next-step planning"]},
];

// Maps each clinician profile to the scenarios within their scope of practice.
const ROLE_SCENARIOS = {
  child_psych:  ["si","panic","substance","trauma","child_mutism","adhd_explosive"],
  neuro_psych:  ["asd_meltdown","adhd_explosive","adult_asd_late_dx"],
  school_psych: ["si","panic","substance","trauma","asd_meltdown","adhd_explosive","college_crisis"],
  adult_psych:  ["college_crisis","adult_asd_late_dx","geriatric_grief"],
};

const DIFFICULTIES = [
  {id:"novice",label:"NOVICE",desc:"Cooperative. Responds to basic validation. Forgiving of minor errors.",modifier:-0.18,color:"#00FFB2"},
  {id:"intermediate",label:"INTERMEDIATE",desc:"Realistic resistance. Requires solid de-escalation technique.",modifier:0,color:"#FFB800"},
  {id:"advanced",label:"ADVANCED",desc:"Highly dysregulated. Expert-level technique required to de-escalate.",modifier:0.10,color:"#FF4D6A"},
];

const TRAINING_MODES = [
  {id:"guided",label:"GUIDED PRACTICE",desc:"Live coaching, suggested next step, references, and visible telemetry.",color:"#00D4FF"},
  {id:"standard",label:"STANDARD SIMULATION",desc:"Live supervisory feedback, but no suggested response line.",color:"#FFB800"},
  {id:"assessment",label:"ASSESSMENT",desc:"No live coaching or numeric state telemetry until the final report.",color:"#FF4D6A"},
];

const EVALUATION_DIMENSIONS = {
  clinician: [
    ["validation","Validation"],
    ["rapport","Rapport"],
    ["safety_assessment","Safety Assessment"],
    ["skill_selection","DBT / MI Skill Selection"],
    ["trauma_informed","Trauma-Informed Communication"],
  ],
  police: [
    ["crisis_recognition","Crisis Recognition"],
    ["active_listening","Active Listening"],
    ["procedural_justice","Procedural Justice"],
    ["communication_discipline","Communication Discipline"],
    ["time_distance_space","Time / Distance / Space"],
  ],
  corrections: [
    ["crisis_recognition","Crisis Recognition"],
    ["dignity_respect","Dignity & Respect"],
    ["directive_communication","Directive Communication"],
    ["realistic_choices","Realistic Choices"],
    ["tactical_patience","Tactical Patience"],
  ],
};

const getDimensionTemplate = roleId =>
  Object.fromEntries((EVALUATION_DIMENSIONS[roleId] || []).map(([key]) => [key, 0.5]));

const makeSubjectState = (agitation=0.5) => ({
  agitation: Math.max(0, Math.min(1, agitation)),
  rapport: Math.max(0, Math.min(1, 1 - agitation * 0.72)),
  cooperation: Math.max(0, Math.min(1, 1 - agitation * 0.80)),
});

const normalizeSubjectState = (candidate, previous) => ({
  agitation: Math.max(0, Math.min(1, Number.isFinite(candidate?.agitation) ? candidate.agitation : previous.agitation)),
  rapport: Math.max(0, Math.min(1, Number.isFinite(candidate?.rapport) ? candidate.rapport : previous.rapport)),
  cooperation: Math.max(0, Math.min(1, Number.isFinite(candidate?.cooperation) ? candidate.cooperation : previous.cooperation)),
});

// Anthropic Messages API requires the first message to be role "user".
// The actor's history starts with its own opening (assistant), so trim
// any leading assistant turns after slicing the window.
const trimHistory = (history, n=10) => {
  const t = history.slice(-n);
  while (t.length && t[0].role !== "user") t.shift();
  return t;
};

// Models occasionally wrap JSON in prose or fences — extract the outermost
// JSON object before parsing instead of failing to a fallback.
const extractJSON = (text) => {
  const cleaned = (text || "").replace(/```json|```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned);
};

const computeCriticalMoments = (logs, stateHistory) => {
  const moments = [];
  logs.forEach((log, i) => {
    const before = stateHistory[i];
    const after = stateHistory[i + 1];
    if (!before || !after) return;
    const agitationShift = after.agitation - before.agitation;
    const rapportShift = after.rapport - before.rapport;
    const cooperationShift = after.cooperation - before.cooperation;
    const severity = Math.abs(agitationShift) + Math.abs(rapportShift) + Math.abs(cooperationShift);
    if (
      Math.abs(agitationShift) >= 0.08 ||
      Math.abs(rapportShift) >= 0.08 ||
      Math.abs(cooperationShift) >= 0.08 ||
      log.overall_score < 0.45 ||
      log.overall_score >= 0.85
    ) {
      moments.push({turn:i+1,severity,agitationShift,rapportShift,cooperationShift,
        score:log.overall_score,feedback:log.feedback,suggested_intervention:log.suggested_intervention});
    }
  });
  return moments.sort((a,b)=>b.severity-a.severity).slice(0,3).sort((a,b)=>a.turn-b.turn);
};

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

const PerformanceRing = ({ score }) => {
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
async function callActor(role, scenario, difficulty, subjectState, apiHistory, responderInput) {
  const agitation = subjectState.agitation;
  const agiLabel = agitation>=0.8
    ? "CRITICAL — near breaking point, may shut down, disengage, or become more volatile"
    : agitation>=0.6
    ? "HIGH — volatile, testing limits, watching for reasons to disengage"
    : agitation>=0.4
    ? "MODERATE — fragile stability, cautiously evaluating the responder"
    : "LOWER — beginning to engage, still guarded";

  const system = `You are ${scenario.clientName}, ${scenario.age} years old (${scenario.pronouns}), ${role.settingLine}.

SCENARIO CONTEXT:
${scenario.context}

CURRENT SIMULATION STATE:
Agitation: ${subjectState.agitation.toFixed(2)}/1.0 — ${agiLabel}
Rapport: ${subjectState.rapport.toFixed(2)}/1.0
Cooperation: ${subjectState.cooperation.toFixed(2)}/1.0
Difficulty: ${difficulty.toUpperCase()}

IMPORTANT:
Agitation, rapport, and cooperation are separate.
A person may become quieter without becoming safer, more trusting, or more cooperative.
Do not automatically reduce all three dimensions together.

${role.actorRules}

${difficulty==="advanced"
  ? "ADVANCED: Only layered, well-timed de-escalation meaningfully improves state. Average responses may fail or worsen one dimension."
  : difficulty==="novice"
  ? "NOVICE: Basic empathy and respect usually help. Be forgiving of minor mistakes."
  : "INTERMEDIATE: Respond realistically. Some techniques work, some do not."}

RESPONSE RULES:
- ${role.voiceNote}
- "verbal_output" MUST contain actual audible spoken words or vocalization — even brief, hostile, muttered, or fragmented. NEVER an empty string, ellipses alone, or stage directions. Silence belongs in "nonverbal_cues".
- Do NOT act like a textbook.
- Be emotionally and behaviorally believable.
- Keep this a professional training simulation and never become gratuitous.
- Return ONLY valid JSON:
{
  "verbal_output":"...",
  "subject_state":{
    "agitation":0.XX,
    "rapport":0.XX,
    "cooperation":0.XX
  },
  "nonverbal_cues":"brief physical observation"
}`;

  const data = await callAPI({
    model:"claude-sonnet-4-20250514",
    max_tokens:350,
    system,
    messages:[...trimHistory(apiHistory),{role:"user",content:responderInput}]
  }).catch(e=>{throw new Error(`Actor ${e.message}`);});
  const text = data.content?.[0]?.text || "";
  try {
    const parsed = extractJSON(text);
    const spoken = (parsed.verbal_output || "").trim();
    return {
      verbal_output: spoken.replace(/[.…\s]/g,"").length ? spoken : "(silent — watching you)",
      subject_state: normalizeSubjectState(parsed.subject_state, subjectState),
      nonverbal_cues: parsed.nonverbal_cues || ""
    };
  } catch {
    return {verbal_output:text.slice(0,280), subject_state:subjectState, nonverbal_cues:""};
  }
}

async function callCoach(role, scenario, difficulty, subjectState, responderInput, recentHistory, profileNote) {
  const dimensions = EVALUATION_DIMENSIONS[role.id] || [];
  const dimensionText = dimensions.map(([key,label])=>`- ${key}: ${label}`).join("\n");

  const system = `You are ${role.supervisorRole}. Be specific, honest, rigorous, and educational.
${profileNote ? `\nTRAINEE PROFILE:\n${profileNote}\n` : ""}
SCENARIO:
${scenario.title} — ${scenario.clientName}, ${scenario.age} (${scenario.pronouns})

CONTEXT:
${scenario.context}

CURRENT SUBJECT STATE:
Agitation: ${subjectState.agitation.toFixed(2)}/1.0
Rapport: ${subjectState.rapport.toFixed(2)}/1.0
Cooperation: ${subjectState.cooperation.toFixed(2)}/1.0

DIFFICULTY:
${difficulty.toUpperCase()}

${role.framework}

EVALUATION DIMENSIONS:
${dimensionText}

OVERALL SCORING:
0.88-1.00: Expert — layered skills, excellent timing, strong judgment
0.72-0.87: Proficient — solid technique with minor gaps
0.55-0.71: Developing — basic competence with clear missed opportunities
0.35-0.54: Minimal — partial rapport but inadequate technique
0.00-0.34: Harmful — counterproductive, unsafe, or rapport-breaking communication

Do not inflate scores.

TRAINEE STATEMENT:
"${responderInput}"

RECENT SESSION HISTORY:
${JSON.stringify(recentHistory.slice(-6))}

Return ONLY valid JSON:
{
  "overall_score":0.XX,
  "dimensions":{
    ${dimensions.map(([key])=>`"${key}":0.XX`).join(",")}
  },
  "feedback":"specific 1-2 sentence supervisory feedback",
  "suggested_intervention":"one concrete next step or line to try",
  "skills_detected":["up to 3"],
  "skills_missed":["up to 3"]
}`;

  const data = await callAPI({
    model:"claude-sonnet-4-20250514",
    max_tokens:550,
    system,
    messages:[{role:"user",content:"Evaluate this trainee response now."}]
  }).catch(e=>{throw new Error(`Coach ${e.message}`);});
  const text = data.content?.[0]?.text || "";
  try {
    const parsed = extractJSON(text);
    const safeDimensions = {...getDimensionTemplate(role.id), ...(parsed.dimensions || {})};
    Object.keys(safeDimensions).forEach(k=>{
      safeDimensions[k] = Math.max(0,Math.min(1,Number(safeDimensions[k]) || 0));
    });
    return {
      overall_score: Math.max(0,Math.min(1,parsed.overall_score ?? 0.5)),
      dimensions: safeDimensions,
      feedback: parsed.feedback || "Evaluation unavailable.",
      suggested_intervention: parsed.suggested_intervention || "Continue building rapport.",
      skills_detected: parsed.skills_detected || [],
      skills_missed: parsed.skills_missed || []
    };
  } catch {
    return {
      overall_score:0.5,
      dimensions:getDimensionTemplate(role.id),
      feedback:"Evaluation unavailable.",
      suggested_intervention:"Continue building rapport.",
      skills_detected:[],
      skills_missed:[]
    };
  }
}

/* ── Main Component ──────────────────────────────────── */
export default function AegisSimulator() {
  const [screen,        setScreen]       = useState(ACCESS_CODE ? "gate" : "setup");
  const [gateInput,     setGateInput]    = useState("");
  const [disclaimerAck, setDisclaimerAck] = useState(false);
  const [gateError,     setGateError]    = useState(false);
  const [selectedRole,  setSelectedRole] = useState(ROLES[0]);
  const [selectedProfile, setSelectedProfile] = useState(CLINICIAN_PROFILES[0]);
  const [selectedSc,    setSelectedSc]   = useState(
    ROLES[0].scenarios.find(s=>ROLE_SCENARIOS[CLINICIAN_PROFILES[0].id].includes(s.id))
  );
  const [selectedDiff,  setSelectedDiff] = useState("intermediate");
  const [agitation,       setAgitation]      = useState(0.75); // retained for existing UI compatibility
  const [agiHistory,      setAgiHistory]     = useState([]);   // retained for existing graphs
  const [subjectState,    setSubjectState]   = useState(makeSubjectState(0.75));
  const [stateHistory,    setStateHistory]   = useState([]);
  const [trainingMode,    setTrainingMode]   = useState("guided");
  const [conversation,  setConversation] = useState([]);
  const [apiHistory,    setApiHistory]   = useState([]);
  const [evaluationLogs, setEvaluationLogs]= useState([]);
  const [clinInput,     setCliInput]     = useState("");
  const [isProcessing,  setIsProcessing] = useState(false);
  const [isInit,        setIsInit]       = useState(false);
  const [currentCoach,  setCurrentCoach] = useState(null);
  const [report,        setReport]       = useState(null);
  const [error,         setError]        = useState(null);
  const [elapsed,       setElapsed]      = useState(0);
  const [turnCount,     setTurnCount]    = useState(0);
  const [showDbt,       setShowDbt]      = useState(false);

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
  const role=selectedRole;

  /* ── Scenarios visible under current role (+ profile for clinical track) ── */
  const visibleScenarios = role.id==="clinician"
    ? role.scenarios.filter(s=>ROLE_SCENARIOS[selectedProfile.id].includes(s.id))
    : role.scenarios;

  /* ── Cascading selectors: Role → Profile → Scenario ── */
  const selectRole = (r) => {
    setSelectedRole(r);
    if(r.id==="clinician"){
      const p=selectedProfile||CLINICIAN_PROFILES[0];
      setSelectedSc(r.scenarios.find(s=>ROLE_SCENARIOS[p.id].includes(s.id))||r.scenarios[0]);
    } else {
      setSelectedSc(r.scenarios[0]);
    }
  };

  const selectProfile = (p) => {
    setSelectedProfile(p);
    setSelectedSc(role.scenarios.find(s=>ROLE_SCENARIOS[p.id].includes(s.id))||role.scenarios[0]);
  };

  const tryGate = () => {
    if(gateInput.trim()===ACCESS_CODE){ setGateError(false); setScreen("setup"); }
    else { setGateError(true); }
  };

  /* ── Start simulation ── */
  const startSimulation = async () => {
    const sc=selectedSc;
    const initAgi=Math.max(0,Math.min(1,sc.initialAgitation+diff.modifier));
    const initState = makeSubjectState(initAgi);
    setScreen("simulation");
    setAgitation(initAgi);
    setAgiHistory([initAgi]);
    setSubjectState(initState);
    setStateHistory([initState]);
    setConversation([]);
    setApiHistory([]);
    setEvaluationLogs([]);
    setCurrentCoach(null);
    setElapsed(0); setTurnCount(0); setError(null); setIsInit(true);

    try {
      const sys=`You are ${sc.clientName}, ${sc.age} (${sc.pronouns}), ${role.settingLine}.
Context: ${sc.context}
Initial state:
Agitation: ${initState.agitation.toFixed(2)}
Rapport: ${initState.rapport.toFixed(2)}
Cooperation: ${initState.cooperation.toFixed(2)}
Generate your OPENING behavioral presentation as the ${role.respLabel.toLowerCase()==="c.o."?"corrections officer":role.respLabel.toLowerCase()} makes first contact.
1-2 sentences MAX. ${role.voiceNote}
YOUR OPENING MUST MATCH YOUR INITIAL AGITATION LEVEL (${initState.agitation.toFixed(2)}):
- 0.75+: You are ACTIVELY dysregulated — loud, hostile, in motion, words spilling out (yelling, cursing within reason, demanding, accusing). NOT quiet, NOT composed, NOT withdrawn unless the scenario context explicitly says shut-down/withdrawn.
- 0.50-0.74: Visibly distressed and guarded, words clipped and defensive.
- Below 0.50: Subdued, flat, or dismissive — but still verbal.
CRITICAL: "verbal_output" MUST contain actual audible spoken words or vocalization — even if brief, hostile, muttered, fragmented, or reluctant. NEVER return an empty string, ellipses alone, or stage directions as the dialogue. Silence belongs in "nonverbal_cues", not "verbal_output".
This is a professional training simulation: stay in character, realistic but never gratuitous.
Respond ONLY as valid JSON:
{
  "verbal_output":"...",
  "subject_state":{
    "agitation":${initState.agitation.toFixed(2)},
    "rapport":${initState.rapport.toFixed(2)},
    "cooperation":${initState.cooperation.toFixed(2)}
  },
  "nonverbal_cues":"brief physical description"
}`;

      let parsed=null;
      for(let attempt=0; attempt<2 && !parsed; attempt++){
        try{
          const data=await callAPI({model:"claude-sonnet-4-20250514",max_tokens:250,system:sys,messages:[{role:"user",content:"Begin session."}]});
          const text=data.content?.[0]?.text||"";
          parsed=extractJSON(text);
        }catch(e){
          if(attempt===1){
            parsed={verbal_output:"",subject_state:initState,nonverbal_cues:"Refuses eye contact. Extremely tense."};
            setError(`Opening generation failed (${e.message}) — fallback used. Diagnostic: check worker route/response.`);
          }
        }
      }
      const spoken=(parsed.verbal_output||"").trim();
      if(!spoken.replace(/[.…\s]/g,"").length) parsed.verbal_output="(silent — watching you)";
      const openingState = normalizeSubjectState(parsed.subject_state, initState);
      setAgitation(openingState.agitation);
      setSubjectState(openingState);
      setAgiHistory([openingState.agitation]);
      setStateHistory([openingState]);
      setConversation([{id:Date.now(),role:"actor",content:parsed.verbal_output,nonverbal:parsed.nonverbal_cues||"",agitation:openingState.agitation,subjectState:openingState,coachScore:null}]);
      setApiHistory([{role:"user",content:"Begin session."},{role:"assistant",content:parsed.verbal_output}]);
    } catch(err){
      setError("Initialization error: "+err.message);
      setSubjectState(initState);
      setStateHistory([initState]);
      setApiHistory([]);
      setConversation([{id:Date.now(),role:"actor",content:"...",nonverbal:"Refuses eye contact. Extremely tense.",agitation:initAgi,subjectState:initState,coachScore:null}]);
    }
    setIsInit(false);
  };

  /* ── Execute turn (parallel inference) ── */
  const executeTurn = async () => {
    if(!clinInput.trim() || isProcessing || isInit) return;
    const input = clinInput.trim();
    setCliInput("");
    setIsProcessing(true);
    setError(null);

    setConversation(h=>[...h,{
      id:Date.now(),
      role:"clinician",
      content:input,
      agitation:subjectState.agitation,
      subjectState,
      stateBefore:subjectState,           // replay foundation
      apiHistoryBefore:[...apiHistory],   // replay foundation
      coachScore:null
    }]);

    const newApiHist=[...apiHistory,{role:"user",content:input}];

    try {
      // ── PARALLEL: Actor + Coach run simultaneously ──
      const [actorResult, coachResult] = await Promise.all([
        callActor(role, selectedSc, selectedDiff, subjectState, apiHistory, input),
        callCoach(role, selectedSc, selectedDiff, subjectState, input, newApiHist,
          role.id==="clinician"
            ? `${selectedProfile.label} — ${selectedProfile.note}. Focus: ${(selectedProfile.evaluatorFocus||[]).join("; ")}`
            : "")
      ]);

      const nextState = actorResult.subject_state;
      setSubjectState(nextState);
      setAgitation(nextState.agitation);
      setStateHistory(h=>[...h,nextState]);
      setAgiHistory(h=>[...h,nextState.agitation]);

      // Assessment mode stores feedback but does not expose it live.
      setCurrentCoach(trainingMode==="assessment" ? null : coachResult);

      setEvaluationLogs(l=>[...l,coachResult]);
      setTurnCount(t=>t+1);

      setConversation(h=>[...h,{
        id:Date.now()+1,
        role:"actor",
        content:actorResult.verbal_output,
        nonverbal:actorResult.nonverbal_cues||"",
        agitation:nextState.agitation,
        subjectState:nextState,
        stateAfter:nextState,               // replay foundation
        coachScore:trainingMode==="assessment" ? null : coachResult.overall_score
      }]);

      setApiHistory([...newApiHist,{role:"assistant",content:actorResult.verbal_output}]);
    } catch(err) {
      setError(err.message || "Turn failed. Check connection and try again.");
    }
    setIsProcessing(false);
    setTimeout(()=>inputRef.current?.focus(),100);
  };

  /* ── End session & generate report ── */
  const endSession = () => {
    clearInterval(timerRef.current);
    if(evaluationLogs.length===0){setScreen("setup");return;}

    const avgPerformance = evaluationLogs.reduce((s,l)=>s+l.overall_score,0)/evaluationLogs.length;
    const finalState = stateHistory[stateHistory.length-1] || subjectState;
    const initState = stateHistory[0] || subjectState;
    const finalAgi = finalState.agitation;
    const initAgi = initState.agitation;
    const peakAgi = Math.max(...stateHistory.map(s=>s.agitation));
    const delta = initAgi-finalAgi;

    const dimensionTotals = {}, dimensionCounts = {};
    evaluationLogs.forEach(log=>{
      Object.entries(log.dimensions || {}).forEach(([key,val])=>{
        dimensionTotals[key]=(dimensionTotals[key]||0)+val;
        dimensionCounts[key]=(dimensionCounts[key]||0)+1;
      });
    });
    const dimensionAverages = Object.fromEntries(
      Object.keys(dimensionTotals).map(key=>[key, dimensionTotals[key]/dimensionCounts[key]])
    );

    const allDet={},allMis={};
    evaluationLogs.forEach(l=>{
      (l.skills_detected||[]).forEach(s=>{allDet[s]=(allDet[s]||0)+1;});
      (l.skills_missed||[]).forEach(s=>{allMis[s]=(allMis[s]||0)+1;});
    });
    const rating=avgPerformance>=0.82?"EXPERT":avgPerformance>=0.68?"PROFICIENT":avgPerformance>=0.52?"DEVELOPING":"NEEDS WORK";
    const ratingCol=avgPerformance>=0.82?"#00FFB2":avgPerformance>=0.68?"#00D4FF":avgPerformance>=0.52?"#FFB800":"#FF4D6A";
    const criticalMoments = computeCriticalMoments(evaluationLogs, stateHistory);

    setReport({
      role, profile: role.id==="clinician"?selectedProfile:null, scenario:selectedSc,
      difficulty:diff,
      trainingMode:TRAINING_MODES.find(m=>m.id===trainingMode),
      avgPerformance,dimensionAverages,
      finalState,initState,
      finalAgi,initAgi,peakAgi,delta,
      allDet,allMis,rating,ratingCol,turns:evaluationLogs.length,
      duration:elapsed,agiHistory:[...agiHistory],stateHistory:[...stateHistory],
      logs:[...evaluationLogs],criticalMoments
    });
    setScreen("report");
  };

  /* ════════════════════════════════════════
     DISCLAIMER GATE — shown after login, before setup
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
          ⚠ CRISIS TRAINING SIMULATION
        </div>
        <p style={{fontSize:"14px",lineHeight:1.75,color:"var(--tx)",marginBottom:"14px"}}>
          AEGIS is a training simulation built for clinicians, law enforcement, and
          corrections professionals practicing crisis de-escalation skills. Scenarios contain realistic,
          emotionally intense crisis content, including references to
          self-harm, suicidal ideation, and acute behavioral dysregulation across
          child, adolescent, and adult populations, presented for professional
          training purposes.
        </p>
        <p style={{fontSize:"13px",lineHeight:1.7,color:"var(--tm)",marginBottom:"22px"}}>
          This tool is not intended for general consumer use and does not provide
          real clinical care. If you or someone you know is in crisis, please contact
          a crisis line or emergency services directly — in the U.S., call or text 988.
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
     ACCESS GATE SCREEN
  ════════════════════════════════════════ */
  const renderGate = () => (
    <div style={{minHeight:"100vh",position:"relative",zIndex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <div className="gl sc" style={{borderRadius:24,padding:"40px 36px",maxWidth:400,width:"100%",textAlign:"center"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><AegisLogo size={76}/></div>
        <div className="breathe-t" style={{fontFamily:"var(--fd)",fontSize:44,fontWeight:800,letterSpacing:"-2px",marginBottom:8}}>AEGIS</div>
        <div style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--tm)",letterSpacing:"3px",textTransform:"uppercase",marginBottom:24}}>Restricted Access</div>
        <input type="password" value={gateInput}
          onChange={e=>{setGateInput(e.target.value);setGateError(false);}}
          onKeyDown={e=>{if(e.key==="Enter")tryGate();}}
          placeholder="Enter access code"
          style={{width:"100%",fontFamily:"var(--fm)",fontSize:14,color:"var(--tx)",background:"rgba(0,212,255,.03)",border:`1px solid ${gateError?"var(--ros)":"var(--gb)"}`,borderRadius:12,padding:"14px 16px",outline:"none",textAlign:"center",letterSpacing:"3px",marginBottom:12}}/>
        {gateError&&<div style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--ros)",marginBottom:12}}>Invalid access code</div>}
        <button className="tx-btn" onClick={tryGate} style={{width:"100%",padding:"14px"}}>ENTER →</button>
        <div style={{fontFamily:"var(--fm)",fontSize:9,color:"rgba(232,240,255,.22)",marginTop:18,lineHeight:1.7}}>Training simulation only.<br/>Access provided by the administrator.</div>
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
        <div style={{display:"flex",justifyContent:"center",marginBottom:18}}><AegisLogo size={108}/></div>
        <div className="breathe-t" style={{fontFamily:"var(--fd)",fontSize:72,fontWeight:800,letterSpacing:"-4px",lineHeight:.9,marginBottom:16}}>
          AEGIS
        </div>
        <div style={{fontFamily:"var(--fm)",fontSize:11,color:"var(--tm)",letterSpacing:"4px",marginBottom:18,textTransform:"uppercase"}}>Crisis De-escalation Engine · v3.1</div>
        <div style={{fontFamily:"var(--fm)",fontSize:12,color:"rgba(232,240,255,.32)",maxWidth:520,margin:"0 auto",lineHeight:1.85}}>
          Multi-role dual-agent AI platform for crisis de-escalation training.<br/>
          Real-time supervisory feedback across clinical, police, and corrections tracks.<br/>
          <span style={{color:"rgba(0,212,255,.5)"}}>Actor Agent + Supervisor Agent — parallel inference per turn.</span><br/>
          <span style={{color:"rgba(255,184,0,.45)"}}>Prototype educational simulation only — does not replace certified instruction, agency policy, clinical supervision, or professional judgment.</span>
        </div>
      </div>

      {/* Role selector */}
      <div className="s1" style={{marginBottom:28}}>
        <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"2.5px",textTransform:"uppercase",marginBottom:12}}>Select Your Role</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
          {ROLES.map(r=>(
            <div key={r.id} onClick={()=>selectRole(r)} className="gl sc-card"
              style={{borderRadius:18,padding:"18px 20px",
                borderLeft:`3px solid ${role.id===r.id?r.color:"rgba(255,255,255,.1)"}`,
                background:role.id===r.id?`${r.color}0D`:"",
                boxShadow:role.id===r.id?`0 0 26px ${r.color}25`:""}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                <span style={{fontSize:26}}>{r.icon}</span>
                <div style={{fontFamily:"var(--fd)",fontSize:14,fontWeight:800,letterSpacing:".5px",color:role.id===r.id?r.color:"var(--tx)"}}>{r.label}</div>
              </div>
              <div style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--tm)",lineHeight:1.7}}>{r.tagline}</div>
              <div style={{fontFamily:"var(--fm)",fontSize:9,color:role.id===r.id?r.color:"rgba(232,240,255,.28)",marginTop:8,letterSpacing:"1px"}}>{r.scenarios.length} SCENARIOS · SCORED ON {r.scoreLabel}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Clinician profile selector — clinical track only */}
      {role.id==="clinician"&&(
        <div className="s2" style={{marginBottom:28}}>
          <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"2.5px",textTransform:"uppercase",marginBottom:12}}>Select Clinician Profile</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
            {CLINICIAN_PROFILES.map(p=>(
              <div key={p.id} onClick={()=>selectProfile(p)} className="gl sc-card"
                style={{borderRadius:16,padding:"14px 16px",
                  borderLeft:`3px solid ${selectedProfile.id===p.id?p.color:"rgba(255,255,255,.1)"}`,
                  background:selectedProfile.id===p.id?`${p.color}0D`:"",
                  boxShadow:selectedProfile.id===p.id?`0 0 20px ${p.color}22`:""}}>
                <div style={{fontFamily:"var(--fd)",fontSize:13,fontWeight:800,color:selectedProfile.id===p.id?p.color:"var(--tx)",marginBottom:3}}>{p.label}</div>
                <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"1px",marginBottom:8}}>{p.degree} · AGES {p.ageRange}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
                  {p.specialties.slice(0,3).map(s=>(
                    <span key={s} style={{fontFamily:"var(--fm)",fontSize:8,color:"rgba(232,240,255,.45)",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",padding:"2px 7px",borderRadius:20}}>{s}</span>
                  ))}
                </div>
                <div style={{fontFamily:"var(--fm)",fontSize:9,color:"rgba(232,240,255,.32)",lineHeight:1.6}}>{p.note}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scenario selector — cascades from role (+ profile) */}
      <div className="s3" style={{marginBottom:28}}>
        <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"2.5px",textTransform:"uppercase",marginBottom:12}}>Select Crisis Scenario · {visibleScenarios.length} in scope</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {visibleScenarios.map(sc=>(
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
              {selectedSc.id===sc.id && trainingMode!=="assessment" && (
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
      <div className="s3" style={{marginBottom:24}}>
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

      {/* Training mode */}
      <div className="s4" style={{marginBottom:24}}>
        <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"2.5px",textTransform:"uppercase",marginBottom:12}}>Training Mode</div>
        <div style={{display:"flex",gap:10}}>
          {TRAINING_MODES.map(m=>(
            <div key={m.id} onClick={()=>setTrainingMode(m.id)} className="gl"
              style={{flex:1,borderRadius:14,padding:"14px 16px",cursor:"pointer",transition:"all .2s",
                borderLeft:`3px solid ${trainingMode===m.id?m.color:"rgba(255,255,255,.1)"}`,
                background:trainingMode===m.id?`${m.color}0D`:"",
                boxShadow:trainingMode===m.id?`0 0 20px ${m.color}25`:""
              }}>
              <div style={{fontFamily:"var(--fd)",fontSize:12,fontWeight:800,color:trainingMode===m.id?m.color:"var(--tm)",letterSpacing:".7px",marginBottom:5}}>{m.label}</div>
              <div style={{fontFamily:"var(--fm)",fontSize:10,color:"rgba(232,240,255,.4)",lineHeight:1.6}}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission brief */}
      <div className="gl s5" style={{borderRadius:20,padding:"20px",marginBottom:20}}>
        <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"2px",marginBottom:14}}>MISSION BRIEF · {role.label}{role.id==="clinician"?` · ${selectedProfile.label.toUpperCase()}`:""}</div>
        <div style={{display:"flex",gap:18,alignItems:"flex-start",marginBottom:16}}>
          <div style={{width:54,height:54,borderRadius:14,background:`${selectedSc.riskColor}16`,border:`2px solid ${selectedSc.riskColor}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{selectedSc.icon}</div>
          <div>
            <div style={{fontFamily:"var(--fd)",fontSize:16,fontWeight:700,marginBottom:6}}>{selectedSc.clientName}, {selectedSc.age} · {selectedSc.title}</div>
            <div style={{fontFamily:"var(--fm)",fontSize:12,color:"var(--tm)",lineHeight:1.8}}>{selectedSc.context}</div>
          </div>
        </div>
        <div style={{paddingTop:14,borderTop:"1px solid rgba(255,255,255,.07)"}}>
          <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--cyan)",letterSpacing:"2px",marginBottom:10}}>{role.considerationsLabel}</div>
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
          Dual-agent parallel inference · Anthropic API · Cloudflare edge proxy<br/>
          <span style={{fontSize:9,color:"rgba(232,240,255,.16)"}}>Provider-abstraction architecture designed for future Azure AI Foundry deployment.</span>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════
     SIMULATION SCREEN
  ════════════════════════════════════════ */
  const renderSimulation = () => {
    const sc=selectedSc;
    const agiColor = trainingMode==="assessment"
      ? "rgba(232,240,255,.35)"
      : agitation>=0.75?"#FF4D6A":agitation>=0.5?"#FFB800":"#00FFB2";

    return (
      <div style={{minHeight:"100vh",position:"relative",zIndex:1,display:"flex",flexDirection:"column"}}>

        {/* TOP BAR */}
        <div className="gl" style={{borderBottom:"1px solid rgba(255,255,255,.07)",padding:"11px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",position:"sticky",top:0,zIndex:200}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <AegisLogo size={26} glow={false}/>
              <div className="breathe-t" style={{fontFamily:"var(--fd)",fontSize:19,fontWeight:800,color:"var(--cyan)",letterSpacing:"-1px"}}>AEGIS</div>
            </div>
            <div style={{width:1,height:22,background:"rgba(255,255,255,.12)"}}/>
            <div>
              <div style={{fontFamily:"var(--fd)",fontSize:13,fontWeight:700}}>{sc.clientName} — {sc.title}</div>
              <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"1.5px",marginTop:1}}>{role.label} TRACK · SESSION ACTIVE · TURN {turnCount}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            {trainingMode!=="assessment" && (
              <div style={{fontFamily:"var(--fm)",fontSize:11,color:agiColor,display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:agiColor,animation:"blink 1.2s ease-in-out infinite",boxShadow:`0 0 8px ${agiColor}`}}/>
                {agitation.toFixed(2)} AGI
              </div>
            )}
            <div style={{fontFamily:"var(--fm)",fontSize:11,color:"var(--tm)"}}>⏱ {fmt(elapsed)}</div>
            <div style={{fontFamily:"var(--fm)",fontSize:9,color:diff.color,background:`${diff.color}18`,border:`1px solid ${diff.color}40`,padding:"3px 10px",borderRadius:20,letterSpacing:"1px"}}>{diff.label}</div>
            <button className="end-btn" onClick={endSession} style={{padding:"6px 14px"}}>END SESSION</button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div style={{display:"grid",gridTemplateColumns:"1.15fr 0.85fr",gap:12,padding:"14px 16px",flex:1}}>

          {/* LEFT: SUBJECT PANEL */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {/* Subject header */}
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
              {trainingMode==="assessment" ? (
                <div style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--tm)",letterSpacing:"1.5px",padding:"10px 0 2px"}}>
                  STATE TELEMETRY HIDDEN · ASSESSMENT MODE
                </div>
              ) : (
                <AgitationMeter value={agitation}/>
              )}
            </div>

            {/* Conversation */}
            <div className="gl" style={{borderRadius:18,padding:"14px",flex:1,display:"flex",flexDirection:"column",minHeight:340}}>
              <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"2px",marginBottom:10,paddingBottom:8,borderBottom:"1px solid rgba(255,255,255,.07)"}}>SESSION TRANSCRIPT</div>
              <div ref={convRef} style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingRight:3}}>
                {isInit&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px",fontFamily:"var(--fm)",fontSize:11,color:"var(--tm)"}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:"var(--cyan)",animation:"blink 0.8s ease-in-out infinite"}}/>
                    Initializing {role.subjectNoun} simulation...
                  </div>
                )}
                {conversation.map(msg=>(
                  <div key={msg.id} style={{animation:"fadeIn .3s ease"}}>
                    {msg.role==="clinician" ? (
                      <div style={{background:"rgba(0,212,255,.05)",border:"1px solid rgba(0,212,255,.15)",borderRadius:"12px 12px 4px 12px",padding:"11px 14px",marginLeft:24}}>
                        <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--cyan)",letterSpacing:"2px",marginBottom:5}}>{role.respLabel}</div>
                        <div style={{fontFamily:"var(--fm)",fontSize:13,lineHeight:1.75,color:"rgba(232,240,255,.9)"}}>{msg.content}</div>
                      </div>
                    ) : (
                      <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:"12px 12px 12px 4px",padding:"11px 14px",marginRight:24}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                          <div style={{fontFamily:"var(--fm)",fontSize:9,color:sc.riskColor,letterSpacing:"2px"}}>{sc.clientName.toUpperCase()}</div>
                          {msg.coachScore!==null&&msg.coachScore!==undefined&&(
                            <div style={{fontFamily:"var(--fm)",fontSize:9,color:msg.coachScore>=0.68?"#00FFB2":msg.coachScore>=0.52?"#FFB800":"#FF4D6A"}}>{role.scoreLabel} {Math.round(msg.coachScore*100)}</div>
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
                {currentCoach && trainingMode!=="assessment"
                  ? <PerformanceRing score={currentCoach.overall_score}/>
                  : (
                  <div style={{width:96,height:96,borderRadius:"50%",border:"4px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",textAlign:"center",lineHeight:1.65}}>{trainingMode==="assessment" ? <>FEEDBACK<br/>LOCKED</> : <>AWAITING<br/>INPUT</>}</div>
                  </div>
                )}
                {evaluationLogs.length>0 && trainingMode!=="assessment" && (
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"1.5px",marginBottom:2}}>TURN HISTORY</div>
                    {evaluationLogs.slice(-7).map((l,i)=>{
                      const c=l.overall_score>=0.68?"#00FFB2":l.overall_score>=0.52?"#FFB800":"#FF4D6A";
                      return (
                        <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:c,boxShadow:`0 0 5px ${c}`,flexShrink:0}}/>
                          <div style={{width:44,height:3,background:"rgba(255,255,255,.05)",borderRadius:99,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${l.overall_score*100}%`,background:c,borderRadius:99}}/>
                          </div>
                          <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",minWidth:22}}>{Math.round(l.overall_score*100)}</div>
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
                  <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--vio)",letterSpacing:"2px",marginBottom:6}}>{role.feedbackLabel}</div>
                  <div style={{fontFamily:"var(--fm)",fontSize:12,color:"rgba(232,240,255,.82)",lineHeight:1.8}}>{currentCoach.feedback}</div>
                </div>
                {trainingMode==="guided" && (
                  <div style={{borderRadius:10,background:"rgba(0,212,255,.05)",border:"1px solid rgba(0,212,255,.14)",padding:"12px 14px"}}>
                    <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--cyan)",letterSpacing:"2px",marginBottom:6}}>TRY NEXT</div>
                    <div style={{fontFamily:"var(--fm)",fontSize:12,color:"rgba(232,240,255,.82)",lineHeight:1.75}}>{currentCoach.suggested_intervention}</div>
                  </div>
                )}
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
              </div>
            ) : (
              <div className="gl" style={{borderRadius:18,padding:"20px",flex:1,display:"flex",flexDirection:"column",gap:10}}>
                <div style={{fontFamily:"var(--fm)",fontSize:11,color:"var(--tm)",textAlign:"center",lineHeight:1.85,paddingTop:8}}>
                  Supervisor evaluates each response in real time.<br/>
                  <span style={{color:"var(--cyan)"}}>Submit your first response to begin.</span>
                </div>
                <div style={{paddingTop:12,borderTop:"1px solid rgba(255,255,255,.07)"}}>
                  <div onClick={()=>trainingMode!=="assessment" && setShowDbt(p=>!p)} style={{fontFamily:"var(--fm)",fontSize:9,color:trainingMode==="assessment"?"rgba(167,139,250,.35)":"var(--vio)",letterSpacing:"2px",cursor:trainingMode==="assessment"?"default":"pointer",display:"flex",justifyContent:"space-between",userSelect:"none"}}>
                    <span>{role.refLabel} — {trainingMode==="assessment"?"LOCKED IN ASSESSMENT":"QUICK REFERENCE"}</span><span>{trainingMode==="assessment"?"✕":showDbt?"▲":"▼"}</span>
                  </div>
                  {showDbt && trainingMode!=="assessment" && (
                    <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:7,animation:"fadeIn .3s ease"}}>
                      {role.reference.map(([k,v])=>(
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
          {showDbt && trainingMode!=="assessment" && (
            <div style={{marginBottom:10,padding:"10px 12px",background:"rgba(167,139,250,.06)",border:"1px solid rgba(167,139,250,.18)",borderRadius:10,display:"flex",flexWrap:"wrap",gap:7,animation:"fadeIn .25s ease"}}>
              {role.reference.map(([k,v])=>(
                <div key={k} style={{display:"flex",gap:5,alignItems:"baseline",background:"rgba(167,139,250,.06)",border:"1px solid rgba(167,139,250,.2)",borderRadius:8,padding:"3px 10px"}}>
                  <span style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--vio)",fontWeight:600,whiteSpace:"nowrap"}}>{k}</span>
                  <span style={{fontFamily:"var(--fm)",fontSize:9,color:"rgba(232,240,255,.35)"}}>{v}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"2px",marginBottom:6}}>{role.terminalLabel}</div>
              <textarea ref={inputRef} value={clinInput} onChange={e=>setCliInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!isProcessing){e.preventDefault();executeTurn();}}}
                placeholder="Type your response... (Enter to transmit, Shift+Enter for newline)"
                rows={3} disabled={isProcessing||isInit}/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7,paddingBottom:1}}>
              <button className="tx-btn" onClick={executeTurn} disabled={!clinInput.trim()||isProcessing||isInit} style={{padding:"13px 20px",whiteSpace:"nowrap"}}>
                {isProcessing?"RUNNING...":"TRANSMIT →"}
              </button>
              <button className="gh-btn" onClick={()=>trainingMode!=="assessment" && setShowDbt(p=>!p)} disabled={trainingMode==="assessment"} style={{padding:"7px 12px",fontSize:11,opacity:trainingMode==="assessment"?0.35:1}}>
                {trainingMode==="assessment" ? "REF LOCKED" : `${role.refLabel} ${showDbt?"▲":"▼"}`}
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
          <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><AegisLogo size={52}/></div>
          <div style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--tm)",letterSpacing:"3px",marginBottom:20}}>SESSION COMPLETE · AEGIS REPORT · {r.role.label}{r.profile?` / ${r.profile.label.toUpperCase()}`:""} TRACK</div>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:120,height:120,borderRadius:"50%",background:`${r.ratingCol}12`,border:`3px solid ${r.ratingCol}`,boxShadow:`0 0 44px ${r.ratingCol}44`,marginBottom:20}}>
            <div style={{fontFamily:"var(--fd)",fontSize:13,fontWeight:800,color:r.ratingCol,letterSpacing:"1.5px",textAlign:"center",lineHeight:1.3}}>{r.rating}</div>
          </div>
          <div style={{fontFamily:"var(--fm)",fontSize:12,color:"var(--tm)"}}>{r.scenario.title} · {r.scenario.clientName}, {r.scenario.age} · {r.difficulty.label}{r.trainingMode?` · ${r.trainingMode.label}`:""}</div>
        </div>

        {/* Stats grid */}
        <div className="s1" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(128px,1fr))",gap:10,marginBottom:22}}>
          {[
            [`AVG ${r.role.scoreLabel} SCORE`,`${Math.round(r.avgPerformance*100)}`,"/ 100","var(--vio)"],
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

        {/* Performance dimensions */}
        <div className="gl s2" style={{borderRadius:20,padding:"20px",marginBottom:18}}>
          <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"2px",marginBottom:16}}>PERFORMANCE DIMENSIONS</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
            {(EVALUATION_DIMENSIONS[r.role.id] || []).map(([key,label])=>{
              const value=r.dimensionAverages?.[key] ?? 0;
              const c=value>=0.82?"#00FFB2":value>=0.68?"#00D4FF":value>=0.52?"#FFB800":"#FF4D6A";
              return (
                <div key={key} style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"12px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",gap:10,marginBottom:7}}>
                    <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"1px"}}>{label.toUpperCase()}</div>
                    <div style={{fontFamily:"var(--fm)",fontSize:11,color:c}}>{Math.round(value*100)}</div>
                  </div>
                  <div style={{height:4,background:"rgba(255,255,255,.05)",borderRadius:99,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${value*100}%`,background:c,borderRadius:99}}/>
                  </div>
                </div>
              );
            })}
          </div>
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

        {/* Subject state change */}
        <div className="gl s3" style={{borderRadius:20,padding:"20px",marginBottom:18}}>
          <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"2px",marginBottom:14}}>SUBJECT STATE CHANGE</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {[
              ["AGITATION",r.initState.agitation,r.finalState.agitation],
              ["RAPPORT",r.initState.rapport,r.finalState.rapport],
              ["COOPERATION",r.initState.cooperation,r.finalState.cooperation],
            ].map(([label,start,end])=>{
              const change=end-start;
              const good = label==="AGITATION" ? change<0 : change>0;
              const c=Math.abs(change)<0.03 ? "#FFB800" : good ? "#00FFB2" : "#FF4D6A";
              return (
                <div key={label} style={{border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"13px"}}>
                  <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"1.5px",marginBottom:8}}>{label}</div>
                  <div style={{fontFamily:"var(--fm)",fontSize:12,color:"rgba(232,240,255,.55)"}}>
                    {start.toFixed(2)} →{" "}
                    <span style={{color:c,fontSize:16}}>{end.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
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

        {/* After action review */}
        {r.criticalMoments?.length>0 && (
          <div className="gl s4" style={{borderRadius:20,padding:"20px",marginBottom:18,borderLeft:"3px solid var(--cyan)"}}>
            <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--cyan)",letterSpacing:"2px",marginBottom:16}}>AFTER ACTION REVIEW · CRITICAL MOMENTS</div>
            {r.criticalMoments.map((m,i)=>{
              const improved = m.agitationShift < 0 || m.rapportShift > 0 || m.cooperationShift > 0;
              const c=improved ? "#00FFB2" : "#FF4D6A";
              return (
                <div key={`${m.turn}-${i}`} style={{padding:"12px 0",borderTop:i>0?"1px solid rgba(255,255,255,.06)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",gap:10,marginBottom:7,flexWrap:"wrap"}}>
                    <div style={{fontFamily:"var(--fd)",fontSize:12,fontWeight:700}}>Critical Moment · Turn {m.turn}</div>
                    <div style={{fontFamily:"var(--fm)",fontSize:10,color:c}}>SCORE {Math.round(m.score*100)}</div>
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
                    <span style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)"}}>AGI {m.agitationShift>=0?"+":""}{m.agitationShift.toFixed(2)}</span>
                    <span style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)"}}>RAPPORT {m.rapportShift>=0?"+":""}{m.rapportShift.toFixed(2)}</span>
                    <span style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)"}}>COOP {m.cooperationShift>=0?"+":""}{m.cooperationShift.toFixed(2)}</span>
                  </div>
                  <div style={{fontFamily:"var(--fm)",fontSize:11,color:"rgba(232,240,255,.58)",lineHeight:1.7,marginBottom:5}}>{m.feedback}</div>
                  <div style={{fontFamily:"var(--fm)",fontSize:10,color:"rgba(0,212,255,.6)",lineHeight:1.6}}>Alternative approach: {m.suggested_intervention}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Turn-by-turn */}
        <div className="gl s5" style={{borderRadius:20,padding:"20px",marginBottom:22}}>
          <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--tm)",letterSpacing:"2px",marginBottom:16}}>TURN-BY-TURN BREAKDOWN</div>
          {r.logs.map((l,i)=>{
            const c=l.overall_score>=0.68?"#00FFB2":l.overall_score>=0.52?"#FFB800":"#FF4D6A";
            const agi=r.agiHistory[i+1]??r.agiHistory[i];
            return (
              <div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderTop:i>0?"1px solid rgba(255,255,255,.06)":"none",alignItems:"flex-start"}}>
                <div style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--tm)",width:20,flexShrink:0,paddingTop:2}}>{i+1}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                    <div style={{fontFamily:"var(--fm)",fontSize:11,color:c,fontWeight:600}}>{r.role.scoreLabel} {Math.round(l.overall_score*100)}</div>
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
        <div className="s6" style={{display:"flex",gap:12}}>
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
      {screen==="gate"       && renderGate()}
      {screen!=="gate" && !disclaimerAck && renderDisclaimer()}
      {screen==="setup"      && renderSetup()}
      {screen==="simulation" && renderSimulation()}
      {screen==="report"     && renderReport()}
    </div>
  );
}
