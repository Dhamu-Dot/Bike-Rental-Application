import React, { useEffect, useState, useRef } from "react";
import api from "../api.js";
import Icon from "./Icon.jsx";
import { formatDateTime } from "../utils.js";

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCount = async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      setCount(res.data.count || 0);
    } catch (e) {
      // server offline or restarting
    }
  };

  useEffect(() => {
    loadCount();
    const timer = setInterval(loadCount, 10000);
    return () => clearInterval(timer);
  }, []);

  const toggle = async () => {
    if (!open) {
      setLoading(true);
      try {
        const res = await api.get("/notifications");
        setList(res.data);
        if (count > 0) {
          await api.put("/notifications/read-all");
          setCount(0);
        }
      } catch (e) {
        // error handling
      } finally {
        setLoading(false);
      }
    }
    setOpen(!open);
  };

  return (
    <div className="bell-wrap">
      <button
        className="icon-btn"
        onClick={toggle}
        aria-label={count > 0 ? `Notifications (${count} unread)` : "Notifications"}
        title="Notifications"
      >
        <Icon name="bell" size={19} />
        {count > 0 && <span className="badge-count">{count}</span>}
      </button>

      {open && (
        <>
          <div className="bell-backdrop" onClick={() => setOpen(false)} />
          <div className="bell-menu">
            <div className="bell-header">
              <h4>Activity & Alerts</h4>
              {list.length > 0 && (
                <small style={{ color: "var(--muted)" }}>{list.length} update{list.length === 1 ? "" : "s"}</small>
              )}
            </div>

            {loading ? (
              <p className="muted" style={{ padding: "16px 0", textAlign: "center" }}>
                Loading updates...
              </p>
            ) : list.length === 0 ? (
              <p className="muted" style={{ padding: "20px 0", textAlign: "center", fontSize: "13.5px" }}>
                No notifications right now. Booking alerts and updates will show up here.
              </p>
            ) : (
              list.map((n) => (
                <div key={n.id} className="note">
                  <b>{n.message}</b>
                  {n.details && <div className="muted">{n.details}</div>}
                  <small>{formatDateTime(n.createdAt)}</small>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
