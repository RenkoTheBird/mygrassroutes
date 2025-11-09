import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../pages/AuthProvider";
import * as progressService from "../services/userProgress";

export function useUserProgress() {
  const { user } = useAuth();
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load completed lessons when user changes
  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        setLoading(true);
        try {
          // Load from Firestore
          const firestoreProgress = await progressService.getCompletedLessons(user.uid);
          
          // Load from localStorage
          const localStorageProgress = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`completedLesson_${user.uid}_`)) {
              try {
                const data = JSON.parse(localStorage.getItem(key));
                localStorageProgress.push(data);
              } catch (e) {
                console.error("Error parsing localStorage data:", e);
              }
            }
          }
          
          // Merge Firestore and localStorage data (prioritize Firestore for recent data)
          const mergedProgress = [...firestoreProgress];
          localStorageProgress.forEach(localLesson => {
            const exists = mergedProgress.some(fsLesson => String(fsLesson.lessonId) === String(localLesson.lessonId));
            if (!exists) {
              mergedProgress.push(localLesson);
            }
          });
          
          setCompletedLessons(mergedProgress);
        } catch (error) {
          console.error("Error loading user progress:", error);
          // Still try to load from localStorage even if Firestore fails
          const localStorageProgress = [];
          if (user) {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith(`completedLesson_${user.uid}_`)) {
                try {
                  const data = JSON.parse(localStorage.getItem(key));
                  localStorageProgress.push(data);
                } catch (e) {
                  console.error("Error parsing localStorage data:", e);
                }
              }
            }
          }
          setCompletedLessons(localStorageProgress);
        } finally {
          setLoading(false);
        }
      } else {
        setCompletedLessons([]);
        setLoading(false);
      }
    };

    loadProgress();
  }, [user]);

  const isLessonCompleted = (lessonId) => {
    if (!user) return false;
    // Use Map for O(1) lookup instead of O(n) Array.some()
    return completedLessons.some(progress => {
      return String(progress.lessonId) === String(lessonId) && progress.isComplete;
    });
  };

  const toggleLessonCompletion = useCallback(async (lessonId) => {
    if (!user) {
      console.log("No user logged in");
      return false;
    }

    const lessonIdStr = String(lessonId);
    const currentStatus = isLessonCompleted(lessonIdStr);
    const newStatus = !currentStatus;
    
    // Update local state immediately
    setCompletedLessons(prev => {
      if (newStatus) {
        // Add to completed
        const exists = prev.some(p => String(p.lessonId) === lessonIdStr);
        if (exists) return prev;
        return [...prev, { lessonId: lessonIdStr, isComplete: true }];
      } else {
        // Remove from completed
        return prev.filter(p => String(p.lessonId) !== lessonIdStr);
      }
    });
    
    try {
      const success = await progressService.updateLessonProgress(user.uid, lessonIdStr, newStatus);
      
      if (!success) {
        // Revert local state on failure
        setCompletedLessons(prev => {
          if (currentStatus) {
            // We tried to unmark, so add it back
            const exists = prev.some(p => String(p.lessonId) === lessonIdStr);
            if (exists) return prev;
            return [...prev, { lessonId: lessonIdStr, isComplete: true }];
          } else {
            // We tried to mark, so remove it
            return prev.filter(p => String(p.lessonId) !== lessonIdStr);
          }
        });
      }
      
      return success;
    } catch (error) {
      // Revert on error
      setCompletedLessons(prev => {
        if (currentStatus) {
          const exists = prev.some(p => String(p.lessonId) === lessonIdStr);
          if (exists) return prev;
          return [...prev, { lessonId: lessonIdStr, isComplete: true }];
        } else {
          return prev.filter(p => String(p.lessonId) !== lessonIdStr);
        }
      });
      console.error("Error toggling lesson completion:", error);
      return false;
    }
  }, [user, isLessonCompleted]);

  const markLessonComplete = useCallback(async (lessonId) => {
    if (!user) {
      console.log("No user logged in");
      return false;
    }

    const lessonIdStr = String(lessonId);
    
    // Save to localStorage for instant persistence
    const localStorageKey = `completedLesson_${user.uid}_${lessonIdStr}`;
    localStorage.setItem(localStorageKey, JSON.stringify({ lessonId: lessonIdStr, isComplete: true, timestamp: Date.now() }));
    
    // Update local state immediately for instant UI feedback
    setCompletedLessons(prev => {
      const exists = prev.some(p => String(p.lessonId) === lessonIdStr);
      if (exists) return prev; // Already exists, don't add duplicate
      return [...prev, { lessonId: lessonIdStr, isComplete: true }];
    });
    
    // Save to Firestore asynchronously (fire and forget)
    // With offline persistence enabled, this will eventually sync
    progressService.updateLessonProgress(user.uid, lessonIdStr, true)
      .then(success => {
        if (!success) {
          console.error("Background save to Firestore failed, but data will retry");
        }
      })
      .catch(error => {
        console.error("Error in background Firestore save:", error);
      });
    
    return true; // Return immediately
  }, [user]);

  const getProgressStats = () => {
    return {
      totalCompleted: completedLessons.length,
      completedLessonIds: completedLessons.map(l => l.lessonId)
    };
  };

  const reloadProgress = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const progress = await progressService.getCompletedLessons(user.uid);
      setCompletedLessons(progress);
    } catch (error) {
      console.error("Error reloading user progress:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    completedLessons,
    isLessonCompleted,
    toggleLessonCompletion,
    markLessonComplete,
    getProgressStats,
    reloadProgress,
    loading,
    user
  };
}

