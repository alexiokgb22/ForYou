import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { writeService } from "../services/api";
import "./WriteLetter.css";

type Collection = {
  title: string;
  readingMode: string;
  unlockDate: string | null;
  user: { name: string };
};

const THEMES = [
  { id: "default", label: "Classique", bg: "#FFFFFF", font: "Georgia, serif", accent: "#C97C5D" },
  { id: "sage", label: "Sauge", bg: "#F0F4EE", font: "Georgia, serif", accent: "#7A8B6F" },
  { id: "sand", label: "Sable", bg: "#FAF6F0", font: "'Palatino Linotype', serif", accent: "#D4AF6A" },
  { id: "night", label: "Nuit", bg: "#1E1E2E", font: "Georgia, serif", accent: "#C97C5D" },
  { id: "rose", label: "Rose", bg: "#FDF0F0", font: "Georgia, serif", accent: "#C0503D" },
];

export default function WriteLetter() {
  const { token } = useParams<{ token: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [content, setContent] = useState("");
  const [theme, setTheme] = useState("default");

  useEffect(() => {
    writeService
      .getCollection(token!)
      .then((res) => setCollection(res.data))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await writeService.submitLetter(token!, {
        senderName,
        senderEmail: senderEmail || undefined,
        content,
        theme,
      });
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTheme = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  if (loading) return <div className="wl-loading"><div className="skeleton skeleton-card" /></div>;
  if (!collection) return <div className="wl-error">Lien invalide ou expiré.</div>;
  if (sent) return <SendConfirmation recipientName={collection.user.name} />;

  return (
    <div className="wl">
      <header className="wl-header">
        <img src="/logomodif.png" alt="ForYou" className="wl-logo" />
        <p className="wl-context">Pour <strong>{collection.user.name}</strong> · {collection.title}</p>
      </header>

      <div className="wl-steps">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`wl-step-dot ${step >= s ? "active" : ""}`} />
        ))}
      </div>

      <main className="wl-main">
        {step === 1 && (
          <div className="wl-section">
            <h2 className="wl-title">Qui es-tu ?</h2>
            <p className="wl-subtitle">Ton prénom apparaîtra sur l'enveloppe.</p>
            <div className="wl-fields">
              <input
                className="wl-input"
                type="text"
                placeholder="Ton prénom *"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                autoComplete="given-name"
                autoFocus
              />
              <input
                className="wl-input"
                type="email"
                placeholder="Ton email (optionnel)"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                inputMode="email"
                autoComplete="email"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="wl-section">
            <h2 className="wl-title">Écris ta lettre</h2>
            <p className="wl-subtitle">Parle du fond du cœur.</p>
            <textarea
              className="wl-textarea"
              placeholder={`Chère ${collection.user.name},\n\n...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />
            <p className="wl-char-count">{content.length} caractères</p>
          </div>
        )}

        {step === 3 && (
          <div className="wl-section">
            <h2 className="wl-title">Choisis un thème</h2>
            <p className="wl-subtitle">L'ambiance visuelle de ta lettre.</p>

            <div className="wl-themes">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  className={`wl-theme-btn ${theme === t.id ? "active" : ""}`}
                  style={{ background: t.bg, borderColor: theme === t.id ? t.accent : "transparent" }}
                  onClick={() => setTheme(t.id)}
                  type="button"
                >
                  <span className="wl-theme-preview" style={{ fontFamily: t.font, color: t.accent }}>Aa</span>
                  <span className="wl-theme-label" style={{ color: t.id === "night" ? "#fff" : "#2E2A25" }}>{t.label}</span>
                </button>
              ))}
            </div>

            <div
              className="wl-preview"
              style={{ background: selectedTheme.bg, fontFamily: selectedTheme.font }}
            >
              <p className="wl-preview-sender" style={{ color: selectedTheme.accent }}>
                De la part de {senderName || "toi"}
              </p>
              <p className="wl-preview-content" style={{ color: selectedTheme.id === "night" ? "#e0ddd8" : "#2E2A25" }}>
                {content || "Ta lettre apparaîtra ici..."}
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="wl-footer">
        {step > 1 && (
          <button className="btn-ghost" onClick={() => setStep((s) => s - 1)} type="button">
            <ArrowLeft size={16} />
            Retour
          </button>
        )}
        {step < 3 ? (
          <button
            className="btn-primary"
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 1 && !senderName.trim()}
            type="button"
          >
            Suivant
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            type="button"
          >
            {submitting ? "Envoi..." : "Envoyer ma lettre"}
            {!submitting && <Send size={16} />}
          </button>
        )}
      </footer>
    </div>
  );
}

function SendConfirmation({ recipientName }: { recipientName: string }) {
  return (
    <div className="wl-confirmation">
      <div className="wl-envelope">
        <div className="wl-envelope-body" />
        <div className="wl-envelope-flap" />
        <div className="wl-envelope-seal" />
      </div>
      <h2 className="wl-confirmation-title">Lettre envoyée !</h2>
      <p className="wl-confirmation-sub">
        {recipientName} recevra ta lettre au moment venu.
      </p>
    </div>
  );
}
