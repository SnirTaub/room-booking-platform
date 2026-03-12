import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/auth.context";

export function PageLayout({ title, children }: { title: string; children: ReactNode; }) {
  const { isAuthenticated, logout, userDisplayName } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-logo">Room booking platform</div>

        <nav className="app-nav">
          {!isAuthenticated && (
            <>
              <Link className="app-nav-link" to="/register">
                Register
              </Link>
              <Link className="app-nav-link" to="/login">
                Login
              </Link>
            </>
          )}
          <Link className="app-nav-link" to="/rooms">
            Search Rooms
          </Link>

          {isAuthenticated && (
            <>
              {userDisplayName && <span className="app-user-label">{userDisplayName}</span>}
              <button onClick={logout} type="button" className="btn btn-outline">
                Logout
              </button>
            </>
          )}
        </nav>
      </header>

      <main>
        <h1 className="app-main-title">{title}</h1>
        {children}
      </main>
    </div>
  );
}