"use client";

interface SadPotatoProps {
  size?: "sm" | "md" | "lg";
}

export function SadPotato({ size = "md" }: SadPotatoProps) {
  const sizes = {
    sm: 80,
    md: 120,
    lg: 160,
  };

  const potatoSize = sizes[size];

  return (
    <div
      className="sad-potato"
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
        {/* Potato body */}
        <ellipse
          cx="50"
          cy="55"
          rx="38"
          ry="32"
          fill="#C4A574"
        />
        {/* Potato highlight */}
        <ellipse
          cx="35"
          cy="45"
          rx="12"
          ry="8"
          fill="#D4B584"
          opacity="0.6"
        />
        {/* Potato spots */}
        <circle cx="60" cy="50" r="3" fill="#A08050" opacity="0.5" />
        <circle cx="45" cy="65" r="2.5" fill="#A08050" opacity="0.5" />
        <circle cx="70" cy="60" r="2" fill="#A08050" opacity="0.5" />

        {/* Sad eyes */}
        <ellipse cx="40" cy="50" rx="5" ry="6" fill="#333" />
        <ellipse cx="58" cy="50" rx="5" ry="6" fill="#333" />
        {/* Eye highlights */}
        <circle cx="38" cy="48" r="2" fill="#fff" />
        <circle cx="56" cy="48" r="2" fill="#fff" />

        {/* Sad eyebrows */}
        <path
          d="M 32 42 L 42 45"
          stroke="#333"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 66 42 L 56 45"
          stroke="#333"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Sad mouth */}
        <path
          d="M 42 68 Q 48 62 54 68"
          stroke="#333"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Tears */}
        <g className="tears">
          <ellipse cx="35" cy="58" rx="2" ry="3" fill="#6BB5FF" className="tear-left" />
          <ellipse cx="63" cy="58" rx="2" ry="3" fill="#6BB5FF" className="tear-right" />
        </g>
      </svg>

      <style jsx>{`
        .sad-potato {
          animation: wobble 2s ease-in-out infinite;
        }

        .tear-left {
          animation: tearDrop 1.5s ease-in-out infinite;
        }

        .tear-right {
          animation: tearDrop 1.5s ease-in-out infinite 0.5s;
        }

        @keyframes wobble {
          0%, 100% {
            transform: rotate(-2deg);
          }
          50% {
            transform: rotate(2deg);
          }
        }

        @keyframes tearDrop {
          0% {
            opacity: 0;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(15px);
          }
        }
      `}</style>
    </div>
  );
}
