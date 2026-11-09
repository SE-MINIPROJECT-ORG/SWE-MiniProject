// Input rules for sign-up and login (EVT-F-001, TC-AUTH-10).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\- ]{7,20}$/;
const SIGNUP_ROLES = ['ATTENDEE', 'ORGANIZER'];

function asText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Password rule shared by sign-up and password change (EVT-F-001, EVT-F-007).
function passwordError(password, field = 'password') {
  if (password.length < 8) return { field, message: 'Password must have at least 8 characters' };
  if (password.length > 72) return { field, message: 'Password must be at most 72 characters' };
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return { field, message: 'Password must contain a letter and a digit' };
  }
  return null;
}

function validateRegistration(body = {}) {
  const errors = [];
  const name = asText(body.name);
  const email = asText(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  const phone = asText(body.phone);
  const role = body.role === undefined ? 'ATTENDEE' : body.role;

  if (!name) errors.push({ field: 'name', message: 'Name is required' });
  else if (name.length > 100) errors.push({ field: 'name', message: 'Name must be at most 100 characters' });

  if (!EMAIL_PATTERN.test(email) || email.length > 255) {
    errors.push({ field: 'email', message: 'Enter a valid email address' });
  }

  const badPassword = passwordError(password);
  if (badPassword) errors.push(badPassword);

  if (phone && !PHONE_PATTERN.test(phone)) errors.push({ field: 'phone', message: 'Enter a valid phone number' });

  if (!SIGNUP_ROLES.includes(role)) {
    errors.push({ field: 'role', message: 'Role must be ATTENDEE or ORGANIZER' });
  }

  return { errors, value: { name, email, password, phone: phone || null, role } };
}

function validateLogin(body = {}) {
  const email = asText(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  const errors = [];
  if (!email) errors.push({ field: 'email', message: 'Email is required' });
  if (!password) errors.push({ field: 'password', message: 'Password is required' });
  return { errors, value: { email, password } };
}

const ALL_ROLES = ['ATTENDEE', 'ORGANIZER', 'ADMIN'];

function validateProfile(body = {}) {
  const errors = [];
  const name = asText(body.name);
  const phone = asText(body.phone);
  if (!name) errors.push({ field: 'name', message: 'Name is required' });
  else if (name.length > 100) errors.push({ field: 'name', message: 'Name must be at most 100 characters' });
  if (phone && !PHONE_PATTERN.test(phone)) errors.push({ field: 'phone', message: 'Enter a valid phone number' });
  return { errors, value: { name, phone: phone || null } };
}

function validatePasswordChange(body = {}) {
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
  const errors = [];
  if (!currentPassword) errors.push({ field: 'currentPassword', message: 'Current password is required' });
  const badPassword = passwordError(newPassword, 'newPassword');
  if (badPassword) errors.push(badPassword);
  return { errors, value: { currentPassword, newPassword } };
}

function validateRole(body = {}) {
  return ALL_ROLES.includes(body.role)
    ? { errors: [], value: body.role }
    : { errors: [{ field: 'role', message: 'Role must be ATTENDEE, ORGANIZER or ADMIN' }] };
}

function validateStatus(body = {}) {
  return typeof body.active === 'boolean'
    ? { errors: [], value: body.active }
    : { errors: [{ field: 'active', message: 'active must be true or false' }] };
}

module.exports = { validateRegistration, validateLogin, validateProfile, validatePasswordChange, validateRole, validateStatus };
