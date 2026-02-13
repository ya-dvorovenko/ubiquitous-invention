"use client";

import { useRef } from "react";
import Image from "next/image";

interface MediaFile {
  file: File;
  preview: string;
  type: "image" | "video";
}

interface MediaUploadProps {
  files: MediaFile[];
  onFilesChange: (files: MediaFile[]) => void;
  maxFiles?: number;
}

export function MediaUpload({ files, onFilesChange, maxFiles = 5 }: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: MediaFile[] = [];

    Array.from(selectedFiles).forEach((file) => {
      if (files.length + newFiles.length >= maxFiles) return;

      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) return;

      newFiles.push({
        file,
        preview: URL.createObjectURL(file),
        type: isImage ? "image" : "video",
      });
    });

    onFilesChange([...files, ...newFiles]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  return (
    <div>
      <label
        className="block text-sm font-medium mb-2"
        style={{ color: "var(--text-secondary)" }}
      >
        Media (optional)
      </label>

      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:border-[var(--accent)]"
        style={{ borderColor: "var(--border-color)" }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: "var(--border-color)" }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-secondary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p style={{ color: "var(--text-secondary)" }}>
          Click to upload images or videos
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
          Max {maxFiles} files
        </p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-4">
          {files.map((media, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden group"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              {media.type === "image" ? (
                <Image
                  src={media.preview}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <video
                  src={media.preview}
                  className="w-full h-full object-cover"
                />
              )}

              {media.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
