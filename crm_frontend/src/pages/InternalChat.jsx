import { useEffect, useRef, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../utils/api";

function InternalChat() {
  const role = localStorage.getItem("role") || "Staff";
  const [channel, setChannel] = useState("general");
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const load = () => {
    const params = new URLSearchParams({ channel, limit: "80" });
    apiFetch(`/chat/messages?${params}`).then((r) => setMessages(r.items || [])).catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, [channel]);
  useEffect(() => {
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [channel]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    try {
      await apiFetch("/chat/messages", {
        method: "POST",
        body: JSON.stringify({ channel, body: body.trim() }),
      });
      setBody("");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout title="Team Chat" roleLabel={role}>
      <div className="crm-panel">
        <div className="crm-filters">
          <select value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value="general">General</option>
            <option value="project">Project</option>
          </select>
        </div>
        {error && <p className="crm-error crm-mt">{error}</p>}

        <div className="crm-chat-messages crm-mt">
          {messages.map((m) => (
            <div key={m.id} className="crm-chat-message">
              <strong>{m.sender_name}</strong>
              <span className="crm-muted crm-text-sm"> · {new Date(m.created_at).toLocaleString("en-IN")}</span>
              <p>{m.body}</p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form className="crm-chat-compose crm-mt" onSubmit={send}>
          <input
            placeholder="Type a message…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
          />
          <button type="submit" className="crm-btn crm-btn-sm">Send</button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default InternalChat;
