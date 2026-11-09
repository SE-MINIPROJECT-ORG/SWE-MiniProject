// Formatting for the event report (EVT-F-035) and admin dashboard (EVT-F-037).

export function percentText(rate) {
  return `${Number(rate || 0).toFixed(1).replace(/\.0$/, '')}%`;
}

// Turns { CONFIRMED: 5, WAITLISTED: 2, total: 7 } into rows for a small table, in a fixed order.
export function breakdown(counts, order, labels = {}) {
  return order.map((key) => ({ key, label: labels[key] || key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' '), value: counts[key] || 0 }));
}
