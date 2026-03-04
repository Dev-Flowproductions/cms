"use client";

import { useState } from "react";
import { useRouter } from "@/lib/navigation";

type UploadResult = { error?: string; success?: boolean };

export function CoverImageUpload({
  postId,
  currentPath,
  supabaseUrl,
  uploadAction,
}: {
  postId: string;
  currentPath: string | null;
  supabaseUrl: string;
  uploadAction: (formData: FormData) => Promise<UploadResult>;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const publicUrl = currentPath
    ? `${supabaseUrl}/storage/v1/object/public/covers/${currentPath}`
    : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(null);
    setUploading(true);
    const result = await uploadAction(formData);
    setUploading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    form.reset();
    router.refresh();
  }

  return (
    <div>
      {publicUrl && (
        <div className="mb-2">
          <img
            src={publicUrl}
            alt="Cover"
            className="max-w-xs rounded border border-gray-200 dark:border-gray-700"
          />
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <input
          type="file"
          name="file"
          accept="image/*"
          className="text-sm"
        />
        <button
          type="submit"
          disabled={uploading}
          className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-sm disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
}
