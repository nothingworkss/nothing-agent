const relativeFormatter = new Intl.RelativeTimeFormat("ko", {
  numeric: "auto",
  style: "short",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  hour: "numeric",
  minute: "2-digit",
});

export function formatRelativeTime(value?: string | null) {
  if (!value) return "방금";

  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 45) return "방금";
  if (absSeconds < 3600) {
    return relativeFormatter.format(Math.round(diffSeconds / 60), "minute");
  }
  if (absSeconds < 86400) {
    return relativeFormatter.format(Math.round(diffSeconds / 3600), "hour");
  }

  return relativeFormatter.format(Math.round(diffSeconds / 86400), "day");
}

export function formatDateTime(value?: string | null) {
  if (!value) return "기록 없음";
  return dateTimeFormatter.format(new Date(value));
}

export function formatTime(value?: string | null) {
  if (!value) return "기록 없음";
  return timeFormatter.format(new Date(value));
}
