import { useState } from "react";
import { Heart } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function Login({ setPerson }) {
  const [selectedPerson, setSelectedPerson] = useState("Jay");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const email =
        selectedPerson === "Jay"
          ? import.meta.env.VITE_JAY_EMAIL
          : import.meta.env.VITE_MILLIE_EMAIL;

      if (!email) {
        throw new Error(
          `Missing email for ${selectedPerson} in .env`
        );
      }

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      localStorage.setItem(
        "jm-session",
        selectedPerson
      );

      setPerson(selectedPerson);
    } catch (err) {
  console.error("FIREBASE LOGIN ERROR:", err);

  setError(
    `${err.code || "Firebase error"}: ${
      err.message || "Unable to sign in"
    }`
  );
} finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="ambient a1" />
      <div className="ambient a2" />

      <section className="login-card">
        <div className="login-logo">
          <Heart size={30} />
        </div>

        <h1>Jay & Millie</h1>

        <p className="muted">
          A private space for two ♡
        </p>

        <div className="people-pick">
          {["Jay", "Millie"].map((name) => (
            <button
              key={name}
              type="button"
              className={`person-card ${
                selectedPerson === name ? "selected" : ""
              } ${name.toLowerCase()}`}
              onClick={() => {
                setSelectedPerson(name);
                setPassword("");
                setError("");
              }}
            >
              <div className={`avatar ${name.toLowerCase()}`}>
                {name[0]}
              </div>

              <strong>{name}</strong>

              <span>
                {name === "Jay"
                  ? "Purple side"
                  : "Rose side"}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={login}>
          <input
            className="field"
            type="password"
            placeholder={`${selectedPerson}'s password`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button
            className={`enter-btn ${selectedPerson.toLowerCase()}`}
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : `Continue as ${selectedPerson}`}
          </button>
        </form>

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}