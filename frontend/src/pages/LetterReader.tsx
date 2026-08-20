import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { collectionService } from "../services/api";
import LetterPaper from "../components/LetterPaper";
import "./LetterReader.css";

type Letter = {
  id: number;
  senderName: string;
  content: string;
  designConfig: { date?: string; signature?: string } | null;
  status: string;
  sentAt: string;
  openedAt: string | null;
};

export default function LetterReader() {
  const { token, id } = useParams<{ token: string; id: string }>();
  const navigate = useNavigate();
  const [letter, setLetter] = useState<Letter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    collectionService
      .openLetter(token!, Number(id))
      .then((res) => setLetter(res.data))
      .catch((err) => setError(err.response?.data?.error ?? "Lettre inaccessible"))
      .finally(() => setLoading(false));
  }, [token, id]);

  const handleExport = async () => {
    if (!paperRef.current || !letter) return;
    const canvas = await html2canvas(paperRef.current, { scale: 2, useCORS: true });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `lettre-de-${letter.senderName}.png`;
    a.click();
  };

  if (loading) return <div className="lr-loading"><div className="skeleton skeleton-card" /></div>;

  if (error) return (
    <div className="lr-error">
      <p>{error}</p>
      <button onClick={() => navigate(-1)} type="button">Retour</button>
    </div>
  );

  if (!letter) return null;

  return (
    <div className="lr">
      <header className="lr-header">
        <button
          className="lr-back"
          onClick={() => navigate(`/collections/${token}`)}
          type="button"
        >
          <ArrowLeft size={18} />
          Retour
        </button>
        <button className="lr-export" onClick={handleExport} type="button">
          <Download size={18} />
        </button>
      </header>

      <main className="lr-main">
        <LetterPaper
          ref={paperRef}
          senderName={letter.senderName}
          date={letter.designConfig?.date ?? new Date(letter.sentAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          body={letter.content}
          signature={letter.designConfig?.signature ?? letter.senderName}
          readOnly
        />
      </main>
    </div>
  );
}
