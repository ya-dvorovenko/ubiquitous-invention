"use client";

import { useState } from "react";
import Image from "next/image";
import { PostMedia } from "@/types";

interface MediaGalleryProps {
  media: PostMedia[];
  blur?: boolean; // For locked content preview
}

export function MediaGallery({ media, blur = false }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (media.length === 0) return null;

  const gridClass =
    media.length === 1
      ? "grid-cols-1"
      : media.length === 2
        ? "grid-cols-2"
        : "grid-cols-2 md:grid-cols-3";

  return (
    <>
      <div className={`grid ${gridClass} gap-2 rounded-xl overflow-hidden`}>
        {media.map((item, index) => (
          <div
            key={index}
            className={`relative aspect-video cursor-pointer overflow-hidden ${blur ? "pointer-events-none" : ""}`}
            onClick={() => !blur && setSelectedIndex(index)}
          >
            {item.type === "image" ? (
              <Image
                src={item.url}
                alt={`Media ${index + 1}`}
                fill
                className={`object-cover transition-transform hover:scale-105 ${blur ? "blur-xl" : ""}`}
              />
            ) : (
              <video
                src={item.url}
                className={`w-full h-full object-cover ${blur ? "blur-xl" : ""}`}
                controls={!blur}
              />
            )}

            {/* Video play icon */}
            {item.type === "video" && !blur && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </div>
            )}

            {/* Blur overlay for locked content */}
            {blur && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setSelectedIndex(null)}
          >
            <svg
              width="24"
              height="24"
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

          {/* Navigation arrows */}
          {media.length > 1 && (
            <>
              <button
                className="absolute left-4 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) =>
                    prev === 0 ? media.length - 1 : (prev ?? 0) - 1
                  );
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                className="absolute right-4 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) =>
                    prev === media.length - 1 ? 0 : (prev ?? 0) + 1
                  );
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          <div
            className="max-w-4xl max-h-[80vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {media[selectedIndex].type === "image" ? (
              <Image
                src={media[selectedIndex].url}
                alt={`Media ${selectedIndex + 1}`}
                width={1200}
                height={800}
                className="object-contain max-h-[80vh]"
              />
            ) : (
              <video
                src={media[selectedIndex].url}
                className="max-h-[80vh]"
                controls
                autoPlay
              />
            )}
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {selectedIndex + 1} / {media.length}
          </div>
        </div>
      )}
    </>
  );
}
