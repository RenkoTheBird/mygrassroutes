import { useState, useEffect } from 'react';
import { X, Check, XCircle } from 'lucide-react';
import ReadButton from './ReadButton';

const QuestionDisplay = ({ 
  question, 
  onAnswer, 
  onNext, 
  isLastQuestion = false,
  showFeedback = true,
  lessonInfo = '',
  questionNumber = 1
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState([]); // For select all questions
  const [fillBlankAnswer, setFillBlankAnswer] = useState(''); // For fill in the blank
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [shakeAnimation, setShakeAnimation] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer('');
    setSelectedAnswers([]);
    setFillBlankAnswer('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowExplanation(false);
    setShakeAnimation(false);
  }, [question?.id]);

  const handleAnswer = (answer) => {
    if (isAnswered) return;

    let correct = false;
    
    switch (question.question_type) {
      case 'multiple_choice':
        setSelectedAnswer(answer);
        correct = answer === question.correct_answer;
        break;
      case 'true_false':
        setSelectedAnswer(answer);
        correct = answer === question.correct_answer;
        break;
      case 'select_all':
        const newAnswers = selectedAnswers.includes(answer)
          ? selectedAnswers.filter(a => a !== answer)
          : [...selectedAnswers, answer];
        setSelectedAnswers(newAnswers);
        return; // Don't submit yet for select all
      case 'fill_blank':
        setFillBlankAnswer(answer);
        correct = answer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
        break;
      default:
        return;
    }

    setIsAnswered(true);
    setIsCorrect(correct);
    
    if (correct) {
      setShowExplanation(true);
    } else {
      setShakeAnimation(true);
      setTimeout(() => setShakeAnimation(false), 500);
    }

    if (onAnswer) {
      onAnswer({
        questionId: question.id,
        userAnswer: question.question_type === 'select_all' ? selectedAnswers : answer,
        isCorrect: correct,
        questionType: question.question_type
      });
    }
  };

  const handleRetry = () => {
    // Reset all state to allow retrying
    setSelectedAnswer('');
    setSelectedAnswers([]);
    setFillBlankAnswer('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowExplanation(false);
    setShakeAnimation(false);
  };

  const handleSelectAllSubmit = () => {
    if (isAnswered || selectedAnswers.length === 0) return;

    const correctAnswers = question.correct_answer.split(',').map(a => a.trim());
    const isCorrectAnswer = correctAnswers.every(answer => selectedAnswers.includes(answer)) &&
                           selectedAnswers.every(answer => correctAnswers.includes(answer));
    
    setIsAnswered(true);
    setIsCorrect(isCorrectAnswer);
    
    if (isCorrectAnswer) {
      setShowExplanation(true);
    } else {
      setShakeAnimation(true);
      setTimeout(() => setShakeAnimation(false), 500);
    }

    if (onAnswer) {
      onAnswer({
        questionId: question.id,
        userAnswer: selectedAnswers,
        isCorrect: isCorrectAnswer,
        questionType: question.question_type
      });
    }
  };

  const getAnswerButtonClass = (option, index, optionKey) => {
    const baseClass = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:shadow-md";
    
    if (!isAnswered) {
      return `${baseClass} border-gray-200 hover:border-emerald-300 hover:bg-emerald-50`;
    }
    
    let isCorrectOption = false;
    let isSelectedOption = false;
    
    if (question.question_type === 'multiple_choice') {
      isCorrectOption = optionKey === question.correct_answer;
      isSelectedOption = optionKey === selectedAnswer;
    } else if (question.question_type === 'select_all') {
      const correctAnswers = question.correct_answer.split(',').map(a => a.trim());
      isCorrectOption = correctAnswers.includes(optionKey);
      isSelectedOption = selectedAnswers.includes(optionKey);
    }
    
    // Only show correct answers if the user's overall answer is correct
    if (isCorrect) {
      if (isCorrectOption && isSelectedOption) {
        return `${baseClass} border-green-500 bg-green-100 text-green-800`;
      } else if (isCorrectOption) {
        return `${baseClass} border-green-500 bg-green-50 text-green-700`;
      } else if (isSelectedOption && !isCorrectOption) {
        return `${baseClass} border-green-500 bg-green-50 text-green-700`;
      } else {
        return `${baseClass} border-gray-200 bg-gray-50 text-gray-600`;
      }
    } else {
      // For incorrect answers, only highlight what the user selected (in red)
      if (isSelectedOption) {
        return `${baseClass} border-red-500 bg-red-100 text-red-800`;
      } else {
        return `${baseClass} border-gray-200 bg-gray-50 text-gray-600`;
      }
    }
  };

  const renderQuestionContent = () => {
    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const optionKey = String.fromCharCode(65 + index); // A, B, C, D
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(optionKey)}
                  className={getAnswerButtonClass(option, index, optionKey)}
                  disabled={isAnswered}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      !isAnswered ? 'bg-gray-200 text-gray-600' :
                      isCorrect ? (
                        optionKey === question.correct_answer && optionKey === selectedAnswer ? 'bg-green-500 text-white' :
                        optionKey === question.correct_answer ? 'bg-green-500 text-white' :
                        optionKey === selectedAnswer ? 'bg-green-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      ) : (
                        optionKey === selectedAnswer ? 'bg-red-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      )
                    }`}>
                      {optionKey}
                    </div>
                    <span className="flex-1">{option}</span>
                    {isAnswered && optionKey === selectedAnswer && (
                      isCorrect ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        );

      case 'true_false':
        return (
          <div className="grid grid-cols-2 gap-4">
            {['True', 'False'].map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={getAnswerButtonClass(option, 0, option)}
                disabled={isAnswered}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg font-semibold">{option}</span>
                  {isAnswered && selectedAnswer === option && (
                    option === question.correct_answer ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )
                  )}
                </div>
              </button>
            ))}
          </div>
        );

      case 'select_all':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const optionKey = String.fromCharCode(65 + index); // A, B, C, D
              const isSelected = selectedAnswers.includes(optionKey);
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(optionKey)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    !isAnswered ? (
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-100 text-emerald-800' 
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                    ) : (
                      getAnswerButtonClass(option, index, optionKey)
                    )
                  }`}
                  disabled={isAnswered}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      !isAnswered ? (
                        isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
                      ) : (
                        isCorrect ? (
                          question.correct_answer.split(',').map(a => a.trim()).includes(optionKey) && isSelected ? 'bg-green-500 text-white' :
                          question.correct_answer.split(',').map(a => a.trim()).includes(optionKey) ? 'bg-green-500 text-white' :
                          isSelected ? 'bg-green-500 text-white' :
                          'bg-gray-200 text-gray-600'
                        ) : (
                          isSelected ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                        )
                      )
                    }`}>
                      {optionKey}
                    </div>
                    <span className="flex-1">{option}</span>
                    {isAnswered && selectedAnswers.includes(optionKey) && (
                      isCorrect ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )
                    )}
                  </div>
                </button>
              );
            })}
            {!isAnswered && selectedAnswers.length > 0 && (
              <button
                onClick={handleSelectAllSubmit}
                className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Submit Selection
              </button>
            )}
          </div>
        );

      case 'fill_blank':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                {question.question_text.replace('_______', '_______')}
              </p>
            </div>
            <input
              type="text"
              value={fillBlankAnswer}
              onChange={(e) => setFillBlankAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fillBlankAnswer && handleAnswer(fillBlankAnswer)}
              placeholder="Enter your answer..."
              className={`w-full p-4 border-2 rounded-lg text-lg ${
                !isAnswered 
                  ? 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200' 
                  : isCorrect 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-red-500 bg-red-50'
              }`}
              disabled={isAnswered}
            />
            {!isAnswered && fillBlankAnswer && (
              <button
                onClick={() => handleAnswer(fillBlankAnswer)}
                className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Submit Answer
              </button>
            )}
          </div>
        );

      default:
        return <div>Unknown question type</div>;
    }
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'true_false':
        return 'True/False';
      case 'select_all':
        return 'Select All';
      case 'fill_blank':
        return 'Fill in the Blank';
      default:
        return type;
    }
  };

  if (!question) {
    return <div className="text-center text-gray-500">No question available</div>;
  }

  return (
    <div className={`max-w-4xl mx-auto p-4 md:p-6 bg-white shadow-lg border-4 ${shakeAnimation ? 'animate-shake' : ''}`} style={{ borderColor: '#059669' }}>
      {/* Read Button - Shows lesson information */}
      <ReadButton 
        lessonInfo={lessonInfo} 
        questionNumber={questionNumber} 
      />

      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-emerald-600 uppercase tracking-wide">Question</span>
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide bg-gray-100 px-3 py-1 rounded">
            {getQuestionTypeLabel(question.question_type)}
          </span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">
          {question.question_text}
        </h2>
      </div>

      {/* Question Content */}
      <div className="mb-6">
        {renderQuestionContent()}
      </div>

      {/* Retry Button - Show when answer is wrong */}
      {isAnswered && !isCorrect && !showExplanation && (
        <div className="mb-6 flex justify-center">
          <button
            onClick={handleRetry}
            className="bg-amber-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center space-x-2 shadow-md"
          >
            <span>Try Again</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      )}

      {/* Feedback Modal */}
      {showExplanation && showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800">Correct!</h3>
                </div>
                <button
                  onClick={() => setShowExplanation(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Explanation */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Explanation</h4>
                <p className="text-gray-700 leading-relaxed">
                  {question.explanation}
                </p>
              </div>

              {/* Source */}
              {question.source && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Source</h4>
                  <p className="text-gray-700">{question.source}</p>
                </div>
              )}

              {/* Next Button */}
              <div className="flex justify-end">
                <button
                  onClick={onNext}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                >
                  <span>{isLastQuestion ? 'Finish Lesson' : 'Next Question'}</span>
                  <Check className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default QuestionDisplay;
