import { Link } from "react-router-dom";

export function Loading({ label = "Loading" }) {
  return (
    <div className="state-card">
      <span className="spinner" aria-hidden="true" />
      <p>{label}…</p>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state-card state-card--error">
      <strong>Something went wrong</strong>
      <p>{error?.message || "The request could not be completed."}</p>
      {onRetry ? (
        <button className="button button--secondary" onClick={onRetry} type="button">
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="state-card">
      <strong>{title}</strong>
      <p>{message}</p>
      {action}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p className="page-description">{description}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}

export function StatCard({ label, value, hint }) {
  return (
    <article className="stat-card">
      <p>{label}</p>
      <strong>{value ?? "—"}</strong>
      {hint ? <small>{hint}</small> : null}
    </article>
  );
}

export function StatusBadge({ status }) {
  const normalized = String(status || "UNKNOWN").toLowerCase().replaceAll("_", "-");
  return <span className={`badge badge--${normalized}`}>{status || "Unknown"}</span>;
}

export function Section({ title, action, children }) {
  return (
    <section className="section-card">
      <div className="section-heading">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          {index ? <span aria-hidden="true">/</span> : null}
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-modal="true"
        className="modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="section-heading">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} type="button" aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
