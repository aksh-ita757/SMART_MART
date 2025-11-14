import api from './api';

/**
 * AUTH SERVICE
 * Handles all authentication-related API calls
 */

const authService = {
  /**
   * User signup
   * @param {Object} userData - { email, password, name, phone, address }
   * @returns {Promise} - User data and token
   */
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    
    // Save token and user to localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  /**
   * User login
   * @param {Object} credentials - { email, password }
   * @returns {Promise} - User data and token
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    
    // Save token and user to localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart'); // Clear cart on logout
  },

  /**
   * Get current user
   * @returns {Object|null} - User object or null
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Get current token
   * @returns {string|null} - JWT token or null
   */
  getToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Get user profile
   * @returns {Promise} - User profile data
   */
  getProfile: async () => {
    return await api.get('/auth/me');
  },
};

export default authService;