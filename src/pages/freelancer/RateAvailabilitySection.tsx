import type { ProfileFormData } from "./freelancer-profile.types";

interface RateAvailabilitySectionProps {
  formData: ProfileFormData;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
}

export default function RateAvailabilitySection({
  formData,
  onChange,
}: RateAvailabilitySectionProps) {
  return (
    <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8 space-y-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Rate & Availability
      </h2>

      {/* Hourly Rate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="hourlyRateMin"
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
              id="hourlyRateMin"
              name="hourlyRateMin"
              value={formData.hourlyRateMin}
              onChange={onChange}
              placeholder="25"
              className="w-full pl-8 pr-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="hourlyRateMax"
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
              id="hourlyRateMax"
              name="hourlyRateMax"
              value={formData.hourlyRateMax}
              onChange={onChange}
              placeholder="75"
              className="w-full pl-8 pr-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
      </div>

      {/* Availability Status */}
      <div>
        <label
          htmlFor="availabilityStatus"
          className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
        >
          Availability Status *
        </label>
        <select
          id="availabilityStatus"
          name="availabilityStatus"
          value={formData.availabilityStatus}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          required
        >
          <option value="available">Available</option>
          <option value="busy">Busy</option>
          <option value="not-available">Not Available</option>
        </select>
      </div>

      {/* Hours Per Week */}
      <div>
        <label
          htmlFor="hoursPerWeek"
          className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
        >
          Available Hours Per Week *
        </label>
        <input
          type="number"
          id="hoursPerWeek"
          name="hoursPerWeek"
          value={formData.hoursPerWeek}
          onChange={onChange}
          placeholder="e.g., 30"
          className="w-full px-4 py-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-input-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          min="1"
          max="168"
          required
        />
        <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">
          Maximum 168 hours per week
        </p>
      </div>
    </div>
  );
}
