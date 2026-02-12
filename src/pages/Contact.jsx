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
      </div>
    </>
  );
}

export default Contact;
