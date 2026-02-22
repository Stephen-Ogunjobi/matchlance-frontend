import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../utils/api";
import { useUser } from "../../contexts/UserContext";

type Category =
  | "web-development"
  | "mobile-development"
  | "design"
  | "writing"
  | "marketing"
  | "data-science"
  | "other";

type ExperienceLevel = "entry" | "intermediate" | "expert";

type BudgetType = "fixed" | "hourly";

type DurationType = "short" | "medium" | "long";

interface JobFormData {
  title: string;
  description: string;
  category: Category | "";
  skills: string[];
  budgetType: BudgetType;
  budgetAmount: string;
  budgetMin: string;
  budgetMax: string;
  experienceLevel: ExperienceLevel | "";
  durationType: DurationType | "";
  estimatedHours: string;
}

export default function EditJob() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { isClient } = useUser();
  const [loading, setLoading] = useState(false);
  const [fetchingJob, setFetchingJob] = useState(true);
  const [error, setError] = useState<string>("");
  const [skillInput, setSkillInput] = useState("");

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    category: "",
    skills: [],
    budgetType: "fixed",
    budgetAmount: "",
    budgetMin: "",
    budgetMax: "",
    experienceLevel: "",
    durationType: "",
    estimatedHours: "",
  });

  // Redirect if not a client
  if (!isClient) {
    navigate("/");
    return null;
  }

  useEffect(() => {
    if (jobId) {
      fetchJobData();
    }
  }, [jobId]);

  const fetchJobData = async () => {
    try {
      setFetchingJob(true);
      const response = await apiClient.get(`job/${jobId}`);
      const job = response.data.job;

      setFormData({
        title: job.title,
        description: job.description,
        category: job.category,
        skills: job.skills,
        budgetType: job.budget.type,
        budgetAmount: job.budget.amount?.toString() || "",
        budgetMin: job.budget.min?.toString() || "",
        budgetMax: job.budget.max?.toString() || "",
        experienceLevel: job.experienceLevel,
        durationType: job.duration.type,
        estimatedHours: job.duration.estimatedHours?.toString() || "",
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load job. Please try again."
      );
    } finally {
      setFetchingJob(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && formData.skills.length < 10) {
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, skillInput.trim()],
        }));
        setSkillInput("");
      }
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title || formData.title.length < 10) {
      setError("Title must be at least 10 characters");
      return;
    }

    if (!formData.description || formData.description.length < 100) {
      setError("Description must be at least 100 characters");
      return;
    }

    if (!formData.category) {
      setError("Please select a category");
      return;
    }

    if (formData.skills.length === 0) {
      setError("Please add at least one skill");
      return;
    }

    if (!formData.experienceLevel) {
      setError("Please select an experience level");
      return;
    }

    if (!formData.durationType) {
      setError("Please select a duration type");
      return;
    }

    if (formData.budgetType === "fixed" && !formData.budgetAmount) {
      setError("Please enter a fixed budget amount");
      return;
    }

    if (
      formData.budgetType === "hourly" &&
      (!formData.budgetMin || !formData.budgetMax)
    ) {
      setError("Please enter both minimum and maximum hourly rates");
      return;
    }

    if (
      formData.budgetType === "hourly" &&
      parseFloat(formData.budgetMax) < parseFloat(formData.budgetMin)
    ) {
      setError("Maximum rate cannot be less than minimum rate");
      return;
    }

    setLoading(true);

    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        skills: formData.skills,
        budget: {
          type: formData.budgetType,
          ...(formData.budgetType === "fixed"
            ? { amount: parseFloat(formData.budgetAmount) }
            : {
                min: parseFloat(formData.budgetMin),
                max: parseFloat(formData.budgetMax),
              }),
          currency: "USD",
        },
        experienceLevel: formData.experienceLevel,
        duration: {
          type: formData.durationType,
          ...(formData.estimatedHours && {
            estimatedHours: parseInt(formData.estimatedHours),
          }),
        },
      };

      await apiClient.patch(`/job/${jobId}`, jobData);
      navigate(`/jobs/${jobId}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update job. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingJob) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="h-5 w-32 rounded-lg bg-[var(--color-muted)] animate-pulse mb-8" />
          <div className="space-y-6">
            <div className="h-10 w-48 rounded-lg bg-[var(--color-muted)] animate-pulse" />
            <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8 animate-pulse space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-32 rounded bg-[var(--color-muted)]" />
                  <div className="h-12 rounded-xl bg-[var(--color-muted)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <button
          onClick={() => navigate(`/jobs/${jobId}`)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to Job
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Edit Job
          </h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Update the details of your job posting.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/20">
            <p className="text-sm font-medium text-[var(--color-error)]">
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Section */}
          <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8 space-y-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Basic Information
            </h2>

            {/* Job Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Job Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Build a responsive e-commerce website"
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                minLength={10}
                maxLength={100}
                required
              />
              <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">
                {formData.title.length}/100 characters (min 10)
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Job Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the job in detail..."
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-y min-h-[160px]"
                minLength={100}
                maxLength={5000}
                required
              />
              <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">
                {formData.description.length}/5000 characters (min 100)
              </p>
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                required
              >
                <option value="">Select a category</option>
                <option value="web-development">Web Development</option>
                <option value="mobile-development">Mobile Development</option>
                <option value="design">Design</option>
                <option value="writing">Writing</option>
                <option value="marketing">Marketing</option>
                <option value="data-science">Data Science</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Skills Section */}
          <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8 space-y-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Required Skills
            </h2>

            <div>
              <label
                htmlFor="skillInput"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Skills * (1-10)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="skillInput"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="e.g., React, Node.js, TypeScript"
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={formData.skills.length >= 10}
                  className="px-5 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:bg-[var(--color-primary)]/20 rounded-full w-5 h-5 inline-flex items-center justify-center transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                {formData.skills.length}/10 skills
              </p>
            </div>
          </div>

          {/* Budget Section */}
          <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8 space-y-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Budget
            </h2>

            {/* Budget Type */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">
                Budget Type *
              </label>
              <div className="flex gap-3">
                <label
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                    formData.budgetType === "fixed"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                      : "border-[var(--color-input-border)] bg-[var(--color-input)] text-[var(--color-text-secondary)] hover:border-[var(--color-border)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="budgetType"
                    value="fixed"
                    checked={formData.budgetType === "fixed"}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span className="text-sm font-medium">Fixed Price</span>
                </label>
                <label
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                    formData.budgetType === "hourly"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                      : "border-[var(--color-input-border)] bg-[var(--color-input)] text-[var(--color-text-secondary)] hover:border-[var(--color-border)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="budgetType"
                    value="hourly"
                    checked={formData.budgetType === "hourly"}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span className="text-sm font-medium">Hourly Rate</span>
                </label>
              </div>
            </div>

            {/* Budget Amount (Fixed) */}
            {formData.budgetType === "fixed" && (
              <div>
                <label
                  htmlFor="budgetAmount"
                  className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
                >
                  Budget Amount (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    id="budgetAmount"
                    name="budgetAmount"
                    value={formData.budgetAmount}
                    onChange={handleInputChange}
                    placeholder="5000"
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            )}

            {/* Budget Range (Hourly) */}
            {formData.budgetType === "hourly" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="budgetMin"
                    className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
                  >
                    Min Hourly Rate (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] font-medium">
                      $
                    </span>
                    <input
                      type="number"
                      id="budgetMin"
                      name="budgetMin"
                      value={formData.budgetMin}
                      onChange={handleInputChange}
                      placeholder="50"
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="budgetMax"
                    className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
                  >
                    Max Hourly Rate (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] font-medium">
                      $
                    </span>
                    <input
                      type="number"
                      id="budgetMax"
                      name="budgetMax"
                      value={formData.budgetMax}
                      onChange={handleInputChange}
                      placeholder="100"
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8 space-y-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Project Details
            </h2>

            {/* Experience Level */}
            <div>
              <label
                htmlFor="experienceLevel"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Experience Level *
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                required
              >
                <option value="">Select experience level</option>
                <option value="entry">Entry Level</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            {/* Duration Type */}
            <div>
              <label
                htmlFor="durationType"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Project Duration *
              </label>
              <select
                id="durationType"
                name="durationType"
                value={formData.durationType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                required
              >
                <option value="">Select duration</option>
                <option value="short">Short (Less than 1 month)</option>
                <option value="medium">Medium (1-3 months)</option>
                <option value="long">Long (More than 3 months)</option>
              </select>
            </div>

            {/* Estimated Hours */}
            <div>
              <label
                htmlFor="estimatedHours"
                className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
              >
                Estimated Hours
              </label>
              <input
                type="number"
                id="estimatedHours"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleInputChange}
                placeholder="e.g., 40"
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                min="1"
              />
              <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">
                Optional — helps freelancers estimate effort
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md hover:shadow-indigo-500/25"
            >
              {loading ? "Updating..." : "Update Job"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/jobs/${jobId}`)}
              className="px-8 py-3.5 rounded-xl bg-[var(--color-muted)] text-[var(--color-text-primary)] font-medium hover:bg-[var(--color-border)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
