import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export const dynamic = "force-dynamic";

export async function GET() {
  const keyStatus = process.env.GROQ_API_KEY
    ? `✅ set (length: ${process.env.GROQ_API_KEY.length})`
    : "❌ NOT SET";

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content:
            'Generate 2 short interview questions for a junior React developer. Return ONLY a JSON array like ["Q1?", "Q2?"]',
        },
      ],
    });

    const text = response.choices[0]?.message?.content?.trim();
    return NextResponse.json({ success: true, GROQ_API_KEY: keyStatus, response: text });
  } catch (error) {
    return NextResponse.json({ success: false, GROQ_API_KEY: keyStatus, error: String(error) }, { status: 500 });
  }
}
