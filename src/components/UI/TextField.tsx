export function TextField({
  label,
  value,
  placeholder,
  onChange,
  mono = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  mono?: boolean;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        className={mono ? "mono-input" : ""}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
    </label>
  );
}
