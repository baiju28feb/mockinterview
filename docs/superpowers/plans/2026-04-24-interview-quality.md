# Interview Quality Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the student interview experience with dynamic cross-questioning, on-demand thinking pauses, and a new "Depth Under Pressure" feedback scoring category.

**Architecture:** Rewrite the VAPI system prompt in `constants/index.ts` to add cross-question judgment logic and pause-phrase detection. Add two VAPI config params (`silenceTimeoutSeconds`, `endpointing`) to the same file. Add a sixth scoring category to the Groq feedback prompt in `lib/actions/feedback.ts`.

**Tech Stack:** VAPI (`@vapi-ai/web`), Deepgram Nova-2 (STT), ElevenLabs (TTS), GPT-4 (interview LLM), Groq llama-3.3-70b-versatile (question gen + feedback), Firebase Firestore, Next.js App Router.

---

## File Map

| File | Change |
|---|---|
| `constants/index.ts` | Rewrite system prompt + add `silenceTimeoutSeconds` + `endpointing` to transcriber |
| `lib/actions/feedback.ts` | Add "Depth Under Pressure" to the Groq prompt's `categoryScores` array |

---

## Task 1: Update VAPI Config and Rewrite System Prompt

**Files:**
- Modify: `constants/index.ts`

### Why

The current system prompt moves to the next question immediately after every answer. There is no cross-question logic and no recognition of "give me a moment" style phrases. The VAPI silence timeout and Deepgram endpointing defaults are too aggressive — the call can end or the AI can interrupt during a genuine thinking pause.

### Steps

- [ ] **Step 1: Open `constants/index.ts` and replace the `interviewer` export entirely**

Replace everything from `export const interviewer = {` to the closing `};` with the following:

```ts
export const interviewer = {
  name: "Interviewer",
  firstMessage:
    "Hello, I'm your interviewer today. Let's get started with the interview. I'll be asking you a series of questions — please take your time and answer as clearly as you can. Ready? Here's your first question.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
    endpointing: 500,
  },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a strict, professional job interviewer conducting a real voice interview. You have a fixed list of questions to ask the candidate one by one.

Your questions are:
{{questions}}

STRICT RULES — follow these exactly:

1. Ask ONE question at a time. Wait for the candidate to finish answering before moving on.

2. CROSS-QUESTIONING — After each answer, judge the quality:
   - If the answer is vague, too brief, or lacks concrete detail: ask ONE neutral probing follow-up (e.g. "Can you give me a specific example?", "What was the actual outcome?", "How did you handle the edge cases?"). Never hint at what a good answer looks like.
   - If the follow-up answer is still shallow: ask one more probe. Use your judgment — stop probing when you have enough depth.
   - If the answer is strong and specific: give a brief neutral acknowledgement (e.g. "Got it.", "Thank you.") and move to the next main question.

3. THINKING PAUSES — If the candidate says anything like "give me a moment", "let me think", "one second", "hold on", or similar:
   - Respond with exactly: "Take your time." — nothing else.
   - Wait for them to continue. Do NOT re-ask the question or prompt them further.

4. Do NOT give hints, tips, or feedback during the interview.
5. Do NOT help the candidate improve their answer or explain concepts to them.
6. Do NOT engage in small talk, jokes, or off-topic conversation.
7. Do NOT answer questions the candidate asks about the role or company — say "I'm not able to share that during the interview."
8. If the candidate goes off-topic, redirect them: "Let's stay focused. Can you answer the question?"
9. Work through ALL main questions in order. Do not skip any.
10. After the last main question has been fully explored, say exactly: "That concludes our interview. Thank you for your time. We'll be in touch with feedback soon. Goodbye." — then end the call.
11. Keep ALL your responses short — this is a voice call, not a chat.

Start immediately by asking the first question.`,
      },
    ],
  },
  silenceTimeoutSeconds: 60,
};
```

**Key changes from the old version:**
- Rule 2 now contains the full cross-questioning decision tree instead of "brief acknowledgement, move on"
- New Rule 3 handles thinking pause phrases ("give me a moment" etc.)
- `endpointing: 500` added to transcriber — Deepgram waits 500ms of silence before finalising a speech chunk (prevents AI from interrupting mid-sentence)
- `silenceTimeoutSeconds: 60` added at the top level — call won't auto-end during a genuine 30-second thinking pause

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
cd D:/dev/mockinterview/mockinterview
npx tsc --noEmit
```

Expected output: no errors. If you see `Object literal may only specify known properties` on `endpointing` or `silenceTimeoutSeconds`, check `types/vapi.d.ts` — add the fields there if needed (see Task 1 note below).

> **Note on VAPI types:** The `endpointing` field on the Deepgram transcriber and `silenceTimeoutSeconds` at the top level are valid VAPI API fields, but the local `types/vapi.d.ts` may not declare them. If `tsc` errors on either field, open `types/vapi.d.ts` and add them to the relevant interface. If the type file uses `[key: string]: unknown` or similar index signatures, no change is needed.

- [ ] **Step 3: Start the dev server and do a smoke test**

```bash
npm run dev
```

Navigate to an existing interview (or create a new one), click "Start Interview", and verify:
- The call connects and the AI asks the first question
- Saying "give me a moment" triggers the AI to respond with "Take your time." and wait
- A short, vague answer to a question triggers a follow-up probe from the AI
- A detailed answer moves the AI on to the next question without probing

- [ ] **Step 4: Commit**

```bash
git add constants/index.ts
git commit -m "feat: add cross-questioning, thinking pause, and VAPI timing config"
```

---

## Task 2: Add "Depth Under Pressure" Feedback Category

**Files:**
- Modify: `lib/actions/feedback.ts`

### Why

The existing five scoring categories don't capture how well the student held up under follow-up probing. The richer transcript produced by cross-questioning now provides enough signal for Groq to score this accurately.

### Steps

- [ ] **Step 1: Open `lib/actions/feedback.ts` and update the Groq prompt inside `generateFeedback`**

Find the `categoryScores` array in the prompt string (around line 80) and add the sixth entry. The full updated prompt should read:

```ts
content: `Analyze this job interview transcript and provide detailed, constructive feedback.

Transcript:
${transcript}

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "totalScore": <number 0-100>,
  "categoryScores": [
    {"name": "Communication Skills", "score": <0-100>, "comment": "<brief comment>"},
    {"name": "Technical Knowledge", "score": <0-100>, "comment": "<brief comment>"},
    {"name": "Problem Solving", "score": <0-100>, "comment": "<brief comment>"},
    {"name": "Cultural Fit", "score": <0-100>, "comment": "<brief comment>"},
    {"name": "Confidence and Clarity", "score": <0-100>, "comment": "<brief comment>"},
    {"name": "Depth Under Pressure", "score": <0-100>, "comment": "<brief comment>"}
  ],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areasForImprovement": ["<area 1>", "<area 2>", "<area 3>"],
  "finalAssessment": "<2-3 sentence overall assessment>"
}`,
```

"Depth Under Pressure" scores how well the student handled follow-up probing — did they elaborate meaningfully when pressed, or give vague and repetitive answers under challenge?

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected output: no errors. The `Feedback` type in `types/index.d.ts` already types `categoryScores` as `Array<{name: string, score: number, comment: string}>` so the sixth entry requires no type change.

- [ ] **Step 3: Verify the feedback page renders the new category**

Run a complete interview (or use an existing transcript), let it end, and check the feedback page at `/interview/[id]/feedback`.

The "Depth Under Pressure" category should appear in the breakdown list alongside the other five, with a score bar and comment. No UI code changes are needed — `feedback/page.tsx` already renders all `categoryScores` via `.map()`.

- [ ] **Step 4: Commit**

```bash
git add lib/actions/feedback.ts
git commit -m "feat: add Depth Under Pressure scoring category to feedback"
```

---

## Self-Review

**Spec coverage:**
- [x] Dynamic cross-questioning → Task 1 Rule 2 in system prompt
- [x] On-demand thinking pause ("give me a moment") → Task 1 Rule 3 in system prompt
- [x] AI-judged cross-question depth → Task 1 Rule 2 ("use your judgment")
- [x] `silenceTimeoutSeconds: 60` → Task 1 Step 1
- [x] `endpointing: 500` → Task 1 Step 1
- [x] "Depth Under Pressure" feedback category → Task 2 Step 1
- [x] No Firebase schema changes → confirmed, no task needed
- [x] No UI changes → confirmed, feedback page renders via `.map()` already

**Placeholder scan:** None found. All code blocks are complete. All commands include expected output.

**Type consistency:** `categoryScores` is referenced consistently across Task 2. `endpointing` and `silenceTimeoutSeconds` include a note about potential VAPI type declaration gaps with a resolution path.
