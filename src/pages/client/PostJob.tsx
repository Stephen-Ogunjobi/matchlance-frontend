import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
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

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-sm";

const labelClass = "block text-sm font-medium text-[var(--color-text-secondary)] mb-2";

const helperClass = "mt-1.5 text-xs text-[var(--color-text-tertiary)]";

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-6 space-y-5">
      {children}
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 pb-2 border-b border-[var(--color-border)]">
      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0 text-indigo-500">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
        {subtitle && <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function PostJob() {
  const navigate = useNavigate();
  const { isClient } = useUser();
  const [loading, setLoading] = useState(false);
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

  if (!isClient) {
    navigate("/");
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    if (formData.budgetType === "hourly" && (!formData.budgetMin || !formData.budgetMax)) {
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
        status: "open",
      };

      await apiClient.post("/job/post-job", jobData);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-4 py-10 sm:px-6">
      <div className="max-w-2xl mx-auto">

        {/* Page Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors mb-5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Post a New Job
          </h1>
          <p className="mt-1.5 text-sm text-[var(--color-text-tertiary)]">
            Fill in the details below to find the right freelancer for your project.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/20">
            <svg className="w-5 h-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm font-medium text-[var(--color-error)]">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Basics */}
          <SectionCard>
            <SectionTitle
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              }
              title="Job Basics"
              subtitle="Give your job a clear title and description"
            />

            {/* Title */}
            <div>
              <label htmlFor="title" className={labelClass}>
                Job Title <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Build a responsive e-commerce website"
                className={inputClass}
                minLength={10}
                maxLength={100}
                required
              />
              <p className={helperClass}>{formData.title.length}/100 characters (min 10)</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className={labelClass}>
                Job Description <span className="text-[var(--color-error)]">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the project scope, deliverables, timeline expectations, and any specific requirements..."
                className={`${inputClass} min-h-[180px] resize-y`}
                minLength={100}
                maxLength={5000}
                required
              />
              <p className={helperClass}>{formData.description.length}/5000 characters (min 100)</p>
            </div>
          </SectionCard>

          {/* Category & Skills */}
          <SectionCard>
            <SectionTitle
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              }
              title="Category & Skills"
              subtitle="Help freelancers find your job"
            />

            {/* Category */}
            <div>
              <label htmlFor="category" className={labelClass}>
                Category <span className="text-[var(--color-error)]">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={inputClass}
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

            {/* Skills */}
            <div>
              <label htmlFor="skillInput" className={labelClass}>
                Required Skills <span className="text-[var(--color-error)]">*</span>
                <span className="ml-1 text-xs font-normal text-[var(--color-text-tertiary)]">(1–10 skills)</span>
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
                  className={inputClass}
                  disabled={formData.skills.length >= 10}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={formData.skills.length >= 10}
                  className="px-4 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 text-sm font-semibold hover:bg-indigo-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  Add
                </button>
              </div>

              {formData.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-indigo-500/20 transition-colors"
                        aria-label={`Remove ${skill}`}
                      >
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className={helperClass}>{formData.skills.length}/10 skills added</p>
            </div>
          </SectionCard>

          {/* Budget */}
          <SectionCard>
            <SectionTitle
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Budget"
              subtitle="Set your payment structure"
            />

            {/* Budget Type Toggle */}
            <div className="flex gap-3">
              {(["fixed", "hourly"] as BudgetType[]).map((type) => (
                <label
                  key={type}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
                    formData.budgetType === type
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-500"
                      : "border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="budgetType"
                    value={type}
                    checked={formData.budgetType === type}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  {type === "fixed" ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {type === "fixed" ? "Fixed Price" : "Hourly Rate"}
                </label>
              ))}
            </div>

            {/* Fixed Budget */}
            {formData.budgetType === "fixed" && (
              <div>
                <label htmlFor="budgetAmount" className={labelClass}>
                  Budget Amount (USD) <span className="text-[var(--color-error)]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-tertiary)] font-medium">$</span>
                  <input
                    type="number"
                    id="budgetAmount"
                    name="budgetAmount"
                    value={formData.budgetAmount}
                    onChange={handleInputChange}
                    placeholder="5000"
                    className={`${inputClass} pl-7`}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            )}

            {/* Hourly Budget */}
            {formData.budgetType === "hourly" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="budgetMin" className={labelClass}>
                    Min Rate (USD/hr) <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-tertiary)] font-medium">$</span>
                    <input
                      type="number"
                      id="budgetMin"
                      name="budgetMin"
                      value={formData.budgetMin}
                      onChange={handleInputChange}
                      placeholder="50"
                      className={`${inputClass} pl-7`}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="budgetMax" className={labelClass}>
                    Max Rate (USD/hr) <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-tertiary)] font-medium">$</span>
                    <input
                      type="number"
                      id="budgetMax"
                      name="budgetMax"
                      value={formData.budgetMax}
                      onChange={handleInputChange}
                      placeholder="100"
                      className={`${inputClass} pl-7`}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Project Details */}
          <SectionCard>
            <SectionTitle
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              }
              title="Project Details"
              subtitle="Scope and timeline information"
            />

            {/* Experience Level */}
            <div>
              <label htmlFor="experienceLevel" className={labelClass}>
                Experience Level <span className="text-[var(--color-error)]">*</span>
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange}
                className={inputClass}
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
              <label htmlFor="durationType" className={labelClass}>
                Project Duration <span className="text-[var(--color-error)]">*</span>
              </label>
              <select
                id="durationType"
                name="durationType"
                value={formData.durationType}
                onChange={handleInputChange}
                className={inputClass}
                required
              >
                <option value="">Select duration</option>
                <option value="short">Short — Less than 1 month</option>
                <option value="medium">Medium — 1 to 3 months</option>
                <option value="long">Long — More than 3 months</option>
              </select>
            </div>

            {/* Estimated Hours */}
            <div>
              <label htmlFor="estimatedHours" className={labelClass}>
                Estimated Hours
                <span className="ml-1 text-xs font-normal text-[var(--color-text-tertiary)]">(optional)</span>
              </label>
              <input
                type="number"
                id="estimatedHours"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleInputChange}
                placeholder="e.g., 40"
                className={inputClass}
                min="1"
              />
            </div>
          </SectionCard>

          {/* Actions */}
          <div className="flex gap-3 pt-1 pb-10">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none sm:px-8 py-3 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Posting...
                </span>
              ) : (
                "Post Job"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 sm:flex-none sm:px-8 py-3 rounded-xl bg-[var(--color-muted)] text-[var(--color-text-secondary)] font-semibold text-sm border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-text-primary)] transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
