import { useState } from "react";
import type {
  LanguageProficiency,
  ProfileFormData,
} from "./freelancer-profile.types";

interface LanguagesSectionProps {
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

export default function LanguagesSection({
  formData,
  setFormData,
}: LanguagesSectionProps) {
  const [languageInput, setLanguageInput] = useState("");
  const [languageProficiency, setLanguageProficiency] =
    useState<LanguageProficiency>("conversational");

  const handleAddLanguage = () => {
    if (languageInput.trim() && formData.languages.length < 10) {
      const languageExists = formData.languages.some(
        (lang) =>
          lang.language.toLowerCase() === languageInput.trim().toLowerCase(),
      );
      if (!languageExists) {
        setFormData((prev) => ({
          ...prev,
          languages: [
            ...prev.languages,
            {
              language: languageInput.trim(),
              proficiency: languageProficiency,
            },
          ],
        }));
        setLanguageInput("");
        setLanguageProficiency("conversational");
      }
    }
  };

  const handleRemoveLanguage = (languageToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter(
        (lang) => lang.language !== languageToRemove,
      ),
    }));
  };

  return (
    <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8 space-y-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Languages
      </h2>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
          Languages * (1-10)
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={languageInput}
            onChange={(e) => setLanguageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddLanguage();
              }
            }}
            placeholder="e.g., English, Spanish"
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          />
          <select
            value={languageProficiency}
            onChange={(e) =>
              setLanguageProficiency(
                e.target.value as LanguageProficiency,
              )
            }
            className="px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          >
            <option value="basic">Basic</option>
            <option value="conversational">Conversational</option>
            <option value="fluent">Fluent</option>
            <option value="native">Native</option>
          </select>
          <button
            type="button"
            onClick={handleAddLanguage}
            disabled={formData.languages.length >= 10}
            className="px-5 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
        {formData.languages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.languages.map((lang) => (
              <span
                key={lang.language}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-warning)]/10 text-[var(--color-warning)] text-sm font-medium"
              >
                {lang.language}
                <span className="opacity-70">
                  ({lang.proficiency})
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveLanguage(lang.language)}
                  className="hover:bg-[var(--color-warning)]/20 rounded-full w-5 h-5 inline-flex items-center justify-center transition-colors"
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
          {formData.languages.length}/10 languages
        </p>
      </div>
    </div>
  );
}
