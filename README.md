# AEGIS — Dual-Agent Clinical Simulation Platform

AI-powered DBT training simulator for behavioral health clinicians. Two Claude agents run in parallel: an **Actor** portraying a patient in crisis, and a **Coach** evaluating the clinician's interventions in real time.

**[Live Demo](https://aegis-sim-snowy.vercel.app)** · Access code available on request

## What it does

Clinicians practice high-stakes crisis conversations — suicidal ideation, self-harm urges, acute agitation — against a realistic AI patient, with a second AI agent scoring their DBT technique as they go. Traditional role-play training requires scheduling two humans; AEGIS makes deliberate practice available on demand.

## Key features

- **Dual-agent orchestration** — Actor and Coach agents execute in parallel via `Promise.all`, so coaching feedback arrives alongside the patient response with no added latency
- **Crisis scenario library** — pre-built scenarios with calibrated initial agitation levels and risk ratings (MODERATE → HIGH)
- **Live agitation gauge** — the patient's emotional state rises or de-escalates based on the quality of the clinician's interventions
- **Cascading setup flow** — Clinician Profile → Role → Scenario → Difficulty
- **End-of-session report** — Coach-generated evaluation of technique, missed opportunities, and DBT skill usage
- **Access code gate** — controlled access for supervised training use

## Tech

- React (Vite), deployed on Vercel
- Anthropic Claude API — two independent system prompts (Actor / Coach), parallel async calls
- Cloudflare Worker proxy for API key security and CORS
- Structured prompt design: persona consistency, state injection (agitation level fed back into each Actor turn)

## Architecture

```
Clinician input
   ├── Actor agent  (patient persona + agitation state)  ┐
   └── Coach agent  (DBT evaluation rubric)              ├─ Promise.all
                                                         ┘
Browser → Cloudflare Worker (key injection, CORS) → Anthropic API
```

## Why I built it

Fifteen years in behavioral health operations taught me that crisis-intervention skill decays without practice, and practice opportunities are scarce. AEGIS applies multi-agent LLM orchestration to a training gap I watched teams struggle with for years.

## Disclaimer

Training simulation only. All patient personas are synthetic. Not a clinical tool and not a substitute for licensed supervision.

