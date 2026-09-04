import {
  Bell,
  Menu,
} from "lucide-react";

export default function Header({
  person,
  notificationCount = 0,
  onMenu,
  onNotifications,
}) {
  return (
    <header className="header">
      <div className="brand">
        <div className="avatar-stack">
          <div className="avatar jay">
            J
          </div>

          <div className="avatar millie">
            M
          </div>
        </div>

        <div>
          <strong>Jay & Millie</strong>

          <small>
            <span className="online-dot" />
            Signed in as {person}
          </small>
        </div>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="icon-btn notif-btn"
          onClick={onNotifications}
          aria-label="Notifications"
        >
          <Bell size={18} />

          {notificationCount > 0 && (
            <span>
              {notificationCount > 9
                ? "9+"
                : notificationCount}
            </span>
          )}
        </button>

        <button
          type="button"
          className="icon-btn"
          onClick={onMenu}
          aria-label="Menu"
        >
          <Menu size={19} />
        </button>
      </div>
    </header>
  );
}