import {
  Camera,
  Mic,
  Send,
  Square,
  Trash2,
  Play,
  Pause,
} from "lucide-react";

import {
  useEffect,
  useRef,
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

import { auth, db } from "../firebase";

const LOCAL_KEY = "jm-messages";

export default function Chat({
  person,
  addNotification,
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);

  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const messagesRef = collection(
      db,
      "messages"
    );

    const messagesQuery = query(
      messagesRef,
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,

      (snapshot) => {
        const firebaseMessages =
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
            source: "firestore",
          }));

        setMessages(firebaseMessages);
        setLoading(false);
        setError("");
      },

      (err) => {
        console.error(
          "Firestore listener error:",
          err
        );

        setError(
          "Unable to load live messages."
        );

        setLoading(false);

        try {
          const local =
            JSON.parse(
              localStorage.getItem(
                LOCAL_KEY
              )
            ) || [];

          if (
            Array.isArray(local) &&
            local.length > 0
          ) {
            setMessages(local);
          }
        } catch {
          setMessages([]);
        }
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(
          recordingTimerRef.current
        );
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }
    };
  }, []);

  const getSender = (message) =>
    message.from ||
    message.sender ||
    message.person ||
    message.user ||
    "Unknown";

  const getText = (message) =>
    message.text ||
    message.message ||
    message.content ||
    "";

  const getTimestamp = (message) => {
    const value =
      message.timestamp ||
      message.createdAt ||
      message.time;

    if (!value) {
      return null;
    }

    if (
      typeof value?.toDate ===
      "function"
    ) {
      return value.toDate();
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null;
    }

    return date;
  };

  const formatTime = (message) => {
    const date =
      getTimestamp(message);

    if (!date) {
      return "";
    }

    return date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatRecordingTime = (
    seconds
  ) => {
    const minutes =
      Math.floor(seconds / 60);

    const remaining =
      seconds % 60;

    return `${minutes}:${String(
      remaining
    ).padStart(2, "0")}`;
  };

  const sendText = async (e) => {
    e.preventDefault();

    const value = text.trim();

    if (!value) {
      return;
    }

    if (!auth.currentUser) {
      setError(
        "You need to be signed in."
      );

      return;
    }

    setText("");
    setError("");

    try {
      await addDoc(
        collection(
          db,
          "messages"
        ),
        {
          from: person,
          text: value,

          timestamp:
            serverTimestamp(),

          senderId:
            auth.currentUser.uid,

          type: "text",
        }
      );

      addNotification?.({
        title:
          `${person} sent a message`,
        text: value,
      });
    } catch (err) {
      console.error(
        "Send message error:",
        err
      );

      setText(value);

      setError(
        "Message failed to send."
      );
    }
  };

  // ==============================
  // CLOUDINARY
  // ==============================

  const uploadToCloudinary =
    async (
      file,
      resourceType = "auto"
    ) => {
      const cloudName =
        import.meta.env
          .VITE_CLOUDINARY_CLOUD_NAME;

      const uploadPreset =
        import.meta.env
          .VITE_CLOUDINARY_UPLOAD_PRESET;

      if (
        !cloudName ||
        !uploadPreset
      ) {
        throw new Error(
          "Cloudinary settings are missing."
        );
      }

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "upload_preset",
        uploadPreset
      );

      const response =
        await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          "Cloudinary error:",
          data
        );

        throw new Error(
          data?.error?.message ||
            "Upload failed."
        );
      }

      if (!data.secure_url) {
        throw new Error(
          "Cloudinary did not return a URL."
        );
      }

      return data;
    };

  // ==============================
  // PHOTO / VIDEO
  // ==============================

  const openMediaPicker = () => {
    if (
      uploading ||
      recording
    ) {
      return;
    }

    fileInputRef.current?.click();
  };

  const uploadMedia = async (e) => {
    const file =
      e.target.files?.[0];

    e.target.value = "";

    if (!file) {
      return;
    }

    if (!auth.currentUser) {
      setError(
        "You need to be signed in."
      );

      return;
    }

    const isImage =
      file.type.startsWith(
        "image/"
      );

    const isVideo =
      file.type.startsWith(
        "video/"
      );

    if (
      !isImage &&
      !isVideo
    ) {
      setError(
        "Please choose an image or video."
      );

      return;
    }

    setUploading(true);
    setError("");

    try {
      const data =
        await uploadToCloudinary(
          file,
          "auto"
        );

      const mediaType =
        data.resource_type ===
        "video"
          ? "video"
          : "image";

      await addDoc(
        collection(
          db,
          "messages"
        ),
        {
          from: person,

          text: "",

          mediaType,

          mediaUrl:
            data.secure_url,

          publicId:
            data.public_id,

          timestamp:
            serverTimestamp(),

          senderId:
            auth.currentUser.uid,

          type: "media",
        }
      );

      addNotification?.({
        title:
          `${person} shared media`,

        text:
          mediaType === "video"
            ? "New video"
            : "New photo",
      });
    } catch (err) {
      console.error(
        "Media upload error:",
        err
      );

      setError(
        err.message ||
          "Unable to upload media."
      );
    } finally {
      setUploading(false);
    }
  };

  // ==============================
  // VOICE NOTES
  // ==============================

  const startRecording =
    async () => {
      if (
        recording ||
        uploading
      ) {
        return;
      }

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices
          .getUserMedia
      ) {
        setError(
          "Voice recording is not supported in this browser."
        );

        return;
      }

      if (
        typeof MediaRecorder ===
        "undefined"
      ) {
        setError(
          "Voice recording is not supported in this browser."
        );

        return;
      }

      try {
        setError("");

        const stream =
          await navigator.mediaDevices
            .getUserMedia({
              audio: true,
            });

        streamRef.current =
          stream;

        let options = {};

        if (
          MediaRecorder.isTypeSupported(
            "audio/webm;codecs=opus"
          )
        ) {
          options = {
            mimeType:
              "audio/webm;codecs=opus",
          };
        }

        const recorder =
          new MediaRecorder(
            stream,
            options
          );

        mediaRecorderRef.current =
          recorder;

        audioChunksRef.current =
          [];

        recorder.ondataavailable =
          (event) => {
            if (
              event.data &&
              event.data.size > 0
            ) {
              audioChunksRef.current.push(
                event.data
              );
            }
          };

        recorder.onstop =
          async () => {
            if (
              recordingTimerRef.current
            ) {
              clearInterval(
                recordingTimerRef.current
              );

              recordingTimerRef.current =
                null;
            }

            stream
              .getTracks()
              .forEach((track) =>
                track.stop()
              );

            streamRef.current =
              null;

            const mimeType =
              recorder.mimeType ||
              "audio/webm";

            const audioBlob =
              new Blob(
                audioChunksRef.current,
                {
                  type: mimeType,
                }
              );

            audioChunksRef.current =
              [];

            if (
              audioBlob.size === 0
            ) {
              setError(
                "The recording was empty."
              );

              setRecordingTime(0);

              return;
            }

            await sendVoiceNote(
              audioBlob,
              mimeType
            );

            setRecordingTime(0);
          };

        recorder.start();

        setRecording(true);
        setRecordingTime(0);

        recordingTimerRef.current =
          setInterval(() => {
            setRecordingTime(
              (time) =>
                time + 1
            );
          }, 1000);
      } catch (err) {
        console.error(
          "Microphone error:",
          err
        );

        if (
          err.name ===
          "NotAllowedError"
        ) {
          setError(
            "Microphone permission was denied."
          );
        } else {
          setError(
            "Unable to start voice recording."
          );
        }
      }
    };

  const stopRecording = () => {
    const recorder =
      mediaRecorderRef.current;

    if (
      !recorder ||
      recorder.state ===
        "inactive"
    ) {
      return;
    }

    setRecording(false);

    recorder.stop();
  };

  const sendVoiceNote =
    async (
      audioBlob,
      mimeType
    ) => {
      if (!auth.currentUser) {
        setError(
          "You need to be signed in."
        );

        return;
      }

      setUploading(true);
      setError("");

      try {
        const extension =
          mimeType.includes(
            "ogg"
          )
            ? "ogg"
            : mimeType.includes(
                  "mp4"
                )
              ? "m4a"
              : "webm";

        const audioFile =
          new File(
            [audioBlob],
            `voice-${Date.now()}.${extension}`,
            {
              type: mimeType,
            }
          );

        /*
          Cloudinary treats audio files
          as the "video" resource type.
        */

        const data =
          await uploadToCloudinary(
            audioFile,
            "video"
          );

        await addDoc(
          collection(
            db,
            "messages"
          ),
          {
            from: person,

            text: "",

            mediaType:
              "audio",

            mediaUrl:
              data.secure_url,

            publicId:
              data.public_id,

            timestamp:
              serverTimestamp(),

            senderId:
              auth.currentUser.uid,

            type:
              "voice",
          }
        );

        addNotification?.({
          title:
            `${person} sent a voice note`,

          text:
            "New voice note",
        });
      } catch (err) {
        console.error(
          "Voice upload error:",
          err
        );

        setError(
          err.message ||
            "Unable to send voice note."
        );
      } finally {
        setUploading(false);
      }
    };

  // ==============================
  // DELETE
  // ==============================

  const removeMessage =
    async (message) => {
      if (
        message.source !==
        "firestore"
      ) {
        return;
      }

      const sender =
        getSender(message);

      if (
        sender !== person
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Delete this message?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteDoc(
          doc(
            db,
            "messages",
            message.id
          )
        );
      } catch (err) {
        console.error(
          "Delete message error:",
          err
        );

        setError(
          "Unable to delete message."
        );
      }
    };

  // ==============================
  // RENDER
  // ==============================

  return (
    <section className="screen chat-screen">
      <div className="section-head">
        <div>
          <h2>
            Messages
          </h2>

          <p>
            Your private conversation
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

      {uploading && (
        <div
          style={{
            marginBottom:
              "12px",
            fontSize:
              "12px",
            opacity: 0.75,
          }}
        >
          Sending...
        </div>
      )}

      <div className="messages">
        {loading && (
          <div className="empty big">
            Loading messages...
          </div>
        )}

        {!loading &&
          messages.length ===
            0 && (
            <div className="empty big">
              No messages yet.
            </div>
          )}

        {messages.map(
          (
            message,
            index
          ) => {
            const sender =
              getSender(message);

            const mine =
              sender ===
              person;

            const textValue =
              getText(message);

            const bubbleClass =
              sender
                .toLowerCase()
                .includes(
                  "millie"
                )
                ? "millie-bubble"
                : "jay-bubble";

            const mediaType =
              message.mediaType
                ?.toLowerCase() ||
              "";

            const hasMedia =
              Boolean(
                message.mediaUrl
              );

            const isVideo =
              mediaType.includes(
                "video"
              );

            const isAudio =
              mediaType.includes(
                "audio"
              ) ||
              message.type ===
                "voice";

            return (
              <div
                className={`message-row ${
                  mine
                    ? "mine"
                    : ""
                }`}
                key={
                  message.id ||
                  index
                }
              >
                <div
                  className={`bubble ${bubbleClass}`}
                >
                  {!mine && (
                    <small
                      style={{
                        display:
                          "block",
                        marginBottom:
                          "5px",
                        opacity:
                          0.75,
                      }}
                    >
                      {sender}
                    </small>
                  )}

                  {textValue && (
                    <div className="bubble-text">
                      {textValue}
                    </div>
                  )}

                  {hasMedia &&
                    isAudio && (
                      <div className="voice-message">
                        <Mic
                          size={16}
                        />

                        <audio
                          src={
                            message.mediaUrl
                          }
                          controls
                          preload="metadata"
                        />
                      </div>
                    )}

                  {hasMedia &&
                    !isAudio &&
                    isVideo && (
                      <video
                        className="chat-media"
                        src={
                          message.mediaUrl
                        }
                        controls
                        preload="metadata"
                      />
                    )}

                  {hasMedia &&
                    !isAudio &&
                    !isVideo && (
                      <img
                        className="chat-media"
                        src={
                          message.mediaUrl
                        }
                        alt="Shared media"
                        loading="lazy"
                      />
                    )}

                  <div className="bubble-meta">
                    <span>
                      {formatTime(
                        message
                      )}
                    </span>

                    {mine &&
                      message.source ===
                        "firestore" && (
                        <button
                          type="button"
                          onClick={() =>
                            removeMessage(
                              message
                            )
                          }
                        >
                          <Trash2
                            size={12}
                          />
                        </button>
                      )}
                  </div>
                </div>
              </div>
            );
          }
        )}

        <div
          ref={bottomRef}
        />
      </div>

      {recording && (
        <div className="recording-strip">
          <span className="record-dot" />

          <span>
            Recording{" "}
            {formatRecordingTime(
              recordingTime
            )}
          </span>

          <button
            type="button"
            onClick={
              stopRecording
            }
          >
            <Square
              size={14}
            />
            Stop
          </button>
        </div>
      )}

      <form
        className="composer"
        onSubmit={sendText}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          hidden
          onChange={uploadMedia}
        />

        <button
          type="button"
          className="composer-btn"
          onClick={
            openMediaPicker
          }
          disabled={
            uploading ||
            recording
          }
          title="Photo or video"
        >
          <Camera
            size={18}
          />
        </button>

        <button
          type="button"
          className={`composer-btn ${
            recording
              ? "recording"
              : ""
          }`}
          onClick={
            recording
              ? stopRecording
              : startRecording
          }
          disabled={
            uploading
          }
          title={
            recording
              ? "Stop recording"
              : "Voice note"
          }
        >
          {recording ? (
            <Square
              size={18}
            />
          ) : (
            <Mic
              size={18}
            />
          )}
        </button>

        <input
          className="composer-input"
          value={text}
          placeholder={
            recording
              ? `Recording ${formatRecordingTime(
                  recordingTime
                )}`
              : uploading
                ? "Sending..."
                : "Write a message..."
          }
          disabled={
            recording
          }
          onChange={(e) =>
            setText(
              e.target.value
            )
          }
        />

        <button
          type="submit"
          className="send-btn"
          disabled={
            uploading ||
            recording
          }
        >
          <Send
            size={18}
          />
        </button>
      </form>
    </section>
  );
}