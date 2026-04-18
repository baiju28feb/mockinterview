export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth";

const NewInterviewPage = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <>
      <h3 className="text-primary-100">Interview Generation</h3>
      <p>
        Our AI will ask you a few questions to tailor your interview. Speak naturally and describe
        the role you&apos;re preparing for.
      </p>

      <Agent userName={user.name} userId={user.id} type="generate" />
    </>
  );
};

export default NewInterviewPage;
