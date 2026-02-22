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

  // Redirect if not a client
  if (!isClient) {
    navigate("/");
    return null;
  }

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
        status: "open",
      };

      await apiClient.post("/job/post-job", jobData);
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to post job. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Job Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-900 mb-2"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              minLength={10}
              maxLength={100}
              required
            />
            <p className="mt-1.5 text-sm text-gray-500">
              {formData.title.length}/100 characters (min 10)
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Job Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the job in detail..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm min-h-[180px] resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              minLength={100}
              maxLength={5000}
              required
            />
            <p className="mt-1.5 text-sm text-gray-500">
              {formData.description.length}/5000 characters (min 100)
            </p>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
            <label
              htmlFor="skillInput"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Required Skills * (1-10 skills)
            </label>
            <div className="flex gap-3">
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
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                disabled={formData.skills.length >= 10}
                className="px-5 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {formData.skills.length}/10 skills
            </p>
          </div>

          {/* Budget Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Budget Type *
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="budgetType"
                  value="fixed"
                  checked={formData.budgetType === "fixed"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Fixed Price</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="budgetType"
                  value="hourly"
                  checked={formData.budgetType === "hourly"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Hourly Rate</span>
              </label>
            </div>
          </div>

          {/* Budget Amount (Fixed) */}
          {formData.budgetType === "fixed" && (
            <div>
              <label
                htmlFor="budgetAmount"
                className="block text-sm font-semibold text-gray-900 mb-2"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                min="0"
                step="0.01"
                required
              />
            </div>
          )}

          {/* Budget Range (Hourly) */}
          {formData.budgetType === "hourly" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="budgetMin"
                  className="block text-sm font-semibold text-gray-900 mb-2"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="budgetMax"
                  className="block text-sm font-semibold text-gray-900 mb-2"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          )}

          {/* Experience Level */}
          <div>
            <label
              htmlFor="experienceLevel"
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Experience Level *
            </label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
              className="block text-sm font-semibold text-gray-900 mb-2"
            >
              Project Duration *
            </label>
            <select
              id="durationType"
              name="durationType"
              value={formData.durationType}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
              className="block text-sm font-semibold text-gray-900 mb-2"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              min="1"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Posting..." : "Post Job"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
