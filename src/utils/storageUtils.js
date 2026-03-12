// Utility functions for localStorage operations

const STORAGE_KEYS = {
  USER: 'siut_user',
  USER_ID: 'siut_user_id',
  USER_LOGIN: 'siut_user_login',
};

/**
 * Save user data to localStorage
 * @param {Object} user - User object with name, surname, login, role, _id, etc.
 */
export const saveUserToStorage = (user) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.USER_ID, user._id || user.id || '');
    localStorage.setItem(STORAGE_KEYS.USER_LOGIN, user.login || '');
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

/**
 * Get user data from localStorage
 * @returns {Object|null} User object or null if not found
 */
export const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error retrieving user from localStorage:', error);
    clearUserFromStorage();
    return null;
  }
};

/**
 * Get user ID from localStorage
 * @returns {string|null} User ID or null if not found
 */
export const getUserIdFromStorage = () => {
  return localStorage.getItem(STORAGE_KEYS.USER_ID);
};

/**
 * Get user login from localStorage
 * @returns {string|null} User login or null if not found
 */
export const getUserLoginFromStorage = () => {
  return localStorage.getItem(STORAGE_KEYS.USER_LOGIN);
};

/**
 * Clear all user data from localStorage
 */
export const clearUserFromStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.USER_LOGIN);
  } catch (error) {
    console.error('Error clearing user from localStorage:', error);
  }
};

/**
 * Check if user is logged in
 * @returns {boolean} True if user is logged in, false otherwise
 */
export const isUserLoggedIn = () => {
  return !!localStorage.getItem(STORAGE_KEYS.USER);
};
