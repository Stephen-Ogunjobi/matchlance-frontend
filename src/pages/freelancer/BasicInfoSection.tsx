import type { ProfileFormData } from "./freelancer-profile.types";

interface BasicInfoSectionProps {
  formData: ProfileFormData;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
}

export default function BasicInfoSection({
  formData,
  onChange,
}: BasicInfoSectionProps) {
  return (
    <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8 space-y-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Basic Information
      </h2>

      {/* Professional Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
        >
          Professional Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={onChange}
          placeholder="e.g., Full-Stack Developer | UI/UX Designer"
          className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          minLength={10}
          maxLength={100}
          required
        />
        <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">
          {formData.title.length}/100 characters (min 10)
        </p>
      </div>

      {/* Bio */}
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
        >
          Professional Bio *
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={onChange}
          placeholder="Tell potential clients about your experience, expertise, and what makes you unique..."
          className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-y min-h-[160px]"
          minLength={100}
          maxLength={2000}
          required
        />
        <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">
          {formData.bio.length}/2000 characters (min 100)
        </p>
      </div>
    </div>
  );
}
