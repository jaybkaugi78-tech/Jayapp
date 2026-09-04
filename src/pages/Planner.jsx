import {
  ChevronLeft,
  ChevronRight,
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
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase";

export default function Planner({
  person,
}) {
  const today = new Date();

  const [viewDate, setViewDate] =
    useState(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );

  const [selectedDate, setSelectedDate] =
    useState(
      today
        .toISOString()
        .split("T")[0]
    );

  const [events, setEvents] =
    useState([]);

  const [title, setTitle] =
    useState("");

  const [note, setNote] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // ============================
  // FIRESTORE EVENTS
  // ============================

  useEffect(() => {
    const eventsRef =
      collection(
        db,
        "events"
      );

    /*
      We don't order the query by
      date/timestamp here because
      old events may not contain
      the newer fields.

      This keeps old planner data
      compatible.
    */

    const unsubscribe =
      onSnapshot(
        eventsRef,

        (snapshot) => {
          const loadedEvents =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data(),
              })
            );

          setEvents(
            loadedEvents
          );

          setLoading(false);
          setError("");
        },

        (err) => {
          console.error(
            "Planner listener error:",
            err
          );

          setLoading(false);

          setError(
            "Unable to load planner."
          );
        }
      );

    return unsubscribe;
  }, []);

  // ============================
  // DATE HELPERS
  // ============================

  const year =
    viewDate.getFullYear();

  const month =
    viewDate.getMonth();

  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();

  const days =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const makeDate = (day) =>
    `${year}-${String(
      month + 1
    ).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

  /*
    Old events may have dates such as:

    2026-7-17

    New planner uses:

    2026-07-17

    This function normalizes both.
  */

  const normalizeDate = (
    value
  ) => {
    if (!value) {
      return "";
    }

    const parts =
      String(value).split("-");

    if (
      parts.length !== 3
    ) {
      return String(value);
    }

    const [
      eventYear,
      eventMonth,
      eventDay,
    ] = parts;

    return `${eventYear}-${String(
      eventMonth
    ).padStart(
      2,
      "0"
    )}-${String(
      eventDay
    ).padStart(
      2,
      "0"
    )}`;
  };

  // ============================
  // OLD + NEW SCHEMA HELPERS
  // ============================

  const getOwner = (
    event
  ) =>
    event.owner ||
    event.from ||
    "Unknown";

  const getTitle = (
    event
  ) =>
    event.title ||
    event.text ||
    "Untitled plan";

  const getNote = (
    event
  ) =>
    event.note || "";

  // ============================
  // SELECTED EVENTS
  // ============================

  const selectedEvents =
    events.filter(
      (event) =>
        normalizeDate(
          event.date
        ) ===
        selectedDate
    );

  // ============================
  // ADD PLAN
  // ============================

  const addPlan =
    async (e) => {
      e.preventDefault();

      const cleanTitle =
        title.trim();

      const cleanNote =
        note.trim();

      if (!cleanTitle) {
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
            "events"
          ),
          {
            // New schema
            title:
              cleanTitle,

            note:
              cleanNote,

            owner:
              person,

            // Old schema compatibility
            text:
              cleanTitle,

            from:
              person,

            // Shared fields
            date:
              selectedDate,

            senderId:
              auth.currentUser.uid,

            createdAt:
              serverTimestamp(),
          }
        );

        setTitle("");
        setNote("");
      } catch (err) {
        console.error(
          "Add plan error:",
          err
        );

        setError(
          "Unable to add plan."
        );
      } finally {
        setSaving(false);
      }
    };

  // ============================
  // DELETE PLAN
  // ============================

  const removePlan =
    async (event) => {
      const owner =
        getOwner(event);

      if (
        owner !== person
      ) {
        setError(
          "You can only delete plans you added."
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Delete this plan?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteDoc(
          doc(
            db,
            "events",
            event.id
          )
        );
      } catch (err) {
        console.error(
          "Delete plan error:",
          err
        );

        setError(
          "Unable to delete plan."
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
            Planner
          </h2>

          <p>
            Plans for the two of you
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

      <div className="calendar-card">
        <div className="month-head">
          <button
            type="button"
            onClick={() =>
              setViewDate(
                new Date(
                  year,
                  month - 1,
                  1
                )
              )
            }
          >
            <ChevronLeft />
          </button>

          <strong>
            {viewDate.toLocaleDateString(
              undefined,
              {
                month:
                  "long",
                year:
                  "numeric",
              }
            )}
          </strong>

          <button
            type="button"
            onClick={() =>
              setViewDate(
                new Date(
                  year,
                  month + 1,
                  1
                )
              )
            }
          >
            <ChevronRight />
          </button>
        </div>

        <div className="weekdays">
          {[
            "S",
            "M",
            "T",
            "W",
            "T",
            "F",
            "S",
          ].map(
            (
              day,
              i
            ) => (
              <span
                key={i}
              >
                {day}
              </span>
            )
          )}
        </div>

        <div className="calendar-grid">
          {Array.from({
            length:
              firstDay,
          }).map(
            (_, i) => (
              <div
                key={`e-${i}`}
              />
            )
          )}

          {Array.from({
            length:
              days,
          }).map(
            (_, i) => {
              const day =
                i + 1;

              const date =
                makeDate(
                  day
                );

              const hasEvent =
                events.some(
                  (event) =>
                    normalizeDate(
                      event.date
                    ) ===
                    date
                );

              return (
                <button
                  type="button"
                  key={day}
                  className={
                    selectedDate ===
                    date
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setSelectedDate(
                      date
                    )
                  }
                >
                  {day}

                  {hasEvent && (
                    <span className="event-dot" />
                  )}
                </button>
              );
            }
          )}
        </div>
      </div>

      <div className="plans">
        <h3>
          Plans —{" "}
          {selectedDate}
        </h3>

        {loading && (
          <div className="empty">
            Loading plans...
          </div>
        )}

        {!loading &&
          selectedEvents.length ===
            0 && (
            <div className="empty">
              Nothing planned yet.
            </div>
          )}

        {selectedEvents.map(
          (event) => {
            const owner =
              getOwner(
                event
              );

            const eventTitle =
              getTitle(
                event
              );

            const eventNote =
              getNote(
                event
              );

            return (
              <div
                className="plan-card"
                key={
                  event.id
                }
              >
                <span
                  className={`side-strip ${
                    owner
                      .toLowerCase()
                      .includes(
                        "millie"
                      )
                      ? "millie"
                      : "jay"
                  }`}
                />

                <div>
                  <strong>
                    {
                      eventTitle
                    }
                  </strong>

                  {eventNote && (
                    <small>
                      {
                        eventNote
                      }
                    </small>
                  )}

                  <small>
                    Added by{" "}
                    {owner}
                  </small>
                </div>

                {owner ===
                  person && (
                  <button
                    type="button"
                    onClick={() =>
                      removePlan(
                        event
                      )
                    }
                    title="Delete plan"
                  >
                    <Trash2
                      size={
                        16
                      }
                    />
                  </button>
                )}
              </div>
            );
          }
        )}

        <form
          className="plan-form"
          onSubmit={
            addPlan
          }
        >
          <input
            className="field"
            value={title}
            placeholder="Plan title"
            disabled={
              saving
            }
            onChange={(e) =>
              setTitle(
                e.target
                  .value
              )
            }
          />

          <input
            className="field"
            value={note}
            placeholder="Note (optional)"
            disabled={
              saving
            }
            onChange={(e) =>
              setNote(
                e.target
                  .value
              )
            }
          />

          <button
            type="submit"
            disabled={
              saving
            }
          >
            {saving
              ? "Adding..."
              : "Add plan"}
          </button>
        </form>
      </div>
    </section>
  );
}