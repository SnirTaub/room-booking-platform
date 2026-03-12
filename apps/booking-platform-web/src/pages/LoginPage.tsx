import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth.api";
import { PageLayout } from "../components/layout/PageLayout";
import { useAuth } from "../context/auth.context";
import { getFriendlyErrorMessage } from "../utils/errorMessages";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginUser({ email, password });
      login(result.accessToken, email);
      navigate("/rooms");
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, "login"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageLayout title="Login to your account">
      <div className="card">
        <form onSubmit={handleSubmit} className="card-form">
          <div className="form-field">
            <label className="form-label">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>

          <div className="form-field">
            <label className="form-label">Password</label>
            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          {error && <p className="text-error">{error}</p>}
        </form>
      </div>
    </PageLayout>
  );
}