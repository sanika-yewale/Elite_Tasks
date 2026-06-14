import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export default function TextEditor() {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    socket.off("load-document");
    socket.off("receive-changes");
    const quill = new Quill(editorRef.current, {
      theme: "snow",
      placeholder: "Start typing...",
    });

    // Load document
    socket.emit("get-document", "internship-doc");

    socket.once("load-document", (document) => {
      console.log("Document loaded");

      if (document) {
        quill.setContents(document);
      }
    });

    // Send changes
    const sendHandler = (delta, oldDelta, source) => {
      console.log("SOURCE:", source);

      if (source !== "user") return;

      console.log("Sending change");
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", sendHandler);

    // Receive changes
    const receiveHandler = (delta) => {
      console.log("Received change");
      quill.updateContents(delta);
    };

    socket.on("receive-changes", receiveHandler);

    // Auto Save
    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, 2000);

    return () => {
      clearInterval(interval);
      quill.off("text-change", sendHandler);
      socket.off("receive-changes", receiveHandler);
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <div
        ref={editorRef}
        style={{
          height: "500px",
          background: "white",
          border: "1px solid #ccc",
        }}
      />
    </div>
  );
}
