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