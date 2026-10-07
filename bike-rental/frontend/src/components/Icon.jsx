import React from "react";

export default function Icon({ name, size = 18, className = "", style = {} }) {
  const s = { width: size, height: size, minWidth: size, display: "inline-block", verticalAlign: "middle", ...style };
  const strokeProps = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    style: s,
  };

  switch (name) {
    case "bike":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="18.5" cy="17.5" r="3.5" />
          <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L9 9l3-3 4 5h4" />
          <path d="M12 17.5V14l-3-3" />
        </svg>
      );
    case "search":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5" className={className} style={s}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "map-pin":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    case "bell":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "user":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "logout":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      );
    case "filter":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      );
    case "zap":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "phone":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case "plus":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case "tool":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case "trash":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case "edit":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    case "credit-card":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      );
    case "eye":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "eye-off":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      );
    case "refresh":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    case "chevron-right":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      );
    case "fuel":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <line x1="3" y1="22" x2="15" y2="22" />
          <line x1="4" y1="9" x2="14" y2="9" />
          <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
          <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
        </svg>
      );
    case "gauge":
      return (
        <svg viewBox="0 0 24 24" {...strokeProps}>
          <path d="m12 14 4-4" />
          <path d="M3.34 19a10 10 0 1 1 17.32 0" />
        </svg>
      );
    default:
      return null;
  }
}
