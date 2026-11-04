// Same sign-up rules as the backend (EVT-F-001), checked before sending the form.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignUp({ name, email, password }) {
  const errors = {};
  if (!name || !name.trim()) errors.name = 'Name is required';
  if (!EMAIL_PATTERN.test((email || '').trim())) errors.email = 'Enter a valid email address';
  if (!password || password.length < 8) errors.password = 'Password must have at least 8 characters';
  else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    errors.password = 'Password must contain a letter and a digit';
  }
  return errors;
}

// Turns the backend's field details into { field: message } for the form.
export function fieldErrors(error) {
  const result = {};
  for (const item of (error && error.details) || []) {
    result[item.field] = item.message;
  }
  return result;
}
