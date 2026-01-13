import { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from "firebase/firestore";
import { db } from "../firebase";

const COUNTER_DOC_PATH = "globalStats/questionsAnswered";
const COMPLETIONS_COLLECTION = "completions";

/**
 * Increment the global questions answered counter
 * Uses deduplication to prevent counting the same completion event twice
 */
export async function incrementQuestionsAnswered(userId, lessonId, questionCount) {
  if (!userId || !lessonId || !questionCount || questionCount <= 0) {
    console.error("Invalid parameters for incrementQuestionsAnswered");
    return false;
  }

  try {
    const lessonIdStr = String(lessonId);
    const timestamp = Date.now();
    
    // Create unique completion ID for deduplication
    // Format: userId_lessonId_timestamp (rounded to nearest second to catch rapid duplicates)
    const completionId = `${userId}_${lessonIdStr}_${Math.floor(timestamp / 1000)}`;
    
    // Check if this completion was already processed
    const completionsRef = collection(db, COUNTER_DOC_PATH, COMPLETIONS_COLLECTION);
    const completionDocRef = doc(completionsRef, completionId);
    const completionDoc = await getDoc(completionDocRef);
    
    if (completionDoc.exists()) {
      console.log("Completion already processed, skipping:", completionId);
      return true; // Already counted, but return success
    }
    
    // Mark this completion as processed first (to prevent race conditions)
    await setDoc(completionDocRef, {
      userId,
      lessonId: lessonIdStr,
      questionCount,
      timestamp: Timestamp.fromMillis(timestamp),
      processedAt: serverTimestamp()
    });
    
    // Get or create the counter document
    const counterDocRef = doc(db, COUNTER_DOC_PATH);
    const counterDoc = await getDoc(counterDocRef);
    
    if (counterDoc.exists()) {
      // Increment existing counter
      await updateDoc(counterDocRef, {
        count: increment(questionCount),
        lastUpdated: serverTimestamp()
      });
    } else {
      // Create new counter document
      await setDoc(counterDocRef, {
        count: questionCount,
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error incrementing questions answered counter:", error);
    // Don't throw - allow graceful degradation
    return false;
  }
}

/**
 * Get the current questions answered count
 */
export async function getQuestionsAnsweredCount() {
  try {
    const counterDocRef = doc(db, COUNTER_DOC_PATH);
    const counterDoc = await getDoc(counterDocRef);
    
    if (counterDoc.exists()) {
      const data = counterDoc.data();
      return data.count || 0;
    }
    
    return 0;
  } catch (error) {
    console.error("Error getting questions answered count:", error);
    return 0;
  }
}

/**
 * Subscribe to real-time updates of the questions answered counter
 * Returns an unsubscribe function
 */
export function subscribeToCounter(callback) {
  const counterDocRef = doc(db, COUNTER_DOC_PATH);
  
  const unsubscribe = onSnapshot(
    counterDocRef,
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const count = data.count || 0;
        callback(count);
      } else {
        callback(0);
      }
    },
    (error) => {
      console.error("Error subscribing to counter:", error);
      // On error, try to get current value once
      getQuestionsAnsweredCount().then(callback).catch(() => callback(0));
    }
  );
  
  return unsubscribe;
}

