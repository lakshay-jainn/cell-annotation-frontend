const FormField = ({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>
      <input
        name={name}
        id={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${className}`}
        placeholder={placeholder}
      />
    </div>
  );
};

export default FormField;
