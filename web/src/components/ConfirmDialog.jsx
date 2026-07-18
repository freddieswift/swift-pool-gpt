import { Modal } from "./ui.jsx";

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  tone = "danger",
  onConfirm,
  onClose,
  busy
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="modal-message">{message}</p>
      <div className="form-actions">
        <button className="button button--secondary" onClick={onClose} type="button">
          Cancel
        </button>
        <button
          className={tone === "danger" ? "button button--danger" : "button"}
          disabled={busy}
          onClick={onConfirm}
          type="button"
        >
          {busy ? "Working…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
