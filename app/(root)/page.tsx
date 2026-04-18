export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser } from "@/lib/actions/auth";
import { getInterviewsByUserId, getLatestInterviews } from "@/lib/actions/interview";

const Dashboard = async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const [userInterviews, latestInterviews] = await Promise.all([
    getInterviewsByUserId(user.id),
    getLatestInterviews({ userId: user.id }),
  ]);

  const hasUserInterviews = userInterviews.length > 0;
  const hasLatestInterviews = latestInterviews.length > 0;

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice</h2>
          <p className="text-lg">
            Practice on real interview questions and get instant feedback from our AI interviewer.
          </p>
          <Button asChild className="btn-primary w-fit">
            <Link href="/interview/new">Start an Interview</Link>
          </Button>
        </div>
        <Image
          src="/robot.png"
          alt="AI Interviewer"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-6">
        <h2>Your Interviews</h2>
        <div className="interviews-section">
          {hasUserInterviews ? (
            userInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interviewId={interview.id}
                userId={user.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet. Start one above!</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2>Take an Interview</h2>
        <div className="interviews-section">
          {hasLatestInterviews ? (
            latestInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p>No interviews available. Be the first to create one!</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Dashboard;
