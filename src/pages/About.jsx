import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import Header from "../components/Header/Header";
import HeaderActions from "../components/HeaderActions";
import { useAuth } from "./AuthProvider";

function About() {
  const unitRefs = useRef([]);
  const { user } = useAuth();

  useEffect(() => {
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

    unitRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      unitRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

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
      `}</style>
      <div className="bg-gray-50">
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

        <main>
          {/* Hero/Header */}
          <section
            className="relative py-20 text-center"
            style={{
              backgroundImage: "url('/assets/leaves-bg.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-emerald-600/75"></div>
            <div className="relative z-10 max-w-3xl mx-auto text-white px-4 md:px-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
                Have you ever asked yourself: "What is the point of politics?"
              </h1>
              <p className="text-base md:text-lg">
                If you've ever felt like it's all just noise, you're not alone.
              </p>
            </div>
          </section>

          {/* Agitation and Solution Sections */}
          <section className="w-full py-12 md:py-16 px-4 md:px-6 lg:px-16">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
              
              {/* Politics feels distant section */}
              <div className="relative">
                {/* Outer circle with background image */}
                <div 
                  className="w-80 h-80 md:w-96 md:h-96 lg:w-[400px] lg:h-[400px] rounded-full flex items-center justify-center p-4"
                  style={{
                    backgroundImage: "url('/assets/leaves-bg.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* Inner content circle */}
                  <div
                    className="w-72 h-72 md:w-80 md:h-80 lg:w-[360px] lg:h-[360px] rounded-full flex flex-col items-center justify-center text-center p-6 shadow-lg relative overflow-hidden"
                    style={{
                      backgroundImage: "url('/assets/deadgrass.jpg')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-green-600/80 rounded-full"></div>
                    <div className="relative z-10 text-white">
                      <h2 className="text-xl md:text-2xl font-bold mb-3">Politics feels inaccessible.</h2>
                      <p className="text-sm mb-2">Textbooks ramble. News overwhelm. 
                        Schools skim the surface. The result? Millions tuned out, 
                        told to "get involved" with zero guidance.</p>
                      <p className="space-y-1 text-sm">
                         We want change, but feel powerless to start.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* That's why we built section */}
              <div className="relative">
                {/* Outer circle with background image */}
                <div 
                  className="w-80 h-80 md:w-96 md:h-96 lg:w-[400px] lg:h-[400px] rounded-full flex items-center justify-center p-4"
                  style={{
                    backgroundImage: "url('/assets/leaves-bg.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* Inner content circle */}
                  <div
                    className="w-72 h-72 md:w-80 md:h-80 lg:w-[360px] lg:h-[360px] rounded-full flex flex-col items-center justify-center text-center p-6 shadow-lg relative overflow-hidden"
                    style={{
                      backgroundImage: "url('/assets/sapling.jpg')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-emerald-600/80 rounded-full"></div>
                    <div className="relative z-10 text-white">
                      <h2 className="text-xl md:text-2xl font-bold mb-3">That's why we created mygrassroutes.</h2>
                      <p className="text-sm mb-2">We understand how desperate you are to make a difference.</p>
                      <p className="text-sm mb-2">
                        We grew <strong>The Pathway</strong> and its 7 Units to help you 
                        deeply understand politics today and
                        actually do something about the issues you care about.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How the Pathway Works */}
          <section className="max-w-6xl mx-auto py-12 md:py-16 px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">How the Pathway Works</h2>
            
            {/* Introduction Text */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg shadow-md p-6 md:p-8 border-l-4 border-emerald-600 mb-8">
              <p className="text-base md:text-lg text-gray-800 leading-relaxed mb-4">
                The Pathway is a progressive learning journey through seven interconnected units. 
                Each unit builds on the previous one, turning you into a changemaker one step at a time.
              </p>
              <p className="text-base md:text-lg text-gray-800 leading-relaxed">
                Work through interactive lessons, connect theory 
                to practice and history to current events, and track your progress 
                as you develop the knowledge and skills needed to 
                create meaningful change in your community.
              </p>
            </div>

            {/* Diagram Section */}
            <div className="space-y-12">
              
              {/* 1. Unit Description & Progress Panel */}
              <div className="bg-white rounded-lg shadow-md p-6 border-2 border-emerald-100">
                <h3 className="text-xl font-bold mb-4 text-emerald-800">Unit Overview & Progress Tracking</h3>
                <p className="text-sm text-gray-700 mb-6">Each unit starts with a description and progress tracker to help you understand what you'll learn and track your journey.</p>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-6 border-2 border-emerald-200">
                  <div className="max-w-sm mx-auto space-y-4">
                    {/* Unit Description Mock */}
                    <div className="bg-white p-4 rounded-lg border-2 border-emerald-300 shadow-sm">
                      <h4 className="font-bold text-lg text-emerald-800 mb-2">Unit 1: Grassroots Movements</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        This unit explores the fundamental principles and practices of grassroots organizing. 
                        Learn how individual actions can create meaningful social change.
                      </p>
                    </div>
                    {/* Progress Mock */}
                    <div className="bg-white p-4 rounded-lg border-2 border-emerald-300 shadow-sm">
                      <h4 className="font-bold text-sm text-gray-800 mb-3">Your Progress</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Lessons Completed</span>
                          <span className="font-bold text-emerald-600 text-sm">5 / 12</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500">42% complete</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Lesson Boxes with Z-Pattern */}
              <div className="bg-white rounded-lg shadow-md p-6 border-2 border-emerald-100">
                <h3 className="text-xl font-bold mb-4 text-emerald-800">Interactive Lesson Path</h3>
                <p className="text-sm text-gray-700 mb-6">Lessons are arranged in a Z pattern. Click any lesson to see details and start learning.</p>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-8 border-2 border-emerald-200 relative">
                  <div className="max-w-2xl mx-auto space-y-6 relative">
                    {/* Lesson 1 - Left (completed) */}
                    <div className="flex justify-start">
                      <div className="bg-emerald-100 border-2 border-emerald-400 rounded-lg px-4 py-3 max-w-xs shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                            1-A
                          </div>
                          <h4 className="font-bold text-sm text-gray-800">Introduction to Movements</h4>
                        </div>
                      </div>
                    </div>

                    {/* Arrow down then right */}
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Lesson 2 - Right (completed) */}
                    <div className="flex justify-end">
                      <div className="bg-emerald-100 border-2 border-emerald-400 rounded-lg px-4 py-3 max-w-xs shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                            1-B
                          </div>
                          <h4 className="font-bold text-sm text-gray-800">Historical Examples</h4>
                        </div>
                      </div>
                    </div>

                    {/* Arrow down then left */}
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Lesson 3 - Left (available, not completed) */}
                    <div className="flex justify-start">
                      <div className="bg-white border-2 border-emerald-300 rounded-lg px-4 py-3 max-w-xs shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                            1-C
                          </div>
                          <h4 className="font-bold text-sm text-gray-800">Organizing Strategies</h4>
                        </div>
                      </div>
                    </div>

                    {/* Arrow down then right */}
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Lesson 4 - Right (locked) */}
                    <div className="flex justify-end">
                      <div className="bg-gray-100 border-2 border-gray-300 rounded-lg px-4 py-3 max-w-xs shadow-sm opacity-60">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-gray-400 flex items-center justify-center text-white font-bold text-xs">
                            1-D
                          </div>
                          <h4 className="font-bold text-sm text-gray-500">Building Coalitions</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center italic">Lessons alternate in a Z pattern. Completed lessons are shown in green, available lessons in white, and locked lessons in gray.</p>
              </div>

              {/* 3. Question Examples */}
              <div className="bg-white rounded-lg shadow-md p-6 border-2 border-emerald-100">
                <h3 className="text-xl font-bold mb-4 text-emerald-800">Interactive Questions</h3>
                <p className="text-sm text-gray-700 mb-6">Each lesson includes interactive questions to help you apply what you've learned. Questions include multiple choice, true/false, select all, and fill-in-the-blank types.</p>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-6 border-2 border-emerald-200">
                  <div className="max-w-lg mx-auto">
                    {/* Example Multiple Choice Question */}
                    <div className="bg-white rounded-lg p-6 border-4" style={{ borderColor: '#059669' }}>
                      <h4 className="font-bold text-lg text-gray-800 mb-4">What is a key characteristic of grassroots movements?</h4>
                      <div className="space-y-3">
                        <button className="w-full text-left p-4 border-2 border-gray-300 rounded-lg hover:border-emerald-400 transition-colors bg-white">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm">A</div>
                            <span>Movements that start from the top down</span>
                          </div>
                        </button>
                        <button className="w-full text-left p-4 border-2 border-emerald-500 rounded-lg bg-green-50">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">B</div>
                            <span>Community-driven change from the ground up</span>
                          </div>
                        </button>
                        <button className="w-full text-left p-4 border-2 border-gray-300 rounded-lg hover:border-emerald-400 transition-colors bg-white">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm">C</div>
                            <span>Government-initiated programs</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Post-Lesson Statistics */}
              <div className="bg-white rounded-lg shadow-md p-6 border-2 border-emerald-100">
                <h3 className="text-xl font-bold mb-4 text-emerald-800">Track Your Progress</h3>
                <p className="text-sm text-gray-700 mb-6">After completing lessons, see your progress update in real time. Track how many lessons you've completed and your overall percentage.</p>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-6 border-2 border-emerald-200">
                  <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                      <h4 className="font-bold text-lg text-gray-800 mb-4">Your Progress</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Lessons Completed</span>
                          <span className="font-bold text-emerald-600">8 / 12</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-emerald-600 h-3 rounded-full transition-all" style={{ width: '67%' }}></div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">67% complete</span>
                          <span className="text-emerald-600 font-semibold">✓ 8 lessons done</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* The Tree: Units */}
          <section className="max-w-4xl mx-auto py-12 md:py-16 px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-emerald-800">The Pathway</h2>
            <div className="space-y-6">
              <div 
                ref={el => unitRefs.current[0] = el}
                style={{background: 'linear-gradient(to right, #ecfdf5, white)', borderLeft: '5px solid #059669', borderRadius: '8px', boxShadow:'0 4px 8px rgba(5,150,105,0.15)', padding:'1rem md:1.5rem'}} 
                className="p-4 md:p-6 fade-in opacity-0 translate-y-4 transition-all duration-700 ease-out"
              >
                <h3 className="font-semibold text-lg md:text-xl mb-1 text-emerald-800">Unit 1 – Grassroots Movements</h3>
                <p className="text-sm md:text-base text-gray-700">
                  Understand how to grow change from the ground up. Learn about change in the past and present.
                </p>
              </div>
              <div 
                ref={el => unitRefs.current[1] = el}
                style={{background: 'linear-gradient(to right, #fef3c7, white)', borderLeft: '5px solid #f59e0b', borderRadius: '8px', boxShadow:'0 4px 8px rgba(245,158,11,0.15)'}} 
                className="p-4 md:p-6 fade-in opacity-0 translate-y-4 transition-all duration-700 ease-out"
              >
                <h3 className="font-semibold text-lg md:text-xl mb-1 text-amber-800">Unit 2 – The Media <span className="text-amber-600 font-normal text-base">(Coming Soon)</span></h3>
                <p className="text-sm md:text-base text-gray-700">
                  See how news shapes narratives, and learn to shape your own.
                </p>
              </div>
              <div 
                ref={el => unitRefs.current[2] = el}
                style={{background: 'linear-gradient(to right, #dbeafe, white)', borderLeft: '5px solid #3b82f6', borderRadius: '8px', boxShadow:'0 4px 8px rgba(59,130,246,0.15)'}} 
                className="p-4 md:p-6 fade-in opacity-0 translate-y-4 transition-all duration-700 ease-out"
              >
                <h3 className="font-semibold text-lg md:text-xl mb-1 text-blue-800">Unit 3 – Politics in Our Lives <span className="text-blue-600 font-normal text-base">(Coming Soon)</span></h3>
                <p className="text-sm md:text-base text-gray-700">
                  Learn how politics affects every part of your daily experience, from school, to housing, to internet access. 
                </p>
              </div>
              <div 
                ref={el => unitRefs.current[3] = el}
                style={{background: 'linear-gradient(to right, #fce7f3, white)', borderLeft: '5px solid #ec4899', borderRadius: '8px', boxShadow:'0 4px 8px rgba(236,72,153,0.15)'}} 
                className="p-4 md:p-6 fade-in opacity-0 translate-y-4 transition-all duration-700 ease-out"
              >
                <h3 className="font-semibold text-lg md:text-xl mb-1 text-pink-800">Unit 4 – Politics in History <span className="text-pink-600 font-normal text-base">(Coming Soon)</span></h3>
                <p className="text-sm md:text-base text-gray-700">
                  Learn from past changemakers to grow a movement even stronger than theirs.
                </p>
              </div>
              <div 
                ref={el => unitRefs.current[4] = el}
                style={{background: 'linear-gradient(to right, #e0e7ff, white)', borderLeft: '5px solid #6366f1', borderRadius: '8px', boxShadow:'0 4px 8px rgba(99,102,241,0.15)'}} 
                className="p-4 md:p-6 fade-in opacity-0 translate-y-4 transition-all duration-700 ease-out"
              >
                <h3 className="font-semibold text-lg md:text-xl mb-1 text-indigo-800">Unit 5 – Bureaucracy <span className="text-indigo-600 font-normal text-base">(Coming Soon)</span></h3>
                <p className="text-sm md:text-base text-gray-700">
                  Democracy can be found buried under mounds of paperwork. We decipher it for you.
                </p>
              </div>
              <div 
                ref={el => unitRefs.current[5] = el}
                style={{background: 'linear-gradient(to right, #ddd6fe, white)', borderLeft: '5px solid #8b5cf6', borderRadius: '8px', boxShadow:'0 4px 8px rgba(139,92,246,0.15)'}} 
                className="p-4 md:p-6 fade-in opacity-0 translate-y-4 transition-all duration-700 ease-out"
              >
                <h3 className="font-semibold text-lg md:text-xl mb-1 text-purple-800">Unit 6 – Political Science <span className="text-purple-600 font-normal text-base">(Coming Soon)</span></h3>
                <p className="text-sm md:text-base text-gray-700">
                  Understand the systems that define our political beliefs and decisions.
                </p>
              </div>
              <div 
                ref={el => unitRefs.current[6] = el}
                style={{background: 'linear-gradient(to right, #f0fdf4, white)', borderLeft: '5px solid #22c55e', borderRadius: '8px', boxShadow:'0 4px 8px rgba(34,197,94,0.15)'}} 
                className="p-4 md:p-6 fade-in opacity-0 translate-y-4 transition-all duration-700 ease-out"
              >
                <h3 className="font-semibold text-lg md:text-xl mb-1 text-green-800">Unit 7 – The Role of the Citizen <span className="text-green-600 font-normal text-base">(Coming Soon)</span></h3>
                <p className="text-sm md:text-base text-gray-700">
                  Learn your rights, your responsibilities, and the many ways you can act right now.
                </p>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section
            className="relative py-20 text-center"
            style={{
              backgroundImage: "url('/assets/leaves-bg.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-emerald-600/75"></div>
            <div className="relative z-10 max-w-3xl mx-auto text-white px-4 md:px-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">You're more powerful than you think.</h2>
              <p className="mb-8 text-sm md:text-base">
                Take control of your power as a changemaker, and bring your friends with you.
              </p>
              <Link to="/pathway">
                <button className="bg-white text-emerald-500 font-medium px-4 md:px-6 py-3 rounded shadow hover:bg-emerald-50 transition text-sm md:text-base">
                  Forge your Pathway now →
                </button>
              </Link>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-100 py-6 text-center text-sm px-4 md:px-6">
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
              Copyright © 2025 mygrassroutes
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}

export default About;
