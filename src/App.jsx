import {
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "./firebase";

import Login from "./components/Login";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import MenuPanel from "./components/MenuPanel";
import NotificationsPanel from "./components/NotificationsPanel";
import SettingsPanel from "./components/SettingsPanel";

import Chat from "./pages/Chat";
import Planner from "./pages/Planner";
import Reminders from "./pages/Reminders";
import Media from "./pages/Media";
import Game from "./pages/Game";

export default function App() {
  const [
    firebaseUser,
    setFirebaseUser,
  ] = useState(null);

  const [
    authLoading,
    setAuthLoading,
  ] = useState(true);

  const [
    person,
    setPerson,
  ] = useState(
    localStorage.getItem(
      "jm-session"
    ) || ""
  );

  const [tab, setTab] =
    useState("chat");

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false);

  const [
    theme,
    setTheme,
  ] = useState(
    localStorage.getItem(
      "jm-theme"
    ) || "dark"
  );

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  // ============================
  // FIREBASE AUTH
  // ============================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          setFirebaseUser(
            user
          );

          if (!user) {
            localStorage.removeItem(
              "jm-session"
            );

            setPerson("");
            setNotifications(
              []
            );
          }

          setAuthLoading(
            false
          );
        }
      );

    return unsubscribe;
  }, []);

  // ============================
  // THEME
  // ============================

  useEffect(() => {
    document.documentElement.dataset.theme =
      theme;

    localStorage.setItem(
      "jm-theme",
      theme
    );
  }, [theme]);

  // ============================
  // LIVE NOTIFICATIONS
  // ============================

  useEffect(() => {
    if (
      !firebaseUser ||
      !person
    ) {
      setNotifications(
        []
      );

      return;
    }

    const notificationsRef =
      collection(
        db,
        "notifications"
      );

    const unsubscribe =
      onSnapshot(
        notificationsRef,

        (snapshot) => {
          const loaded =
            snapshot.docs
              .map(
                (item) => ({
                  id: item.id,
                  ...item.data(),
                })
              )

              // Only show notifications
              // intended for this person.
              .filter(
                (item) =>
                  item.to ===
                    person ||
                  item.recipientId ===
                    firebaseUser.uid
              );

          loaded.sort(
            (a, b) => {
              const aTime =
                a.createdAt
                  ?.toMillis?.() ||
                0;

              const bTime =
                b.createdAt
                  ?.toMillis?.() ||
                0;

              return (
                bTime -
                aTime
              );
            }
          );

          setNotifications(
            loaded
          );
        },

        (err) => {
          console.error(
            "Notification listener error:",
            err
          );
        }
      );

    return unsubscribe;
  }, [
    firebaseUser,
    person,
  ]);

  // ============================
  // ADD NOTIFICATION
  // ============================

  const addNotification =
    async ({
      title,
      text,
      to,
    }) => {
      if (
        !auth.currentUser
      ) {
        return;
      }

      /*
        If Chat currently calls:

        addNotification({
          title: "...",
          text: "..."
        })

        there is no "to" yet.

        In that case automatically
        send it to the other person.
      */

      const recipient =
        to ||
        (person === "Jay"
          ? "Millie"
          : "Jay");

      try {
        await addDoc(
          collection(
            db,
            "notifications"
          ),
          {
            title,
            text,

            to:
              recipient,

            from:
              person,

            senderId:
              auth.currentUser.uid,

            read:
              false,

            createdAt:
              serverTimestamp(),
          }
        );
      } catch (err) {
        console.error(
          "Add notification error:",
          err
        );
      }
    };

  // ============================
  // MARK ALL AS READ
  // ============================

  const markAllRead =
    async () => {
      const unread =
        notifications.filter(
          (item) =>
            !item.read
        );

      if (
        unread.length === 0
      ) {
        return;
      }

      try {
        await Promise.all(
          unread.map(
            (item) =>
              updateDoc(
                doc(
                  db,
                  "notifications",
                  item.id
                ),
                {
                  read: true,
                }
              )
          )
        );
      } catch (err) {
        console.error(
          "Mark notifications read error:",
          err
        );
      }
    };

  // ============================
  // CLEAR NOTIFICATIONS
  // ============================

  const clearNotifications =
    async () => {
      if (
        notifications.length ===
        0
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Clear all notifications?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await Promise.all(
          notifications.map(
            (item) =>
              deleteDoc(
                doc(
                  db,
                  "notifications",
                  item.id
                )
              )
          )
        );
      } catch (err) {
        console.error(
          "Clear notifications error:",
          err
        );
      }
    };

  // ============================
  // UNREAD COUNT
  // ============================

  const unreadCount =
    notifications.filter(
      (item) =>
        !item.read
    ).length;

  // ============================
  // LOGOUT
  // ============================

  const logout =
    async () => {
      try {
        await signOut(
          auth
        );
      } catch (err) {
        console.error(
          "Logout error:",
          err
        );
      }

      localStorage.removeItem(
        "jm-session"
      );

      setPerson("");
      setMenuOpen(false);
      setSettingsOpen(
        false
      );
      setNotificationsOpen(
        false
      );
      setNotifications(
        []
      );
    };

  // ============================
  // LOADING
  // ============================

  if (authLoading) {
    return (
      <main className="login-page">
        <div className="login-card">
          <h1>
            Jay & Millie
          </h1>

          <p className="muted">
            Loading your space...
          </p>
        </div>
      </main>
    );
  }

  // ============================
  // LOGIN
  // ============================

  if (
    !firebaseUser ||
    !person
  ) {
    return (
      <Login
        setPerson={
          setPerson
        }
      />
    );
  }

  // ============================
  // APP
  // ============================

  return (
    <div className="shell">
      <div className="frame">
        <Header
          person={person}
          notificationCount={
            unreadCount
          }
          onMenu={() =>
            setMenuOpen(
              true
            )
          }
          onNotifications={() =>
            setNotificationsOpen(
              true
            )
          }
        />

        <main className="content">
          {tab ===
            "chat" && (
            <Chat
              person={
                person
              }
              addNotification={
                addNotification
              }
            />
          )}

          {tab ===
            "planner" && (
            <Planner
              person={
                person
              }
            />
          )}

          {tab ===
            "reminders" && (
            <Reminders
              person={
                person
              }
            />
          )}

          {tab ===
            "media" && (
            <Media />
          )}

          {tab ===
            "game" && (
            <Game
              person={
                person
              }
            />
          )}
        </main>

        <BottomNav
          tab={tab}
          setTab={setTab}
        />
      </div>

      {menuOpen && (
        <MenuPanel
          setTab={
            setTab
          }
          close={() =>
            setMenuOpen(
              false
            )
          }
          openSettings={() =>
            setSettingsOpen(
              true
            )
          }
          openNotifications={() =>
            setNotificationsOpen(
              true
            )
          }
          onLogout={
            logout
          }
        />
      )}

      {notificationsOpen && (
        <NotificationsPanel
          notifications={
            notifications
          }
          markAllRead={
            markAllRead
          }
          clearNotifications={
            clearNotifications
          }
          close={() =>
            setNotificationsOpen(
              false
            )
          }
        />
      )}

      {settingsOpen && (
        <SettingsPanel
          person={
            person
          }
          theme={
            theme
          }
          setTheme={
            setTheme
          }
          close={() =>
            setSettingsOpen(
              false
            )
          }
          onLogout={
            logout
          }
        />
      )}
    </div>
  );
}