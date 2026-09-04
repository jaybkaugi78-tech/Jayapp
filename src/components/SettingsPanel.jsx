import {
  Bell,
  Check,
  LogOut,
  Moon,
  Sun,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  enablePushNotifications,
} from "../pushNotifications";

export default function SettingsPanel({
  person,
  theme,
  setTheme,
  close,
  onLogout,
}) {
  const [
    pushStatus,
    setPushStatus,
  ] = useState("");

  const [
    enablingPush,
    setEnablingPush,
  ] = useState(false);

  const enableNotifications =
    async () => {
      try {
        setEnablingPush(true);
        setPushStatus("");

        await enablePushNotifications(
          person
        );

        setPushStatus(
          "enabled"
        );
      } catch (err) {
        console.error(
          "Push notification setup error:",
          err
        );

        setPushStatus(
          err.message ||
            "Unable to enable notifications."
        );
      } finally {
        setEnablingPush(
          false
        );
      }
    };

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
          onClick={
            enableNotifications
          }
          disabled={
            enablingPush
          }
        >
          {pushStatus ===
          "enabled" ? (
            <Check size={17} />
          ) : (
            <Bell size={17} />
          )}

          {enablingPush
            ? "Enabling notifications..."
            : pushStatus ===
                "enabled"
              ? "Phone notifications enabled"
              : "Enable phone notifications"}
        </button>

        {pushStatus &&
          pushStatus !==
            "enabled" && (
            <p
              className="muted"
              style={{
                marginTop: 8,
                textAlign:
                  "center",
              }}
            >
              {pushStatus}
            </p>
          )}

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