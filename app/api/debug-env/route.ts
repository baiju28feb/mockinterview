import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const vars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: mask(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: mask(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: mask(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: mask(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: mask(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    NEXT_PUBLIC_FIREBASE_APP_ID: mask(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
    FIREBASE_PROJECT_ID: mask(process.env.FIREBASE_PROJECT_ID),
    FIREBASE_CLIENT_EMAIL: mask(process.env.FIREBASE_CLIENT_EMAIL),
    FIREBASE_PRIVATE_KEY: mask(process.env.FIREBASE_PRIVATE_KEY),
    GOOGLE_GEMINI_API_KEY: mask(process.env.GOOGLE_GEMINI_API_KEY),
    NEXT_PUBLIC_VAPI_PUBLIC_KEY: mask(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY),
  };

  return NextResponse.json(vars);
}

function mask(value: string | undefined): string {
  if (!value) return "❌ NOT SET";
  return `✅ ${value.slice(0, 6)}... (length: ${value.length})`;
}
