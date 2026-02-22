import { useState } from "react";
import type {
  Category,
  ProfileFormData,
} from "./freelancer-profile.types";
import { categoryOptions } from "./freelancer-profile.types";

interface SkillsExpertiseSectionProps {
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
}

export default function SkillsExpertiseSection({
  formData,
  setFormData,
  onChange,
}: SkillsExpertiseSectionProps) {
  const [skillInput, setSkillInput] = useState("");
  const [categoryInput, setCategoryInput] = useState<Category | "">("");

  const handleAddSkill = () => {
    if (skillInput.trim() && formData.skills.length < 20) {
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

  const handleAddCategory = () => {
    if (categoryInput && formData.categories.length < 5) {
      if (!formData.categories.includes(categoryInput)) {
        setFormData((prev) => ({
          ...prev,
          categories: [...prev.categories, categoryInput],
        }));
        setCategoryInput("");
      }
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat !== categoryToRemove),
    }));
  };

  return (
    <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8 space-y-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Skills & Expertise
      </h2>

      {/* Skills */}
      <div>
        <label
          htmlFor="skillInput"
          className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
        >
          Skills * (1-20)
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
            disabled={formData.skills.length >= 20}
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
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
          {formData.skills.length}/20 skills
        </p>
      </div>

      {/* Categories */}
      <div>
        <label
          htmlFor="categoryInput"
          className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
        >
          Categories * (1-5)
        </label>
        <div className="flex gap-2">
          <select
            id="categoryInput"
            value={categoryInput}
            onChange={(e) =>
              setCategoryInput(e.target.value as Category)
            }
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          >
            <option value="">Select a category</option>
            {categoryOptions.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddCategory}
            disabled={formData.categories.length >= 5 || !categoryInput}
            className="px-5 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
        {formData.categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.categories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-success)]/10 text-[var(--color-success)] text-sm font-medium"
              >
                {categoryOptions.find((c) => c.value === category)
                  ?.label || category}
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category)}
                  className="hover:bg-[var(--color-success)]/20 rounded-full w-5 h-5 inline-flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
          {formData.categories.length}/5 categories
        </p>
      </div>

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
          onChange={onChange}
          className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          required
        >
          <option value="">Select experience level</option>
          <option value="entry">Entry Level</option>
          <option value="intermediate">Intermediate</option>
          <option value="expert">Expert</option>
        </select>
      </div>
    </div>
  );
}
