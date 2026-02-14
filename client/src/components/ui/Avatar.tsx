import Image from "next/image";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  avatarUrl?: string;
}

const sizeClasses = {
  sm: "w-10 h-10 text-lg",
  md: "w-12 h-12 text-xl",
  lg: "w-24 h-24 text-4xl",
};

export function Avatar({ name, size = "md", className = "", avatarUrl }: AvatarProps) {
  if (avatarUrl) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full flex-shrink-0 overflow-hidden relative ${className}`}
      >
        <Image
          src={avatarUrl}
          alt={name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold flex-shrink-0 ${className}`}
      style={{ backgroundColor: "var(--accent)", color: "#1a1a1a" }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
