import {
  Bell,
  CalendarDays,
  Gamepad2,
  Heart,
  Image,
  LogOut,
  MessageCircle,
  Settings,
  X,
} from "lucide-react";

export default function MenuPanel({
  setTab,
  close,
  openSettings,
  openNotifications,
  onLogout,
}) {
  const go = (tab) => {
    setTab(tab);
    close();
  };

  return (
    <div className="overlay">
      <aside className="menu-panel">
        <button
          className="menu-x"
          onClick={close}
        >
          <X />
        </button>

        <div className="menu-logo">
          <Heart />
        </div>

        <h2>Jay & Millie</h2>
        <p>Your private space.</p>

        <div className="menu-links">
          <button
            onClick={() =>
              go("chat")
            }
          >
            <MessageCircle />
            Messages
          </button>

          <button
            onClick={() =>
              go("planner")
            }
          >
            <CalendarDays />
            Planner
          </button>

          <button
            onClick={() =>
              go("reminders")
            }
          >
            <Bell />
            Reminders
          </button>

          <button
            onClick={() =>
              go("media")
            }
          >
            <Image />
            Memories
          </button>

          <button
            onClick={() =>
              go("game")
            }
          >
            <Gamepad2 />
            Game
          </button>

          <button
            onClick={() => {
              close();
              openNotifications();
            }}
          >
            <Bell />
            Notifications
          </button>

          <button
            onClick={() => {
              close();
              openSettings();
            }}
          >
            <Settings />
            Settings
          </button>

          <button
            onClick={onLogout}
          >
            <LogOut />
            Sign out
          </button>
        </div>
      </aside>
    </div>
  );
}