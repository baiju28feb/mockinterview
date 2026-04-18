export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth";
import { getInterviewById } from "@/lib/actions/interview";
import { getFeedbackByInterviewId } from "@/lib/actions/feedback";

const InterviewPage = async ({ params }: RouteParams) => {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({ interviewId: id, userId: user.id });

  return (
    <>
      <h3 className="text-primary-100 capitalize">{interview.role} Interview</h3>

      <Agent
        userName={user.name}
        userId={user.id}
        interviewId={id}
        feedbackId={feedback?.id}
        type="interview"
        questions={interview.questions}
      />
    </>
  );
};

export default InterviewPage;
