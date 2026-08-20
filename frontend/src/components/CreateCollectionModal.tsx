import { useState, FormEvent } from "react";
import { Unlock, Lock } from "lucide-react";
import { collectionService } from "../services/api";
import "./CreateCollectionModal.css";

type Props = {
  onClose: () => void;
  onCreated: (collection: any) => void;
};

export default function CreateCollectionModal({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [readingMode, setReadingMode] = useState<"IMMEDIATE" | "SCHEDULED">("IMMEDIATE");
  const [unlockDate, setUnlockDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await collectionService.create({
        title,
        readingMode,
        unlockDate: readingMode === "SCHEDULED" ? unlockDate : undefined,
      });
      onCreated(res.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <h2 className="modal-title">Nouvelle collection</h2>
        <p className="modal-subtitle">Tes proches écriront leurs lettres via un lien unique.</p>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="modal-label">
            Nom de la collection
            <input
              className="modal-input"
              type="text"
              placeholder="Ex : Mon anniversaire 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </label>

          <fieldset className="modal-fieldset">
            <legend className="modal-label">Mode de lecture</legend>
            <div className="modal-modes">
              <button
                type="button"
                className={`modal-mode-btn ${readingMode === "IMMEDIATE" ? "active" : ""}`}
                onClick={() => setReadingMode("IMMEDIATE")}
              >
                <span className="modal-mode-icon"><Unlock size={20} /></span>
                <span className="modal-mode-name">Lecture libre</span>
                <span className="modal-mode-desc">Tes proches peuvent lire dès l'envoi</span>
              </button>
              <button
                type="button"
                className={`modal-mode-btn ${readingMode === "SCHEDULED" ? "active" : ""}`}
                onClick={() => setReadingMode("SCHEDULED")}
              >
                <span className="modal-mode-icon"><Lock size={20} /></span>
                <span className="modal-mode-name">Jour J</span>
                <span className="modal-mode-desc">Lettres scellées jusqu'à une date</span>
              </button>
            </div>
          </fieldset>

          {readingMode === "SCHEDULED" && (
            <label className="modal-label">
              Date de lecture
              <input
                className="modal-input"
                type="date"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </label>
          )}

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "..." : "Créer le lien"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
