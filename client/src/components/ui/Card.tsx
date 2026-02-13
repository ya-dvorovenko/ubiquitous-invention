interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function Card({ children, className = "", hoverable = false }: CardProps) {
  return (
    <div
      className={`p-6 rounded-xl ${hoverable ? "transition-all hover:brightness-110 cursor-pointer" : ""} ${className}`}
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
      }}
    >
      {children}
    </div>
  );
}
