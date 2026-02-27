import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../utils/api";
import { useUser } from "../../contexts/UserContext";

// ── Types ──────────────────────────────────────────────────────────────────

type Currency = "USD" | "NGN" | "EUR" | "GBP";
type CompanySize = "1-10" | "11-50" | "51-200" | "201-500" | "500+";
type ExperienceLevel = "entry" | "intermediate" | "expert";

const CATEGORIES = [
  "web-development",
  "mobile-development",
  "design",
  "writing",
  "marketing",
  "data-science",
  "video-editing",
  "devops",
  "finance",
  "legal",
  "customer-support",
  "other",
];

interface ClientProfile {
  _id?: string;
  bio?: string;
  profilePicture?: string;
  company: {
    name?: string;
    website?: string;
    size?: CompanySize;
    industry?: string;
  };
  location: {
    country: string;
    city?: string;
    timezone: string;
  };
  hiringPreferences: {
    categories: string[];
    preferredExperienceLevel?: ExperienceLevel;
    typicalBudget: {
      min?: number;
      max?: number;
      currency: Currency;
    };
  };
  rating: {
    average: number;
    count: number;
  };
  totalJobsPosted: number;
  totalHires: number;
  totalSpent: number;
  hireRate: number;
  paymentVerified: boolean;
  isVerified: boolean;
  profileCompleteness: number;
}

type FormData = {
  bio: string;
  profilePicture: string;
  companyName: string;
  companyWebsite: string;
  companySize: CompanySize | "";
  companyIndustry: string;
  country: string;
  city: string;
  timezone: string;
  categories: string[];
  preferredExperienceLevel: ExperienceLevel | "";
  budgetMin: string;
  budgetMax: string;
  currency: Currency;
};

const emptyForm: FormData = {
  bio: "",
  profilePicture: "",
  companyName: "",
  companyWebsite: "",
  companySize: "",
  companyIndustry: "",
  country: "",
  city: "",
  timezone: "",
  categories: [],
  preferredExperienceLevel: "",
  budgetMin: "",
  budgetMax: "",
  currency: "USD",
};

function profileToForm(p: ClientProfile): FormData {
  return {
    bio: p.bio ?? "",
    profilePicture: p.profilePicture ?? "",
    companyName: p.company?.name ?? "",
    companyWebsite: p.company?.website ?? "",
    companySize: p.company?.size ?? "",
    companyIndustry: p.company?.industry ?? "",
    country: p.location?.country ?? "",
    city: p.location?.city ?? "",
    timezone: p.location?.timezone ?? "",
    categories: p.hiringPreferences?.categories ?? [],
    preferredExperienceLevel:
      p.hiringPreferences?.preferredExperienceLevel ?? "",
    budgetMin: p.hiringPreferences?.typicalBudget?.min?.toString() ?? "",
    budgetMax: p.hiringPreferences?.typicalBudget?.max?.toString() ?? "",
    currency: p.hiringPreferences?.typicalBudget?.currency ?? "USD",
  };
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ViewClientProfile() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();

  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  const [form, setForm] = useState<FormData>(emptyForm);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile
  useEffect(() => {
    if (userLoading || !user || !clientId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/client/profile/${clientId}`);
        const data: ClientProfile =
          res.data.clientProfile ?? res.data;
        setProfile(data);
        setForm(profileToForm(data));
        setPhotoPreview(data.profilePicture ?? "");
      } catch (err: any) {
        if (err.response?.status === 404) {
          // No profile yet — show blank form if owner
        } else {
          setError(err.response?.data?.message ?? "Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    setIsOwner(user._id === clientId);
    fetchProfile();
  }, [userLoading, user, clientId]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to server
    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const res = await apiClient.post(
        `/client/profile/${clientId}/upload-picture`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const url: string =
        res.data.profilePicture ?? res.data.url ?? res.data;
      setPhotoPreview(
        url.startsWith("http") ? url : `http://localhost:3001${url}`
      );
      set("profilePicture", url);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to upload photo.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!form.country || !form.timezone) {
      setError("Country and timezone are required.");
      return;
    }

    const payload = {
      bio: form.bio,
      profilePicture: form.profilePicture,
      company: {
        name: form.companyName,
        website: form.companyWebsite,
        size: form.companySize || undefined,
        industry: form.companyIndustry,
      },
      location: {
        country: form.country,
        city: form.city,
        timezone: form.timezone,
      },
      hiringPreferences: {
        categories: form.categories,
        preferredExperienceLevel: form.preferredExperienceLevel || undefined,
        typicalBudget: {
          min: form.budgetMin ? Number(form.budgetMin) : undefined,
          max: form.budgetMax ? Number(form.budgetMax) : undefined,
          currency: form.currency,
        },
      },
    };

    try {
      setSaving(true);
      const res = profile
        ? await apiClient.patch(`/client/profile/${clientId}`, payload)
        : await apiClient.post(`/client/profile/${clientId}`, payload);

      const saved: ClientProfile =
        res.data.clientProfile ?? res.data;
      setProfile(saved);
      setForm(profileToForm(saved));
      setSuccessMsg("Profile saved successfully.");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (userLoading || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-28 w-28 rounded-full bg-[var(--color-border)] mx-auto" />
          <div className="h-5 rounded bg-[var(--color-border)] w-40 mx-auto" />
          <div className="h-32 rounded-2xl bg-[var(--color-border)]" />
          <div className="h-32 rounded-2xl bg-[var(--color-border)]" />
          <div className="h-32 rounded-2xl bg-[var(--color-border)]" />
        </div>
      </div>
    );
  }

  // ── Read-only view (non-owner with existing profile) ───────────────────────

  if (!isOwner && profile) {
    const fullName =
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.email ||
      "";
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-indigo-500 hover:underline"
        >
          &larr; Back
        </button>

        {/* Header */}
        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8 text-center">
          {profile.profilePicture ? (
            <img
              src={
                profile.profilePicture.startsWith("http")
                  ? profile.profilePicture
                  : `http://localhost:3001${profile.profilePicture}`
              }
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500 mx-auto mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-[var(--color-text-secondary)]">
                {fullName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            {fullName}
          </h1>
          {profile.company?.name && (
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {profile.company.name}
            </p>
          )}
          {(profile.location?.city || profile.location?.country) && (
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {[profile.location.city, profile.location.country]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
          {profile.isVerified && (
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-500">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Verified
            </span>
          )}
        </div>

        {profile.bio && (
          <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-6">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
              About
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-5 text-center">
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              {profile.totalJobsPosted}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Jobs Posted
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-5 text-center">
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              {profile.totalHires}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Total Hires
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-5 text-center">
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              {profile.hireRate}%
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Hire Rate
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-5 text-center">
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              {profile.rating.average.toFixed(1)}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Rating ({profile.rating.count})
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Edit / Create form (owner) ─────────────────────────────────────────────

  const initials =
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .map((n) => n![0])
      .join("") ||
    user?.email?.[0]?.toUpperCase() ||
    "C";

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-indigo-500 hover:underline mb-6 inline-block"
      >
        &larr; Back
      </button>

      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">
        {profile ? "Edit Profile" : "Complete Your Profile"}
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8">
        {profile
          ? "Keep your information up to date."
          : "Fill in your details so freelancers can trust and learn about you."}
      </p>

      {/* Profile completeness bar */}
      {profile && (
        <div className="mb-8 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              Profile completeness
            </span>
            <span className="text-sm font-semibold text-indigo-500">
              {profile.profileCompleteness}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-border)]">
            <div
              className="h-2 rounded-full bg-indigo-500 transition-all"
              style={{ width: `${profile.profileCompleteness}%` }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo */}
        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-6">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
            Profile Photo
          </h2>
          <div className="flex items-center gap-5">
            {photoPreview ? (
              <img
                src={
                  photoPreview.startsWith("http") ||
                  photoPreview.startsWith("data:")
                    ? photoPreview
                    : `http://localhost:3001${photoPreview}`
                }
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[var(--color-border)] flex items-center justify-center text-2xl font-semibold text-[var(--color-text-secondary)]">
                {initials}
              </div>
            )}
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-muted)] transition-colors"
              >
                Upload photo
              </button>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                JPG, PNG or GIF · max 5 MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-6">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
            About
          </h2>
          <textarea
            rows={4}
            placeholder="Tell freelancers a bit about yourself or your company..."
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {/* Company */}
        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Company
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                Company name
              </label>
              <input
                type="text"
                placeholder="Acme Inc."
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                Website
              </label>
              <input
                type="url"
                placeholder="https://acme.com"
                value={form.companyWebsite}
                onChange={(e) => set("companyWebsite", e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                Company size
              </label>
              <select
                value={form.companySize}
                onChange={(e) =>
                  set("companySize", e.target.value as CompanySize | "")
                }
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select size</option>
                {(
                  ["1-10", "11-50", "51-200", "201-500", "500+"] as CompanySize[]
                ).map((s) => (
                  <option key={s} value={s}>
                    {s} employees
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                Industry
              </label>
              <input
                type="text"
                placeholder="e.g. Technology"
                value={form.companyIndustry}
                onChange={(e) => set("companyIndustry", e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Location <span className="text-[var(--color-error)]">*</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                Country *
              </label>
              <input
                type="text"
                placeholder="Nigeria"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                required
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                City
              </label>
              <input
                type="text"
                placeholder="Lagos"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                Timezone *
              </label>
              <input
                type="text"
                placeholder="Africa/Lagos"
                value={form.timezone}
                onChange={(e) => set("timezone", e.target.value)}
                required
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Hiring preferences */}
        <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-6 space-y-5">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Hiring Preferences
          </h2>

          {/* Categories */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2">
              Categories you hire for
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active = form.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      active
                        ? "bg-indigo-500 text-white border-indigo-500"
                        : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-indigo-400 hover:text-indigo-500"
                    }`}
                  >
                    {cat.replace(/-/g, " ")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred experience level */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Preferred experience level
            </label>
            <select
              value={form.preferredExperienceLevel}
              onChange={(e) =>
                set(
                  "preferredExperienceLevel",
                  e.target.value as ExperienceLevel | ""
                )
              }
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Any level</option>
              <option value="entry">Entry</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          {/* Typical budget */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2">
              Typical budget range
            </label>
            <div className="flex items-center gap-3">
              <select
                value={form.currency}
                onChange={(e) => set("currency", e.target.value as Currency)}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {(["USD", "NGN", "EUR", "GBP"] as Currency[]).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                placeholder="Min"
                value={form.budgetMin}
                onChange={(e) => set("budgetMin", e.target.value)}
                className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[var(--color-text-secondary)] text-sm">
                –
              </span>
              <input
                type="number"
                min={0}
                placeholder="Max"
                value={form.budgetMax}
                onChange={(e) => set("budgetMax", e.target.value)}
                className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <p className="text-sm text-[var(--color-error)] bg-[var(--color-error)]/10 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
        {successMsg && (
          <p className="text-sm text-[var(--color-success)] bg-[var(--color-success)]/10 rounded-xl px-4 py-3">
            {successMsg}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : profile ? "Save Changes" : "Create Profile"}
        </button>
      </form>
    </div>
  );
}
