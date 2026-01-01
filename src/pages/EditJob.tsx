import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../utils/api";
import { useUser } from "../contexts/UserContext";

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

      // Populate form with existing job data
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
      console.error("Error fetching job:", err);
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

    // Validation
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

    // Budget validation
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
      console.error("Error updating job:", err);
      setError(
        err.response?.data?.message || "Failed to update job. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingJob) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        <h1>Edit Job</h1>
        <p>Loading job data...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1>Edit Job</h1>

      {error && (
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
      )}

      <form onSubmit={handleSubmit}>
        {/* Job Title */}
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="title"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
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
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            minLength={10}
            maxLength={100}
            required
          />
          <small style={{ color: "#666" }}>
            {formData.title.length}/100 characters (min 10)
          </small>
        </div>

        {/* Description */}
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="description"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Job Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the job in detail..."
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "14px",
              minHeight: "150px",
            }}
            minLength={100}
            maxLength={5000}
            required
          />
          <small style={{ color: "#666" }}>
            {formData.description.length}/5000 characters (min 100)
          </small>
        </div>

        {/* Category */}
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="category"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
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
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="skillInput"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Required Skills * (1-10 skills)
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
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
              style={{ flex: 1, padding: "8px", fontSize: "14px" }}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              disabled={formData.skills.length >= 10}
              style={{ padding: "8px 16px" }}
            >
              Add
            </button>
          </div>
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {formData.skills.map((skill) => (
              <span
                key={skill}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#e0e0e0",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <small style={{ color: "#666" }}>
            {formData.skills.length}/10 skills
          </small>
        </div>

        {/* Budget Type */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Budget Type *
          </label>
          <div style={{ display: "flex", gap: "16px" }}>
            <label
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <input
                type="radio"
                name="budgetType"
                value="fixed"
                checked={formData.budgetType === "fixed"}
                onChange={handleInputChange}
              />
              Fixed Price
            </label>
            <label
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <input
                type="radio"
                name="budgetType"
                value="hourly"
                checked={formData.budgetType === "hourly"}
                onChange={handleInputChange}
              />
              Hourly Rate
            </label>
          </div>
        </div>

        {/* Budget Amount (Fixed) */}
        {formData.budgetType === "fixed" && (
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="budgetAmount"
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Budget Amount (USD) *
            </label>
            <input
              type="number"
              id="budgetAmount"
              name="budgetAmount"
              value={formData.budgetAmount}
              onChange={handleInputChange}
              placeholder="e.g., 5000"
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              min="0"
              step="0.01"
              required
            />
          </div>
        )}

        {/* Budget Range (Hourly) */}
        {formData.budgetType === "hourly" && (
          <div
            style={{
              marginBottom: "20px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div>
              <label
                htmlFor="budgetMin"
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Min Hourly Rate (USD) *
              </label>
              <input
                type="number"
                id="budgetMin"
                name="budgetMin"
                value={formData.budgetMin}
                onChange={handleInputChange}
                placeholder="e.g., 50"
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label
                htmlFor="budgetMax"
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Max Hourly Rate (USD) *
              </label>
              <input
                type="number"
                id="budgetMax"
                name="budgetMax"
                value={formData.budgetMax}
                onChange={handleInputChange}
                placeholder="e.g., 100"
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
        )}

        {/* Experience Level */}
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="experienceLevel"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Experience Level *
          </label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleInputChange}
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            required
          >
            <option value="">Select experience level</option>
            <option value="entry">Entry Level</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        {/* Duration Type */}
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="durationType"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Project Duration *
          </label>
          <select
            id="durationType"
            name="durationType"
            value={formData.durationType}
            onChange={handleInputChange}
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            required
          >
            <option value="">Select duration</option>
            <option value="short">Short (Less than 1 month)</option>
            <option value="medium">Medium (1-3 months)</option>
            <option value="long">Long (More than 3 months)</option>
          </select>
        </div>

        {/* Estimated Hours */}
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="estimatedHours"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Estimated Hours (Optional)
          </label>
          <input
            type="number"
            id="estimatedHours"
            name="estimatedHours"
            value={formData.estimatedHours}
            onChange={handleInputChange}
            placeholder="e.g., 40"
            style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            min="1"
          />
        </div>

        {/* Submit Buttons */}
        <div style={{ display: "flex", gap: "12px", marginTop: "30px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Updating..." : "Update Job"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/jobs/${jobId}`)}
            style={{
              padding: "12px 24px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
