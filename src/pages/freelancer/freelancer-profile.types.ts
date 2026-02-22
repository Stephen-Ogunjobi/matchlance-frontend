export type Category =
  | "web-development"
  | "mobile-development"
  | "design"
  | "writing"
  | "marketing"
  | "data-science"
  | "other";

export type ExperienceLevel = "entry" | "intermediate" | "expert";

export type AvailabilityStatus = "available" | "busy" | "not-available";

export type LanguageProficiency = "basic" | "conversational" | "fluent" | "native";

export interface Language {
  language: string;
  proficiency: LanguageProficiency;
}

export interface ProfileFormData {
  bio: string;
  title: string;
  skills: string[];
  categories: string[];
  experienceLevel: ExperienceLevel | "";
  hourlyRateMin: string;
  hourlyRateMax: string;
  availabilityStatus: AvailabilityStatus;
  hoursPerWeek: string;
  country: string;
  city: string;
  timezone: string;
  languages: Language[];
  profilePicture?: string;
}

export const categoryOptions: { value: Category; label: string }[] = [
  { value: "web-development", label: "Web Development" },
  { value: "mobile-development", label: "Mobile Development" },
  { value: "design", label: "Design" },
  { value: "writing", label: "Writing" },
  { value: "marketing", label: "Marketing" },
  { value: "data-science", label: "Data Science" },
  { value: "other", label: "Other" },
];
