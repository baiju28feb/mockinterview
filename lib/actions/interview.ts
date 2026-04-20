"use server";

import { getDb } from "@/lib/firebase/admin";
import Groq from "groq-sdk";

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export async function createInterview(params: InterviewFormProps & { userId: string }) {
  const { userId, role, level, type, techstack, amount } = params;

  try {
    const questions = await generateQuestions({ role, level, type, techstack, amount });

    const db = getDb();
    const interviewRef = db.collection("interviews").doc();
    await interviewRef.set({
      userId,
      role,
      level,
      type,
      techstack,
      questions,
      finalized: false,
      createdAt: new Date().toISOString(),
    });

    return { success: true, interviewId: interviewRef.id };
  } catch (error) {
    console.error("createInterview error:", error);
    return { success: false, message: "Failed to create interview." };
  }
}

export async function getInterviewById(interviewId: string): Promise<Interview | null> {
  try {
    const db = getDb();
    const doc = await db.collection("interviews").doc(interviewId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as Omit<Interview, "id">) };
  } catch {
    return null;
  }
}

export async function getLatestInterviews({ userId, limit = 6 }: GetLatestInterviewsParams) {
  try {
    const db = getDb();
    const snapshot = await db
      .collection("interviews")
      .where("userId", "!=", userId)
      .where("finalized", "==", true)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Interview, "id">) }));
  } catch {
    return [];
  }
}

export async function getInterviewsByUserId(userId: string): Promise<Interview[]> {
  try {
    const db = getDb();
    const snapshot = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Interview, "id">) }));
  } catch {
    return [];
  }
}

async function generateQuestions({
  role,
  level,
  type,
  techstack,
  amount,
}: Omit<InterviewFormProps, "interviewId">) {
  const response = await getGroq().chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `Generate ${amount} interview questions for a ${level} ${role} position.
Interview type: ${type}
Tech stack: ${techstack.join(", ")}

Return ONLY a valid JSON array of question strings, with no other text or markdown.
Example format: ["Question 1?", "Question 2?", "Question 3?"]`,
      },
    ],
    temperature: 0.7,
  });

  const text = response.choices[0]?.message?.content?.trim() ?? "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Failed to parse questions from AI response.");

  return JSON.parse(jsonMatch[0]) as string[];
}
