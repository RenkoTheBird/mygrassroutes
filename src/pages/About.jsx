import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import Header from "../components/Header/Header";
import HeaderActions from "../components/HeaderActions";

function About() {
  const unitRefs = useRef([]);

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
            { label: "Pathway", href: "/pathway" },
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
            <div className="absolute inset-0 bg-emerald-700/75"></div>
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
                    <div className="absolute inset-0 bg-emerald-700/80 rounded-full"></div>
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

          {/* The Tree: Units */}
          <section className="max-w-4xl mx-auto py-12 md:py-16 px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">The Pathway</h2>
            <div className="space-y-6">
              <div 
                ref={el => unitRefs.current[0] = el}
                style={{background: 'white', borderLeft: '5px solid black', borderRadius: '8px', boxShadow:'0 2px 6px rgba(0,0,0,0.05)', padding:'1rem md:1.5rem'}} 
                className="p-4 md:p-6 fade-in opacity-0 translate-y-4 transition-all duration-700 ease-out"
              >
                <h3 className="font-semibold text-lg md:text-xl mb-1">Unit 1 – Grassroots Movements</h3>
                <p className="text-sm md:text-base">
                  Understanding how to grow change from the ground up. Learn about change in the past and present.
                </p>
              </div>
              <div 
                ref={el => unitRefs.current[1] = el}
                style={{background: 'white', borderLeft: '5px solid black', borderRadius: '8px', boxShadow:'0 2px 6px rgba(0,0,0,0.05)'}} 
                className="p-4 md:p-6 fade-in opacity-0 translate-y-4 transition-all duration-700 ease-out"
              >
                <h3 className="font-semibold text-lg md:text-xl mb-1">Unit 2 – The Media</h3>
                <p className="text-sm md:text-base">
                  See how news shapes narratives — and shape your own.
                </p>
              </div>
              <div 
                ref={el => unitRefs.current[2] = el}
                style={{background: 'white', borderLeft: '5px solid black', borderRadius: '8px', boxShadow:'0 2px 6px rgba(0,0,0,0.05)'}} 
                className="p-4 md:p-6 fade-in opacity-0 translate-y-4 transition-all duration-700 ease-out"
              >
                <h3 className="font-semibold text-lg md:text-xl mb-1">Unit 3 – Politics in Our Lives</h3>
                <p className="text-sm md:text-base">
                  Learn how politics affects every part of your daily experience, from school, to housing, to internet access. 
                </p>
              </div>
              <div 
                ref={el => unitRefs.current[3] = el}
                style={{background: 'white', borderLeft: '5px solid black', borderRadius: '8px', boxShadow:'0 2px 6px rgba(0,0,0,0.05)'}} 
                className="p-4 md:p-6 fade-in opacity-0 translate-y-4 transition-all duration-700 ease-out"
              >
                <h3 className="font-semibold text-lg md:text-xl mb-1">Unit 4 – Politics in History</h3>
                <p className="text-sm md:text-base">
                  Learn from past changemakers to grow a movement even stronger than theirs.
                </p>
              </div>
              <div 
                ref={el => unitRefs.current[4] = el}
                style={{background: 'white', borderLeft: '5px solid black', borderRadius: '8px', boxShadow:'0 2px 6px rgba(0,0,0,0.05)'}} 
                className="p-4 md:p-6 fade-in opacity-0 translate-y-4 transition-all duration-700 ease-out"
              >
                <h3 className="font-semibold text-lg md:text-xl mb-1">Unit 5 – Bureaucracy</h3>
                <p className="text-sm md:text-base">
                  Democracy can be found buried under mounds of paperwork. We decipher it for you.
                </p>
              </div>
              <div 
                ref={el => unitRefs.current[5] = el}
                style={{background: 'white', borderLeft: '5px solid black', borderRadius: '8px', boxShadow:'0 2px 6px rgba(0,0,0,0.05)'}} 
                className="p-4 md:p-6 fade-in opacity-0 translate-y-4 transition-all duration-700 ease-out"
              >
                <h3 className="font-semibold text-lg md:text-xl mb-1">Unit 6 – Political Science</h3>
                <p className="text-sm md:text-base">
                  Understand the systems that define our political beliefs and decisions,
                </p>
              </div>
              <div 
                ref={el => unitRefs.current[6] = el}
                style={{background: 'white', borderLeft: '5px solid black', borderRadius: '8px', boxShadow:'0 2px 6px rgba(0,0,0,0.05)'}} 
                className="p-4 md:p-6 fade-in opacity-0 translate-y-4 transition-all duration-700 ease-out"
              >
                <h3 className="font-semibold text-lg md:text-xl mb-1">Unit 7 – The Role of the Citizen</h3>
                <p className="text-sm md:text-base">
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
            <div className="absolute inset-0 bg-emerald-700/75"></div>
            <div className="relative z-10 max-w-3xl mx-auto text-white px-4 md:px-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">You're more powerful than you think.</h2>
              <p className="mb-8 text-sm md:text-base">
                Take control of your power as a citizen, and bring your friends with you.
              </p>
              <Link to="/pathway">
                <button className="bg-white text-emerald-700 font-medium px-4 md:px-6 py-3 rounded shadow hover:bg-emerald-50 transition text-sm md:text-base">
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
