/**
 * Account Management Utilities
 * Handles account uniqueness checks, role retrieval, and account validation
 * 
 * This is the frontend mock service. In production, all checks should be
 * performed on the backend with a secure database.
 */

// Import mock accounts data
import mockAccountsData from '../data/mockAccounts.json';

/**
 * Get all registered accounts (mock data)
 * In production: Backend endpoint GET /api/auth/accounts
 * @returns {Array} Array of account objects
 */
export function getAllAccounts() {
  return mockAccountsData.accounts || [];
}

/**
 * Check if email already exists in the system
 * @param {string} email - Email to check
 * @returns {boolean} True if email exists, false otherwise
 */
export function emailExists(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getAllAccounts();
  return accounts.some(account => 
    account.email.toLowerCase() === normalizedEmail
  );
}

/**
 * Check if username already exists in the system
 * @param {string} username - Username to check
 * @returns {boolean} True if username exists, false otherwise
 */
export function usernameExists(username) {
  if (!username || typeof username !== 'string') {
    return false;
  }

  const normalizedUsername = username.trim().toLowerCase();
  const accounts = getAllAccounts();
  return accounts.some(account => 
    account.username.toLowerCase() === normalizedUsername
  );
}

/**
 * Generate a username from full name
 * Converts "John Doe Smith" → "john.doe.smith"
 * @param {string} fullName - Full name to convert
 * @returns {string} Generated username
 */
export function generateUsername(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return '';
  }

  return fullName
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(part => part.length > 0)
    .join('.');
}

/**
 * Validate account uniqueness for signup
 * Checks both email and username
 * @param {string} email - Email to validate
 * @param {string} fullName - Full name for username generation
 * @returns {Object} { isValid, errors[] }
 */
export function validateAccountUniqueness(email, fullName) {
  const errors = [];

  if (!email || !fullName) {
    return {
      isValid: false,
      errors: ['Email and full name are required']
    };
  }

  // Check email uniqueness
  if (emailExists(email)) {
    errors.push('An account with this email already exists');
  }

  // Check username uniqueness
  const generatedUsername = generateUsername(fullName);
  if (generatedUsername && usernameExists(generatedUsername)) {
    errors.push('An account with this name already exists');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Find account by email (case-insensitive)
 * @param {string} email - Email to search for
 * @returns {Object|null} Account object if found, null otherwise
 */
export function findAccountByEmail(email) {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getAllAccounts();
  return accounts.find(account => 
    account.email.toLowerCase() === normalizedEmail
  ) || null;
}

/**
 * Get the assigned role for an email
 * Used during login to enforce role integrity
 * @param {string} email - Email to lookup
 * @returns {string|null} Role ('student', 'mentor', 'society_head', 'admin') or null if not found
 */
export function getAssignedRole(email) {
  const account = findAccountByEmail(email);
  return account ? account.role : null;
}

/**
 * Validate that selected role matches the assigned role
 * @param {string} email - User's email
 * @param {string} selectedRole - Role user is trying to use
 * @returns {Object} { isValid, assignedRole, error }
 */
export function validateRoleMatch(email, selectedRole) {
  const assignedRole = getAssignedRole(email);

  // If email not found, role validation fails
  if (!assignedRole) {
    return {
      isValid: false,
      assignedRole: null,
      error: 'Account not found'
    };
  }

  // Check if selected role matches assigned role
  const rolesMatch = assignedRole === selectedRole;

  return {
    isValid: rolesMatch,
    assignedRole,
    error: rolesMatch 
      ? null 
      : `You are registered as a ${assignedRole}. Only that role can be used to sign in.`
  };
}

/**
 * Create a new account in mock database
 * In production: POST /api/auth/signup with backend processing
 * @param {Object} accountData - Account details
 * @returns {Object} { success, account, error }
 */
export function createMockAccount(accountData) {
  const {
    email,
    fullName,
    password,
    role,
  } = accountData;

  // Validate inputs
  if (!email || !fullName || !password || !role) {
    return {
      success: false,
      account: null,
      error: 'All fields are required'
    };
  }

  // Check uniqueness
  const uniquenessCheck = validateAccountUniqueness(email, fullName);
  if (!uniquenessCheck.isValid) {
    return {
      success: false,
      account: null,
      error: uniquenessCheck.errors[0]
    };
  }

  // Create user account object
  const username = generateUsername(fullName);
  const newAccount = {
    id: `acc-${role}-${Date.now()}`,
    email: email.trim().toLowerCase(),
    username: username,
    fullName: fullName.trim(),
    role: role,
    password: password, // In production: hashed on backend
    createdAt: new Date().toISOString()
  };

  // In a real app, this would be stored in a database
  // For testing, we just return success
  return {
    success: true,
    account: newAccount,
    error: null
  };
}

/**
 * Authenticate user for login
 * Validates email and returns assigned role
 * In production: POST /api/auth/login with password verification on backend
 * @param {string} email - User email
 * @returns {Object} { success, user, assignedRole, error }
 */
export function authenticateUser(email) {
  const account = findAccountByEmail(email);

  if (!account) {
    return {
      success: false,
      user: null,
      assignedRole: null,
      error: 'Account not found' // Generic for security
    };
  }

  // Return user info and assigned role
  return {
    success: true,
    user: {
      id: account.id,
      name: account.fullName,
      email: account.email
    },
    assignedRole: account.role,
    error: null
  };
}

/**
 * Validate role selection during login
 * Ensures user can only use their assigned role
 * @param {string} email - User email
 * @param {string} selectedRole - Role they're trying to use
 * @returns {Object} { isValid, assignedRole, error }
 */
export function validateLoginRole(email, selectedRole) {
  return validateRoleMatch(email, selectedRole);
}

/**
 * Check if account can have multiple roles
 * Currently, all accounts have exactly one role
 * @param {string} email - User email
 * @returns {Array} Array of allowed roles for this user
 */
export function getAllowedRolesForUser(email) {
  const assignedRole = getAssignedRole(email);
  return assignedRole ? [assignedRole] : [];
}
