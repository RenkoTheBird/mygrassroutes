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
                The Pathway is designed as a progressive learning journey through seven interconnected units. 
                Each unit builds on the previous one, taking you from understanding grassroots movements to 
                mastering your role as an active citizen.
              </p>
              <p className="text-base md:text-lg text-gray-800 leading-relaxed">
                Work through interactive lessons at your own pace, complete activities that connect theory 
                to practice, and track your progress as you develop the knowledge and skills needed to 
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
                <p className="text-sm text-gray-700 mb-6">Lessons are arranged in a Z-pattern, alternating left and right. Click any lesson to see details and start learning.</p>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-8 border-2 border-emerald-200 relative">
                  <div className="max-w-2xl mx-auto space-y-6 relative">
                    {/* Lesson 1 - Left */}
                    <div className="flex justify-start">
                      <div className="bg-white border-2 border-emerald-300 rounded-lg px-4 py-3 max-w-xs shadow-sm">
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

                    {/* Lesson 2 - Right */}
                    <div className="flex justify-end">
                      <div className="bg-white border-2 border-emerald-300 rounded-lg px-4 py-3 max-w-xs shadow-sm">
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

                    {/* Lesson 3 - Left (completed) */}
                    <div className="flex justify-start">
                      <div className="bg-gray-100 border-2 border-gray-300 rounded-lg px-4 py-3 max-w-xs shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-gray-400 flex items-center justify-center text-white font-bold text-xs">
                            1-C
                          </div>
                          <h4 className="font-bold text-sm text-gray-800">Organizing Strategies</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center italic">Lessons alternate in a Z-pattern, with completed lessons shown in gray</p>
              </div>

              {/* 3. Question Examples */}
              <div className="bg-white rounded-lg shadow-md p-6 border-2 border-emerald-100">
                <h3 className="text-xl font-bold mb-4 text-emerald-800">Interactive Questions</h3>
                <p className="text-sm text-gray-700 mb-6">Each lesson includes interactive questions to help you apply what you've learned. Questions include multiple choice, true/false, select all, and fill-in-the-blank formats.</p>
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
                  Understanding how to grow change from the ground up. Learn about change in the past and present.
                </p>
              </div>
              <div 
                ref={el => unitRefs.current[1] = el}
                style={{background: 'linear-gradient(to right, #fef3c7, white)', borderLeft: '5px solid #f59e0b', borderRadius: '8px', boxShadow:'0 4px 8px rgba(245,158,11,0.15)'}} 
                className="p-4 md:p-6 fade-in opacity-0 translate-y-4 transition-all duration-700 ease-out"
              >
                <h3 className="font-semibold text-lg md:text-xl mb-1 text-amber-800">Unit 2 – The Media <span className="text-amber-600 font-normal text-base">(Coming Soon)</span></h3>
                <p className="text-sm md:text-base text-gray-700">
                  See how news shapes narratives — and shape your own.
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
                  Understand the systems that define our political beliefs and decisions,
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
                Take control of your power as a citizen, and bring your friends with you.
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
            <p className="font-semibold">mygrassroutes – Politics for all.</p>
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
