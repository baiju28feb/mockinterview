"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createInterview } from "@/lib/actions/interview";

const TECH_OPTIONS = [
  "React", "Next.js", "TypeScript", "JavaScript", "Node.js",
  "Express", "Python", "Django", "FastAPI", "Java", "Spring Boot",
  "PostgreSQL", "MongoDB", "MySQL", "Redis", "Docker",
  "AWS", "GraphQL", "Tailwind CSS", "Vue.js", "Angular",
];

const InterviewForm = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    role: "",
    level: "Junior",
    type: "Technical",
    techstack: [] as string[],
    amount: 5,
    customTech: "",
  });

  const toggleTech = (tech: string) => {
    setForm((prev) => ({
      ...prev,
      techstack: prev.techstack.includes(tech)
        ? prev.techstack.filter((t) => t !== tech)
        : [...prev.techstack, tech],
    }));
  };

  const addCustomTech = () => {
    const tech = form.customTech.trim();
    if (!tech || form.techstack.includes(tech)) return;
    setForm((prev) => ({ ...prev, techstack: [...prev.techstack, tech], customTech: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role.trim()) return toast.error("Please enter a job role.");
    if (form.techstack.length === 0) return toast.error("Please select at least one technology.");

    setLoading(true);
    try {
      const result = await createInterview({
        userId,
        role: form.role,
        level: form.level,
        type: form.type,
        techstack: form.techstack,
        amount: form.amount,
        interviewId: "",
      });

      if (!result.success) throw new Error(result.message);
      toast.success("Interview created! Starting now...");
      router.push(`/interview/${result.interviewId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create interview.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl w-full">
      {/* Role */}
      <div className="flex flex-col gap-2">
        <label className="label font-semibold text-light-100">Job Role</label>
        <input
          className="input bg-dark-200 rounded-full min-h-12 px-5 text-white placeholder:text-light-400 outline-none border border-input focus:border-primary-200 transition-colors"
          placeholder="e.g. Frontend Developer, Data Engineer, DevOps..."
          value={form.role}
          onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
        />
      </div>

      {/* Level */}
      <div className="flex flex-col gap-2">
        <label className="label font-semibold text-light-100">Experience Level</label>
        <div className="flex gap-3 flex-wrap">
          {["Junior", "Mid", "Senior"].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setForm((p) => ({ ...p, level }))}
              className={`px-6 py-2 rounded-full font-semibold transition-colors cursor-pointer ${
                form.level === level
                  ? "bg-primary-200 text-dark-100"
                  : "bg-dark-200 text-light-100 hover:bg-dark-300"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div className="flex flex-col gap-2">
        <label className="label font-semibold text-light-100">Interview Type</label>
        <div className="flex gap-3 flex-wrap">
          {["Technical", "Behavioral", "Mixed"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setForm((p) => ({ ...p, type }))}
              className={`px-6 py-2 rounded-full font-semibold transition-colors cursor-pointer ${
                form.type === type
                  ? "bg-primary-200 text-dark-100"
                  : "bg-dark-200 text-light-100 hover:bg-dark-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="flex flex-col gap-3">
        <label className="label font-semibold text-light-100">
          Tech Stack
          {form.techstack.length > 0 && (
            <span className="ml-2 text-primary-200">({form.techstack.length} selected)</span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {TECH_OPTIONS.map((tech) => (
            <button
              key={tech}
              type="button"
              onClick={() => toggleTech(tech)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                form.techstack.includes(tech)
                  ? "bg-primary-200 text-dark-100"
                  : "bg-dark-200 text-light-100 hover:bg-dark-300"
              }`}
            >
              {tech}
            </button>
          ))}
        </div>

        {/* Custom tech input */}
        <div className="flex gap-2 mt-1">
          <input
            className="input bg-dark-200 rounded-full min-h-10 px-5 text-white placeholder:text-light-400 outline-none border border-input focus:border-primary-200 transition-colors flex-1 text-sm"
            placeholder="Add custom technology..."
            value={form.customTech}
            onChange={(e) => setForm((p) => ({ ...p, customTech: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTech())}
          />
          <Button type="button" onClick={addCustomTech} className="btn-secondary rounded-full px-5">
            Add
          </Button>
        </div>

        {/* Selected custom techs */}
        {form.techstack.filter((t) => !TECH_OPTIONS.includes(t)).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.techstack
              .filter((t) => !TECH_OPTIONS.includes(t))
              .map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary-200 text-dark-100 flex items-center gap-2"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => toggleTech(tech)}
                    className="hover:text-destructive-100 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Number of questions */}
      <div className="flex flex-col gap-2">
        <label className="label font-semibold text-light-100">
          Number of Questions: <span className="text-primary-200">{form.amount}</span>
        </label>
        <div className="flex gap-3">
          {[5, 7, 10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setForm((p) => ({ ...p, amount: n }))}
              className={`px-6 py-2 rounded-full font-semibold transition-colors cursor-pointer ${
                form.amount === n
                  ? "bg-primary-200 text-dark-100"
                  : "bg-dark-200 text-light-100 hover:bg-dark-300"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" className="btn-primary w-full min-h-12 text-base" disabled={loading}>
        {loading ? "Generating your interview..." : "Create Interview"}
      </Button>
    </form>
  );
};

export default InterviewForm;
