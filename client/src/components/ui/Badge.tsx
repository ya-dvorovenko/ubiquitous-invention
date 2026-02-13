interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "price";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const styles = {
    default: {
      backgroundColor: "var(--border-color)",
      color: "var(--text-secondary)",
    },
    success: {
      backgroundColor: "var(--accent)",
      color: "#1a1a1a",
    },
    price: {
      backgroundColor: "var(--border-color)",
      color: "var(--accent)",
    },
  };

  return (
    <span
      className="text-sm font-medium px-3 py-1 rounded-full"
      style={styles[variant]}
    >
      {children}
    </span>
  );
}
