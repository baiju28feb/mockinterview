export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth";
import { getInterviewById } from "@/lib/actions/interview";
import { getFeedbackByInterviewId } from "@/lib/actions/feedback";

const FeedbackPage = async ({ params }: RouteParams) => {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({ interviewId: id, userId: user.id });
  if (!feedback) redirect(`/interview/${id}`);

  return (
    <section className="section-feedback">
      <div className="flex flex-row justify-center">
        <h2>
          Feedback on the <span className="capitalize text-primary-100">{interview.role}</span>{" "}
          Interview
        </h2>
      </div>

      <div className="flex flex-row justify-center">
        <div className="flex flex-row gap-5">
          <div className="flex flex-col gap-2 items-center">
            <p className="text-4xl font-bold text-primary-200">{feedback.totalScore}</p>
            <p className="text-sm text-light-400">Overall Score</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex flex-col gap-2 items-center">
            <p className="text-sm font-semibold capitalize">{interview.type}</p>
            <p className="text-sm text-light-400">Interview Type</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex flex-col gap-2 items-center">
            <p className="text-sm font-semibold">
              {new Date(feedback.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="text-sm text-light-400">Date Taken</p>
          </div>
        </div>
      </div>

      <hr className="border-border" />

      <section>
        <h3>Breakdown of the Interview</h3>
        <ul className="flex flex-col gap-4 mt-4">
          {feedback.categoryScores.map(({ name, score, comment }) => (
            <li key={name}>
              <div className="flex justify-between items-center mb-1">
                <p className="font-semibold">{name}</p>
                <p className="text-primary-200 font-bold">{score}/100</p>
              </div>
              <div className="h-1.5 w-full rounded-full bg-dark-300">
                <div
                  className="progress"
                  style={{ width: `${score}%` }}
                />
              </div>
              <p className="text-sm text-light-400 mt-1">{comment}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Strengths</h3>
        <ul className="mt-2">
          {feedback.strengths.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Areas for Improvement</h3>
        <ul className="mt-2">
          {feedback.areasForImprovement.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Final Assessment</h3>
        <p className="mt-2">{feedback.finalAssessment}</p>
      </section>

      <div className="buttons">
        <Button asChild className="btn-secondary">
          <Link href="/">Back to Dashboard</Link>
        </Button>
        <Button asChild className="btn-primary">
          <Link href={`/interview/${id}`}>Retake Interview</Link>
        </Button>
      </div>
    </section>
  );
};

export default FeedbackPage;
