import { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useLocation, useSearchParams } from "react-router-dom";
import AccordionItem from "./components/accordionItem.jsx";
import Header from "./components/Header/Header";
import HeaderActions from "./components/HeaderActions";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Pathway from "./pages/Pathway";
import Sources from "./pages/Sources";
import QuestionDemo from "./pages/QuestionDemo";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import ResetPassword from "./pages/ResetPassword";
import NotFoundPage from "./pages/NotFoundPage";

import { AuthProvider, useAuth } from "./pages/AuthProvider";
import ProtectedRoute from "./pages/ProtectedRoute";
import { subscribeToCounter } from "./services/globalCounter";

// Custom hook to get location (only works inside Router context)
function useHideHeader() {
  const location = useLocation();
  return location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/reset-password" || location.pathname === "/questions" || location.pathname === "/dashboard" || location.pathname === "/pathway" || location.pathname === "/contact";
}

function AppContent() {
  const [openIndexes, setOpenIndexes] = useState([]);
  const [showLoggedOutMessage, setShowLoggedOutMessage] = useState(false);
  const sectionRefs = useRef([]);
  const hasShownLoggedOutMessage = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const animationRef = useRef(null);

  const toggleAccordion = (index) => {
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index) // close if already open
        : [...prev, index] // open without closing others
    );
  };

  const hideHeader = useHideHeader();
  const location = useLocation();

  // Check for loggedOut parameter
  useEffect(() => {
    if (searchParams.get("loggedOut") === "true" && !hasShownLoggedOutMessage.current) {
      hasShownLoggedOutMessage.current = true;
      setShowLoggedOutMessage(true);
      // Remove the parameter from URL without reloading
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("loggedOut");
      setSearchParams(newSearchParams, { replace: true });
      // Hide message after 5 seconds
      const timer = setTimeout(() => {
        setShowLoggedOutMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams]);

  // Reset logged out message flag when route changes
  useEffect(() => {
    if (location.pathname !== "/" || !searchParams.get("loggedOut")) {
      hasShownLoggedOutMessage.current = false;
    }
  }, [location.pathname, searchParams]);
    
    // Scroll to top when location changes
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [location]);
    
    // Subscribe to global questions answered counter
    useEffect(() => {
      const unsubscribe = subscribeToCounter((count) => {
        setQuestionsAnswered(count);
      });
      
      return () => unsubscribe();
    }, []);
    
    // Animate counter value changes with scrolling effect
    useEffect(() => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
      
      const startValue = displayCount;
      const endValue = questionsAnswered;
      const duration = 1000; // 1 second animation
      const steps = 30;
      const stepValue = (endValue - startValue) / steps;
      const stepDuration = duration / steps;
      let currentStep = 0;
      
      if (startValue === endValue) {
        setDisplayCount(endValue);
        return;
      }
      
      animationRef.current = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayCount(endValue);
          if (animationRef.current) {
            clearInterval(animationRef.current);
            animationRef.current = null;
          }
        } else {
          const newValue = Math.round(startValue + stepValue * currentStep);
          setDisplayCount(newValue);
        }
      }, stepDuration);
      
      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
      };
    }, [questionsAnswered]);
    
    // Fade-in scroll animation effect - re-run when on homepage
    useEffect(() => {
      // Only set up observer if we're on the homepage
      if (location.pathname !== "/") {
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('fade-in-visible');
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        }
      );

      // Use double requestAnimationFrame to ensure DOM elements are fully rendered
      // and refs are properly assigned
      let rafId1, rafId2;
      rafId1 = requestAnimationFrame(() => {
        rafId2 = requestAnimationFrame(() => {
          sectionRefs.current.forEach((ref) => {
            if (ref) {
              const rect = ref.getBoundingClientRect();
              const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
              if (isVisible) {
                // Immediately show if already visible
                ref.classList.add('fade-in-visible');
              } else {
                // Reset to initial state only if not visible
                ref.classList.remove('fade-in-visible');
              }
              observer.observe(ref);
            }
          });
        });
      });

      return () => {
        if (rafId1) cancelAnimationFrame(rafId1);
        if (rafId2) cancelAnimationFrame(rafId2);
        sectionRefs.current.forEach((ref) => {
          if (ref) observer.unobserve(ref);
        });
      };
    }, [location.pathname]);

    return (
      <>
        <style>{`
          .fade-in {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.7s ease-out;
          }
          
          .fade-in-visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
          }
          
          .animate-slide-down {
            animation: slideDown 0.4s ease-out;
          }
          
          .counter-number {
            display: inline-block;
            transition: transform 0.1s ease-out;
          }
          
          .counter-number.updating {
            animation: counterPulse 0.3s ease-in-out;
          }
          
          @keyframes counterPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(20deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
        `}</style>
        <div className="bg-gray-50">
        {!hideHeader && (
          <Header
            logo="/assets/headerlogo.png"
            navLinks={[
              { label: "About", href: "/about" },
              { label: "Sources", href: "/sources" },
              ...(user ? [] : [{ label: "Pathway", href: "/pathway" }]),
              { label: "Contact", href: "/contact" },
            ]}
            actions={<HeaderActions />}
          />
        )}
        
        {/* Logged out success message - Global overlay */}
        {showLoggedOutMessage && (
          <div className="fixed top-0 left-0 right-0 z-[60] flex justify-center p-4 animate-slide-down pointer-events-none">
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-2 border-2 border-green-700">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold text-lg">Logged out successfully.</span>
            </div>
          </div>
        )}
        
        <main className={!hideHeader ? "pt-20" : ""}>
          <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      {/* --- Home Page Sections --- */}
                      {/* Top Section - Rectangular Design */}
                      <header className="container mx-auto py-12 px-4 md:px-6 flex justify-center">
                        <div className="relative w-full max-w-6xl">
                          {/* Main rectangular container */}
                          <div 
                            className="w-full min-h-[400px] md:min-h-[500px] rounded-2xl flex flex-col md:flex-row items-center p-6 md:p-8 shadow-lg relative overflow-hidden"
                            style={{
                              backgroundImage: "url('/assets/leaves-bg.jpg')",
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            <div className="absolute inset-0 bg-emerald-600/70 rounded-2xl"></div>
                            
                            {/* Left Side - Text Content */}
                            <div className="relative z-10 w-full md:w-1/2 flex flex-col items-start justify-center p-4 md:p-8">
                              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight mb-4 text-white text-left">
                                Get involved, step by step.
                              </h1>
                              <p className="text-sm md:text-base mb-6 text-white text-left max-w-md">
                                Create change right from your screen.
                              </p>
                              {/* Global Questions Counter */}
                              <div className="mb-6 text-white">
                                <div className="text-2xl md:text-3xl font-bold text-white">
                                  <span className="counter-number" key={displayCount}>
                                    {displayCount.toLocaleString()}
                                  </span>
                                  <span className="text-lg md:text-xl font-normal ml-2">
                                    questions answered worldwide
                                  </span>
                                </div>
                              </div>
                              <Link to="/pathway" className="inline-block bg-white text-emerald-600 font-medium px-4 md:px-5 py-2 rounded shadow hover:bg-emerald-50 transition text-sm md:text-base">
                                View The Pathway Now →
                              </Link>
                            </div>

                            {/* Right Side - Mini Pathway Diagram */}
                            <div className="relative z-10 w-full md:w-1/2 flex flex-col items-center justify-center p-4">
                              <div className="w-full max-w-sm bg-white/90 backdrop-blur-sm rounded-lg p-4 md:p-6 shadow-xl">
                                <h3 className="text-xs font-bold text-emerald-700 mb-4 text-center">
                                  Unit 1: Grassroots Movements
                                </h3>
                                
                                {/* Mini lesson cards */}
                                <div className="space-y-2">
                                  {/* Lesson 1-1 */}
                                  <div className="flex items-center gap-2 bg-emerald-50 p-2 rounded border border-emerald-200">
                                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                      1-A
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-gray-800 truncate">
                                        The power of the desk
                                      </p>
                                    </div>
                                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>

                                  {/* Arrow */}
                                  <div className="flex justify-center py-0.5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>

                                  {/* Lesson 1-2 */}
                                  <div className="flex items-center gap-2 bg-emerald-50 p-2 rounded border border-emerald-200">
                                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                      1-B
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-gray-800 truncate">
                                        Change throughout history
                                      </p>
                                    </div>
                                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>

                                  {/* Arrow */}
                                  <div className="flex justify-center py-0.5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>

                                  {/* Lesson 1-3 */}
                                  <div className="flex items-center gap-2 bg-white p-2 rounded border border-gray-300">
                                    <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                      1-C
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-gray-800 truncate">
                                        Change today
                                      </p>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                  </div>
                                </div>

                                <p className="text-xs text-center text-gray-600 mt-4">
                                  Forge your own path to change
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </header>

                  {/* Problem / Agitation */}
                  <section 
                    ref={el => sectionRefs.current[0] = el}
                    className="container mx-auto py-12 bg-emerald-200 px-4 md:px-6 fade-in"
                  >
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      {/* Left Side - Falling Leaf Animation */}
                      <div className="w-full md:w-1/2 flex items-center justify-center relative h-64 md:h-80">
                        <img 
                          src="/assets/leaf.svg" 
                          alt="Falling leaf" 
                          className="absolute w-8 h-8 opacity-60 animate-[float_6s_ease-in-out_infinite] top-[10%] left-[20%]"
                          onError={(e) => {
                            console.error('Failed to load leaf image:', '/assets/leaf.svg');
                            e.target.style.display = 'none';
                          }}
                        />
                        <img 
                          src="/assets/leaf.svg" 
                          alt="Falling leaf" 
                          className="absolute w-8 h-8 opacity-60 animate-[float_6s_ease-in-out_infinite] top-[30%] left-[10%] [animation-delay:1.5s]"
                          onError={(e) => {
                            console.error('Failed to load leaf image:', '/assets/leaf.svg');
                            e.target.style.display = 'none';
                          }}
                        />
                        <img 
                          src="/assets/leaf.svg" 
                          alt="Falling leaf" 
                          className="absolute w-8 h-8 opacity-60 animate-[float_6s_ease-in-out_infinite] top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 [animation-delay:3s]"
                          onError={(e) => {
                            console.error('Failed to load leaf image:', '/assets/leaf.svg');
                            e.target.style.display = 'none';
                          }}
                        />
                        <img 
                          src="/assets/leaf.svg" 
                          alt="Falling leaf" 
                          className="absolute w-8 h-8 opacity-60 animate-[float_6s_ease-in-out_infinite] top-[45%] left-[45%] -translate-x-1/2 -translate-y-1/2 [animation-delay:4.5s]"
                          onError={(e) => {
                            console.error('Failed to load leaf image:', '/assets/leaf.svg');
                            e.target.style.display = 'none';
                          }}
                        />
                        <img 
                          src="/assets/leaf.svg" 
                          alt="Falling leaf" 
                          className="absolute w-8 h-8 opacity-60 animate-[float_6s_ease-in-out_infinite] top-[20%] right-[25%] [animation-delay:2s]"
                          onError={(e) => {
                            console.error('Failed to load leaf image:', '/assets/leaf.svg');
                            e.target.style.display = 'none';
                          }}
                        />
                        <img 
                          src="/assets/leaf.svg" 
                          alt="Falling leaf" 
                          className="absolute w-8 h-8 opacity-60 animate-[float_6s_ease-in-out_infinite] bottom-[15%] right-[20%] [animation-delay:5s]"
                          onError={(e) => {
                            console.error('Failed to load leaf image:', '/assets/leaf.svg');
                            e.target.style.display = 'none';
                          }}
                        />
                        <img 
                          src="/assets/leaf.svg" 
                          alt="Falling leaf" 
                          className="absolute w-8 h-8 opacity-60 animate-[float_6s_ease-in-out_infinite] top-[5%] left-[40%] [animation-delay:0.8s]"
                          onError={(e) => {
                            console.error('Failed to load leaf image:', '/assets/leaf.svg');
                            e.target.style.display = 'none';
                          }}
                        />
                        <img 
                          src="/assets/leaf.svg" 
                          alt="Falling leaf" 
                          className="absolute w-8 h-8 opacity-60 animate-[float_6s_ease-in-out_infinite] top-[40%] left-[5%] [animation-delay:2.5s]"
                          onError={(e) => {
                            console.error('Failed to load leaf image:', '/assets/leaf.svg');
                            e.target.style.display = 'none';
                          }}
                        />
                        <img 
                          src="/assets/leaf.svg" 
                          alt="Falling leaf" 
                          className="absolute w-8 h-8 opacity-60 animate-[float_6s_ease-in-out_infinite] top-[60%] left-[25%] [animation-delay:3.8s]"
                          onError={(e) => {
                            console.error('Failed to load leaf image:', '/assets/leaf.svg');
                            e.target.style.display = 'none';
                          }}
                        />
                        <img 
                          src="/assets/leaf.svg" 
                          alt="Falling leaf" 
                          className="absolute w-8 h-8 opacity-60 animate-[float_6s_ease-in-out_infinite] bottom-[10%] left-[35%] [animation-delay:5.5s]"
                          onError={(e) => {
                            console.error('Failed to load leaf image:', '/assets/leaf.svg');
                            e.target.style.display = 'none';
                          }}
                        />
                        <img 
                          src="/assets/leaf.svg" 
                          alt="Falling leaf" 
                          className="absolute w-8 h-8 opacity-60 animate-[float_6s_ease-in-out_infinite] top-[15%] right-[10%] [animation-delay:1.2s]"
                          onError={(e) => {
                            console.error('Failed to load leaf image:', '/assets/leaf.svg');
                            e.target.style.display = 'none';
                          }}
                        />
                        <img 
                          src="/assets/leaf.svg" 
                          alt="Falling leaf" 
                          className="absolute w-8 h-8 opacity-60 animate-[float_6s_ease-in-out_infinite] bottom-[5%] right-[35%] [animation-delay:4.2s]"
                          onError={(e) => {
                            console.error('Failed to load leaf image:', '/assets/leaf.svg');
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      {/* Right Side - Text Content */}
                      <div className="w-full md:w-1/2 flex flex-col justify-center px-4 md:px-6 text-right">
                        <h2 className="text-2xl md:text-3xl font-bold text-emerald-700">
                          Everyone tells you to "get involved." But how?
                        </h2>
                        <p className="mt-4 text-gray-700 leading-relaxed text-sm md:text-base">
                          Politics feels distant, confusing, and rigged for insiders. 
                          It's impossible to know where to start. And most sites just regurgitate 
                          civics classes, without telling you how to create the change you want.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Solutions */}
                  <section 
                    ref={el => sectionRefs.current[1] = el}
                    className="container mx-auto py-12 bg-white px-4 md:px-6 fade-in"
                  >
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      {/* Left Side - Text Content */}
                      <div className="w-full md:w-1/2 flex flex-col justify-center px-4 md:px-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 mb-6">
                          mygrassroutes turns learning into actionable change.
                        </h2>
                        <ul className="space-y-3 text-gray-800 text-sm md:text-base mb-6">
                          <li> - Learn by doing, not memorizing </li>
                          <li> - Discover exactly where you can make change </li>
                          <li> - Unveil strategies that work right now </li>
                          <li> - Accessible for all, detailed for leaders </li>
                        </ul>
                        <div>
                          <Link to="/pathway" className="inline-block bg-emerald-600 text-white px-4 md:px-6 py-2 rounded shadow hover:bg-emerald-500 transition text-sm md:text-base">
                            Get Started Now →
                          </Link>
                        </div>
                      </div>

                      {/* Right Side - Sample Question Card */}
                      <div className="w-full md:w-1/2 flex justify-center px-4 md:px-6">
                        <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-xl">
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Sample Question</span>
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-100 px-2 py-1 rounded">
                                Multiple Choice
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-gray-800 mb-4">
                              What is the primary goal of grassroots organizing?
                            </h3>
                          </div>

                          {/* Question Options */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                A
                              </div>
                              <span className="text-xs flex-1 text-gray-800">Create change from the ground up</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <div className="w-7 h-7 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                B
                              </div>
                              <span className="text-xs flex-1 text-gray-800">Run for political office</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <div className="w-7 h-7 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                C
                              </div>
                              <span className="text-xs flex-1 text-gray-800">Join a political party</span>
                            </div>
                          </div>

                          <p className="text-xs text-center text-gray-600 italic">
                            Learn by answering detailed questions
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Social Proof */}
                  <section 
                    ref={el => sectionRefs.current[2] = el}
                    className="container mx-auto py-12 bg-emerald-200 px-4 md:px-6 fade-in"
                  >
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      {/* Left Side - Image */}
                      <div className="w-full md:w-1/2 flex justify-center">
                        <img 
                          src="/assets/sapling.jpg" 
                          alt="Growing community" 
                          className="w-full max-w-md rounded-lg shadow-lg object-cover"
                        />
                      </div>
                      {/* Right Side - Text Content */}
                      <div className="w-full md:w-1/2 flex flex-col justify-center px-4 md:px-6 text-right">
                        <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 break-words">
                          Thousands are already creating change.
                        </h2>
                        <div className="flex flex-wrap gap-4 md:gap-6 mt-6 justify-end">
                          <blockquote className="bg-white shadow-md p-4 md:p-6 rounded-lg max-w-sm text-gray-700 italic text-sm md:text-base">
                            "I went from confused to connected in 30 minutes."
                          </blockquote>
                          <blockquote className="bg-white shadow-md p-4 md:p-6 rounded-lg max-w-sm text-gray-700 italic text-sm md:text-base">
                            "With no more guesswork, I'm organizing my first event."
                          </blockquote>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Differentiation */}
                  <section 
                    ref={el => sectionRefs.current[3] = el}
                    className="container mx-auto py-12 bg-white px-4 md:px-6 fade-in"
                  >
                    <h2 className="text-center text-2xl md:text-3xl font-bold text-emerald-700">
                      Swap memorization for action.
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full mt-8 text-center border-collapse text-gray-700 text-sm md:text-base">
                        <thead>
                          <tr className="bg-emerald-400">
                            <th className="py-2 text-emerald-900 px-2">Old Civics</th>
                            <th className="py-2 text-emerald-900 px-2">mygrassroutes</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2 px-2">Memorize the three branches</td>
                            <td className="py-2 px-2">Join a campaign in your zip code</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 px-2">Read a boring textbook</td>
                            <td className="py-2 px-2">Get up-to-date, actionable info</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-2">Watch from the sidelines</td>
                            <td className="py-2 px-2">Lead from anywhere</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* FAQ Section */}
                  <section 
                    ref={el => sectionRefs.current[4] = el}
                    className="container mx-auto py-12 bg-emerald-200 px-4 md:px-6 fade-in"
                  >
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      {/* Left Side - FAQ Content */}
                      <div className="w-full md:w-1/2 flex flex-col justify-center px-4 md:px-6">
                        <h2 className="text-emerald-700 text-2xl md:text-3xl font-bold mb-6">Got questions?</h2>

                    <AccordionItem
                      title="What if I don’t know anything about politics?"
                      isOpen={openIndexes.includes(0)}
                      onClick={() => toggleAccordion(0)}
                    >
                      <p>
                        Not a problem. The Pathway is designed to connect with beginners searching for their first steps, just like you.
                      </p>
                    </AccordionItem>

                    <AccordionItem
                      title="Is this just for students?"
                      isOpen={openIndexes.includes(1)}
                      onClick={() => toggleAccordion(1)}
                    >
                      <p>
                        Nope. Students will benefit from the knowledge, but mygrassroutes is built for the real world.
                      </p>
                    </AccordionItem>

                    <AccordionItem
                      title="How is this different from school?"
                      isOpen={openIndexes.includes(2)}
                      onClick={() => toggleAccordion(2)}
                    >
                      <p>
                        mygrassroutes is hands-on, fast-paced, and built to get you moving, not memorizing.
                      </p>
                    </AccordionItem>

                    <AccordionItem
                      title="Can I actually get involved from home?"
                      isOpen={openIndexes.includes(3)}
                      onClick={() => toggleAccordion(3)}
                    >
                      <p>
                        Yes! Learn to join, grow, and create a movement right from your screen.
                      </p>
                    </AccordionItem>
                      </div>
                      {/* Right Side - Image */}
                      <div className="w-full md:w-1/2 flex justify-center">
                        <img 
                          src="/assets/forest.jpg" 
                          alt="Questions and answers" 
                          className="w-full max-w-md rounded-lg shadow-lg object-cover"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Call to Action */}
                  <section 
                    ref={el => sectionRefs.current[5] = el}
                    className="container mx-auto py-12 text-center text-white rounded-lg mt-8 shadow-lg px-4 md:px-6 relative overflow-hidden fade-in"
                    style={{
                      backgroundImage: "url('/assets/leaves-bg.jpg')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-emerald-600/70"></div>
                    <div className="relative z-10">
                      <h2 className="text-2xl md:text-3xl font-bold">
                        Real change starts right here.
                      </h2>
                      <p className="mt-4 max-w-xl mx-auto text-sm md:text-base">
                        Don't wait for someone else. Create it yourself.
                      </p>
                      <Link to="/pathway" className="mt-6 inline-block bg-white text-emerald-600 px-4 md:px-6 py-2 rounded shadow hover:bg-emerald-50 transition text-sm md:text-base">
                        View The Pathway →
                      </Link>
                    </div>
                  </section>

                  {/* Footer */}
                  <footer className="bg-gray-900 text-white py-6 text-center mt-8 px-4 md:px-6">
                    <p className="text-sm md:text-base">
                      <strong>mygrassroutes</strong> – Politics, step by step.
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-3">
                      <a href="https://www.instagram.com/mygrassroutes?igsh=cW9tOHdhbmRyOXk4&utm_source=qr" className="text-white opacity-75 hover:text-emerald-400 hover:opacity-100 transition-colors" aria-label="Instagram">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                      <a href="https://bsky.app/profile/mygrassroutes.bsky.social" className="text-white opacity-75 hover:text-emerald-400 hover:opacity-100 transition-colors" aria-label="Bluesky">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                          <path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z"/>
                        </svg>
                      </a>
                    </div>
                    <p className="mt-2 text-xs opacity-75">
                      Copyright © 2025 mygrassroutes
                    </p>
                  </footer>
                </>
              } />
              <Route path="/about" element={<About />} />
              <Route path="/sources" element={<Sources />} />
              <Route path="/pathway" element={<Pathway />} />
              <Route path="/questions" element={<QuestionDemo />} />
              <Route path="/contact" element={<Contact />} />

                {/* NEW: Login route */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                {/* NEW: Protected Dashboard route */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                {/* Catch-all route for 404 pages */}
                <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        </div>
      </>
    );
}

function App() {
  return <AppContent />;
}

export default App;