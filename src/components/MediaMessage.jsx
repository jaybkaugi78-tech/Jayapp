import {
  useEffect,
  useState,
} from "react";

import { getBlob } from "../storage";

export default function MediaMessage({
  blobId,
  mediaType,
}) {
  const [url, setUrl] =
    useState("");

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
          "Media error:",
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

  if (!url) {
    return (
      <div className="media-loading">
        Loading...
      </div>
    );
  }

  if (
    mediaType?.startsWith("video")
  ) {
    return (
      <video
        src={url}
        className="chat-media"
        controls
      />
    );
  }

  return (
    <img
      src={url}
      className="chat-media"
      alt="Shared"
    />
  );
}