import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getFeedbackByInterviewId } from "@/lib/actions/feedback";
import TechIcons from "@/components/TechIcons";
import { interviewCovers } from "@/constants";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({ interviewId, userId })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
  const badgeColor =
    normalizedType === "Behavioral"
      ? "bg-light-400"
      : normalizedType === "Mixed"
      ? "bg-primary-200"
      : "bg-success-100";

  const coverIndex =
    interviewId
      ? interviewId.charCodeAt(0) % interviewCovers.length
      : 0;
  const coverImage = interviewCovers[coverIndex];

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recent";

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          <div className="absolute top-0 right-0 w-full h-full">
            <Image
              src={coverImage}
              alt="interview cover"
              fill
              className="rounded-2xl object-cover opacity-20"
            />
          </div>

          <div className="flex gap-5 items-start relative z-10">
            <span
              className={`${badgeColor} text-dark-100 px-3 py-1 rounded-full text-sm font-semibold capitalize`}
            >
              {normalizedType}
            </span>
          </div>

          <h3 className="mt-5 capitalize relative z-10">{role} Interview</h3>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-5 items-center">
            <div className="flex gap-2 items-center">
              <Image src="/calendar.svg" alt="calendar" width={22} height={22} />
              <p>{formattedDate}</p>
            </div>

            <div className="flex gap-2 items-center">
              <Image src="/star.svg" alt="score" width={22} height={22} />
              <p>{feedback ? `${feedback.totalScore}/100` : "---/100"}</p>
            </div>
          </div>

          <TechIcons techStack={techstack} />

          <p className="line-clamp-2 text-sm">
            {feedback
              ? feedback.finalAssessment
              : "You haven't taken this interview yet. Take it now to improve your skills."}
          </p>
        </div>

        <div className="flex justify-end">
          <Button asChild className="btn-primary">
            <Link href={feedback ? `/interview/${interviewId}/feedback` : `/interview/${interviewId}`}>
              {feedback ? "View Feedback" : "Start Interview"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
