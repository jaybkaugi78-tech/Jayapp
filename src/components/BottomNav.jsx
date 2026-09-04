import {
  Bell,
  CalendarDays,
  Gamepad2,
  Image,
  MessageCircle,
} from "lucide-react";

export default function BottomNav({
  tab,
  setTab,
}) {
  const items = [
    {
      id: "chat",
      label: "Chat",
      icon: MessageCircle,
    },
    {
      id: "planner",
      label: "Planner",
      icon: CalendarDays,
    },
    {
      id: "reminders",
      label: "Reminders",
      icon: Bell,
    },
    {
      id: "media",
      label: "Media",
      icon: Image,
    },
    {
      id: "game",
      label: "Game",
      icon: Gamepad2,
    },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            className={
              tab === item.id
                ? "active"
                : ""
            }
            onClick={() =>
              setTab(item.id)
            }
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}