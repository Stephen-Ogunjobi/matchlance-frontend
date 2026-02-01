interface Budget {
  type: string;
  amount: number;
  currency: string;
}

interface Duration {
  type: "short" | "medium" | "long";
  estimatedHours?: number;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  category?: string;
  skills?: string[];
  budget: Budget;
  experienceLevel?: string;
  duration?: Duration;
  location?: string;
  status: string;
  matchScore?: number;
  createdAt: string;
  updatedAt: string;
}

interface JobDetailsCardProps {
  job: Job;
  onSendProposal?: () => void;
  showProposalButton?: boolean;
}

export default function JobDetailsCard({
  job,
  onSendProposal,
  showProposalButton = true,
}: JobDetailsCardProps) {
  const formatBudget = (budget: Budget) => {
    return `${budget.currency}${budget.amount} (${budget.type})`;
  };

  const formatDuration = (duration?: Duration) => {
    if (!duration) return "Not specified";
    const durationMap = {
      short: "Less than 1 month",
      medium: "1-3 months",
      long: "More than 3 months",
    };
    return durationMap[duration.type];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-8 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
            {job.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {job.matchScore && (
              <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-[var(--color-success)]/10 text-[var(--color-success)]">
                {job.matchScore}% Match
              </span>
            )}
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-semibold uppercase ${
                job.status === "open"
                  ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                  : "bg-[var(--color-error)]/10 text-[var(--color-error)]"
              }`}
            >
              {job.status}
            </span>
          </div>
        </div>
        <p className="text-[var(--color-text-tertiary)]">
          Posted on {formatDate(job.createdAt)}
        </p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-xl bg-[var(--color-muted)] mb-6">
        <div>
          <p className="text-xs text-[var(--color-text-tertiary)] font-medium mb-1">
            Budget
          </p>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {formatBudget(job.budget)}
          </p>
        </div>

        {job.experienceLevel && (
          <div>
            <p className="text-xs text-[var(--color-text-tertiary)] font-medium mb-1">
              Experience
            </p>
            <p className="text-sm font-semibold text-[var(--color-text-primary)] capitalize">
              {job.experienceLevel}
            </p>
          </div>
        )}

        {job.duration && (
          <div>
            <p className="text-xs text-[var(--color-text-tertiary)] font-medium mb-1">
              Duration
            </p>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {formatDuration(job.duration)}
            </p>
            {job.duration.estimatedHours && (
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Est. {job.duration.estimatedHours} hours
              </p>
            )}
          </div>
        )}

        {job.location && (
          <div>
            <p className="text-xs text-[var(--color-text-tertiary)] font-medium mb-1">
              Location
            </p>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {job.location}
            </p>
          </div>
        )}

        {job.category && (
          <div>
            <p className="text-xs text-[var(--color-text-tertiary)] font-medium mb-1">
              Category
            </p>
            <p className="text-sm font-semibold text-[var(--color-text-primary)] capitalize">
              {job.category.replace("-", " ")}
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
          Job Description
        </h2>
        <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
          {job.description}
        </p>
      </div>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            Required Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Send Proposal Button */}
      {showProposalButton && job.status === "open" && onSendProposal && (
        <div className="pt-6 border-t border-[var(--color-border)]">
          <button
            onClick={onSendProposal}
            className="px-6 py-3 rounded-xl font-semibold bg-[var(--color-success)] text-white hover:bg-[var(--color-success-hover)] transition-colors"
          >
            Send Proposal
          </button>
        </div>
      )}
    </div>
  );
}
