import { useState } from 'react';
import { X, BookOpen } from 'lucide-react';
import { sanitizeHTML } from '../utils/security';

const ReadButton = ({ lessonInfo, questionNumber }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Only show the button starting from the second question
  if (questionNumber < 2) {
    return null;
  }

  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = sanitizeHTML(lessonInfo);

  return (
    <>
      {/* Inline Read Button */}
      <div className="w-full mb-6">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-emerald-600 text-white px-6 py-4 rounded-lg font-medium hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 animate-fade-in"
        >
          <BookOpen className="w-5 h-5" />
          <span>Read Lesson Content</span>
        </button>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Lesson Information</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Lesson Content - Using sanitized HTML */}
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
              </div>

              {/* Close Button */}
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                >
                  <span>Close</span>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReadButton;
