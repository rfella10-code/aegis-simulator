import { useState } from "react";
import {
  BUILDER_OPTIONS, SAFETY_PRESENTATIONS, ICONS, LOCKED_RULES, YOUTH_RULES,
  riskFor, localChecks, REVIEW_SYSTEM, reviewPayload,
} from "./customScenarios.js";

/* ══════════════════════════════════════════════════════
   SCENARIO BUILDER — instructors create a fictional person
   in crisis. Saving runs an AI review first; the scenario can
   only be run once it passes.
══════════════════════════════════════════════════════ */

const label = { fontFamily:"var(--fm)", fontSize:9, color:"var(--tm)", letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:8, display:"block" };
const input = { width:"100%", fontFamily:"var(--fm)", fontSize:13, color:"var(--tx)", background:"rgba(0,212,255,.03)", border:"1px solid var(--gb)", borderRadius:12, padding:"12px 14px", outline:"none" };
const hint = { fontFamily:"var(--fm)", fontSize:10, color:"rgba(232,240,255,.34)", lineHeight:1.6, marginTop:6 };
const panel = { borderRadius:20, padding:"20px", marginBottom:16 };

const extract = (text) => {
  const cleaned = (text || "").replace(/```json|```/g, "").trim();
  const m = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(m ? m[0] : cleaned);
};

function Chip({ on, color = "var(--cyan)", onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      style={{ fontFamily:"var(--fm)", fontSize:11, padding:"7px 12px", borderRadius:20, cursor:"pointer",
        color: on ? color : "rgba(232,240,255,.55)", background: on ? `${color}18` : "rgba(255,255,255,.03)",
        border:`1px solid ${on ? color : "rgba(255,255,255,.1)"}`, transition:"all .15s" }}>
      {children}
    </button>
  );
}

export default function ScenarioBuilder({ role, initial, callAPI, onSave, onCancel }) {
  const [d, setD] = useState(initial);
  const [review, setReview] = useState(initial.review || null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const opts = BUILDER_OPTIONS[role.id];
  const minor = Number(d.age) < 18;
  const safety = d.presentations.some((p) => SAFETY_PRESENTATIONS.includes(p));
  const risk = riskFor(Number(d.initialAgitation));

  // Any edit after a review sends the scenario back to draft.
  const set = (patch) => {
    setD((prev) => ({ ...prev, ...patch, status: "draft", review: null }));
    if (review) setReview(null);
    setError(null);
  };
  const togglePresentation = (p) =>
    set({ presentations: d.presentations.includes(p) ? d.presentations.filter((x) => x !== p)
      : d.presentations.length >= 3 ? d.presentations : [...d.presentations, p] });

  const runReview = async () => {
    setError(null);
    const local = localChecks(d);
    if (local.length) {
      const r = { verdict:"block", summary:"Fix these before the AI review runs.", findings:local, local:true };
      setReview(r);
      onSave({ ...d, status:"draft", review:r, updated:Date.now() }, { stay:true });
      return;
    }
    setBusy(true);
    try {
      const data = await callAPI({
        max_tokens: 800,
        system: REVIEW_SYSTEM,
        messages: [{ role:"user", content: reviewPayload(d, role.label) }],
        aegis: { agent:"review" },
      });
      const parsed = extract(data.content?.[0]?.text);
      const verdict = ["pass","warn","block"].includes(parsed.verdict) ? parsed.verdict : "warn";
      const r = { verdict, summary: parsed.summary || "", findings: Array.isArray(parsed.findings) ? parsed.findings.slice(0, 6) : [] };
      setReview(r);
      const status = verdict === "block" ? "draft" : "reviewed";
      setD((prev) => ({ ...prev, status, review:r }));
      onSave({ ...d, status, review:r, updated:Date.now() }, { stay:true });
    } catch (e) {
      setError(`The AI review couldn't run (${e.message}). Your draft is saved — try again in a moment.`);
      onSave({ ...d, status:"draft", review:null, updated:Date.now() }, { stay:true });
    }
    setBusy(false);
  };

  const verdictStyle = review && {
    pass: { c:"#00FFB2", t:"PASSED · SAVED" },
    warn: { c:"#FFB800", t:"SAVED WITH SUGGESTIONS" },
    block: { c:"#FF4D6A", t:"BLOCKED · NOT READY" },
  }[review.verdict];

  return (
    <div style={{ minHeight:"100vh", position:"relative", zIndex:1, maxWidth:900, margin:"0 auto", padding:"36px 20px 80px" }}>
      {/* Header */}
      <div className="sc" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginBottom:26 }}>
        <div>
          <div style={{ fontFamily:"var(--fm)", fontSize:10, color:role.color, letterSpacing:"3px", marginBottom:6 }}>{role.label} TRACK · SCENARIO BUILDER</div>
          <div style={{ fontFamily:"var(--fd)", fontSize:34, fontWeight:800, letterSpacing:"-1.5px" }}>{initial.title ? "Edit scenario" : "Build a custom scenario"}</div>
          <div style={{ fontFamily:"var(--fm)", fontSize:11, color:"var(--tm)", marginTop:6, lineHeight:1.7, maxWidth:560 }}>
            Describe a fictional person in crisis. It runs through the same Actor and Supervisor as the built-in scenarios.
          </div>
        </div>
        <button className="gh-btn" onClick={onCancel} style={{ padding:"10px 16px" }}>← Back to setup</button>
      </div>

      {initial.imported && (
        <div className="gl s1" style={{ ...panel, borderLeft:"3px solid var(--amb)" }}>
          <div style={{ fontFamily:"var(--fm)", fontSize:11, color:"var(--amb)", lineHeight:1.7 }}>
            Shared scenario received. Links can be edited by anyone, so it needs a fresh AI review before it can be used.
          </div>
        </div>
      )}

      {/* 1 · The person */}
      <div className="gl s1" style={panel}>
        <div style={{ fontFamily:"var(--fd)", fontSize:16, fontWeight:700, marginBottom:16 }}>1 · The person</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:14 }}>
          <div>
            <label style={label} htmlFor="b-title">Scenario title</label>
            <input id="b-title" style={input} value={d.title} maxLength={60} placeholder="e.g. After-School Meltdown"
              onChange={(e) => set({ title:e.target.value })} />
          </div>
          <div>
            <label style={label} htmlFor="b-name">First name (fictional)</label>
            <input id="b-name" style={input} value={d.clientName} maxLength={24} placeholder="e.g. Marcus"
              onChange={(e) => set({ clientName:e.target.value })} />
          </div>
          <div>
            <label style={label} htmlFor="b-age">Age</label>
            <input id="b-age" type="number" min={5} max={95} style={input} value={d.age}
              onChange={(e) => set({ age: Math.max(5, Math.min(95, Number(e.target.value) || 5)) })} />
            {minor && <div style={{ ...hint, color:"rgba(0,212,255,.6)" }}>Minor · youth safety rules turn on automatically.</div>}
          </div>
          <div>
            <label style={label} htmlFor="b-pro">Pronouns</label>
            <select id="b-pro" style={input} value={d.pronouns} onChange={(e) => set({ pronouns:e.target.value })}>
              <option>she/her</option><option>he/him</option><option>they/them</option>
            </select>
          </div>
        </div>
        <label style={label}>Icon</label>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {ICONS.map((ic) => (
            <button key={ic} type="button" onClick={() => set({ icon:ic })} aria-label={`Icon ${ic}`}
              style={{ width:40, height:40, fontSize:19, borderRadius:10, cursor:"pointer",
                background: d.icon === ic ? "var(--cd)" : "rgba(255,255,255,.03)",
                border:`1px solid ${d.icon === ic ? "var(--cyan)" : "rgba(255,255,255,.1)"}` }}>{ic}</button>
          ))}
        </div>
      </div>

      {/* 2 · Situation */}
      <div className="gl s2" style={panel}>
        <div style={{ fontFamily:"var(--fd)", fontSize:16, fontWeight:700, marginBottom:16 }}>2 · The situation</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:14, marginBottom:16 }}>
          <div>
            <label style={label} htmlFor="b-set">Setting</label>
            <select id="b-set" style={input} value={d.setting} onChange={(e) => set({ setting:e.target.value })}>
              {opts.settings.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={label} htmlFor="b-pres">Also in the room</label>
            <select id="b-pres" style={input} value={d.alsoPresent} onChange={(e) => set({ alsoPresent:e.target.value })}>
              {opts.present.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <label style={label}>What they're dealing with · pick up to 3</label>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:safety ? 8 : 16 }}>
          {opts.presentations.map((p) => (
            <Chip key={p} on={d.presentations.includes(p)} color={SAFETY_PRESENTATIONS.includes(p) ? "#FF4D6A" : "var(--cyan)"}
              onClick={() => togglePresentation(p)}>{p}</Chip>
          ))}
        </div>
        {safety && <div style={{ ...hint, color:"#FF4D6A", marginBottom:16 }}>Safety scenario · the AI expresses distress through words only, never methods or detail.</div>}

        <label style={label} htmlFor="b-desc">One-line summary (shown on the scenario card)</label>
        <input id="b-desc" style={{ ...input, marginBottom:16 }} value={d.description} maxLength={160}
          placeholder="e.g. Sent to the counselor after throwing a chair. Refusing to talk."
          onChange={(e) => set({ description:e.target.value })} />

        <label style={label} htmlFor="b-story">Backstory · what just happened</label>
        <textarea id="b-story" rows={5} maxLength={600} value={d.backstory}
          placeholder="Who they are, what just happened, what they want right now. Behaviors, not labels."
          onChange={(e) => set({ backstory:e.target.value })} />
        <div style={{ ...hint, textAlign:"right", color: d.backstory.length > 540 ? "var(--amb)" : hint.color }}>{d.backstory.length} / 600</div>

        <label style={{ ...label, marginTop:10 }} htmlFor="b-hidden">Details they hold back · one per line</label>
        <textarea id="b-hidden" rows={3} maxLength={400} value={d.hidden}
          placeholder="Things the trainee has to earn through rapport. Hidden from trainees before the session."
          onChange={(e) => set({ hidden:e.target.value })} />
      </div>

      {/* 3 · Intensity & goals */}
      <div className="gl s3" style={panel}>
        <div style={{ fontFamily:"var(--fd)", fontSize:16, fontWeight:700, marginBottom:16 }}>3 · Intensity & what good looks like</div>
        <label style={label} htmlFor="b-agi">Starting agitation</label>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:6 }}>
          <input id="b-agi" type="range" min={0.1} max={0.95} step={0.05} value={d.initialAgitation}
            onChange={(e) => set({ initialAgitation:Number(e.target.value) })} style={{ flex:1, accentColor:risk.riskColor }} />
          <span style={{ fontFamily:"var(--fm)", fontSize:14, color:risk.riskColor, minWidth:44, textAlign:"right" }}>{Number(d.initialAgitation).toFixed(2)}</span>
          <span style={{ fontFamily:"var(--fm)", fontSize:9, color:risk.riskColor, background:`${risk.riskColor}18`, border:`1px solid ${risk.riskColor}40`, padding:"3px 9px", borderRadius:20, letterSpacing:"1px" }}>{risk.riskLevel}</span>
        </div>
        <div style={{ ...hint, marginBottom:16 }}>Difficulty is still chosen on the setup screen and adjusts this at the start.</div>

        <label style={label}>Key considerations · what a strong response does</label>
        {d.considerations.map((c, i) => (
          <input key={i} style={{ ...input, marginBottom:8 }} value={c} maxLength={160}
            placeholder={["e.g. Validate before asking any questions","e.g. Offer a choice instead of a directive","e.g. Screen for safety calmly and directly"][i]}
            onChange={(e) => set({ considerations: d.considerations.map((x, j) => (j === i ? e.target.value : x)) })}
            aria-label={`Consideration ${i + 1}`} />
        ))}
      </div>

      {/* Locked rules */}
      <div className="gl s4" style={{ ...panel, borderLeft:"3px solid rgba(255,255,255,.18)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:10, flexWrap:"wrap", marginBottom:12 }}>
          <div style={{ fontFamily:"var(--fd)", fontSize:16, fontWeight:700 }}>🔒 Built-in safety rules</div>
          <div style={{ fontFamily:"var(--fm)", fontSize:9, color:"var(--tm)", letterSpacing:"1.5px" }}>LOCKED · APPLIED BY THE SERVER</div>
        </div>
        {[...LOCKED_RULES.slice(0, 5), "If the trainee says they are in real crisis, the simulation pauses and shows 988.", ...(minor ? YOUTH_RULES : [])].map((r, i) => (
          <div key={i} style={{ display:"flex", gap:8, marginBottom:6, fontFamily:"var(--fm)", fontSize:11, lineHeight:1.6,
            color: minor && i >= 6 ? "rgba(0,212,255,.75)" : "rgba(232,240,255,.55)" }}>
            <span aria-hidden="true">·</span><span>{r.replace(/<\/?scenario_details>/g, "the scenario")}</span>
          </div>
        ))}
      </div>

      {/* Review result */}
      {(review || error) && (
        <div className="gl" style={{ ...panel, borderLeft:`3px solid ${error ? "#FF4D6A" : verdictStyle.c}` }} aria-live="polite">
          {error && <div style={{ fontFamily:"var(--fm)", fontSize:11, color:"#FF4D6A", lineHeight:1.7 }}>{error}</div>}
          {review && (
            <>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:10 }}>
                <span style={{ fontFamily:"var(--fm)", fontSize:10, color:verdictStyle.c, background:`${verdictStyle.c}18`, border:`1px solid ${verdictStyle.c}40`, padding:"4px 10px", borderRadius:20, letterSpacing:"1.5px" }}>{verdictStyle.t}</span>
                <span style={{ fontFamily:"var(--fd)", fontSize:15, fontWeight:700 }}>{review.local ? "Quick check" : "AI review"}</span>
              </div>
              {review.summary && <div style={{ fontFamily:"var(--fm)", fontSize:11, color:"rgba(232,240,255,.62)", lineHeight:1.7, marginBottom:10 }}>{review.summary}</div>}
              {review.findings.map((f, i) => (
                <div key={i} style={{ display:"flex", gap:10, marginBottom:10 }}>
                  <span style={{ fontFamily:"var(--fm)", fontSize:10, color: f.severity === "block" ? "#FF4D6A" : "#FFB800", marginTop:2 }}>{f.severity === "block" ? "✕" : "!"}</span>
                  <div>
                    <div style={{ fontFamily:"var(--fm)", fontSize:11, color:"var(--tx)", lineHeight:1.6 }}>{f.issue}</div>
                    {f.fix && <div style={{ fontFamily:"var(--fm)", fontSize:11, color:"rgba(0,212,255,.7)", lineHeight:1.6 }}>Try: {f.fix}</div>}
                  </div>
                </div>
              ))}
              {review.verdict !== "block" && (
                <div style={{ fontFamily:"var(--fm)", fontSize:11, color:"rgba(232,240,255,.55)", lineHeight:1.7 }}>
                  Next: go back to setup, pick it, and run a test session. Sharing unlocks after the test run.
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="s5" style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        <button className="gh-btn" onClick={onCancel} style={{ flex:1, minWidth:160, padding:"16px", fontSize:13 }}>Cancel</button>
        {review && review.verdict !== "block" ? (
          <button className="tx-btn" onClick={() => onSave({ ...d, updated:Date.now() })} style={{ flex:2, minWidth:220, padding:"16px" }}>
            <span style={{ position:"relative", zIndex:1 }}>DONE — BACK TO SETUP →</span>
          </button>
        ) : (
          <button className="tx-btn" onClick={runReview} disabled={busy} style={{ flex:2, minWidth:220, padding:"16px" }}>
            <span style={{ position:"relative", zIndex:1 }}>{busy ? "REVIEWING WITH AI…" : "RUN AI REVIEW & SAVE →"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
