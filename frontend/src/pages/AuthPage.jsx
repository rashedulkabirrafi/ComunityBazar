import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { Eye, EyeOff, ArrowRight, Leaf } from "lucide-react";
import auth from "../firebase/firebase.config";
import { AuthContext } from "../Provider/AuthProvider";
import { api } from "../lib/api";
import { Brand, Field, Notice } from "../ui/shared";
const errors = {
  "auth/invalid-credential": "The email or password is incorrect.",
  "auth/email-already-in-use":
    "An account with this email already exists. Try logging in.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/network-request-failed":
    "Check your internet connection and try again.",
  "auth/weak-password": "Choose a password with at least 10 characters.",
};
export default function AuthPage({ register = false }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [show, setShow] = useState(false),
    [email, setEmail] = useState("");
  const { refreshProfile } = useContext(AuthContext),
    navigate = useNavigate(),
    location = useLocation();
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const form = new FormData(e.currentTarget);
    try {
      if (register) {
        await createUserWithEmailAndPassword(auth, email, form.get("password"));
        await updateProfile(auth.currentUser, {
          displayName: form.get("name"),
        });
        await api("/users", {
          method: "POST",
          body: { name: form.get("name") },
        });
        await refreshProfile();
      } else
        await signInWithEmailAndPassword(auth, email, form.get("password"));
      const destination =
        typeof location.state === "string" &&
        location.state.startsWith("/") &&
        !location.state.startsWith("//")
          ? location.state
          : "/dashboard/MyProfile";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        errors[err.code] ||
          err.message ||
          "We couldn’t sign you in. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function reset() {
    if (!email) {
      setError("Enter your email address above first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setNotice(
        "If an account exists, password reset instructions are on their way.",
      );
    } catch (err) {
      setError(
        errors[err.code] || "Enter a valid email address and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-layout">
      <title>{`${register ? "Join the community" : "Welcome back"} — ComunityBazar`}</title>
      <aside className="auth-aside">
        <Brand />
        <div>
          <p className="eyebrow">A LITTLE CLOSER TO SOMETHING GOOD</p>
          <h2>
            Good things
            <br />
            bring people
            <br />
            together.
          </h2>
          <p>
            Your next favorite might be right around the corner. Make room for a
            little possibility.
          </p>
        </div>
        <p className="auth-note">
          <Leaf size={20} />
          <br />
          Buy thoughtfully. Sell simply.
          <br />
          Give good things a second life.
        </p>
      </aside>
      <div className="auth-main">
        <p className="eyebrow">
          {register ? "MAKE YOURSELF AT HOME" : "YOUR COMMUNITY IS HERE"}
        </p>
        <h1>{register ? "Join the community." : "Welcome back."}</h1>
        <p>
          {register
            ? "A new beginning for you and your next great find."
            : "Sign in to pick up where you left off."}
        </p>
        <Notice message={error} tone="error" />
        <Notice message={notice} />
        <form onSubmit={submit}>
          {register && (
            <Field label="Your name">
              <input
                name="name"
                required
                maxLength={80}
                autoComplete="name"
                placeholder="How should we call you?"
              />
            </Field>
          )}
          <Field label="Email address">
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </Field>
          <Field
            label="Password"
            controlId="password"
            hintId="password-hint"
            hint={
              register
                ? "Use at least 10 characters. A unique passphrase works well."
                : null
            }
          >
            <div className="password-wrap">
              <input
                id="password"
                type={show ? "text" : "password"}
                name="password"
                minLength={register ? 10 : 1}
                required
                aria-describedby={register ? "password-hint" : undefined}
                autoComplete={register ? "new-password" : "current-password"}
                placeholder={
                  register ? "Create a secure password" : "Enter your password"
                }
              />
              <button
                className="icon-button"
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>
          {!register && (
            <div className="auth-help">
              <button
                type="button"
                className="text-link"
                disabled={busy}
                onClick={reset}
              >
                Forgot your password?
              </button>
            </div>
          )}
          <button disabled={busy} className="button full">
            {busy ? "One moment…" : register ? "Create your account" : "Log in"}
            <ArrowRight size={17} />
          </button>
          {register && (
            <p className="auth-footer">
              Read how we handle your data in our{" "}
              <Link to="/privacy">privacy information</Link>.
            </p>
          )}
        </form>
        <p className="auth-footer">
          {register ? "Already feel at home?" : "New around here?"}{" "}
          <Link state={location.state} to={register ? "/Login" : "/Register"}>
            {register ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
