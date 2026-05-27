const logoConfig = {
  Java: { label: "Java", short: "J", bg: "#f97316" },
  "C++": { label: "C++", short: "C++", bg: "#2563eb" },
  HTML: { label: "HTML", short: "HTML", bg: "#ea580c" },
  CSS: { label: "CSS", short: "CSS", bg: "#0284c7" },
  JavaScript: { label: "JavaScript", short: "JS", bg: "#facc15", color: "#111827" },
};

function CategoryLogo({ category }) {
  const config = logoConfig[category] || { label: category, short: category?.slice(0, 2) || "?", bg: "#475569" };
  const textColor = config.color || "#f8fafc";

  return (
    <span
      aria-label={`${config.label} logo`}
      className="category-logo"
      style={{ backgroundColor: config.bg, color: textColor }}
      title={`${config.label} logo`}
    >
      {config.short}
    </span>
  );
}

export default CategoryLogo;
