export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import InterviewForm from "@/components/InterviewForm";

const NewInterviewPage = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex flex-col gap-8 items-center">
      <div className="flex flex-col gap-2 text-center">
        <h2>Set Up Your Interview</h2>
        <p className="text-light-400 max-w-lg">
          Tell us about the role you&apos;re preparing for. We&apos;ll generate a personalized
          interview and you&apos;ll speak with our AI interviewer live.
        </p>
      </div>

      <InterviewForm userId={user.id} />
    </div>
  );
};

export default NewInterviewPage;
