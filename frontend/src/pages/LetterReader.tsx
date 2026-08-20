import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { collectionService } from "../services/api";
import "./LetterReader.css";

type Letter = {
  id: number;
  senderName: string;
  content: string;
  theme: string;
  status: string;
  sentAt: string;
  openedAt: string | null;
};

const THEMES: Record<string, { bg: string; font: string; accent: string; text: string }> = {
  default: { bg: "#FFFFFF", font: "Georgia, serif", accent: "#C97C5D", text: "#2E2A25" },
  sage:    { bg: "#F0F4EE", font: "Georgia, serif", accent: "#7A8B6F", text: "#2E2A25" },
  sand:    { bg: "#FAF6F0", font: "'Palatino Linotype', serif", accent: "#D4AF6A", text: "#2E2A25" },
  night:   { bg: "#1E1E2E", font: "Georgia, serif", accent: "#C97C5D", text: "#E0DDD8" },
  rose:    { bg: "#FDF0F0", font: "Georgia, serif", accent: "#C0503D", text: "#2E2A25" },
};

export default function LetterReader() {
  const { token, id } = useParams<{ token: string; id: string }>();
  const navigate = useNavigate();
  const [letter, setLetter] = useState<Letter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    collectionService
      .openLetter(token!, Number(id))
      .then((res) => setLetter(res.data))
      .catch((err) => setError(err.response?.data?.error ?? "Lettre inaccessible"))
      .finally(() => setLoading(false));
  }, [token, id]);

  const handleExport = () => {
    if (!letter) return;
    const blob = new Blob(
      [`De : ${letter.senderName}\nDate : ${new Date(letter.sentAt).toLocaleDateString("fr-FR")}\n\n${letter.content}`],
      { type: "text/plain;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lettre-de-${letter.senderName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="lr-loading"><div className="skeleton skeleton-card" /></div>;

  if (error) return (
    <div className="lr-error">
      <p>{error}</p>
      <button onClick={() => navigate(-1)} type="button">Retour</button>
    </div>
  );

  if (!letter) return null;

  const theme = THEMES[letter.theme] ?? THEMES.default;

  return (
    <div className="lr" style={{ background: theme.bg }}>
      <header className="lr-header" style={{ borderBottomColor: `${theme.accent}30` }}>
        <button
          className="lr-back"
          onClick={() => navigate(`/collections/${token}`)}
          type="button"
          style={{ color: theme.accent }}
        >
          <ArrowLeft size={18} />
          Retour
        </button>
        <button className="lr-export" onClick={handleExport} type="button" style={{ color: theme.accent }}>
          <Download size={18} />
        </button>
      </header>

      <main className="lr-main">
        <div className="lr-meta">
          <p className="lr-sender" style={{ color: theme.accent, fontFamily: theme.font }}>
            De la part de {letter.senderName}
          </p>
          <p className="lr-date" style={{ color: `${theme.text}80` }}>
            {new Date(letter.sentAt).toLocaleDateString("fr-FR", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>

        <div className="lr-divider" style={{ background: `${theme.accent}30` }} />

        <p
          className="lr-content"
          style={{ fontFamily: theme.font, color: theme.text }}
        >
          {letter.content}
        </p>
      </main>
    </div>
  );
}
