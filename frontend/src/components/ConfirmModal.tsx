import { TriangleAlert } from "lucide-react";
import "./ConfirmModal.css";

type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirmer",
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-wrap">
          <TriangleAlert size={28} color="var(--color-danger)" />
        </div>
        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn-ghost" onClick={onCancel} type="button">
            Annuler
          </button>
          <button
            className="btn-danger"
            onClick={onConfirm}
            disabled={loading}
            type="button"
          >
            {loading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
