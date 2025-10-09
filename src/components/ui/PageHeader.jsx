const PageHeader = ({
  title,
  subtitle,
  backgroundColor = "#1e40af",
  gradientTo = "#3b82f6",
  className = "",
}) => {
  return (
    <header
      className={`py-8 shadow-lg ${className}`}
      style={{
        backgroundColor: backgroundColor,
        background: `linear-gradient(135deg, ${backgroundColor} 0%, ${gradientTo} 100%)`,
        color: "#ffffff",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-2" style={{ color: "#ffffff" }}>
          {title}
        </h1>
        <p className="text-lg opacity-95" style={{ color: "#ffffff" }}>
          {subtitle}
        </p>
      </div>
    </header>
  );
};

export default PageHeader;
