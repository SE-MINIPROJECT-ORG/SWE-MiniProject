// Input rules for sign-up and login (EVT-F-001, TC-AUTH-10).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\- ]{7,20}$/;
const SIGNUP_ROLES = ['ATTENDEE', 'ORGANIZER'];

function asText(value) {
  return typeof value === 'string' ? value.trim() : '';
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

  if (password.length < 8) errors.push({ field: 'password', message: 'Password must have at least 8 characters' });
  else if (password.length > 72) errors.push({ field: 'password', message: 'Password must be at most 72 characters' });
  else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain a letter and a digit' });
  }

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

module.exports = { validateRegistration, validateLogin };
