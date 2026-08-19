import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="skeleton skeleton-avatar" />
        <div className="skeleton skeleton-text" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

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
          Déconnexion
        </button>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-empty">
          <span className="dashboard-empty-icon">💌</span>
          <p>Ton espace est prêt.</p>
          <p className="dashboard-empty-sub">Bientôt, tes lettres apparaîtront ici.</p>
        </div>
      </main>
    </div>
  );
}
