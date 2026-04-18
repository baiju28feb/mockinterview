"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Vapi from "@vapi-ai/web";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/feedback";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({ userName, userId, interviewId, feedbackId, type, questions }: AgentProps) => {
  const router = useRouter();
  const vapiRef = useRef<Vapi | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState("");

  useEffect(() => {
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
    vapiRef.current = vapi;

    vapi.on("call-start", () => setCallStatus(CallStatus.ACTIVE));
    vapi.on("call-end", () => setCallStatus(CallStatus.FINISHED));
    vapi.on("speech-start", () => setIsSpeaking(true));
    vapi.on("speech-end", () => setIsSpeaking(false));
    vapi.on("message", (message: { type: string; transcriptType?: string; role?: string; transcript?: string }) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setMessages((prev) => [
          ...prev,
          {
            role: (message.role ?? "assistant") as SavedMessage["role"],
            content: message.transcript ?? "",
          },
        ]);
      }
    });
    vapi.on("error", (error: unknown) => console.error("Vapi error:", error));

    return () => {
      vapi.stop();
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  const handleCallEnd = useCallback(async () => {
    if (type === "interview" && interviewId && userId) {
      const result = await createFeedback({ interviewId, userId, transcript: messages, feedbackId });
      router.push(
        result.success ? `/interview/${interviewId}/feedback` : "/"
      );
    } else {
      router.push("/");
    }
  }, [type, interviewId, userId, messages, feedbackId, router]);

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      handleCallEnd();
    }
  }, [callStatus, handleCallEnd]);

  const startCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    const vapi = vapiRef.current;
    if (!vapi) return;

    if (type === "interview" && questions?.length) {
      const questionsText = questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
      const systemMessage = interviewer.model.messages[0].content.replace(
        "{{questions}}",
        questionsText
      );

      await vapi.start({
        ...interviewer,
        model: {
          ...interviewer.model,
          messages: [{ role: "system", content: systemMessage }],
        },
      } as Parameters<typeof vapi.start>[0]);
    } else {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!);
    }
  };

  const stopCall = () => vapiRef.current?.stop();

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="AI Interviewer"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt={userName}
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p key={lastMessage}>{lastMessage}</p>
          </div>
        </div>
      )}

      <div className="flex w-full justify-center gap-4 mt-4">
        {callStatus === CallStatus.ACTIVE ? (
          <button className="btn-disconnect" onClick={stopCall}>
            End Interview
          </button>
        ) : (
          <button
            className="btn-call"
            onClick={startCall}
            disabled={callStatus === CallStatus.CONNECTING}
          >
            {callStatus === CallStatus.CONNECTING ? "Connecting..." : "Start Interview"}
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
