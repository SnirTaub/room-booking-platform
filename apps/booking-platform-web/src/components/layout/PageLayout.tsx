import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/auth.context";

export function PageLayout({ title, children }: { title: string; children: ReactNode; }) {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <nav style={{ display: "flex", gap: "12px" }}>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
          <Link to="/rooms">Search Rooms</Link>
        </nav>

        {isAuthenticated && (
          <button onClick={logout} type="button">
            Logout
          </button>
        )}
      </header>

      <h1>{title}</h1>
      {children}
    </div>
  );
}