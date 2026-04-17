
export const VALID_ROLES = {
  STUDENT: 'student',
  MENTOR: 'mentor',
  SOCIETY_HEAD: 'society_head',
  ADMIN: 'admin',
};

export const RESTRICTED_ROLES = [VALID_ROLES.MENTOR, VALID_ROLES.SOCIETY_HEAD, VALID_ROLES.ADMIN];
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;

  const trimmedEmail = email.trim();

  if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(trimmedEmail)) return false;

  if (/\.\./.test(trimmedEmail)) return false;

  if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) return false;

  if (trimmedEmail.length < 5 || trimmedEmail.length > 254) return false;
  const [localPart, domain] = trimmedEmail.split('@');
  if (!localPart || !domain) return false;

  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  if (localPart.length > 64) return false;

  const domainParts = domain.split('.');
  if (domainParts.length < 2) return false;
  if (domainParts.some(part => !part || part.length > 63)) return false;

  return true;
}

export function validatePassword(password) {
  const errors = [];

  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'] };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  const commonPasswords = [
    'password',
    '12345678',
    'qwerty123',
    'abc12345',
    'password123',
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a stronger password');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function passwordsMatch(password, confirmPassword) {
  if (!password || !confirmPassword) return false;
  return password === confirmPassword;
}

export function isValidRole(role) {
  return Object.values(VALID_ROLES).includes(role);
}

export function canSelfAssignRole(role) {
  return isValidRole(role);
}

export function isValidDisplayName(displayName) {
  if (!displayName || typeof displayName !== 'string') return false;
  const trimmed = displayName.trim();
  return trimmed.length >= 3 && trimmed.length <= 50 && /^[a-zA-Z0-9_\-]+$/.test(trimmed);
}

export function isValidName(name) {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 50 && /^[a-zA-Z\s\-']+$/.test(trimmed);
}

export function validateSignupForm(formData) {
  const errors = {};

  if (!isValidName(formData.firstName)) {
    errors.firstName = 'First name must be 2-50 characters';
  }
  if (!isValidName(formData.lastName)) {
    errors.lastName = 'Last name must be 2-50 characters';
  }

  if (!isValidDisplayName(formData.displayName)) {
    errors.displayName = 'Display name must be 3-50 characters (letters, numbers, hyphens, underscores only)';
  }
  if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0];
  }
  if (!passwordsMatch(formData.password, formData.confirmPassword)) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!formData.avatar) {
    errors.avatar = 'Profile picture is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
export function validateLoginForm(formData) {
  const errors = {};
  if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!formData.password || typeof formData.password !== 'string' || formData.password.length === 0) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function getGenericAuthError() {
  return 'Invalid email or password. Please try again.';
}

export function getGenericSignupError() {
  return 'Unable to create account. Please try again or contact support.';
}
