import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Link, Trash2, Lock, Unlock, Mail, ChevronRight, ChevronDown, LogOut } from "lucide-react";
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
  unreadCount: number;
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <img
          src="/logomodif.png"
          alt="ForYou"
          className="dashboard-logo"
        />
        <div className="dashboard-user-menu" ref={dropdownRef}>
          <button
            className="dashboard-user-btn"
            onClick={() => setDropdownOpen((o) => !o)}
            type="button"
          >
            {user.avatarUrl ? (
              <img className="dashboard-avatar" src={user.avatarUrl} alt={user.name} />
            ) : (
              <div className="dashboard-avatar-placeholder">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="dashboard-user-name">{user.name}</span>
            <ChevronDown size={16} color="var(--color-text-muted)" />
          </button>
          {dropdownOpen && (
            <div className="dashboard-dropdown">
              <button className="dropdown-item" onClick={handleLogout} type="button">
                <LogOut size={15} />
                Déconnexion
              </button>
            </div>
          )}
        </div>
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
                    <div className="collection-title-row">
                      <p className="collection-title">{col.title}</p>
                      {col.unreadCount > 0 && (
                        <span className="collection-unread-dot">{col.unreadCount}</span>
                      )}
                    </div>
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
