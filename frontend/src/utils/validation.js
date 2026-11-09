// Same sign-up rules as the backend (EVT-F-001), checked before sending the form.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password rule shared by sign-up and password change (EVT-F-001, EVT-F-007).
export function passwordProblem(password) {
  if (!password || password.length < 8) return 'Password must have at least 8 characters';
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return 'Password must contain a letter and a digit';
  return '';
}

export function validateSignUp({ name, email, password }) {
  const errors = {};
  if (!name || !name.trim()) errors.name = 'Name is required';
  if (!EMAIL_PATTERN.test((email || '').trim())) errors.email = 'Enter a valid email address';
  const problem = passwordProblem(password);
  if (problem) errors.password = problem;
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

// Password change form (EVT-F-007): new password follows the rule and is typed twice.
export function validatePasswordChange({ currentPassword, newPassword, confirmPassword }) {
  const errors = {};
  if (!currentPassword) errors.currentPassword = 'Enter your current password';
  const problem = passwordProblem(newPassword);
  if (problem) errors.newPassword = problem;
  else if (newPassword !== confirmPassword) errors.confirmPassword = 'The two new passwords do not match';
  return errors;
}
