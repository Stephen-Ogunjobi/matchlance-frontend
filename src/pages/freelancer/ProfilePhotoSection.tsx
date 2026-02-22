import { useState } from "react";
import apiClient from "../../utils/api";
import type { ProfileFormData } from "./freelancer-profile.types";

interface ProfilePhotoSectionProps {
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  userId: string;
}

export default function ProfilePhotoSection({
  formData,
  setFormData,
  userId,
}: ProfilePhotoSectionProps) {
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [pictureError, setPictureError] = useState("");

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPictureError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPictureError("Image size must be less than 5MB");
      return;
    }

    setPictureError("");
    setUploadingPicture(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("profilePicture", file);

      const response = await apiClient.post(
        `/freelancer/profile/${userId}/upload-picture`,
        formDataUpload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.profilePicture) {
        setFormData((prev) => ({
          ...prev,
          profilePicture: response.data.profilePicture,
        }));
      }
    } catch (err: any) {
      setPictureError(
        err.response?.data?.message ||
          "Failed to upload profile picture. Please try again.",
      );
    } finally {
      setUploadingPicture(false);
    }
  };

  return (
    <div className="rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] p-8">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">
        Profile Photo
      </h2>
      <div className="flex flex-col items-center gap-4">
        {formData.profilePicture &&
        formData.profilePicture.trim() !== "" ? (
          <img
            src={
              formData.profilePicture.startsWith("http")
                ? formData.profilePicture
                : `http://localhost:3001${formData.profilePicture}`
            }
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-[var(--color-primary)]/20 shadow-lg shadow-[var(--color-primary)]/10"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-[var(--color-muted)] border-4 border-[var(--color-border)] flex items-center justify-center">
            <svg
              className="w-12 h-12 text-[var(--color-text-tertiary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          <input
            type="file"
            id="profilePictureInput"
            accept="image/*"
            onChange={handleProfilePictureChange}
            className="hidden"
          />
          <label
            htmlFor="profilePictureInput"
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              uploadingPicture
                ? "bg-[var(--color-muted)] text-[var(--color-text-tertiary)] cursor-not-allowed"
                : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-sm hover:shadow-md"
            }`}
          >
            {uploadingPicture ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Uploading...
              </>
            ) : formData.profilePicture ? (
              "Change Photo"
            ) : (
              "Upload Photo"
            )}
          </label>
          <span className="text-xs text-[var(--color-text-tertiary)]">
            Max 5MB — JPG, PNG, GIF
          </span>
        </div>

        {pictureError && (
          <p className="text-sm text-[var(--color-error)]">
            {pictureError}
          </p>
        )}
      </div>
    </div>
  );
}
