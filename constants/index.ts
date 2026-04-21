export const mappings: Record<string, string> = {
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  "express.js": "express",
  expressjs: "express",
  express: "express",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  mongo: "mongodb",
  mongoose: "mongoose",
  mysql: "mysql",
  postgresql: "postgresql",
  sqlite: "sqlite",
  firebase: "firebase",
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
  digitalocean: "digitalocean",
  heroku: "heroku",
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  angular: "angular",
  nestjs: "nestjs",
  graphql: "graphql",
  webpack: "webpack",
  git: "git",
  github: "github",
  figma: "figma",
  prisma: "prisma",
  redux: "redux",
  redis: "redis",
  jest: "jest",
  nuxt: "nuxt",
  nuxtjs: "nuxt",
};

export const interviewCovers = [
  "/covers/adobe.png",
  "/covers/amazon.png",
  "/covers/facebook.png",
  "/covers/hostinger.png",
  "/covers/pinterest.png",
  "/covers/quora.png",
  "/covers/reddit.png",
  "/covers/skype.png",
  "/covers/spotify.png",
  "/covers/telegram.png",
  "/covers/tiktok.png",
  "/covers/yahoo.png",
];

export const interviewer = {
  name: "Interviewer",
  firstMessage:
    "Hello, I'm your interviewer today. Let's get started with the interview. I'll be asking you a series of questions — please take your time and answer as clearly as you can. Ready? Here's your first question.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
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
2. After each answer, give only a brief neutral acknowledgement (e.g. "Got it.", "Thank you.", "Understood.") — then immediately ask the next question.
3. Do NOT give hints, tips, or feedback during the interview.
4. Do NOT help the candidate improve their answer or explain concepts to them.
5. Do NOT engage in small talk, jokes, or off-topic conversation.
6. Do NOT answer questions the candidate asks about the role or company — say "I'm not able to share that during the interview."
7. If the candidate goes off-topic, redirect them: "Let's stay focused. Can you answer the question?"
8. Work through ALL questions in order. Do not skip any.
9. After the last question has been answered, say exactly: "That concludes our interview. Thank you for your time. We'll be in touch with feedback soon. Goodbye." — then end the call.
10. Keep ALL your responses short — this is a voice call, not a chat.

Start immediately by asking the first question.`,
      },
    ],
  },
};
