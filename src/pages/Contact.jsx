import { useEffect, useRef } from "react";
import Header from "../components/Header/Header";
import HeaderActions from "../components/HeaderActions";
import { useAuth } from "./AuthProvider";

function Contact() {
  const contactRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    // Fade in animation on mount
    const timer = setTimeout(() => {
      if (contactRef.current) {
        contactRef.current.classList.add('fade-in-visible');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        .fade-in-top {
          opacity: 0;
          transform: translateY(-30px);
          transition: all 0.8s ease-out;
        }
        
        .fade-in-top-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
      <div className="bg-gray-50 min-h-screen">
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

        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 md:gap-12 max-w-6xl mx-auto">
              
              {/* Left side - "Contact" text */}
              <div className="w-full lg:w-2/5 flex items-center lg:items-start justify-center lg:justify-start">
                <h1
                  ref={contactRef}
                  className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-emerald-500 fade-in-top"
                >
                  Contact
                </h1>
              </div>

              {/* Right side - Green square with info */}
              <div className="w-full lg:w-3/5">
                <div className="bg-emerald-500 text-white p-8 md:p-10 rounded-lg shadow-xl">
                  <div className="space-y-6 md:space-y-8">
                    
                    {/* Email */}
                    <div className="border-b border-emerald-500/30 pb-4">
                      <h3 className="text-lg md:text-xl font-semibold mb-2">Email</h3>
                      <a 
                        href="mailto:contact@mygrassroutes.com" 
                        className="text-emerald-100 hover:text-white transition-colors break-words"
                      >
                        support@mygrassroutes.com
                      </a>
                    </div>

                    {/* PO Box */}
                    <div className="border-b border-emerald-500/30 pb-4">
                      <h3 className="text-lg md:text-xl font-semibold mb-2">Mailing Address</h3>
                      <p className="text-emerald-100">
                        P.O. Box coming soon!
                      </p>
                    </div>

                    {/* Google Form */}
                    <div>
                      <h3 className="text-lg md:text-xl font-semibold mb-2">Feedback & Survey</h3>
                      <p className="text-emerald-100 mb-3 text-sm">
                        Share your thoughts and help us improve the platform.
                      </p>
                      <a 
                        href="https://forms.gle/9bEMpwQpBLFGXDbq6" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-white text-emerald-500 px-6 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
                      >
                        Take Our Survey →
                      </a>
                    </div>

                  </div>
                </div>

                {/* Additional info below the square */}
                <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
                  <p className="text-gray-700 text-center">
                    Have a question, suggestion, or want to get involved? We'd love to hear from you!
                  </p>
                </div>
              </div>

            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 py-6 text-center text-sm px-4 md:px-6">
          <p className="font-semibold">mygrassroutes – Politics for all.</p>
          <p className="mt-2 text-xs text-gray-600">
            Copyright © 2025 mygrassroutes
          </p>
        </footer>
      </div>
    </>
  );
}

export default Contact;
