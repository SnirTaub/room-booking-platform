import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth.api";
import { PageLayout } from "../components/layout/PageLayout";
import { getFriendlyErrorMessage } from "../utils/errorMessages";
import { saveUserProfile } from "../utils/storage";

export function RegisterPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!fullName || !email || !password) {
      setError("Please fill in your full name, email, and password.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({ email, password, fullName });
      saveUserProfile(email, fullName);
      navigate("/login");
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, "register"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageLayout title="Create your account">
      <div className="card">
        <form onSubmit={handleSubmit} className="card-form">
          <div className="form-field">
            <label className="form-label">Full name</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="form-field">
            <label className="form-label">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>

          <div className="form-field">
            <label className="form-label">Password</label>
            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? "Registering..." : "Register"}
          </button>

          {error && <p className="text-error">{error}</p>}
        </form>
      </div>
    </PageLayout>
  );
}