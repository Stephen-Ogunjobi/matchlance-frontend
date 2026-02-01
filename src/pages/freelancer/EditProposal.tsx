import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import apiClient from "../../utils/api";
import { useUser } from "../../contexts/UserContext";

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

interface Proposal {
  _id: string;
  jobId: {
    _id: string;
    title: string;
  };
  coverLetter: string;
  proposedBudget: {
    min: number;
    max: number;
  };
  estimatedTime: string;
  availability: string;
  portfolioLinks?: string[];
  questions?: string;
  attachments?: string[];
  status: string;
}

export default function EditProposal() {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const { isFreelancer } = useUser();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);

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

  useEffect(() => {
    if (!isFreelancer) {
      navigate("/");
      return;
    }

    if (proposalId) {
      fetchProposal();
    }
  }, [proposalId, isFreelancer]);

  const fetchProposal = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/proposal/${proposalId}`);
      const proposalData = response.data.proposal;

      setProposal(proposalData);

      // Store existing attachments
      if (proposalData.attachments && proposalData.attachments.length > 0) {
        setExistingAttachments(proposalData.attachments);
      }

      // Populate form with existing data
      setFormData({
        coverLetter: proposalData.coverLetter,
        proposedBudget: {
          min: proposalData.proposedBudget.min.toString(),
          max: proposalData.proposedBudget.max.toString(),
        },
        estimatedTime: proposalData.estimatedTime,
        availability: proposalData.availability,
        portfolioLinks:
          proposalData.portfolioLinks && proposalData.portfolioLinks.length > 0
            ? proposalData.portfolioLinks
            : [""],
        questions: proposalData.questions || "",
        attachments: [],
      });
    } catch (err: any) {
      console.error("Error fetching proposal:", err);
      setError(
        err.response?.data?.error ||
          "Failed to load proposal. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
        setError("Only PDF and DOC/DOCX files are allowed");
        return;
      }

      const totalFiles =
        existingAttachments.length +
        formData.attachments.length +
        validFiles.length;
      if (totalFiles > 5) {
        setError("Cannot exceed 5 attachments in total");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...validFiles],
      }));
    }
  };

  const removeNewAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const removeExistingAttachment = (index: number) => {
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.coverLetter ||
      !formData.proposedBudget.min ||
      !formData.proposedBudget.max ||
      !formData.estimatedTime ||
      !formData.availability
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate cover letter length
    if (formData.coverLetter.length < 100) {
      setError("Cover letter must be at least 100 characters");
      return;
    }

    if (formData.coverLetter.length > 2000) {
      setError("Cover letter cannot exceed 2000 characters");
      return;
    }

    // Validate budget values
    const minBudget = parseFloat(formData.proposedBudget.min);
    const maxBudget = parseFloat(formData.proposedBudget.max);

    if (isNaN(minBudget) || isNaN(maxBudget)) {
      setError("Budget values must be valid numbers");
      return;
    }

    if (minBudget < 0 || maxBudget < 0) {
      setError("Budget values cannot be negative");
      return;
    }

    if (minBudget > maxBudget) {
      setError("Minimum budget cannot be greater than maximum budget");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Filter out empty portfolio links
      const portfolioLinks = formData.portfolioLinks.filter(
        (link) => link.trim() !== ""
      );

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("coverLetter", formData.coverLetter);
      formDataToSend.append("proposedBudget[min]", minBudget.toString());
      formDataToSend.append("proposedBudget[max]", maxBudget.toString());
      formDataToSend.append("estimatedTime", formData.estimatedTime);
      formDataToSend.append("availability", formData.availability);

      // Add portfolio links
      if (portfolioLinks.length > 0) {
        portfolioLinks.forEach((link, index) => {
          formDataToSend.append(`portfolioLinks[${index}]`, link);
        });
      }

      // Add questions if provided
      if (formData.questions) {
        formDataToSend.append("questions", formData.questions);
      }

      // Add existing attachments that weren't removed
      if (existingAttachments.length > 0) {
        existingAttachments.forEach((attachment, index) => {
          formDataToSend.append(`existingAttachments[${index}]`, attachment);
        });
      }

      // Add new attachments
      formData.attachments.forEach((file) => {
        formDataToSend.append("attachments", file);
      });

      await apiClient.patch(`/proposal/${proposalId}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSubmitSuccess(true);

      // Redirect to my proposals after 2 seconds
      setTimeout(() => {
        navigate("/my-proposals");
      }, 2000);
    } catch (err: any) {
      console.error("Error updating proposal:", err);
      setError(
        err.response?.data?.error ||
          "Failed to update proposal. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
        <Link
          to="/my-proposals"
          style={{
            display: "inline-block",
            marginBottom: "20px",
            color: "#007bff",
            textDecoration: "none",
          }}
        >
          &larr; Back to My Proposals
        </Link>
        <p>Loading proposal...</p>
      </div>
    );
  }

  if (error && !proposal) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
        <Link
          to="/my-proposals"
          style={{
            display: "inline-block",
            marginBottom: "20px",
            color: "#007bff",
            textDecoration: "none",
          }}
        >
          &larr; Back to My Proposals
        </Link>
        <div
          style={{
            padding: "10px",
            marginBottom: "20px",
            backgroundColor: "#fee",
            border: "1px solid #f88",
            borderRadius: "4px",
            color: "#c33",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  if (!proposal) return null;

  // Don't allow editing if proposal is already accepted or rejected
  if (proposal.status !== "pending") {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
        <Link
          to="/my-proposals"
          style={{
            display: "inline-block",
            marginBottom: "20px",
            color: "#007bff",
            textDecoration: "none",
          }}
        >
          &larr; Back to My Proposals
        </Link>
        <div
          style={{
            padding: "20px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "8px",
            color: "#856404",
          }}
        >
          <h2>Cannot Edit Proposal</h2>
          <p>
            This proposal has been {proposal.status} and can no longer be
            edited.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <Link
        to="/my-proposals"
        style={{
          display: "inline-block",
          marginBottom: "20px",
          color: "#007bff",
          textDecoration: "none",
          fontSize: "14px",
        }}
      >
        &larr; Back to My Proposals
      </Link>

      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "30px",
        }}
      >
        <h1 style={{ marginTop: 0 }}>Edit Proposal</h1>
        <p style={{ color: "#666", marginBottom: "24px" }}>
          Job: <strong>{proposal.jobId.title}</strong>
        </p>

        {submitSuccess && (
          <div
            style={{
              padding: "12px",
              marginBottom: "20px",
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "4px",
              color: "#155724",
            }}
          >
            Proposal updated successfully! Redirecting...
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "12px",
              marginBottom: "20px",
              backgroundColor: "#fee",
              border: "1px solid #f88",
              borderRadius: "4px",
              color: "#c33",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="coverLetter"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Cover Letter * (100-2000 characters)
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
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
            <small style={{ color: "#666", fontSize: "12px" }}>
              {formData.coverLetter.length}/2000 characters
            </small>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Proposed Budget Range *
            </label>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <label
                  htmlFor="budgetMin"
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                  }}
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
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>
              <span style={{ marginTop: "24px" }}>-</span>
              <div style={{ flex: 1 }}>
                <label
                  htmlFor="budgetMax"
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                  }}
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
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="estimatedTime"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Estimated Time *
            </label>
            <select
              id="estimatedTime"
              name="estimatedTime"
              value={formData.estimatedTime}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                backgroundColor: "white",
              }}
            >
              <option value="">Select estimated time</option>
              <option value="less-than-month">Less than 1 month</option>
              <option value="1-month">1 month</option>
              <option value="2-months">2 months</option>
              <option value="3-months">3 months</option>
              <option value="more-than-3-months">More than 3 months</option>
            </select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="availability"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Availability *
            </label>
            <select
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                backgroundColor: "white",
              }}
            >
              <option value="">Select availability</option>
              <option value="immediately">Immediately</option>
              <option value="few-days">In a few days</option>
              <option value="1-week">In 1 week</option>
              <option value="2-weeks">In 2 weeks</option>
            </select>
          </div>

          {/* Portfolio Links */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Portfolio Links (Optional, max 5)
            </label>
            {formData.portfolioLinks.map((link, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "8px",
                  alignItems: "center",
                }}
              >
                <input
                  type="url"
                  value={link}
                  onChange={(e) =>
                    handlePortfolioLinkChange(index, e.target.value)
                  }
                  placeholder="https://example.com/portfolio"
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
                {formData.portfolioLinks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePortfolioLink(index)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {formData.portfolioLinks.length < 5 && (
              <button
                type="button"
                onClick={addPortfolioLink}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  marginTop: "8px",
                }}
              >
                + Add Portfolio Link
              </button>
            )}
          </div>

          {/* Questions */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="questions"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Questions/Clarifications (Optional, max 1000 characters)
            </label>
            <textarea
              id="questions"
              name="questions"
              value={formData.questions}
              onChange={handleInputChange}
              maxLength={1000}
              rows={4}
              placeholder="Any questions or clarifications about the project?"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
            <small style={{ color: "#666", fontSize: "12px" }}>
              {formData.questions.length}/1000 characters
            </small>
          </div>

          {/* Attachments */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Attachments (Optional, max 5 files - PDF, DOC, DOCX only)
            </label>

            {/* Existing Attachments */}
            {existingAttachments.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#666",
                  }}
                >
                  Current Attachments:
                </p>
                {existingAttachments.map((attachment, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      backgroundColor: "#e7f3ff",
                      border: "1px solid #007bff",
                      borderRadius: "4px",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontSize: "14px" }}>📎</span>
                      <span style={{ fontSize: "14px" }}>
                        {attachment.split("/").pop()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingAttachment(index)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New File Upload */}
            <div style={{ marginBottom: "12px" }}>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple
                onChange={handleFileChange}
                disabled={
                  existingAttachments.length + formData.attachments.length >= 5
                }
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  width: "100%",
                  cursor:
                    existingAttachments.length + formData.attachments.length >=
                    5
                      ? "not-allowed"
                      : "pointer",
                }}
              />
              <small
                style={{
                  color: "#666",
                  fontSize: "12px",
                  display: "block",
                  marginTop: "4px",
                }}
              >
                {existingAttachments.length + formData.attachments.length}/5
                files total
              </small>
            </div>

            {/* New Attachments List */}
            {formData.attachments.length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#666",
                  }}
                >
                  New Attachments to Upload:
                </p>
                {formData.attachments.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      backgroundColor: "#d4edda",
                      border: "1px solid #28a745",
                      borderRadius: "4px",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontSize: "14px" }}>📎</span>
                      <span style={{ fontSize: "14px" }}>
                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewAttachment(index)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "12px 32px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? "Updating..." : "Update Proposal"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/my-proposals")}
              disabled={submitting}
              style={{
                padding: "12px 32px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
