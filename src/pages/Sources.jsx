import { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import HeaderActions from '../components/HeaderActions';
import database from '../database/database';

function Sources() {
  const [sources, setSources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <h3 className="text-xl md:text-2xl font-bold mb-6 text-emerald-700">
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
            { label: "Pathway", href: "/pathway" },
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
            { label: "Pathway", href: "/pathway" },
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
            { label: "Pathway", href: "/pathway" },
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
            <div className="absolute inset-0 bg-emerald-700/75"></div>
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
              <div className="mt-16 pt-12 border-t-2 border-emerald-700">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-emerald-700">
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

export default Sources;