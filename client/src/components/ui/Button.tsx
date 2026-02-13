interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
  className = "",
}: ButtonProps) {
  const styles = {
    primary: {
      backgroundColor: "var(--accent)",
      color: "#1a1a1a",
    },
    secondary: {
      backgroundColor: "var(--border-color)",
      color: "var(--text-primary)",
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-xl font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={styles[variant]}
    >
      {children}
    </button>
  );
}
