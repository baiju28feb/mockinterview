# Interview Quality Enhancement — Design Spec

**Date:** 2026-04-24
**Approach:** B — Enhanced System Prompt + VAPI Config Tuning

---

## Goal

Improve the student interview experience through three targeted quality upgrades:
1. Dynamic cross-questioning driven by GPT-4's real-time judgment of answer quality
2. On-demand thinking pause triggered by student speech ("give me a moment")
3. A new "Depth Under Pressure" feedback scoring category

---

## Stack Overview

| Layer | Service |
|---|---|
| Question generation | Groq (llama-3.3-70b-versatile) |
| Voice interview (LLM) | VAPI → GPT-4 |
| Speech-to-text | VAPI → Deepgram Nova-2 |
| Text-to-speech | VAPI → ElevenLabs (sarah) |
| Feedback generation | Groq (llama-3.3-70b-versatile) |
| Database | Firebase Firestore |

---

## Changes

### 1. System Prompt Rewrite — `constants/index.ts`

Replace rule 2 (the "brief acknowledgement, move on" rule) with two new instruction blocks.

**Cross-question block:**
After each candidate answer, the AI judges quality:
- Vague or incomplete → ask one neutral probing follow-up (e.g. "Can you give me a concrete example?", "What was the outcome?", "How did you handle edge cases?")
- Follow-up answer still shallow → ask one more probe. No hard limit — AI decides when enough depth has been reached.
- Strong, specific answer → brief acknowledgement, move to next main question.
- Probes must be neutral. Never hint at what a good answer looks like. Never give feedback mid-interview.

**Thinking pause block (new rule):**
If the candidate says anything like "give me a moment", "let me think", "one second", "hold on":
- Respond with exactly: "Take your time." — nothing else.
- Wait for them to continue. Do NOT re-ask the question or prompt further.

All other existing rules remain unchanged (no hints, no off-topic, strict tone, end-call phrase).

---

### 2. VAPI Config Additions — `constants/index.ts`

Two additions to the `interviewer` object:

**`silenceTimeoutSeconds: 60`**
Call-level silence timeout. Default (~30s) is too short when a student takes a genuine thinking pause after "give me a moment". 60 seconds prevents the call from auto-ending mid-thought.

**`transcriber.endpointing: 500`**
Deepgram endpointing in milliseconds — how long of silence before a speech chunk is finalised and sent to the LLM. Default (~100ms) causes the AI to interrupt between sentences. 500ms gives the student one full breath of silence without triggering a response.

```ts
transcriber: {
  provider: "deepgram",
  model: "nova-2",
  language: "en",
  endpointing: 500,
},
silenceTimeoutSeconds: 60,
```

---

### 3. Feedback Prompt Update — `lib/actions/feedback.ts`

Add a 6th entry to the `categoryScores` array in the Groq feedback prompt:

```json
{"name": "Depth Under Pressure", "score": <0-100>, "comment": "<brief comment>"}
```

This category scores how well the student handled follow-up probing — did they elaborate meaningfully and hold up under challenge, or did they give vague or repetitive answers when pressed?

The richer transcript produced by cross-questioning gives Groq sufficient signal to score this accurately without any additional input.

---

## Files Changed

| File | Change |
|---|---|
| `constants/index.ts` | System prompt rewrite + `silenceTimeoutSeconds` + `endpointing` |
| `lib/actions/feedback.ts` | Add "Depth Under Pressure" to Groq prompt |

## Files Unchanged

| File | Why untouched |
|---|---|
| `types/index.d.ts` | `categoryScores` already typed as `Array<{name, score, comment}>` |
| `app/(root)/interview/[id]/feedback/page.tsx` | Already renders `categoryScores` via `.map()` |
| `lib/actions/interview.ts` | Question generation unchanged |
| All Firebase schema | No new fields required |

---

## Out of Scope

- Pre-planned follow-up question trees (Approach C — future option)
- Question metadata / context hints in Firestore
- Any UI changes to the interview page
