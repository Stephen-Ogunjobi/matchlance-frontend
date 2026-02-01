interface SkillTagsProps {
  skills: string[];
  onRemove?: (skill: string) => void;
  maxDisplay?: number;
  variant?: "default" | "input";
}

export default function SkillTags({
  skills,
  onRemove,
  maxDisplay,
  variant = "default",
}: SkillTagsProps) {
  const displaySkills = maxDisplay ? skills.slice(0, maxDisplay) : skills;
  const remainingCount = maxDisplay ? skills.length - maxDisplay : 0;

  const baseStyles =
    variant === "input"
      ? "inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm"
      : "px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs";

  return (
    <div className="flex flex-wrap gap-2">
      {displaySkills.map((skill) => (
        <span key={skill} className={baseStyles}>
          {skill}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(skill)}
              className="text-blue-600 hover:text-blue-800 font-bold ml-1"
            >
              ×
            </button>
          )}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="px-2 py-1 text-gray-500 text-xs">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}
