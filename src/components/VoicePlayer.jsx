import {
  Pause,
  Play,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { getBlob } from "../storage";

export default function VoicePlayer({
  blobId,
}) {
  const audioRef = useRef(null);

  const [url, setUrl] = useState("");
  const [playing, setPlaying] =
    useState(false);

  useEffect(() => {
    let objectUrl = "";

    const load = async () => {
      try {
        const blob =
          await getBlob(blobId);

        if (!blob) return;

        objectUrl =
          URL.createObjectURL(blob);

        setUrl(objectUrl);
      } catch (error) {
        console.error(
          "Voice note error:",
          error
        );
      }
    };

    load();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(
          objectUrl
        );
      }
    };
  }, [blobId]);

  const toggle = async () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      await audioRef.current.play();
    }
  };

  if (!url) {
    return (
      <div className="media-loading">
        Loading voice note...
      </div>
    );
  }

  return (
    <div className="voice-note">
      <button
        type="button"
        onClick={toggle}
      >
        {playing ? (
          <Pause size={16} />
        ) : (
          <Play size={16} />
        )}
      </button>

      <div className="wave">
        {[12, 19, 10, 24, 17, 27, 13, 22, 15, 25, 11, 18].map(
          (height, index) => (
            <span
              key={index}
              style={{
                height: `${height}px`,
              }}
            />
          )
        )}
      </div>

      <small>
        {playing ? "Playing" : "Voice"}
      </small>

      <audio
        ref={audioRef}
        src={url}
        onPlay={() =>
          setPlaying(true)
        }
        onPause={() =>
          setPlaying(false)
        }
        onEnded={() =>
          setPlaying(false)
        }
      />
    </div>
  );
}