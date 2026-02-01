import { useNavigate } from "react-router-dom";

interface Budget {
  type: string;
  amount?: number;
  min?: number;
  max?: number;
  currency: string;
}

interface JobCardProps {
  title: string;
  description?: string;
  budget?: Budget;
  location?: string;
  matchScore?: number;
  skills?: string[];
  experienceLevel?: string;
  status?: string;
  createdAt?: string;
  linkTo?: string;
}

export default function JobCard({
  title,
  description,
  budget,
  location,
  matchScore,
  skills,
  experienceLevel,
  status,
  createdAt,
  linkTo,
}: JobCardProps) {
  const navigate = useNavigate();

  const formatBudget = (budget: Budget) => {
    if (budget.type === "fixed") {
      return `${budget.currency}${budget.amount?.toLocaleString()}`;
    }
    return `${budget.currency}${budget.min}-${budget.max}/hr`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <div
      onClick={() => linkTo && navigate(linkTo)}
      className="border border-gray-200 rounded-xl p-5 bg-white cursor-pointer transition-all hover:border-blue-500 hover:shadow-md"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {status && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              status === "open"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-2 text-gray-600">{truncateText(description)}</p>
      )}

      {skills && skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
            >
              {skill}
            </span>
          ))}
          {skills.length > 5 && (
            <span className="px-2 py-1 text-gray-500 text-xs">
              +{skills.length - 5} more
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-700">
        {budget && (
          <span>
            <span className="font-medium">Budget:</span> {formatBudget(budget)}
          </span>
        )}
        {location && (
          <span>
            <span className="font-medium">Location:</span> {location}
          </span>
        )}
        {experienceLevel && (
          <span className="capitalize">{experienceLevel} Level</span>
        )}
        {matchScore && (
          <span className="text-green-600 font-medium">{matchScore}% Match</span>
        )}
        {createdAt && <span className="ml-auto">{formatDate(createdAt)}</span>}
      </div>
    </div>
  );
}
