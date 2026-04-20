"use server";

import { getDb } from "@/lib/firebase/admin";
import Groq from "groq-sdk";

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export async function createFeedback({
  interviewId,
  userId,
  transcript,
  feedbackId,
}: CreateFeedbackParams) {
  try {
    const formattedTranscript = transcript
      .map(({ role, content }) => `- ${role}: ${content}`)
      .join("\n");

    const feedback = await generateFeedback(formattedTranscript);

    const db = getDb();
    const feedbackRef = feedbackId
      ? db.collection("feedback").doc(feedbackId)
      : db.collection("feedback").doc();

    await feedbackRef.set({
      interviewId,
      userId,
      ...feedback,
      createdAt: new Date().toISOString(),
    });

    await db.collection("interviews").doc(interviewId).update({ finalized: true });

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("createFeedback error:", error);
    return { success: false, message: "Failed to generate feedback." };
  }
}

export async function getFeedbackByInterviewId({
  interviewId,
  userId,
}: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
  try {
    const db = getDb();
    const snapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...(doc.data() as Omit<Feedback, "id">) };
  } catch {
    return null;
  }
}

async function generateFeedback(
  transcript: string
): Promise<Omit<Feedback, "id" | "interviewId" | "createdAt">> {
  const response = await getGroq().chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
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
    {"name": "Confidence and Clarity", "score": <0-100>, "comment": "<brief comment>"}
  ],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areasForImprovement": ["<area 1>", "<area 2>", "<area 3>"],
  "finalAssessment": "<2-3 sentence overall assessment>"
}`,
      },
    ],
    temperature: 0.5,
  });

  const text = response.choices[0]?.message?.content?.trim() ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse feedback from AI response.");

  return JSON.parse(jsonMatch[0]);
}
