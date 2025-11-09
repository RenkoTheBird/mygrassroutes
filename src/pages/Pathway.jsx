import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import DonationForm from "../components/DonationForm";
import database from "../database/database";
import { useUserProgress } from "../hooks/useUserProgress";
import { useAuth } from "./AuthProvider";
import { CheckCircle, Circle, ArrowDown } from "lucide-react";

function Pathway() {
  const { user } = useAuth();
  const { isLessonCompleted, toggleLessonCompletion, getProgressStats } = useUserProgress();
  const [unit1Lessons, setUnit1Lessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all Unit 1 lessons on component mount
  useEffect(() => {
    const loadUnit1Lessons = async () => {
      setLoading(true);
      try {
        // Get all sections for unit 1
        const sections = await database.getSectionsByUnit(1);
        
        // Fetch all lessons for each section
        const lessonsPromises = sections.map(async (section) => {
          const lessons = await database.getLessonsBySection(section.id);
          return lessons.map(lesson => ({
            ...lesson,
            section_number: section.section_number,
            section_title: section.title
          }));
        });
        
        // Flatten all lessons into a single array
        const allLessons = await Promise.all(lessonsPromises);
        const flattenedLessons = allLessons.flat();
        
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
        setLoading(false);
      }
    };
    
    loadUnit1Lessons();
  }, []);

  const handleLessonClick = async (lesson) => {
    try {
      console.log('Clicking lesson:', lesson);
      window.location.href = `/questions?lesson=${lesson.id}`;
    } catch (error) {
      console.error('Error loading lesson:', error);
      alert(`Error loading lesson: ${lesson.title}`);
    }
  };

    // Group lessons by section
    const groupedLessons = unit1Lessons.reduce((acc, lesson) => {
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
                    <img src="/assets/Tree.svg" alt="Home" className="h-8 w-8" />
                  </Link>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">
                      {getProgressStats().totalCompleted} {getProgressStats().totalCompleted === 1 ? 'lesson' : 'lessons'} completed
                    </span>
                  </div>
                </div>
                <Link 
                  to="/dashboard" 
                  className="text-sm font-medium text-emerald-700 hover:text-emerald-900 hover:underline flex items-center"
                >
                  View Profile →
                </Link>
              </div>
            </div>
          ) : (
            // Non-logged-in user: Notice Banner
            <div className="bg-amber-50 py-3 px-6">
              <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
                <p className="text-sm text-amber-800">
                  You can view the Pathway, but your progress will not be saved.{" "}
                  <Link to="/signup" className="font-medium text-amber-900 hover:underline">
                    Create an account
                  </Link>
                  {" "}to track your progress.
                </p>
                <div className="flex items-center gap-4">
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

        <main style={{ paddingTop: '56px' }}>
          {/* Unit 1 Lessons Path with decorative sides */}
          <section className="py-12 px-4 md:px-6 relative pathway-leaves-bg">

            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  Unit 1: Grassroots movements
                </h2>
                {!user && (
                  <Link 
                    to="/login" 
                    className="inline-block text-sm text-emerald-700 hover:text-emerald-900 hover:underline"
                  >
                    Log in to save your progress
                  </Link>
                )}
              </div>

              {/* Centered content with max width */}
              <div className="flex justify-center">
                <div className="w-full max-w-2xl">

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
                        className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.values(groupedLessons).map((section, sectionIndex) => {
                        let lessonIndex = 0; // Track lesson index within each section
                        return (
                          <div key={`section-${section.section_number}`} className="space-y-4">
                            {/* Section Title */}
                            <div className="text-center mb-6 pt-8 border-t-2 border-gray-200">
                              <h3 className="text-xl font-bold text-emerald-700">
                                Section {section.section_number}: {section.section_title}
                              </h3>
                            </div>
                            
                            {/* Section's Lessons */}
                            {section.lessons.map((lesson) => {
                              const completed = isLessonCompleted(lesson.id);
                              const isFirstLesson = lessonIndex === 0;
                              lessonIndex++;
                              
                              return (
                                <div key={lesson.id} className="relative">
                                  {/* Arrow connector */}
                                  {!isFirstLesson && (
                                    <div className="absolute left-6 top-0 w-0.5 h-8 bg-gray-300 transform -translate-y-full">
                                      <ArrowDown className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-4 h-4 text-gray-300" />
                                    </div>
                                  )}
                                  
                                  <button
                                    onClick={() => handleLessonClick(lesson)}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                                      completed 
                                        ? 'bg-gray-100 border-gray-300 hover:bg-gray-200' 
                                        : 'bg-white border-emerald-300 hover:border-emerald-400 hover:shadow-lg'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      {/* Lesson Number/Letter Badge */}
                                      <div className="flex-shrink-0">
                                        <div
                                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                                            completed ? 'bg-gray-400' : 'bg-emerald-600'
                                          }`}
                                        >
                                          {lesson.section_number}-{lesson.lesson_letter}
                                        </div>
                                      </div>
                                      
                                      {/* Lesson Content */}
                                      <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm text-gray-800 mb-1">
                                          {lesson.title}
                                        </h3>
                                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                          {lesson.description}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                          <span>{lesson.duration_minutes} min</span>
                                          {user && (
                                            <span className={`font-semibold ${completed ? 'text-green-600' : 'text-gray-400'}`}>
                                              {completed ? '✓ Completed' : '○ In progress'}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Completion Check */}
                                      {user && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleLessonCompletion(lesson.id);
                                          }}
                                          className="flex-shrink-0"
                                        >
                                          {completed ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                          ) : (
                                            <Circle className="w-5 h-5 text-gray-400 hover:text-emerald-600" />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Unit 2 Coming Soon - centered */}
              <div className="flex justify-center mt-16 mb-12">
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
          <section className="py-12 px-4 md:px-6 bg-gray-50">
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
          <footer className="bg-gray-100 py-6 text-center text-sm">
            <p className="font-semibold">mygrassroutes – Learn. Act. Lead.</p>
            <p className="mt-2 text-xs text-gray-600">
              Copyright © 2025 mygrassroutes
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}

export default Pathway;