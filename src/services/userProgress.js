import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc, 
  serverTimestamp,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Get user's progress document for a specific lesson
 */
export async function getLessonProgress(userId, lessonId) {
  try {
    // Ensure lessonId is treated as string for consistency
    const lessonIdStr = String(lessonId);
    const lessonProgressRef = doc(db, "userProgress", `${userId}_${lessonIdStr}`);
    const docSnap = await getDoc(lessonProgressRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting lesson progress:", error);
    return null;
  }
}

/**
 * Mark a lesson as complete or incomplete
 */
export async function updateLessonProgress(userId, lessonId, isComplete) {
  try {
    const lessonIdStr = String(lessonId);
    const docId = `${userId}_${lessonIdStr}`;
    const lessonProgressRef = doc(db, "userProgress", docId);
    
    // Write to Firestore - with persistence enabled, this will be queued if offline
    await setDoc(lessonProgressRef, {
      userId,
      lessonId: lessonIdStr,
      isComplete,
      updatedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    // Don't log errors here since we're running async and errors are expected with connectivity issues
    // The write will be retried automatically by Firestore when connection is restored
    return false;
  }
}

/**
 * Get all completed lessons for a user
 */
export async function getCompletedLessons(userId) {
  try {
    const q = query(
      collection(db, "userProgress"),
      where("userId", "==", userId),
      where("isComplete", "==", true)
    );
    
    // Add timeout to prevent hanging on connection issues
    const queryPromise = getDocs(q);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 3000)
    );
    
    const querySnapshot = await Promise.race([queryPromise, timeoutPromise]);
    const completedLessons = [];
    
    querySnapshot.forEach((doc) => {
      completedLessons.push(doc.data());
    });
    
    return completedLessons;
  } catch (error) {
    // If query times out or fails, return empty array
    // Firestore persistence will serve cached data on next attempt
    return [];
  }
}

/**
 * Get user's overall progress statistics
 */
export async function getUserProgressStats(userId) {
  try {
    const completedLessons = await getCompletedLessons(userId);
    return {
      totalCompleted: completedLessons.length,
      completedLessonIds: completedLessons.map(l => l.lessonId)
    };
  } catch (error) {
    console.error("Error getting user progress stats:", error);
    return {
      totalCompleted: 0,
      completedLessonIds: []
    };
  }
}

/**
 * Check if a specific lesson is completed
 */
export async function isLessonCompleted(userId, lessonId) {
  try {
    const progress = await getLessonProgress(userId, lessonId);
    return progress?.isComplete === true;
  } catch (error) {
    console.error("Error checking lesson completion:", error);
    return false;
  }
}

/**
 * Toggle lesson completion status
 */
export async function toggleLessonCompletion(userId, lessonId) {
  try {
    const currentProgress = await getLessonProgress(userId, lessonId);
    const newStatus = !(currentProgress?.isComplete === true);
    return await updateLessonProgress(userId, lessonId, newStatus);
  } catch (error) {
    console.error("Error toggling lesson completion:", error);
    return false;
  }
}

