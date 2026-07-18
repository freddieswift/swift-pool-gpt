import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export function LoginPage() {
  const { user, login } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "", rememberMe: true });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (user) return <Navigate replace to="/app" />;

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(form);
      show("Welcome back");
      navigate(location.state?.from?.pathname || "/app", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Sign in" subtitle="Manage your leagues, teams and match nights.">
      <form className="form-stack" onSubmit={submit}>
        {error ? <div className="form-error">{error}</div> : null}
        <label>Email<input autoComplete="email" required type="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<input autoComplete="current-password" required type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <label className="checkbox"><input checked={form.rememberMe} type="checkbox"
          onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })} /> Keep me signed in</label>
        <button className="button button--full" disabled={submitting} type="submit">
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="auth-switch">New to SwiftPool? <Link to="/register">Create an account</Link></p>
    </AuthCard>
  );
}

export function RegisterPage() {
  const { user, register } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (user) return <Navigate replace to="/app" />;

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
      show("Account created. You can now sign in.");
      navigate("/login");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Create account" subtitle="Start administering a SwiftPool league.">
      <form className="form-stack" onSubmit={submit}>
        {error ? <div className="form-error">{error}</div> : null}
        <div className="form-row">
          <label>First name<input required value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></label>
          <label>Last name<input required value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></label>
        </div>
        <label>Email<input required type="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<input minLength="10" required type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <label>Confirm password<input minLength="10" required type="password" value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} /></label>
        <button className="button button--full" disabled={submitting} type="submit">
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
    </AuthCard>
  );
}

function AuthCard({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">SwiftPool control room</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </section>
    </div>
  );
}
