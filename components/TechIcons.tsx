import Image from "next/image";
import { mappings } from "@/constants";

const TechIcons = ({ techStack }: TechIconProps) => {
  const icons = techStack.slice(0, 5).map((tech) => {
    const normalized = tech.toLowerCase();
    const slug = mappings[normalized] ?? normalized;
    return { tech, slug };
  });

  return (
    <div className="flex items-center gap-2">
      {icons.map(({ tech, slug }) => (
        <div key={tech} className="relative group">
          <div className="flex-center size-8 rounded-full bg-dark-300">
            <Image
              src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`}
              alt={tech}
              width={20}
              height={20}
              className="object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/tech.svg";
              }}
            />
          </div>
          <span className="tech-tooltip">{tech}</span>
        </div>
      ))}
      {techStack.length > 5 && (
        <span className="text-sm text-light-400">+{techStack.length - 5}</span>
      )}
    </div>
  );
};

export default TechIcons;
