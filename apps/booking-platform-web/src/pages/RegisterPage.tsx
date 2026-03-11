import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth.api";
import { PageLayout } from "../components/layout/PageLayout";
import { useAuth } from "../context/auth.context";

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("StrongPass123!");
  const [fullName, setFullName] = useState("John Doe");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await registerUser({
        email,
        password,
        fullName,
      });

      login(result.accessToken);
      navigate("/rooms");
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageLayout title="Register">
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px", maxWidth: 400 }}>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </PageLayout>
  );
}