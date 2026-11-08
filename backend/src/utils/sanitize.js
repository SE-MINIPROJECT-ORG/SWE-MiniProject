// Server-side clean-up of free text (EVT-SR-003).
// Removes invisible control characters (keeps line breaks and tabs) and trims spaces.
// HTML is not stripped: text is always stored as plain text and React escapes it
// when showing it, so "<script>" appears as text and never runs.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function cleanText(value) {
  if (typeof value !== 'string') return '';
  return value.replace(CONTROL_CHARS, '').trim();
}

module.exports = { cleanText };
