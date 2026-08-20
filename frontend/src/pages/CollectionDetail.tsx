import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check, Lock, Unlock, Mail } from "lucide-react";
import { collectionService } from "../services/api";
import "./CollectionDetail.css";

type Collection = {
  id: number;
  title: string;
  publicToken: string;
  readingMode: "IMMEDIATE" | "SCHEDULED";
  unlockDate: string | null;
  _count: { letters: number };
};

type Letter = {
  id: number;
  senderName: string;
  theme: string;
  status: "SENT" | "OPENED";
  sentAt: string;
};

export default function CollectionDetail() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [canOpen, setCanOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      collectionService.getOne(token!),
      collectionService.getLetters(token!),
    ])
      .then(([colRes, lettersRes]) => {
        setCollection(colRes.data);
        setLetters(lettersRes.data.letters);
        setCanOpen(lettersRes.data.canOpen);
      })
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleCopy = () => {
    const link = `${window.location.origin}/write/${token}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLetterClick = (letter: Letter) => {
    if (!canOpen) return;
    navigate(`/collections/${token}/letters/${letter.id}`);
  };

  if (loading) return <div className="cd-loading"><div className="skeleton skeleton-card" /></div>;
  if (!collection) return null;

  const writeLink = `${window.location.origin}/write/${token}`;
  const unreadCount = letters.filter((l) => l.status === "SENT").length;

  return (
    <div className="cd">
      <header className="cd-header">
        <button className="cd-back" onClick={() => navigate("/dashboard")} type="button">
          <ArrowLeft size={18} />
          Retour
        </button>
        <h1 className="cd-title">{collection.title}</h1>
        <div className="cd-link-row">
          <p className="cd-link-text">{writeLink}</p>
          <button className="cd-copy-btn" onClick={handleCopy} type="button">
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Copié" : "Copier"}
          </button>
        </div>
      </header>

      <main className="cd-main">
        <div className="cd-meta">
          {collection.readingMode === "IMMEDIATE" ? (
            <span className="badge badge-unlocked">
              <Unlock size={12} />
              Lecture libre
            </span>
          ) : (
            <span className="badge badge-locked">
              <Lock size={12} />
              Jour J : {collection.unlockDate
                ? new Date(collection.unlockDate).toLocaleDateString("fr-FR")
                : ""}
            </span>
          )}
          <span className="cd-count">
            {collection._count.letters} lettre{collection._count.letters !== 1 ? "s" : ""}
            {unreadCount > 0 && (
              <span className="cd-unread-badge">{unreadCount} nouvelle{unreadCount > 1 ? "s" : ""}</span>
            )}
          </span>
        </div>

        {!canOpen && collection.readingMode === "SCHEDULED" && (
          <div className="cd-locked-banner">
            <Lock size={16} />
            <p>Les lettres seront lisibles le {collection.unlockDate
              ? new Date(collection.unlockDate).toLocaleDateString("fr-FR")
              : ""}
            </p>
          </div>
        )}

        {letters.length === 0 ? (
          <div className="cd-empty">
            <Mail size={52} strokeWidth={1.2} color="var(--color-border)" />
            <p>Aucune lettre reçue pour l'instant</p>
            <p className="cd-empty-sub">Partage le lien ci-dessus à tes proches.</p>
          </div>
        ) : (
          <div className="cd-letters-grid">
            {letters.map((letter) => (
              <div
                key={letter.id}
                className={`cd-envelope ${!canOpen ? "locked" : ""} ${letter.status === "SENT" ? "unread" : ""}`}
                onClick={() => handleLetterClick(letter)}
              >
                {letter.status === "SENT" && <span className="cd-envelope-dot" />}
                <div className="cd-envelope-icon">
                  {canOpen ? (
                    <Mail size={28} color="var(--color-primary)" strokeWidth={1.5} />
                  ) : (
                    <Lock size={24} color="var(--color-locked)" strokeWidth={1.5} />
                  )}
                </div>
                <p className="cd-envelope-name">{letter.senderName}</p>
                <p className="cd-envelope-date">
                  {new Date(letter.sentAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
