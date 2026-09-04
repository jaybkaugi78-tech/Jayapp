import {
  Image as ImageIcon,
  Play,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase";

export default function Media() {
  const [items, setItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const messagesRef =
      collection(
        db,
        "messages"
      );

    const unsubscribe =
      onSnapshot(
        messagesRef,

        (snapshot) => {
          const media =
            snapshot.docs
              .map((item) => ({
                id: item.id,
                ...item.data(),
              }))
              .filter(
                (item) =>
                  item.mediaUrl &&
                  (
                    item.mediaType ===
                      "image" ||
                    item.mediaType ===
                      "video" ||
                    item.mediaType?.startsWith(
                      "image/"
                    ) ||
                    item.mediaType?.startsWith(
                      "video/"
                    )
                  )
              );

          media.sort(
            (a, b) => {
              const aTime =
                a.timestamp
                  ?.toMillis?.() ||
                a.createdAt
                  ?.toMillis?.() ||
                0;

              const bTime =
                b.timestamp
                  ?.toMillis?.() ||
                b.createdAt
                  ?.toMillis?.() ||
                0;

              return (
                bTime -
                aTime
              );
            }
          );

          setItems(media);
          setLoading(false);
          setError("");
        },

        (err) => {
          console.error(
            "Media listener error:",
            err
          );

          setLoading(false);

          setError(
            "Unable to load memories."
          );
        }
      );

    return unsubscribe;
  }, []);

  const getOwner = (
    item
  ) =>
    item.from ||
    item.sender ||
    item.person ||
    "Unknown";

  const isVideo = (
    item
  ) =>
    item.mediaType ===
      "video" ||
    item.mediaType?.startsWith(
      "video/"
    );

  return (
    <section className="screen">
      <div className="section-head">
        <div>
          <h2>
            Memories
          </h2>

          <p>
            Photos and videos you've shared
          </p>
        </div>

        <ImageIcon />
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

      {loading ? (
        <div className="empty big">
          Loading memories...
        </div>
      ) : items.length ===
        0 ? (
        <div className="empty big">
          No memories yet.
        </div>
      ) : (
        <div className="media-grid">
          {items.map(
            (item) => {
              const owner =
                getOwner(
                  item
                );

              const video =
                isVideo(
                  item
                );

              return (
                <div
                  className="media-card"
                  key={
                    item.id
                  }
                >
                  {video ? (
                    <div
                      style={{
                        position:
                          "relative",
                      }}
                    >
                      <video
                        className="chat-media"
                        src={
                          item.mediaUrl
                        }
                        controls
                        preload="metadata"
                      />

                      <div
                        style={{
                          position:
                            "absolute",
                          top:
                            "10px",
                          right:
                            "10px",
                          width:
                            "30px",
                          height:
                            "30px",
                          borderRadius:
                            "50%",
                          display:
                            "grid",
                          placeItems:
                            "center",
                          background:
                            "rgba(0, 0, 0, 0.55)",
                          pointerEvents:
                            "none",
                        }}
                      >
                        <Play
                          size={
                            15
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <img
                      className="chat-media"
                      src={
                        item.mediaUrl
                      }
                      alt={`Shared by ${owner}`}
                      loading="lazy"
                    />
                  )}

                  <div className="media-caption">
                    Shared by{" "}
                    {owner}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}