export function TextField({ label, value, onChange, ...props }) {
  return (
    <label>
      {label}
      <input value={value ?? ""} onChange={(event) => onChange(event.target.value)} {...props} />
    </label>
  );
}

export function TextAreaField({ label, value, onChange, ...props }) {
  return (
    <label>
      {label}
      <textarea value={value ?? ""} onChange={(event) => onChange(event.target.value)} {...props} />
    </label>
  );
}

export function SelectField({ label, value, onChange, children, ...props }) {
  return (
    <label>
      {label}
      <select value={value ?? ""} onChange={(event) => onChange(event.target.value)} {...props}>
        {children}
      </select>
    </label>
  );
}

export function CheckboxField({ label, checked, onChange, description }) {
  return (
    <label className="checkbox-field">
      <input checked={Boolean(checked)} type="checkbox" onChange={(event) => onChange(event.target.checked)} />
      <span>
        <strong>{label}</strong>
        {description ? <small>{description}</small> : null}
      </span>
    </label>
  );
}

export function FormError({ message }) {
  return message ? <div className="form-error">{message}</div> : null;
}
