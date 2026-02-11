// Global Questions Counter Service
// Uses PostgreSQL via API instead of Firestore
import { authenticatedPost } from '../utils/api';

/**
 * Increment the global questions answered counter
 * Uses deduplication to prevent counting the same completion event twice
 */
export async function incrementQuestionsAnswered(userId, lessonId, questionCount) {
  console.log("[Global Counter] incrementQuestionsAnswered called with:", { userId, lessonId, questionCount });
  
  if (!userId || !lessonId || !questionCount || questionCount <= 0) {
    console.error("[Global Counter] Invalid parameters for incrementQuestionsAnswered:", { userId, lessonId, questionCount });
    return false;
  }

  try {
    console.log("[Global Counter] Making authenticated API request to /global-counter/increment");
    
    const response = await authenticatedPost('/global-counter/increment', {
      userId,
      lessonId: String(lessonId),
      questionCount
    });
    
    console.log("[Global Counter] Response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error("[Global Counter] API error:", errorData);
      throw new Error(`API request failed: ${response.status} ${errorData.message || response.statusText}`);
    }
    
    const data = await response.json();
    console.log("[Global Counter] API response:", data);
    
    if (data.success) {
      console.log("[Global Counter] Counter incremented successfully, new count:", data.count);
      return true;
    } else {
      console.error("[Global Counter] API returned success: false");
      return false;
    }
  } catch (error) {
    console.error("[Global Counter] Error incrementing questions answered counter:", error);
    console.error("[Global Counter] Error details:", {
      message: error.message,
      stack: error.stack
    });
    // Don't throw - allow graceful degradation
    return false;
  }
}

/**
 * Get the current questions answered count
 */
export async function getQuestionsAnsweredCount() {
  try {
    const url = `${API_BASE_URL}/global-counter/count`;
    console.log("[Global Counter] Getting count from:", url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("[Global Counter] Error getting count, status:", response.status);
      return 0;
    }
    
    const data = await response.json();
    const count = data.count || 0;
    console.log("[Global Counter] Current count:", count);
    return count;
  } catch (error) {
    console.error("[Global Counter] Error getting questions answered count:", error);
    return 0;
  }
}

/**
 * Subscribe to real-time updates of the questions answered counter
 * Since we're using PostgreSQL, we'll poll the API periodically
 * Returns an unsubscribe function
 */
export function subscribeToCounter(callback) {
  console.log("[Global Counter] Setting up polling subscription");
  
  // Poll every 2 seconds for updates
  const pollInterval = setInterval(async () => {
    try {
      const count = await getQuestionsAnsweredCount();
      callback(count);
    } catch (error) {
      console.error("[Global Counter] Error in polling:", error);
    }
  }, 2000);
  
  // Also get initial value immediately
  getQuestionsAnsweredCount().then(callback).catch(() => callback(0));
  
  // Return unsubscribe function
  return () => {
    console.log("[Global Counter] Unsubscribing from counter");
    clearInterval(pollInterval);
  };
}
