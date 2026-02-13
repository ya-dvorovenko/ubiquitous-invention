"use client";

interface PotatoLoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

export function PotatoLoader({ size = "md", text, fullScreen }: PotatoLoaderProps) {
  const sizes = {
    sm: 40,
    md: 60,
    lg: 80,
  };

  const potatoSize = sizes[size];

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className="potato-bounce"
        style={{
          width: potatoSize,
          height: potatoSize,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <ellipse
            cx="50"
            cy="55"
            rx="38"
            ry="32"
            fill="#C4A574"
            className="potato-body"
          />
          <ellipse
            cx="35"
            cy="45"
            rx="12"
            ry="8"
            fill="#D4B584"
            opacity="0.6"
          />
          <circle cx="60" cy="50" r="3" fill="#A08050" opacity="0.5" />
          <circle cx="45" cy="65" r="2.5" fill="#A08050" opacity="0.5" />
          <circle cx="70" cy="60" r="2" fill="#A08050" opacity="0.5" />
          <circle cx="40" cy="50" r="4" fill="#333" />
          <circle cx="55" cy="48" r="4" fill="#333" />
          <circle cx="41" cy="49" r="1.5" fill="#fff" />
          <circle cx="56" cy="47" r="1.5" fill="#fff" />
          <path
            d="M 42 60 Q 48 66 54 60"
            stroke="#333"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <g className="flame">
            <path
              d="M 35 90 Q 40 80 45 90 Q 50 78 55 90 Q 60 80 65 90"
              stroke="#FF6B35"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 40 92 Q 45 85 50 92 Q 55 85 60 92"
              stroke="#FFB347"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
      {text && (
        <p
          className="text-sm font-medium animate-pulse"
          style={{ color: "var(--text-secondary)" }}
        >
          {text}
        </p>
      )}

      <style jsx>{`
        .potato-bounce {
          animation: bounce 0.6s ease-in-out infinite;
        }

        .flame {
          animation: flicker 0.3s ease-in-out infinite alternate;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0) rotate(-3deg);
          }
          50% {
            transform: translateY(-15px) rotate(3deg);
          }
        }

        @keyframes flicker {
          0% {
            opacity: 0.8;
            transform: scaleY(0.9);
          }
          100% {
            opacity: 1;
            transform: scaleY(1.1);
          }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-40" style={{ backgroundColor: "var(--bg-primary)" }}>
        {content}
      </div>
    );
  }

  return content;
}
