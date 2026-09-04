import {
  Check,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase";

export default function Reminders({
  person,
}) {
  const [reminders, setReminders] =
    useState([]);

  const [text, setText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // ============================
  // FIRESTORE LIVE REMINDERS
  // ============================

  useEffect(() => {
    const remindersRef =
      collection(
        db,
        "reminders"
      );

    const unsubscribe =
      onSnapshot(
        remindersRef,

        (snapshot) => {
          const loaded =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data(),
              })
            );

          /*
            Sort newest reminders first.

            Old/future reminders without
            createdAt still work.
          */

          loaded.sort(
            (a, b) => {
              const aTime =
                a.createdAt?.toMillis?.() ||
                0;

              const bTime =
                b.createdAt?.toMillis?.() ||
                0;

              return bTime - aTime;
            }
          );

          setReminders(
            loaded
          );

          setLoading(false);
          setError("");
        },

        (err) => {
          console.error(
            "Reminder listener error:",
            err
          );

          setLoading(false);

          setError(
            "Unable to load reminders."
          );
        }
      );

    return unsubscribe;
  }, []);

  // ============================
  // ADD REMINDER
  // ============================

  const add = async (e) => {
    e.preventDefault();

    const value =
      text.trim();

    if (!value) {
      return;
    }

    if (
      !auth.currentUser
    ) {
      setError(
        "You need to be signed in."
      );

      return;
    }

    setSaving(true);
    setError("");

    try {
      await addDoc(
        collection(
          db,
          "reminders"
        ),
        {
          text: value,

          owner:
            person,

          done:
            false,

          senderId:
            auth.currentUser.uid,

          createdAt:
            serverTimestamp(),
        }
      );

      setText("");
    } catch (err) {
      console.error(
        "Add reminder error:",
        err
      );

      setError(
        "Unable to add reminder."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // COMPLETE / UNCOMPLETE
  // ============================

  const toggle = async (
    reminder
  ) => {
    setError("");

    try {
      await updateDoc(
        doc(
          db,
          "reminders",
          reminder.id
        ),
        {
          done:
            !reminder.done,
        }
      );
    } catch (err) {
      console.error(
        "Toggle reminder error:",
        err
      );

      setError(
        "Unable to update reminder."
      );
    }
  };

  // ============================
  // DELETE
  // ============================

  const removeReminder =
    async (reminder) => {
      const owner =
        reminder.owner ||
        reminder.person ||
        "Unknown";

      if (
        owner !== person
      ) {
        setError(
          "You can only delete reminders you added."
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Delete this reminder?"
        );

      if (!confirmed) {
        return;
      }

      setError("");

      try {
        await deleteDoc(
          doc(
            db,
            "reminders",
            reminder.id
          )
        );
      } catch (err) {
        console.error(
          "Delete reminder error:",
          err
        );

        setError(
          "Unable to delete reminder."
        );
      }
    };

  // ============================
  // UI
  // ============================

  return (
    <section className="screen">
      <div className="section-head">
        <div>
          <h2>
            Reminders
          </h2>

          <p>
            Little things worth remembering
          </p>
        </div>

        <span className="online-pill">
          ● Live
        </span>
      </div>

      {error && (
        <div
          style={{
            marginBottom:
              "12px",
            color:
              "var(--danger)",
            fontSize:
              "12px",
          }}
        >
          {error}
        </div>
      )}

      <div className="reminder-list">
        {loading && (
          <div className="empty big">
            Loading reminders...
          </div>
        )}

        {!loading &&
          reminders.length ===
            0 && (
            <div className="empty big">
              No reminders yet.
            </div>
          )}

        {reminders.map(
          (reminder) => {
            const owner =
              reminder.owner ||
              reminder.person ||
              "Jay";

            const isMine =
              owner === person;

            return (
              <div
                className={`reminder-card ${
                  reminder.done
                    ? "done"
                    : ""
                }`}
                key={
                  reminder.id
                }
              >
                <div
                  className={`reminder-avatar ${
                    owner
                      .toLowerCase()
                      .includes(
                        "millie"
                      )
                      ? "millie"
                      : "jay"
                  }`}
                >
                  {owner[0]}
                </div>

                <div>
                  <strong>
                    {
                      reminder.text
                    }
                  </strong>

                  <small>
                    {owner}
                  </small>
                </div>

                <button
                  type="button"
                  className={`check ${
                    reminder.done
                      ? "checked"
                      : ""
                  }`}
                  onClick={() =>
                    toggle(
                      reminder
                    )
                  }
                  title={
                    reminder.done
                      ? "Mark incomplete"
                      : "Mark complete"
                  }
                >
                  {reminder.done ? (
                    <Check
                      size={19}
                    />
                  ) : (
                    <span />
                  )}
                </button>

                {isMine && (
                  <button
                    type="button"
                    className="delete-mini"
                    onClick={() =>
                      removeReminder(
                        reminder
                      )
                    }
                    title="Delete reminder"
                  >
                    <Trash2
                      size={16}
                    />
                  </button>
                )}
              </div>
            );
          }
        )}
      </div>

      <form
        className="add-bar"
        onSubmit={add}
      >
        <input
          className="field"
          value={text}
          placeholder="Add a reminder..."
          disabled={saving}
          onChange={(e) =>
            setText(
              e.target.value
            )
          }
        />

        <button
          type="submit"
          disabled={saving}
        >
          {saving
            ? "Adding..."
            : "Add"}
        </button>
      </form>
    </section>
  );
}