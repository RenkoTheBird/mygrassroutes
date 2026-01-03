// Database utility for API operations
// This connects to the Express server which handles SQLite operations

// Determine API base URL:
// - In development (localhost), always use proxy for better performance
// - Only use VITE_API_URL if it's explicitly set AND we're not on localhost
// - Otherwise use relative URLs (proxied by Vite)
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' || 
   window.location.hostname === '');

const hasNgrokUrl = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.includes('ngrok');

// In development on localhost, always use the proxy (ignore VITE_API_URL if it's ngrok)
const API_BASE_URL = (isLocalhost && hasNgrokUrl)
  ? '/api'  // Prefer proxy in development, even if ngrok URL is set
  : (import.meta.env.VITE_API_URL 
      ? `${import.meta.env.VITE_API_URL}/api` 
      : '/api');

// Log the API configuration for debugging
if (typeof window !== 'undefined') {
  console.log('[Database] API configuration:', {
    isLocalhost,
    hasNgrokUrl,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    API_BASE_URL,
    hostname: window.location.hostname
  });
}

class Database {
  constructor() {
    this.isInitialized = false;
  }

  // Initialize database connection
  async initialize() {
    if (this.isInitialized) return;
    
    // Test connection to the API
    try {
      const healthUrl = API_BASE_URL === '/api' 
        ? '/health'  // Use relative URL for proxy
        : `${API_BASE_URL.replace('/api', '')}/health`;  // Use absolute URL if VITE_API_URL is set
      console.log('Database: Testing connection to:', healthUrl);
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Database: Health check response status:', response.status);
      if (!response.ok) {
        throw new Error(`API server not available: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Database: Health check response:', data);
      this.isInitialized = true;
    } catch (error) {
      console.error('Database: Failed to connect to database API:', error);
      console.error('Database: This might be normal if the server is still starting. Requests will be retried.');
      // Don't throw error, just mark as initialized and let individual requests handle errors
      this.isInitialized = true;
    }
  }

  // Helper method to make API requests
  async apiRequest(endpoint) {
    await this.initialize();
    
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('Database: Making API request to:', url);
      const response = await fetch(url);
      console.log('Database: Response status:', response.status);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Database: Response data:', data);
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get all units
  async getUnits() {
    return await this.apiRequest('/units');
  }

  // Get sections for a specific unit
  async getSectionsByUnit(unitId) {
    console.log('Database: Getting sections for unit:', unitId);
    const result = await this.apiRequest(`/sections/${unitId}`);
    console.log('Database: Sections result:', result);
    return result;
  }

  // Get lessons for a specific section
  async getLessonsBySection(sectionId) {
    return await this.apiRequest(`/lessons/${sectionId}`);
  }

  // Get lessons for a specific unit
  async getLessonsByUnit(unitId) {
    // This would need to be implemented in the API if needed
    throw new Error('getLessonsByUnit not implemented in API');
  }

  // Get a specific lesson
  async getLesson(lessonId) {
    return await this.apiRequest(`/lesson/${lessonId}`);
  }

  // Get a specific unit
  async getUnit(unitId) {
    const units = await this.getUnits();
    return units.find(unit => unit.id === parseInt(unitId));
  }

  // Simulate lesson completion (for future use)
  async completeLesson(userId, lessonId) {
    await this.initialize();
    // In a real app, this would update the user_progress table
    console.log(`User ${userId} completed lesson ${lessonId}`);
    return { success: true };
  }

  // Get user progress (for future use)
  async getUserProgress(userId) {
    await this.initialize();
    // In a real app, this would query the user_progress table
    return [];
  }

  // Get questions for a specific lesson
  async getQuestionsByLesson(lessonId) {
    return await this.apiRequest(`/questions/${lessonId}`);
  }

  // Get a specific question
  async getQuestion(questionId) {
    return await this.apiRequest(`/question/${questionId}`);
  }

  // Get questions by lesson ID with parsed options (alias for getQuestionsByLesson)
  async getQuestionsByLessonWithParsedOptions(lessonId) {
    return await this.getQuestionsByLesson(lessonId);
  }

  // Get lesson content/paragraphs for a specific lesson
  async getLessonContent(lessonId) {
    return await this.apiRequest(`/lesson-content/${lessonId}`);
  }

  // Get all sources grouped by unit, section, and lesson
  async getAllSources() {
    return await this.apiRequest('/sources');
  }
}

// Create and export a singleton instance
const database = new Database();
export default database;