import {
  Bell,
  CheckCheck,
  Trash2,
  X,
} from "lucide-react";

export default function NotificationsPanel({
  notifications = [],
  close,
  markAllRead,
  clearNotifications,
}) {
  const formatTime = (value) => {
    if (!value) return "";

    const date =
      value?.toDate?.() ||
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    return date.toLocaleString();
  };

  return (
    <div className="overlay">
      <aside className="panel">
        <div className="panel-head">
          <div>
            <h2>
              Notifications
            </h2>

            <p>
              Recent activity
            </p>
          </div>

          <button
            type="button"
            onClick={close}
          >
            <X />
          </button>
        </div>

        {notifications.length >
          0 && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom:
                "14px",
            }}
          >
            <button
              type="button"
              className="new-game"
              onClick={
                markAllRead
              }
            >
              <CheckCheck
                size={15}
              />
              &nbsp; Mark read
            </button>

            <button
              type="button"
              className="new-game"
              onClick={
                clearNotifications
              }
            >
              <Trash2
                size={15}
              />
              &nbsp; Clear
            </button>
          </div>
        )}

        <div className="notification-list">
          {notifications.length ===
            0 && (
            <div className="empty big">
              Nothing new.
            </div>
          )}

          {notifications.map(
            (item) => (
              <div
                className={`notification ${
                  item.read
                    ? ""
                    : "unread"
                }`}
                key={
                  item.id
                }
              >
                <div className="notif-icon">
                  <Bell
                    size={16}
                  />
                </div>

                <div>
                  <strong>
                    {
                      item.title
                    }
                  </strong>

                  <p>
                    {item.text}
                  </p>

                  {item.createdAt && (
                    <small>
                      {formatTime(
                        item.createdAt
                      )}
                    </small>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </aside>
    </div>
  );
}