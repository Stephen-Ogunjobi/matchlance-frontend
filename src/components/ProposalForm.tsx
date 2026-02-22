import { useState } from "react";
import apiClient from "../utils/api";

interface ProposalFormData {
  coverLetter: string;
  proposedBudget: {
    min: string;
    max: string;
  };
  estimatedTime: string;
  availability: string;
  portfolioLinks: string[];
  questions: string;
  attachments: File[];
}

interface ProposalFormProps {
  jobId: string;
  onSuccess: () => void;
  onCancel: () => void;
  onError: (message: string) => void;
}

export default function ProposalForm({
  jobId,
  onSuccess,
  onCancel,
  onError,
}: ProposalFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProposalFormData>({
    coverLetter: "",
    proposedBudget: {
      min: "",
      max: "",
    },
    estimatedTime: "",
    availability: "",
    portfolioLinks: [""],
    questions: "",
    attachments: [],
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBudgetChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "min" | "max"
  ) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      proposedBudget: {
        ...prev.proposedBudget,
        [field]: value,
      },
    }));
  };

  const handlePortfolioLinkChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newLinks = [...prev.portfolioLinks];
      newLinks[index] = value;
      return { ...prev, portfolioLinks: newLinks };
    });
  };

  const addPortfolioLink = () => {
    if (formData.portfolioLinks.length < 5) {
      setFormData((prev) => ({
        ...prev,
        portfolioLinks: [...prev.portfolioLinks, ""],
      }));
    }
  };

  const removePortfolioLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(
        (file) =>
          file.type === "application/pdf" ||
          file.type === "application/msword" ||
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );

      if (validFiles.length !== fileArray.length) {
        onError("Only PDF and DOC/DOCX files are allowed");
        return;
      }

      if (formData.attachments.length + validFiles.length > 5) {
        onError("Cannot exceed 5 attachments");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...validFiles],
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.coverLetter ||
      !formData.proposedBudget.min ||
      !formData.proposedBudget.max ||
      !formData.estimatedTime ||
      !formData.availability
    ) {
      onError("Please fill in all required fields");
      return;
    }

    if (formData.coverLetter.length < 100) {
      onError("Cover letter must be at least 100 characters");
      return;
    }

    if (formData.coverLetter.length > 2000) {
      onError("Cover letter cannot exceed 2000 characters");
      return;
    }

    const minBudget = parseFloat(formData.proposedBudget.min);
    const maxBudget = parseFloat(formData.proposedBudget.max);

    if (isNaN(minBudget) || isNaN(maxBudget)) {
      onError("Budget values must be valid numbers");
      return;
    }

    if (minBudget < 0 || maxBudget < 0) {
      onError("Budget values cannot be negative");
      return;
    }

    if (minBudget > maxBudget) {
      onError("Minimum budget cannot be greater than maximum budget");
      return;
    }

    try {
      setSubmitting(true);

      const portfolioLinks = formData.portfolioLinks.filter(
        (link) => link.trim() !== ""
      );

      const formDataToSend = new FormData();
      formDataToSend.append("coverLetter", formData.coverLetter);
      formDataToSend.append("proposedBudget[min]", minBudget.toString());
      formDataToSend.append("proposedBudget[max]", maxBudget.toString());
      formDataToSend.append("estimatedTime", formData.estimatedTime);
      formDataToSend.append("availability", formData.availability);

      if (portfolioLinks.length > 0) {
        portfolioLinks.forEach((link, index) => {
          formDataToSend.append(`portfolioLinks[${index}]`, link);
        });
      }

      if (formData.questions) {
        formDataToSend.append("questions", formData.questions);
      }

      formData.attachments.forEach((file) => {
        formDataToSend.append("attachments", file);
      });

      await apiClient.post(`/proposal/job/${jobId}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onSuccess();
    } catch (err: any) {
      onError(
        err.response?.data?.message ||
          "Failed to submit proposal. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-6 border-t border-[var(--color-border)]">
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">
        Submit Your Proposal
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Letter */}
        <div>
          <label
            htmlFor="coverLetter"
            className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2"
          >
            Cover Letter *{" "}
            <span className="font-normal text-[var(--color-text-tertiary)]">
              (100-2000 characters)
            </span>
          </label>
          <textarea
            id="coverLetter"
            name="coverLetter"
            value={formData.coverLetter}
            onChange={handleInputChange}
            required
            minLength={100}
            maxLength={2000}
            rows={6}
            placeholder="Explain why you're a good fit for this job (minimum 100 characters)..."
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-y"
          />
          <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
            {formData.coverLetter.length}/2000 characters
          </p>
        </div>

        {/* Proposed Budget */}
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
            Proposed Budget Range *
          </label>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label
                htmlFor="budgetMin"
                className="block text-xs text-[var(--color-text-tertiary)] mb-1"
              >
                Minimum ($)
              </label>
              <input
                type="number"
                id="budgetMin"
                value={formData.proposedBudget.min}
                onChange={(e) => handleBudgetChange(e, "min")}
                required
                min="0"
                step="0.01"
                placeholder="Min"
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
            </div>
            <span className="text-[var(--color-text-tertiary)] mt-5">-</span>
            <div className="flex-1">
              <label
                htmlFor="budgetMax"
                className="block text-xs text-[var(--color-text-tertiary)] mb-1"
              >
                Maximum ($)
              </label>
              <input
                type="number"
                id="budgetMax"
                value={formData.proposedBudget.max}
                onChange={(e) => handleBudgetChange(e, "max")}
                required
                min="0"
                step="0.01"
                placeholder="Max"
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Estimated Time */}
        <div>
          <label
            htmlFor="estimatedTime"
            className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2"
          >
            Estimated Time *
          </label>
          <select
            id="estimatedTime"
            name="estimatedTime"
            value={formData.estimatedTime}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          >
            <option value="">Select estimated time</option>
            <option value="less-than-month">Less than 1 month</option>
            <option value="1-month">1 month</option>
            <option value="2-months">2 months</option>
            <option value="3-months">3 months</option>
            <option value="more-than-3-months">More than 3 months</option>
          </select>
        </div>

        {/* Availability */}
        <div>
          <label
            htmlFor="availability"
            className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2"
          >
            Availability *
          </label>
          <select
            id="availability"
            name="availability"
            value={formData.availability}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          >
            <option value="">Select availability</option>
            <option value="immediately">Immediately</option>
            <option value="few-days">In a few days</option>
            <option value="1-week">In 1 week</option>
            <option value="2-weeks">In 2 weeks</option>
          </select>
        </div>

        {/* Portfolio Links */}
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
            Portfolio Links{" "}
            <span className="font-normal text-[var(--color-text-tertiary)]">
              (Optional, max 5)
            </span>
          </label>
          <div className="space-y-2">
            {formData.portfolioLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={link}
                  onChange={(e) =>
                    handlePortfolioLinkChange(index, e.target.value)
                  }
                  placeholder="https://example.com/portfolio"
                  className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
                {formData.portfolioLinks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePortfolioLink(index)}
                    className="px-3 py-2 rounded-xl text-sm font-medium bg-[var(--color-error)]/10 text-[var(--color-error)] hover:bg-[var(--color-error)]/20 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          {formData.portfolioLinks.length < 5 && (
            <button
              type="button"
              onClick={addPortfolioLink}
              className="mt-2 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-colors"
            >
              + Add Portfolio Link
            </button>
          )}
        </div>

        {/* Questions */}
        <div>
          <label
            htmlFor="questions"
            className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2"
          >
            Questions/Clarifications{" "}
            <span className="font-normal text-[var(--color-text-tertiary)]">
              (Optional, max 1000 characters)
            </span>
          </label>
          <textarea
            id="questions"
            name="questions"
            value={formData.questions}
            onChange={handleInputChange}
            maxLength={1000}
            rows={4}
            placeholder="Any questions or clarifications about the project?"
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-y"
          />
          <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
            {formData.questions.length}/1000 characters
          </p>
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
            Attachments{" "}
            <span className="font-normal text-[var(--color-text-tertiary)]">
              (Optional, max 5 files - PDF, DOC, DOCX)
            </span>
          </label>
          <div className="p-4 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-muted)]">
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              multiple
              onChange={handleFileChange}
              disabled={formData.attachments.length >= 5}
              className="w-full text-sm text-[var(--color-text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--color-primary)]/10 file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
              {formData.attachments.length}/5 files uploaded
            </p>
          </div>

          {formData.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {formData.attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-muted)] border border-[var(--color-border)]"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[var(--color-text-tertiary)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                    <span className="text-sm text-[var(--color-text-primary)]">
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="px-2 py-1 rounded-lg text-xs font-medium bg-[var(--color-error)]/10 text-[var(--color-error)] hover:bg-[var(--color-error)]/20 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex flex-wrap gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl font-semibold bg-[var(--color-success)] text-white hover:bg-[var(--color-success-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Proposal"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-6 py-3 rounded-xl font-semibold bg-[var(--color-muted)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
