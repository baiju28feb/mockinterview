import { NextRequest, NextResponse } from "next/server";
import { createInterview } from "@/lib/actions/interview";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message } = body;

  if (message?.type === "tool-calls") {
    const toolCall = message.toolCallList?.[0];

    if (toolCall?.function?.name === "createInterview") {
      const params = JSON.parse(toolCall.function.arguments);
      const userId = params.userId || message.call?.metadata?.userId;

      const techstack =
        typeof params.techstack === "string"
          ? params.techstack.split(",").map((s: string) => s.trim())
          : params.techstack;

      const result = await createInterview({
        userId,
        role: params.role,
        level: params.level,
        type: params.type,
        techstack,
        amount: parseInt(params.amount) || 5,
        interviewId: "",
      });

      return NextResponse.json({
        results: [
          {
            toolCallId: toolCall.id,
            result: result.success
              ? `Interview created successfully! Interview ID: ${result.interviewId}`
              : "Failed to create interview. Please try again.",
          },
        ],
      });
    }
  }

  return NextResponse.json({ message: "ok" });
}
