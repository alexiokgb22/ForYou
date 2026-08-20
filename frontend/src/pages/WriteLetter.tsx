import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { writeService } from "../services/api";
import LetterPaper from "../components/LetterPaper";
import "./WriteLetter.css";

type Collection = {
  title: string;
  readingMode: string;
  unlockDate: string | null;
  user: { name: string };
};

export default function WriteLetter() {
  const { token } = useParams<{ token: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [date, setDate] = useState("");
  const [body, setBody] = useState("");
  const [signature, setSignature] = useState("");

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
        content: body,
        theme: "default",
        designConfig: { date, signature },
      });
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

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
        {[1, 2].map((s) => (
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
            <LetterPaper
              recipientName={collection.user.name}
              date={date}
              body={body}
              signature={signature}
              onDateChange={setDate}
              onBodyChange={setBody}
              onSignatureChange={setSignature}
            />
            <p className="wl-char-count">{body.length} / 1200</p>
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
        {step < 2 ? (
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
            disabled={!body.trim() || submitting}
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
