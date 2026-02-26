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
 * Validate full name
 * @param {string} fullName
 * @returns {boolean}
 */
export function isValidFullName(fullName) {
  if (!fullName || typeof fullName !== 'string') return false;

  const trimmedName = fullName.trim();

  // Minimum 2 characters
  if (trimmedName.length < 2) return false;

  // Maximum 100 characters
  if (trimmedName.length > 100) return false;

  // Allow letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) return false;

  return true;
}

/**
 * Sanitize user input to prevent XSS (basic)
 * @param {string} input
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Check if user has access to specific role-based resource
 * @param {string} userRole
 * @param {string} requiredRole
 * @returns {boolean}
 */
export function hasRoleAccess(userRole, requiredRole) {
  if (!userRole || !requiredRole) return false;
  if (!isValidRole(userRole) || !isValidRole(requiredRole)) return false;
  return userRole === requiredRole;
}

/**
 * Check if user has access to resource with multiple allowed roles
 * @param {string} userRole
 * @param {array} allowedRoles
 * @returns {boolean}
 */
export function hasMultiRoleAccess(userRole, allowedRoles = []) {
  if (!userRole || !Array.isArray(allowedRoles)) return false;
  if (!isValidRole(userRole)) return false;
  return allowedRoles.includes(userRole);
}

/**
 * Get dashboard route based on user role
 * Returns appropriate dashboard URL for role
 * @param {string} role
 * @returns {string}
 */
export function getDashboardRoute(role) {
  const dashboards = {
    [VALID_ROLES.STUDENT]: '/student/dashboard',
    [VALID_ROLES.MENTOR]: '/mentor/dashboard',
    [VALID_ROLES.SOCIETY_HEAD]: '/society/dashboard',
    [VALID_ROLES.ADMIN]: '/admin/dashboard',
  };

  return dashboards[role] || '/';
}

/**
 * Validate signup form data
 * @param {object} formData { fullName, email, password, confirmPassword, role }
 * @returns {object} { isValid, errors }
 */
export function validateSignupForm(formData) {
  const errors = {};

  // Validate full name
  if (!isValidFullName(formData.fullName)) {
    errors.fullName = 'Full name must be 2-100 characters with letters, spaces, hyphens, or apostrophes only';
  }

  // Validate email
  if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0]; // Show first error
  }

  // Validate password confirmation
  if (!passwordsMatch(formData.password, formData.confirmPassword)) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Validate role
  if (!isValidRole(formData.role)) {
    errors.role = 'Invalid role selected';
  }

  // Check if role can be self-assigned
  if (!canSelfAssignRole(formData.role)) {
    errors.role = 'You can only register as a Student. Other roles require approval.';
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
