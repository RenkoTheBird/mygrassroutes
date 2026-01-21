import { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import HeaderActions from '../components/HeaderActions';
import { useAuth } from './AuthProvider';
import database from '../database/database';

function Sources() {
  const [sources, setSources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadSources = async () => {
      setLoading(true);
      try {
        console.log('[Sources] Fetching sources from API...');
        const data = await database.getAllSources();
        console.log('[Sources] Received data:', data);
        setSources(data);
      } catch (err) {
        console.error('[Sources] Error loading sources:', err);
        setError(`Failed to load sources: ${err.message}. Please make sure the server is running on port 3001.`);
      } finally {
        setLoading(false);
      }
    };

    loadSources();
  }, []);

  // Helper function to get section title from section letter
  const getSectionTitle = (sectionLetter) => {
    const sectionMap = {
      'a': 'The nature of a movement',
      'b': 'Defining real change',
      'c': 'Protests',
      'd': 'Interest groups',
      'e': 'Boycotts',
      'f': 'Petitions',
      'g': 'Starting your own movement'
    };
    return sectionMap[sectionLetter] || `Section ${sectionLetter.toUpperCase()}`;
  };

  // Helper function to render sources for a specific unit
  const renderUnitSources = (unitNum, unitData) => {
    const sectionLetters = Object.keys(unitData).sort();
    
    return (
      <div key={unitNum} className="mb-12">
        <h3 className="text-xl md:text-2xl font-bold mb-6 text-emerald-600">
          Unit {unitNum}: {getUnitTitle(unitNum)}
        </h3>
        <div className="space-y-6">
          {sectionLetters.map(sectionLetter => {
            const lessonNumbers = Object.keys(unitData[sectionLetter]).sort((a, b) => a - b);
            return (
              <div key={sectionLetter} className="border-l-4 border-emerald-600 pl-6 mb-4">
                <h4 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
                  Section {sectionLetter.toUpperCase()}: {getSectionTitle(sectionLetter)}
                </h4>
                <div className="space-y-4">
                  {lessonNumbers.map(lessonNum => {
                    const lessonSources = unitData[sectionLetter][lessonNum];
                    return (
                      <div key={lessonNum} className="bg-gray-50 p-4 rounded-md">
                        <h5 className="font-semibold mb-2 text-gray-700">
                          Lesson {lessonNum}
                        </h5>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          {lessonSources.map((source, idx) => (
                            <li key={idx} className="text-sm md:text-base text-gray-600">
                              <a 
                                href={source} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 hover:underline break-all"
                              >
                                {source}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper function to get unit title
  const getUnitTitle = (unitNum) => {
    const unitTitles = {
      '1': 'Grassroots Movements',
      '2': 'The Media',
      '3': 'Politics in Our Lives',
      '4': 'Politics in History',
      '5': 'Bureaucracy',
      '6': 'Political Science',
      '7': 'The Role of the Citizen'
    };
    return unitTitles[unitNum] || `Unit ${unitNum}`;
  };

  if (loading) {
    return (
      <>
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Loading sources...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
        <>
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-red-600">{error}</p>
        </div>
      </>
    );
  }

  const unitNumbers = sources ? Object.keys(sources).sort((a, b) => a - b) : [];

  console.log('[Sources] Rendering with unitNumbers:', unitNumbers);
  console.log('[Sources] Sources object:', sources);

  return (
    <>
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
            className="relative py-16 text-center"
            style={{
              backgroundImage: "url('/assets/leaves-bg.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-emerald-600/75"></div>
            <div className="relative z-10 max-w-3xl mx-auto text-white px-4 md:px-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
                Sources & References
              </h1>
              <p className="text-base md:text-lg">
                All the resources cited throughout mygrassroutes
              </p>
            </div>
          </section>

          {/* Sources Content */}
          <section className="w-full py-12 md:py-16 px-4 md:px-6 lg:px-16">
            <div className="max-w-4xl mx-auto">
              {!sources || unitNumbers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg mb-4">No sources available at this time.</p>
                  <p className="text-gray-500 text-sm">Sources will appear here as lessons are added to the platform.</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {unitNumbers.map(unitNum => (
                    renderUnitSources(unitNum, sources[unitNum])
                  ))}
                </div>
              )}

              {/* Additional Resources Section */}
              <div className="mt-16 pt-12 border-t-2 border-emerald-600">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-emerald-600">
                  Additional Resources
                </h2>
                <div className="bg-gray-100 p-6 rounded-lg">
                  <p className="text-gray-600 italic">
                    This section will contain additional recommended resources and references. 
                    Content coming soon!
                  </p>
                </div>
              </div>
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
              <a href="https://bsky.app/profile/mygrassroutes.bsky.social" className="text-gray-600 hover:text-emerald-600 transition-colors" aria-label="Bluesky">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                  <path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z"/>
                </svg>
              </a>
              <a href="https://discord.gg/J7jmGf3w" className="text-gray-600 hover:text-emerald-600 transition-colors" aria-label="Discord">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
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

export default Sources;