import { useNavigate } from "react-router-dom";

interface ProfileFormActionsProps {
  loading: boolean;
  profileExists: boolean;
}

export default function ProfileFormActions({
  loading,
  profileExists,
}: ProfileFormActionsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-2">
      <button
        type="submit"
        disabled={loading}
        className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md hover:shadow-indigo-500/25"
      >
        {loading
          ? "Saving..."
          : profileExists
            ? "Update Profile"
            : "Create Profile"}
      </button>
      <button
        type="button"
        onClick={() => navigate("/")}
        className="px-8 py-3.5 rounded-xl bg-[var(--color-muted)] text-[var(--color-text-primary)] font-medium hover:bg-[var(--color-border)] transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
