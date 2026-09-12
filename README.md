# AEGIS — Crisis De-escalation Simulation Engine

**v3.1 · Multi-Role Dual-Agent AI Training Platform**

AEGIS is an interactive training simulator for crisis de-escalation. Trainees engage a realistic AI-simulated person in crisis while a second AI agent — a supervisory evaluator — scores every response in real time against the professional framework for their role. Built for behavioral health clinicians, police officers, and corrections officers.

> **Disclaimer:** AEGIS is a prototype educational simulation only. It does not replace certified instruction, agency policy, clinical supervision, or professional judgment, and it is not a clinical or field decision tool.

---

## How It Works

Every trainee turn triggers **two AI agents in parallel**:

| Agent | Role |
|---|---|
| **Actor** | Portrays the person in crisis — age-authentic voice, evolving emotional state, realistic resistance calibrated to difficulty |
| **Supervisor** | Evaluates the trainee's response against the role's professional framework and returns a scored, skill-tagged critique |

Both calls run simultaneously (`Promise.all`), so evaluation adds no extra latency to the conversation.

### Multi-Dimensional Subject State

The simulated subject tracks three independent dimensions — **agitation, rapport, and cooperation** — because a person going quiet is not the same as a person becoming safer. Poor technique can lower volume while destroying trust; AEGIS models that.

---

## Training Tracks

### 🧠 Clinician — scored on DBT
Cascading **Role → Clinician Profile → Scenario** selection. Four profiles (Child Psychologist, Neuropsychologist, School Psychologist, Adult Clinician), each with its own scope of practice and evaluator focus — the Supervisor judges a School Psychologist against NASP-aligned crisis standards and a Neuropsychologist against neurodiversity-affirming, sensory-informed practice.

**10 scenarios, ages 6–71:** acute trauma withdrawal (6), ASD post-meltdown (10), ADHD/ODD explosive episode (12), suicidal ideation (16), panic (15), substance crisis (17), trauma disclosure (14), college burnout with passive SI (21), late ASD diagnosis and loss (28), geriatric bereavement with passive self-harm (71).

### 🚔 Police Officer — scored on CIT-informed framework
CIT-informed communication principles and ICAT-informed decision-making: active listening skills, the Behavioral Change Stairway, LEED, time/distance/space, procedural justice, command discipline.

**5 scenarios:** intoxicated & combative subject, mental health crisis call (psychosis), welfare check with a despondent subject, domestic disturbance with a police-distrustful party, and **peer intervention** — talking down a fellow officer in an acute stress response under a duty-to-intervene policy.

### 🔐 Corrections Officer — scored on correctional de-escalation
Dignity and respect, calm directive communication, realistic choices within facility rules, tactical patience, crisis recognition (withdrawal, psychosis, and medical crisis can look like defiance).

**4 scenarios:** cell-front transport refusal (PTSD history), opioid withdrawal crisis at intake with group dynamics, rapid restrictive-housing decompensation, and a **tier talk-down** — the verbal engagement window of an active suicide threat while the emergency response team is en route. Sensitive scenarios are written to strict content guardrails: the Actor portrays distress through dialogue only, never self-harm actions or method detail.

---

## Training Modes

| Mode | Live coaching | Suggested next step | References | State telemetry |
|---|---|---|---|---|
| **Guided Practice** | ✅ | ✅ | ✅ | ✅ |
| **Standard Simulation** | ✅ | — | ✅ | ✅ |
| **Assessment** | Locked until report | — | Locked | Hidden |

Assessment mode withholds all feedback and telemetry during the session and reveals the complete evaluation only in the final report — the foundation for formal skills testing.

## Session Report

- Overall performance rating with per-turn score history
- **Five evaluation dimensions per role** (e.g., Validation, Safety Assessment, Trauma-Informed Communication for clinicians; Procedural Justice, Time/Distance/Space for police) averaged across the session
- Subject state change: agitation, rapport, and cooperation from first contact to session end
- Agitation trend graph across the full session
- **After Action Review** — the three most consequential turns, with state shifts, scores, and alternative approaches
- Skills applied vs. growth areas, aggregated across turns
- Full turn-by-turn supervisory breakdown

---

## Architecture

- **Frontend:** React single-file application, deployed on Vercel
- **Inference:** Anthropic Claude API — dual-agent parallel inference per turn, structured JSON contracts for state and evaluation
- **Edge layer:** Cloudflare Worker proxy — server-side API key injection and CORS; the client never holds credentials
- **Environment auto-detection:** the same file runs against the direct API in a sandboxed preview and through the Worker in production
- **Access:** shared-passcode gate (usage friction for API cost control — not authentication)
- **Design:** provider-abstraction architecture designed for future Azure AI Foundry deployment in HIPAA-scoped environments

## Version History

- **v3.1** — Multi-dimensional subject state (agitation/rapport/cooperation), three training modes, five-dimension supervisor scoring per role, After Action Review, critical-moment detection, replay metadata foundation, peer-intervention and tier talk-down scenarios, brand mark, hardened disclaimers
- **v3.0** — Multi-role expansion: Police Officer and Corrections Officer tracks with role-specific evaluation frameworks; clinician profile selector restored; Cloudflare Worker routing; access gate
- **v2.x** — Dual-agent clinical simulator: 10 scenarios across the lifespan, DBT-scored supervision, difficulty tiers, session reports

## Roadmap

- Worker-side session issuance and rate limiting
- Session replay from stored turn metadata
- Scenario authoring interface for training coordinators
- Cohort analytics for training programs
- Azure AI Foundry deployment path for HIPAA-scoped institutional use

---

## Author

Built by **Thomas Green** — 15 years of behavioral health and clinical group facilitation experience, now building AI-powered clinical tools under the **Corvia** brand. AEGIS pairs domain expertise in real crisis intervention with hands-on AI product engineering.

*Feedback from clinicians, law enforcement trainers, and corrections professionals is actively welcomed.*
