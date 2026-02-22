import type { ProfileFormData } from "./freelancer-profile.types";

interface LocationSectionProps {
  formData: ProfileFormData;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
}

export default function LocationSection({
  formData,
  onChange,
}: LocationSectionProps) {
  return (
    <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8 space-y-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Location
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Country */}
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
          >
            Country *
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={onChange}
            placeholder="e.g., United States"
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            required
          />
        </div>

        {/* City */}
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
          >
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={onChange}
            placeholder="e.g., New York"
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          />
        </div>
      </div>

      {/* Timezone */}
      <div>
        <label
          htmlFor="timezone"
          className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
        >
          Timezone *
        </label>
        <input
          type="text"
          id="timezone"
          name="timezone"
          value={formData.timezone}
          onChange={onChange}
          placeholder="e.g., America/New_York"
          className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          required
        />
        <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">
          Detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}
        </p>
      </div>
    </div>
  );
}
