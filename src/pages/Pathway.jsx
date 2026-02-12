import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from "react-router-dom";
import DonationForm from "../components/DonationForm";
import database from "../database/database";
import { useUserProgress } from "../hooks/useUserProgress";
import { useAuth } from "./AuthProvider";
import { CheckCircle, Circle, X } from "lucide-react";

function Pathway() {
  const { user } = useAuth();
  const { isLessonCompleted, toggleLessonCompletion, getProgressStats, loading: userProgressLoading } = useUserProgress();
  const [unit1Lessons, setUnit1Lessons] = useState([]);
  const [databaseLoading, setDatabaseLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const lessonRefs = useRef({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentMessage, setPaymentMessage] = useState(null);
  const hasShownPaymentMessage = useRef(false);

  // Load all Unit 1 lessons on component mount
  useEffect(() => {
    const loadUnit1Lessons = async () => {
      setDatabaseLoading(true);
      setError(null); // Clear any previous errors
      try {
        console.log('[Pathway] Starting to load Unit 1 lessons...');
        // Get all sections for unit 1
        const sections = await database.getSectionsByUnit(1);
        console.log('[Pathway] Got sections:', sections);
        
        // Fetch all lessons for each section
        const lessonsPromises = sections.map(async (section) => {
          console.log(`[Pathway] Fetching lessons for section ${section.id} (${section.title})`);
          const lessons = await database.getLessonsBySection(section.id);
          console.log(`[Pathway] Got ${lessons.length} lessons for section ${section.id}`);
          return lessons.map(lesson => ({
            ...lesson,
            section_number: section.section_number,
            section_title: section.title
          }));
        });
        
        // Flatten all lessons into a single array
        const allLessons = await Promise.all(lessonsPromises);
        const flattenedLessons = allLessons.flat();
        console.log(`[Pathway] Total lessons loaded: ${flattenedLessons.length}`);
        
        // Sort lessons by section number and lesson letter
        flattenedLessons.sort((a, b) => {
          if (a.section_number !== b.section_number) {
            return a.section_number - b.section_number;
          }
          return a.lesson_letter.localeCompare(b.lesson_letter);
        });
        
        setUnit1Lessons(flattenedLessons);
      } catch (error) {
        console.error('Error loading Unit 1 lessons:', error);
        setError('Failed to load lessons. Please try again later.');
      } finally {
        setDatabaseLoading(false);
      }
    };
    
    loadUnit1Lessons();
  }, []);

  // Combined loading state - wait for both database and user progress
  const loading = databaseLoading || userProgressLoading;

  // Check for payment status in URL parameters
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    
    if (paymentStatus && !hasShownPaymentMessage.current) {
      hasShownPaymentMessage.current = true;
      
      if (paymentStatus === 'success') {
        setPaymentMessage({ type: 'success', text: 'Payment processed successfully! Thank you for your support.' });
      } else if (paymentStatus === 'cancelled') {
        setPaymentMessage({ type: 'error', text: 'Payment was cancelled. If you encountered any issues, please try again.' });
      }
      
      // Remove the parameter from URL without reloading
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('payment');
      setSearchParams(newSearchParams, { replace: true });
      
      // Auto-dismiss message after 8 seconds
      const timer = setTimeout(() => {
        setPaymentMessage(null);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams]);

  // Reset payment message flag when component unmounts or route changes
  useEffect(() => {
    return () => {
      hasShownPaymentMessage.current = false;
    };
  }, []);

  // Handle clicks outside lesson boxes to close pop-out
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedLessonId === null) return;
      
      // Check if click is inside any lesson button or pop-out box
      const clickedInside = Object.values(lessonRefs.current).some(ref => 
        ref && ref.contains(event.target)
      );
      
      if (!clickedInside) {
        setSelectedLessonId(null);
      }
    };

    if (selectedLessonId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedLessonId]);

  const handleLessonClick = (lesson, event) => {
    // Stop propagation to prevent immediate closing
    if (event) {
      event.stopPropagation();
    }
    
    // Toggle selection - if clicking the same lesson, deselect it
    if (selectedLessonId === lesson.id) {
      setSelectedLessonId(null);
    } else {
      setSelectedLessonId(lesson.id);
    }
  };

  const handleStartLesson = (lesson) => {
    try {
      console.log('Starting lesson:', lesson);
      window.location.href = `/questions?lesson=${lesson.id}`;
    } catch (error) {
      console.error('Error loading lesson:', error);
      alert(`Error loading lesson: ${lesson.title}`);
    }
  };

    // Helper function to check if a lesson is accessible
    const isLessonAccessible = (lesson, sectionLessons) => {
      if (!user) {
        // When not logged in, only first section is accessible
        return lesson.section_number === 1;
      }
      
      // When logged in, check if previous lesson in the section is completed
      // First lesson (A) is always accessible
      if (lesson.lesson_letter === 'A') {
        return true;
      }
      
      // Find the previous lesson in the same section
      const lessonOrder = ['A', 'B', 'C', 'D', 'E', 'F'];
      const currentIndex = lessonOrder.indexOf(lesson.lesson_letter);
      if (currentIndex === 0) return true; // First lesson
      
      const previousLetter = lessonOrder[currentIndex - 1];
      const previousLesson = sectionLessons.find(
        l => l.section_number === lesson.section_number && l.lesson_letter === previousLetter
      );
      
      if (!previousLesson) return true; // If previous lesson doesn't exist, allow access
      
      // Lesson is accessible if previous lesson is completed
      return isLessonCompleted(previousLesson.id);
    };

    // When logged out, show all lessons but only section 1 is accessible
    // When logged in, show all lessons
    const filteredLessons = unit1Lessons;

    // Group lessons by section
    const groupedLessons = filteredLessons.reduce((acc, lesson) => {
      const sectionKey = `${lesson.section_number}-${lesson.section_title}`;
      if (!acc[sectionKey]) {
        acc[sectionKey] = {
          section_number: lesson.section_number,
          section_title: lesson.section_title,
          lessons: []
        };
      }
      acc[sectionKey].lessons.push(lesson);
      return acc;
    }, {});

    // Separate accessible sections from preview sections when logged out
    const accessibleSections = !user 
      ? Object.values(groupedLessons).filter(section => section.section_number === 1)
      : Object.values(groupedLessons);
    
    const previewSections = !user
      ? Object.values(groupedLessons).filter(section => section.section_number > 1)
      : [];

    // Flatten all lessons for global indexing (Z-pattern)
    const allLessonsFlat = filteredLessons;
    const selectedLesson = selectedLessonId ? allLessonsFlat.find(l => l.id === selectedLessonId) : null;

    return (
        <>
      <div className="bg-gray-50 min-h-screen">
        {/* Sticky Banner - positioned at top */}
        <div className="fixed top-0 left-0 w-full z-40 shadow-sm border-b border-gray-200">
          {user ? (
            // Logged-in user: Progress Banner
            <div className="bg-emerald-50 border-emerald-200 py-3 px-6">
              <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
                <div className="flex items-center gap-3">
                  <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <img 
                      src="/assets/Tree.svg" 
                      alt="Home" 
                      className="h-8 w-8" 
                      onError={(e) => {
                        console.error('Failed to load Tree logo:', '/assets/Tree.svg');
                        e.target.style.display = 'none';
                      }}
                    />
                  </Link>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">
                      {getProgressStats().totalCompleted} {getProgressStats().totalCompleted === 1 ? 'lesson' : 'lessons'} completed
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      document.getElementById('donation-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-sm font-medium text-emerald-700 hover:text-emerald-900 hover:underline flex items-center"
                  >
                    Donate →
                  </button>
                  <Link 
                    to="/dashboard" 
                    className="text-sm font-medium text-emerald-700 hover:text-emerald-900 hover:underline flex items-center"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            // Non-logged-in user: Notice Banner
            <div className="bg-amber-50 py-3 px-4 md:px-6">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                <p className="text-sm text-amber-800 leading-relaxed">
                  You can view the Pathway, but your progress will not be saved.{" "}
                  <Link to="/signup" className="font-medium text-amber-900 hover:underline">
                    Create an account
                  </Link>
                  {" "}to track your progress.
                </p>
                <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                  <Link 
                    to="/" 
                    className="text-sm font-medium text-amber-700 hover:text-amber-900 hover:underline flex items-center"
                  >
                    Return to Home
                  </Link>
                  <Link 
                    to="/login" 
                    className="text-sm font-medium text-amber-700 hover:text-amber-900 hover:underline flex items-center"
                  >
                    Log in
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <main className="pt-32 md:pt-14">
          {/* Payment Status Message */}
          {paymentMessage && (
            <div className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl border-2 animate-slide-down ${
              paymentMessage.type === 'success' 
                ? 'bg-green-600 text-white border-green-700' 
                : 'bg-red-600 text-white border-red-700'
            }`}>
              {paymentMessage.type === 'success' ? (
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
              ) : (
                <X className="w-6 h-6 flex-shrink-0" />
              )}
              <span className="font-semibold text-lg">{paymentMessage.text}</span>
              <button
                onClick={() => setPaymentMessage(null)}
                className="ml-2 hover:opacity-80 transition-opacity"
                aria-label="Dismiss message"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Unit 1 Lessons Path with decorative sides */}
          <section className="pt-8 pb-12 px-4 md:px-6 md:py-12 relative pathway-leaves-bg">

            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8 mt-4 md:mt-0">
                <div className="lg:pl-80 px-4 md:px-0">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 leading-tight scroll-mt-32 md:scroll-mt-14">
                    Unit 1: Grassroots movements
                  </h2>
                  {!user && (
                    <Link 
                      to="/login" 
                      className="inline-block text-sm text-emerald-700 hover:text-emerald-900 hover:underline mt-2"
                    >
                      Log in to save your progress
                    </Link>
                  )}
                </div>
              </div>

              {/* Left side: Fixed panel with progress summary - hidden on mobile */}
              <div className="hidden lg:block fixed left-0 top-[56px] bottom-0 w-80 bg-white border-r-2 border-gray-200 overflow-y-auto z-30">
                <div className="p-6 space-y-6">
                  {/* Unit Description */}
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">Unit 1: Grassroots movements</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Let's explore how to grow change from the ground up! 
                      Learn how individual actions can create meaningful social change, understand effective 
                      strategies for community engagement, and develop the skills needed to mobilize people 
                      around shared goals. Practical examples and scenarios will teach you your rights as a 
                      protestor, the importance of interest groups, the real way to get a boycott working,
                      how to start a petition despite all the bureaucracy, and more.
                    </p>
                  </div>

                  {/* Progress Summary */}
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 shadow-md">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Your Progress</h3>
                    {user ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Lessons Completed</span>
                          <span className="font-bold text-emerald-600">
                            {getProgressStats().totalCompleted} / {allLessonsFlat.length}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(getProgressStats().totalCompleted / allLessonsFlat.length) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {Math.round((getProgressStats().totalCompleted / allLessonsFlat.length) * 100)}% complete
                        </p>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        <p className="mb-3">
                          Log in to track your progress and save your learning journey.
                        </p>
                        <Link 
                          to="/login"
                          className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium w-full sm:w-auto"
                        >
                          Log in
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Z-Pattern Layout with Split Screen */}
              <div className="w-full max-w-7xl mx-auto lg:pl-80 px-4 md:px-0">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    <p className="mt-4 text-gray-600">Loading your path...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center justify-center"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8 relative">
                    {/* Right side: Lesson boxes with Z-pattern */}
                    <div className="w-full space-y-8 relative">
                      {accessibleSections.map((section, sectionIndex) => {
                        return (
                          <div key={`section-${section.section_number}`} className="space-y-6">
                            {/* Section Title */}
                            <div className="text-center mb-6 pt-8 border-t-2 border-gray-200">
                              <h3 className="text-xl font-bold text-emerald-700">
                                Section {section.section_number}: {section.section_title}
                              </h3>
                            </div>
                            
                            {/* Section's Lessons with Z-pattern */}
                            <div className="flex flex-col gap-6 relative">
                              {section.lessons.map((lesson, lessonIndexInSection) => {
                                // Find global index for Z-pattern
                                const globalIndex = allLessonsFlat.findIndex(l => l.id === lesson.id);
                                const isLeft = globalIndex % 2 === 0;
                                const completed = isLessonCompleted(lesson.id);
                                const isSelected = selectedLessonId === lesson.id;
                                const accessible = isLessonAccessible(lesson, section.lessons);
                                
                                return (
                                  <div key={lesson.id} className="relative">
                                    <div className={`flex ${isLeft ? 'justify-start' : 'justify-end'} relative`}>
                                      {/* Lesson Button */}
                                      <div 
                                        className="relative"
                                        ref={(el) => {
                                          if (el) {
                                            lessonRefs.current[lesson.id] = el;
                                          } else {
                                            delete lessonRefs.current[lesson.id];
                                          }
                                        }}
                                      >
                                        <button
                                          onClick={(e) => {
                                            if (!accessible) {
                                              e.stopPropagation();
                                              return;
                                            }
                                            handleLessonClick(lesson, e);
                                          }}
                                          disabled={!accessible}
                                          className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 max-w-xs relative z-0 ${
                                            !accessible
                                              ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                                              : isSelected
                                                ? 'border-emerald-500 shadow-lg ring-2 ring-emerald-200'
                                                : completed 
                                                  ? 'bg-emerald-100 border-emerald-400 hover:bg-emerald-200' 
                                                  : 'bg-white border-emerald-300 hover:border-emerald-400 hover:shadow-md'
                                          }`}
                                        >
                                          <div className="flex items-center gap-3">
                                            {/* Lesson Number Badge */}
                                            <div
                                              className={`w-10 h-10 rounded flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${
                                                !accessible 
                                                  ? 'bg-gray-400' 
                                                  : completed 
                                                    ? 'bg-emerald-600' 
                                                    : 'bg-emerald-600'
                                              }`}
                                            >
                                              {lesson.section_number}-{lesson.lesson_letter}
                                            </div>
                                            
                                            {/* Lesson Title */}
                                            <h3 className={`font-bold text-sm text-left ${
                                              !accessible ? 'text-gray-500' : 'text-gray-800'
                                            }`}>
                                              {lesson.title}
                                            </h3>
                                          </div>
                                        </button>
                                        
                                        {/* Pop-out details box (appears in middle, opposite direction) */}
                                        {isSelected && selectedLesson && (() => {
                                          const selectedLessonAccessible = isLessonAccessible(selectedLesson, section.lessons);
                                          return (
                                            <div 
                                              className={`absolute z-20 ${
                                                // On mobile, always show below; on desktop, show to the side
                                                'top-full mt-2 left-0 md:top-0 md:mt-0'
                                              } ${
                                                // On desktop, alternate sides based on position
                                                isLeft 
                                                  ? 'md:left-full md:ml-4 md:right-auto' 
                                                  : 'md:right-0 md:left-auto md:-translate-x-full md:-mr-4'
                                              } w-full md:w-72 max-w-sm md:max-w-none bg-red-500 border-2 border-red-500 rounded-lg p-4 shadow-2xl animate-fade-in-opacity`}
                                              style={{ 
                                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
                                              }}
                                            >
                                              <div className="space-y-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                  <div
                                                    className={`w-10 h-10 rounded flex items-center justify-center text-white font-bold text-xs ${
                                                      !selectedLessonAccessible
                                                        ? 'bg-gray-400'
                                                        : isLessonCompleted(selectedLesson.id) 
                                                          ? 'bg-emerald-600' 
                                                          : 'bg-emerald-600'
                                                    }`}
                                                  >
                                                    {selectedLesson.section_number}-{selectedLesson.lesson_letter}
                                                  </div>
                                                  <h4 className="font-bold text-sm text-white">
                                                    {selectedLesson.title}
                                                  </h4>
                                                </div>
                                                <p className="text-xs text-white line-clamp-3">
                                                  {selectedLesson.description}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-white">
                                                  <span>{selectedLesson.duration_minutes} min</span>
                                                  {user && (
                                                    <span className={`font-semibold ${
                                                      isLessonCompleted(selectedLesson.id) ? 'text-green-600' : 'text-gray-500'
                                                    }`}>
                                                      {isLessonCompleted(selectedLesson.id) ? '✓' : '○'}
                                                    </span>
                                                  )}
                                                </div>
                                                {!selectedLessonAccessible && user && (
                                                  <p className="text-xs text-white bg-red-600 bg-opacity-50 rounded p-2">
                                                    Complete the previous lesson in this section to unlock this lesson.
                                                  </p>
                                                )}
                                                <button
                                                  onClick={() => {
                                                    if (selectedLessonAccessible) {
                                                      handleStartLesson(selectedLesson);
                                                    }
                                                  }}
                                                  disabled={!selectedLessonAccessible}
                                                  className={`w-full mt-2 px-4 py-2 text-xs font-semibold rounded-lg border-2 transition-all shadow-lg flex items-center justify-center ${
                                                    !selectedLessonAccessible
                                                      ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                                                      : 'bg-white text-emerald-600 hover:bg-gray-50 border-emerald-600 hover:shadow-xl'
                                                  }`}
                                                  style={selectedLessonAccessible ? { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)' } : {}}
                                                >
                                                  {!selectedLessonAccessible 
                                                    ? 'Locked' 
                                                    : isLessonCompleted(selectedLesson.id) 
                                                      ? 'Redo Lesson' 
                                                      : 'Start Lesson'}
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Message for logged-out users about more content */}
                    {!user && (
                      <>
                        <div className="flex justify-center mt-12 mb-8">
                          <div className="inline-block p-6 rounded-lg bg-amber-50 border-2 border-amber-200 max-w-2xl">
                            <p className="text-base text-amber-800 text-center">
                              <span className="font-semibold">Log in to see the rest of the content.</span>
                              {" "}Create an account to access all modules and track your progress.
                            </p>
                            <div className="flex justify-center gap-4 mt-4">
                              <Link 
                                to="/login"
                                className="inline-flex items-center justify-center px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                              >
                                Log in
                              </Link>
                              <Link 
                                to="/signup"
                                className="inline-flex items-center justify-center px-6 py-2 bg-white text-emerald-600 border-2 border-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-medium"
                              >
                                Sign up
                              </Link>
                            </div>
                          </div>
                        </div>
                        
                        {/* Preview of inaccessible content (grayed out) */}
                        {previewSections.length > 0 && (
                          <div className="space-y-8 opacity-40 pointer-events-none">
                            {previewSections.slice(0, 2).map((section) => (
                              <div key={`preview-section-${section.section_number}`} className="space-y-6">
                                {/* Section Title */}
                                <div className="text-center mb-6 pt-8 border-t-2 border-gray-300">
                                  <h3 className="text-xl font-bold text-gray-500">
                                    Section {section.section_number}: {section.section_title}
                                  </h3>
                                </div>
                                
                                {/* Section's Lessons with Z-pattern - grayed out */}
                                <div className="flex flex-col gap-6 relative">
                                  {section.lessons.slice(0, 3).map((lesson) => {
                                    // Find global index for Z-pattern
                                    const globalIndex = allLessonsFlat.findIndex(l => l.id === lesson.id);
                                    const isLeft = globalIndex % 2 === 0;
                                    
                                    return (
                                      <div key={`preview-${lesson.id}`} className="relative">
                                        <div className={`flex ${isLeft ? 'justify-start' : 'justify-end'} relative`}>
                                          {/* Lesson Button - grayed out preview */}
                                          <div className="relative">
                                            <div className="px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-100 max-w-xs relative z-0">
                                              <div className="flex items-center gap-3">
                                                {/* Lesson Number Badge */}
                                                <div className="w-10 h-10 rounded flex items-center justify-center text-white font-bold text-xs flex-shrink-0 bg-gray-400">
                                                  {lesson.section_number}-{lesson.lesson_letter}
                                                </div>
                                                
                                                {/* Lesson Title */}
                                                <h3 className="font-bold text-sm text-gray-500 text-left">
                                                  {lesson.title}
                                                </h3>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Unit 2 Coming Soon - centered */}
              <div className="flex justify-center mt-16 mb-12 lg:pl-80">
                <div className="inline-block p-8 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300">
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Unit 2: Coming Soon
                  </h3>
                  <p className="text-sm text-gray-500">
                    Stay tuned for more content
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Donation Section */}
          <section id="donation-section" className="py-12 px-4 md:px-6 bg-gray-50 lg:pl-80">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                Support Our Mission
              </h2>
              <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Help us continue building tools that make civic engagement accessible to everyone. 
                Your donation directly supports our mission to empower citizens and strengthen democracy.
              </p>
              <DonationForm />
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-100 py-6 text-center text-sm lg:pl-80">
            <p className="font-semibold">mygrassroutes – Politics, step by step.</p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <a href="https://www.instagram.com/mygrassroutes?igsh=cW9tOHdhbmRyOXk4&utm_source=qr" className="text-gray-600 hover:text-emerald-600 transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://bsky.app/profile/mygrassroutes.com" className="text-gray-600 hover:text-emerald-600 transition-colors" aria-label="Bluesky">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                  <path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z"/>
                </svg>
              </a>
              <a href="https://discord.gg/QGwDf2PdYb" className="text-gray-600 hover:text-emerald-600 transition-colors" aria-label="Discord">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
              <a href="https://www.reddit.com/r/mygrassroutes/" className="text-gray-600 hover:text-emerald-600 transition-colors" aria-label="Reddit">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.963-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
              </a>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              Copyright © 2026 mygrassroutes
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}

export default Pathway;