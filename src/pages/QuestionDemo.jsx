import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import QuestionDisplay from '../components/QuestionDisplay';
import database from '../database/database';
import { useUserProgress } from '../hooks/useUserProgress';

const QuestionDemo = () => {
  const [searchParams] = useSearchParams();
  const { markLessonComplete, user } = useUserProgress();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lessonInfo, setLessonInfo] = useState('');
  const [lessonContent, setLessonContent] = useState([]);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);

  // Get lesson ID from URL parameters, default to 1
  const lessonId = parseInt(searchParams.get('lesson')) || 1;

  useEffect(() => {
    // Prevent body scrolling on mount
    document.body.style.overflow = 'hidden';
    return () => {
      // Restore scrolling on unmount
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        console.log('Loading questions for lesson ID:', lessonId);
        // Set start time when lesson loads
        setStartTime(Date.now());
        
        // Load questions for the specified lesson
        const questionsData = await database.getQuestionsByLessonWithParsedOptions(lessonId);
        console.log('Loaded questions:', questionsData.length, 'questions');
        setQuestions(questionsData);
        
        // Load lesson content from database
        const contentData = await database.getLessonContent(lessonId);
        console.log('Loaded lesson content:', contentData.length, 'content items');
        console.log('Content data:', contentData);
        setLessonContent(contentData);
        
        // Generate lesson info HTML from database content
        const lessonInfoHTML = generateLessonInfoHTML(contentData);
        console.log('Generated lesson info HTML:', lessonInfoHTML);
        setLessonInfo(lessonInfoHTML);
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [lessonId]);

  // Track elapsed time
  useEffect(() => {
    if (!startTime || lessonCompleted) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000); // Time in seconds
      setTimeSpent(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, lessonCompleted]);

  // Mark lesson as complete when lesson is completed
  useEffect(() => {
    const markComplete = async () => {
      if (lessonCompleted && !hasMarkedComplete) {
        console.log('[QuestionDemo] Marking lesson complete:', lessonId);
        try {
          await markLessonComplete(lessonId);
          console.log('[QuestionDemo] Lesson marked complete');
          setHasMarkedComplete(true);
        } catch (error) {
          console.error('Error marking lesson complete:', error);
        }
      }
    };

    markComplete();
  }, [lessonCompleted, hasMarkedComplete, lessonId, markLessonComplete]);

  const handleAnswer = (answerData) => {
    setAnswers(prev => [...prev, answerData]);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Lesson completed - calculate final time and show completion screen
      const finalTime = Math.floor((Date.now() - startTime) / 1000);
      setTimeSpent(finalTime);
      setLessonCompleted(true);
      console.log('All answers:', answers);
    }
  };

  // Helper function to generate HTML from lesson content
  const generateLessonInfoHTML = (contentData) => {
    if (!contentData || contentData.length === 0) {
      return '<p>No lesson content available.</p>';
    }

    let html = '<div class="space-y-4">';
    
    contentData.forEach((item, index) => {
      switch (item.content_type) {
        case 'header':
          html += `<h3 class="text-xl font-semibold text-gray-800 mb-4">${item.title}</h3>`;
          const headerContentWithBreaks = item.content.replace(/\n/g, '<br>');
          html += `<p class="text-gray-700">${headerContentWithBreaks}</p>`;
          break;
        case 'paragraph':
          html += `<div class="mb-4">`;
          if (item.title) {
            html += `<h4 class="text-lg font-medium text-gray-800 mb-2">${item.title}</h4>`;
          }
          // Convert newlines to HTML line breaks
          const contentWithBreaks = item.content.replace(/\n/g, '<br>');
          html += `<p class="text-gray-700">${contentWithBreaks}</p>`;
          html += `</div>`;
          break;
        case 'tip':
          html += `<div class="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">`;
          const tipContentWithBreaks = item.content.replace(/\n/g, '<br>');
          html += `<p class="text-blue-800"><strong>${item.title}:</strong> ${tipContentWithBreaks}</p>`;
          html += `</div>`;
          break;
        case 'list':
          html += `<div class="mb-4">`;
          if (item.title) {
            html += `<h4 class="text-lg font-medium text-gray-800 mb-2">${item.title}</h4>`;
          }
          html += `<ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">`;
          // Split content by newlines to create list items
          item.content.split('\n').forEach(line => {
            if (line.trim()) {
              html += `<li>${line.trim()}</li>`;
            }
          });
          html += `</ul>`;
          html += `</div>`;
          break;
        default:
          html += `<p class="text-gray-700">${item.content}</p>`;
      }
    });
    
    html += '</div>';
    return html;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Questions Available</h2>
          <p className="text-gray-600 mb-6">There are no questions available for this lesson.</p>
          <Link
            to="/pathway"
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Back to Pathway
          </Link>
        </div>
      </div>
    );
  }

  // Show completion screen when lesson is completed
  if (lessonCompleted) {
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      if (mins === 0) return `${secs}s`;
      return `${mins}m ${secs}s`;
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 md:p-12 text-center animate-fade-in">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Completion Message */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Lesson Complete!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            You've successfully completed the lesson. Great work!
          </p>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row gap-6 mb-8">
            {/* Questions Completed */}
            <div className="flex-1 bg-emerald-50 rounded-lg p-8 border-2 border-emerald-200">
              <div className="text-5xl font-bold text-emerald-700 mb-3">
                {questions.length}
              </div>
              <div className="text-base text-gray-600 uppercase tracking-wide">
                Questions Completed
              </div>
            </div>

            {/* Time Spent */}
            <div className="flex-1 bg-purple-50 rounded-lg p-8 border-2 border-purple-200">
              <div className="text-5xl font-bold text-purple-700 mb-3">
                {formatTime(timeSpent)}
              </div>
              <div className="text-base text-gray-600 uppercase tracking-wide">
                Time Spent
              </div>
            </div>
          </div>

          {/* Return Button */}
          <Link
            to="/pathway"
            className="inline-block bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
          >
            Return to Pathway
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50">
      {/* Fixed Progress Bar at Top */}
      <div className="bg-white shadow-sm flex-shrink-0 relative">
        {/* X button in top left */}
        <Link
          to="/pathway"
          className="absolute left-4 top-3 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Back to Pathway"
        >
          <X className="w-6 h-6 text-gray-600" />
        </Link>
        <div className="max-w-6xl mx-auto px-6 py-2">
          <div className="mb-1">
            <span className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto min-h-0 flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-6 py-6 w-full">
          {/* Question Display - Centered */}
          <QuestionDisplay
            question={currentQuestion}
            onAnswer={handleAnswer}
            onNext={handleNext}
            isLastQuestion={isLastQuestion}
            showFeedback={true}
            questionNumber={currentQuestionIndex + 1}
            lessonInfo={lessonInfo}
          />
        </div>
      </main>
    </div>
  );
};

export default QuestionDemo;
