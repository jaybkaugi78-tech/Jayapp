import {
  LogOut,
  Moon,
  Sun,
  X,
} from "lucide-react";

export default function SettingsPanel({
  person,
  theme,
  setTheme,
  close,
  onLogout,
}) {
  return (
    <div className="overlay">
      <aside className="panel">
        <div className="panel-head">
          <div>
            <h2>Settings</h2>
            <p>
              Personalize your space
            </p>
          </div>

          <button
            onClick={close}
          >
            <X />
          </button>
        </div>

        <div
          className={`big-avatar ${person.toLowerCase()}`}
        >
          {person[0]}
        </div>

        <button
          className="save-btn"
          onClick={() =>
            setTheme(
              theme === "dark"
                ? "light"
                : "dark"
            )
          }
        >
          {theme === "dark" ? (
            <Sun size={17} />
          ) : (
            <Moon size={17} />
          )}

          {theme === "dark"
            ? "Use light mode"
            : "Use dark mode"}
        </button>

        <button
          className="logout-btn"
          onClick={onLogout}
        >
          <LogOut size={17} />
          Sign out
        </button>
      </aside>
    </div>
  );
}