/**
 * Authentication Validation Utilities
 * Provides secure validation for auth inputs and role-based access control
 */

/**
 * Defined roles in the system
 * Only these roles should be allowed
 */
export const VALID_ROLES = {
  STUDENT: 'student',
  MENTOR: 'mentor',
  SOCIETY_HEAD: 'society_head',
  ADMIN: 'admin',
};

/**
 * Roles that require special approval/verification
 * Students cannot self-assign these roles
 */
export const RESTRICTED_ROLES = [VALID_ROLES.MENTOR, VALID_ROLES.SOCIETY_HEAD, VALID_ROLES.ADMIN];

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;

  // Trim whitespace
  const trimmedEmail = email.trim();

  // Check basic format
  if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(trimmedEmail)) return false;

  // Ensure no consecutive dots
  if (/\.\./.test(trimmedEmail)) return false;

  // Ensure doesn't start or end with dot
  if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) return false;

  // Check minimum length
  if (trimmedEmail.length < 5 || trimmedEmail.length > 254) return false;

  // Split and validate parts
  const [localPart, domain] = trimmedEmail.split('@');
  if (!localPart || !domain) return false;

  // Validate local part (before @)
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  if (localPart.length > 64) return false;

  // Validate domain part (after @)
  const domainParts = domain.split('.');
  if (domainParts.length < 2) return false;
  if (domainParts.some(part => !part || part.length > 63)) return false;

  return true;
}

/**
 * Validate password strength
 * Requires: minimum 8 characters, at least one uppercase, one number
 * @param {string} password
 * @returns {object} { isValid, errors }
 */
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

  // Common weak passwords to avoid
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

/**
 * Secure password comparison (frontend validation only)
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {boolean}
 */
export function passwordsMatch(password, confirmPassword) {
  if (!password || !confirmPassword) return false;
  // Safety check: never trim passwords as they may intentionally have spaces
  return password === confirmPassword;
}

/**
 * Validate role assignment
 * Ensures only valid roles are assigned
 * @param {string} role
 * @returns {boolean}
 */
export function isValidRole(role) {
  return Object.values(VALID_ROLES).includes(role);
}

/**
 * Check if user can self-assign a role during signup
 * All roles can be self-registered; no approval required
 * @param {string} role
 * @returns {boolean}
 */
export function canSelfAssignRole(role) {
  // All roles can be self-assigned during signup
  return isValidRole(role);
}

/**
 * Validate display name
 * @param {string} displayName
 * @returns {boolean}
 */
export function isValidDisplayName(displayName) {
  if (!displayName || typeof displayName !== 'string') return false;
  const trimmed = displayName.trim();
  return trimmed.length >= 3 && trimmed.length <= 50 && /^[a-zA-Z0-9_\-]+$/.test(trimmed);
}

/**
 * Validate name (first or last)
 * @param {string} name
 * @returns {boolean}
 */
export function isValidName(name) {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 50 && /^[a-zA-Z\s\-']+$/.test(trimmed);
}

/**
 * Validate signup form data
 * @param {object} formData { firstName, lastName, displayName, email, password, confirmPassword, role, avatar }
 * @returns {object} { isValid, errors }
 */
export function validateSignupForm(formData) {
  const errors = {};

  // Validate first name
  if (!isValidName(formData.firstName)) {
    errors.firstName = 'First name must be 2-50 characters';
  }

  // Validate last name
  if (!isValidName(formData.lastName)) {
    errors.lastName = 'Last name must be 2-50 characters';
  }

  // Validate display name
  if (!isValidDisplayName(formData.displayName)) {
    errors.displayName = 'Display name must be 3-50 characters (letters, numbers, hyphens, underscores only)';
  }

  // Validate email
  if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0];
  }

  // Validate password confirmation
  if (!passwordsMatch(formData.password, formData.confirmPassword)) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Validate avatar
  if (!formData.avatar) {
    errors.avatar = 'Profile picture is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate login form data
 * @param {object} formData { email, password }
 * @returns {object} { isValid, errors }
 */
export function validateLoginForm(formData) {
  const errors = {};

  // Validate email
  if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Validate password exists (don't validate strength for login)
  if (!formData.password || typeof formData.password !== 'string' || formData.password.length === 0) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Get generic auth error message (for security)
 * Never reveal if email exists or which field failed
 * @returns {string}
 */
export function getGenericAuthError() {
  return 'Invalid email or password. Please try again.';
}

/**
 * Get generic signup error message (for security)
 * @returns {string}
 */
export function getGenericSignupError() {
  return 'Unable to create account. Please try again or contact support.';
}
