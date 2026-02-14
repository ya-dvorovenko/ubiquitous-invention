"use client";

import { useState } from "react";
import { Button, Card, MediaUpload } from "../ui";

interface MediaFile {
  file: File;
  preview: string;
  type: "image" | "video";
}

interface CreatePostFormProps {
  onPublish: (data: {
    title: string;
    preview: string;
    content: string;
    mediaFiles: MediaFile[];
  }) => Promise<void>;
}

export function CreatePostForm({ onPublish }: CreatePostFormProps) {
  const [title, setTitle] = useState("");
  const [preview, setPreview] = useState("");
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !preview.trim() || !content.trim()) return;

    setIsPublishing(true);

    try {
      await onPublish({ title, preview, content, mediaFiles });
      // mediaFiles.forEach((m) => URL.revokeObjectURL(m.preview));
      // setTitle("");
      // setPreview("");
      // setContent("");
      // setMediaFiles([]);
    } finally {
      setIsPublishing(false);
    }
  };

  const isValid = title.trim() && preview.trim() && content.trim();

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title..."
            className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
            style={{
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Preview (visible to everyone)
          </label>
          <textarea
            value={preview}
            onChange={(e) => setPreview(e.target.value)}
            placeholder="Write a preview that will be visible to non-subscribers..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl outline-none resize-none transition-colors"
            style={{
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Content (subscribers only)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your exclusive content for subscribers..."
            rows={8}
            className="w-full px-4 py-3 rounded-xl outline-none resize-none transition-colors"
            style={{
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        <MediaUpload
          files={mediaFiles}
          onFilesChange={setMediaFiles}
          maxFiles={5}
        />

        <Button onClick={handleSubmit} disabled={isPublishing || !isValid}>
          {isPublishing ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </Card>
  );
}
