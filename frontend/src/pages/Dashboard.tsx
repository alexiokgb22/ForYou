import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Plus, Link, Trash2, Lock, Unlock, Mail, ChevronRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { authService, collectionService } from "../services/api";
import CreateCollectionModal from "../components/CreateCollectionModal";
import ConfirmModal from "../components/ConfirmModal";
import "./Dashboard.css";

type Collection = {
  id: number;
  title: string;
  publicToken: string;
  readingMode: "IMMEDIATE" | "SCHEDULED";
  unlockDate: string | null;
  _count: { letters: number };
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    collectionService
      .getMine()
      .then((res) => setCollections(res.data))
      .finally(() => setCollectionsLoading(false));
  }, [user]);

  const handleCreated = (collection: Collection) => {
    setCollections((prev) => [collection, ...prev]);
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeletingId(confirmId);
    try {
      await collectionService.delete(confirmId);
      setCollections((prev) => prev.filter((c) => c.id !== confirmId));
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const handleCopy = (token: string) => {
    const link = `${window.location.origin}/write/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  if (authLoading) return <DashboardSkeleton />;
  if (!user) return null;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-user">
          {user.avatarUrl ? (
            <img className="dashboard-avatar" src={user.avatarUrl} alt={user.name} />
          ) : (
            <div className="dashboard-avatar-placeholder">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="dashboard-welcome">Bonjour,</p>
            <p className="dashboard-name">{user.name}</p>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout} type="button">
          <LogOut size={18} />
        </button>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">Mes collections</h2>
          <button className="btn-new" onClick={() => setShowModal(true)} type="button">
            <Plus size={16} />
            Recevoir des lettres
          </button>
        </div>

        {collectionsLoading ? (
          <div className="collections-list">
            {[1, 2].map((i) => <div key={i} className="skeleton skeleton-card" />)}
          </div>
        ) : collections.length === 0 ? (
          <div className="dashboard-empty">
            <Mail size={48} strokeWidth={1.2} color="var(--color-border)" />
            <p>Aucune collection pour l'instant</p>
            <p className="dashboard-empty-sub">
              Crée ta première collection et partage le lien à tes proches.
            </p>
          </div>
        ) : (
          <div className="collections-list">
            {collections.map((col) => (
              <div
                key={col.id}
                className="collection-card"
                onClick={() => navigate(`/collections/${col.publicToken}`)}
              >
                <div className="collection-card-top">
                  <div className="collection-card-info">
                    <p className="collection-title">{col.title}</p>
                    <div className="collection-meta">
                      <span className="collection-count">
                        {col._count.letters} lettre{col._count.letters !== 1 ? "s" : ""}
                      </span>
                      <span className="meta-dot">·</span>
                      {col.readingMode === "IMMEDIATE" ? (
                        <span className="badge badge-unlocked">
                          <Unlock size={11} />
                          Lecture libre
                        </span>
                      ) : (
                        <span className="badge badge-locked">
                          <Lock size={11} />
                          {col.unlockDate ? new Date(col.unlockDate).toLocaleDateString("fr-FR") : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--color-text-muted)" />
                </div>

                <div className="collection-card-actions">
                  <button
                    className="btn-copy"
                    onClick={(e) => { e.stopPropagation(); handleCopy(col.publicToken); }}
                    type="button"
                  >
                    <Link size={14} />
                    {copiedToken === col.publicToken ? "Lien copié !" : "Copier le lien"}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={(e) => { e.stopPropagation(); setConfirmId(col.id); }}
                    type="button"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <CreateCollectionModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {confirmId && (
        <ConfirmModal
          title="Supprimer la collection ?"
          message="Toutes les lettres associées seront définitivement supprimées."
          confirmLabel="Supprimer"
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
          loading={deletingId === confirmId}
        />
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="dashboard-loading">
      <div className="skeleton skeleton-avatar" />
      <div className="skeleton skeleton-text" />
    </div>
  );
}
