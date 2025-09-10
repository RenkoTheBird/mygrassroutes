import Header from "../components/Header/Header";

function About() {
  return (
    <>
      <div className="bg-gray-50">
        <Header
          logo="/assets/headerlogo.png"
          navLinks={[
            { label: "Home", href: "/" },
            {
              label: "Services",
              children: [
                { label: "Web Development", href: "/services/web" },
                { label: "App Development", href: "/services/app" },
              ],
            },
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
          ]}
          actions={
            <>
              <button className="hidden md:inline-block bg-white text-emerald-700 border border-emerald-700 px-3 py-1 rounded hover:bg-emerald-50 transition">
                Login
              </button>
              <button className="hidden md:inline-block bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 transition">
                Sign Up
              </button>
            </>
          }
        />

        <main className="pt-20">
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
            <div className="relative z-10 max-w-3xl mx-auto text-white px-6">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                Have you ever asked yourself, what is the point of politics?
              </h1>
              <p className="text-lg">
                If you’ve ever felt like it’s all just noise — you’re not alone.
              </p>
            </div>
          </section>

          {/* Agitation Section */}
          <section className="w-full bg-green-400 py-16 px-6 md:px-16 flex flex-col md:flex-row items-start gap-8">
            <img
              src="../assets/overwhelmed.jpg"
              alt="An overwhelmed man holds his head in his hands."
              className="w-full md:w-1/5 rounded shadow-lg"
            />
            <div className="text-brown-700 md:ml-6 max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">Politics feels distant for a reason.</h2>
              <p>Textbooks skim the surface. News overwhelms.</p>
              <p>
                Schools rarely explain how power <em>really</em> works — or where you fit in.
              </p>
              <p>The result? Millions of Americans tuned out,</p>
              <p className="mb-4">turned off, and told to “get involved” with zero guidance.</p>
              <ul className="space-y-2">
                <li>❌ We hear “vote” but not what comes after</li>
                <li>❌ We want change but don’t know where to start</li>
                <li>❌ We care — but feel powerless</li>
              </ul>
            </div>
          </section>

          {/* Solution Section */}
          <section className="w-full bg-emerald-600 text-white py-16 px-6 md:px-16 flex flex-col md:flex-row items-start gap-8">
            <img
              src="../assets/sapling.jpg"
              alt="A person holding a plant sapling with dirt on their hands."
              className="w-full md:w-1/6 rounded shadow-lg align-right"
            />
            <div className="md:mr-6 max-w-2xl md:text-right">
              <h2 className="text-3xl font-bold mb-4">That’s why we built mygrassroutes.</h2>
              <p>An interactive map of civic power — built for action.</p>
              <p>
                We created <strong>The Tree</strong> to help you grow your understanding,
              </p>
              <p>
                deepen your involvement, and actually do something about the issues you care about.
              </p>
            </div>
          </section>

          {/* The Tree: Units */}
          <section className="max-w-4xl mx-auto py-16 px-6">
            <h2 className="text-3xl font-bold mb-8">The Tree: 7 Units of Real Civic Power</h2>
            <div className="space-y-6">
              <div style={{background: 'white', borderLeft: '5px solid black', borderRadius: '8px', boxShadow:'0 2px 6px rgba(0,0,0,0.05)', padding:'1.5rem'}}>
                <h3 className="font-semibold text-xl mb-1">Unit 1 – Grassroots Movements</h3>
                <p>
                  Change starts from the ground up. Learn how people like you have shifted laws, won rights, and sparked revolutions.
                </p>
              </div>
              <div style={{background: 'white', borderLeft: '5px solid black', borderRadius: '8px', boxShadow:'0 2px 6px rgba(0,0,0,0.05)', padding:'1.5rem'}}>
                <h3 className="font-semibold text-xl mb-1">Unit 2 – The Media</h3>
                <p>
                  See how news shapes narratives — and how you can spot bias, influence coverage, and make your voice heard.
                </p>
              </div>
              <div style={{background: 'white', borderLeft: '5px solid black', borderRadius: '8px', boxShadow:'0 2px 6px rgba(0,0,0,0.05)', padding:'1.5rem'}}>
                <h3 className="font-semibold text-xl mb-1">Unit 3 – Politics in Our Lives</h3>
                <p>
                  Politics touches every part of your daily experience — school, housing, internet access. Learn to trace the impact.
                </p>
              </div>
              <div style={{background: 'white', borderLeft: '5px solid black', borderRadius: '8px', boxShadow:'0 2px 6px rgba(0,0,0,0.05)', padding:'1.5rem'}}>
                <h3 className="font-semibold text-xl mb-1">Unit 4 – Politics in History</h3>
                <p>
                  Discover the real stories of how change was made. From civil rights to the suffrage movement, history is a playbook.
                </p>
              </div>
              <div style={{background: 'white', borderLeft: '5px solid black', borderRadius: '8px', boxShadow:'0 2px 6px rgba(0,0,0,0.05)', padding:'1.5rem'}}>
                <h3 className="font-semibold text-xl mb-1">Unit 5 – Bureaucracy</h3>
                <p>
                  Paperwork and policy aren’t sexy — but they’re powerful. This unit shows you how decisions get made behind the scenes.
                </p>
              </div>
              <div style={{background: 'white', borderLeft: '5px solid black', borderRadius: '8px', boxShadow:'0 2px 6px rgba(0,0,0,0.05)', padding:'1.5rem'}}>
                <h3 className="font-semibold text-xl mb-1">Unit 6 – Political Science</h3>
                <p>
                  Get grounded in systems thinking, ideology, power structures — without the boring lecture hall.
                </p>
              </div>
              <div style={{background: 'white', borderLeft: '5px solid black', borderRadius: '8px', boxShadow:'0 2px 6px rgba(0,0,0,0.05)', padding:'1.5rem'}}>
                <h3 className="font-semibold text-xl mb-1">Unit 7 – The Role of the Citizen</h3>
                <p>
                  Here’s where it gets personal. Learn your rights, your responsibilities, and your many ways to act — right now.
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
            <div className="relative z-10 max-w-3xl mx-auto text-white px-6">
              <h2 className="text-4xl font-bold mb-4">You’re more powerful than you think.</h2>
              <p className="mb-8">
                Start at the root. Learn what they never taught you. Take action — and bring others with you.
              </p>
              <button className="bg-white text-emerald-700 font-medium px-6 py-3 rounded shadow hover:bg-emerald-50 transition">
                Explore the Tree Now →
              </button>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-100 py-6 text-center text-sm">
            <p className="font-semibold">mygrassroutes – Learn. Act. Lead.</p>
            <nav className="mt-2 space-x-2">
              <a href="#" className="hover:underline">
                FAQ
              </a>
              |
              <a href="#" className="hover:underline">
                Privacy
              </a>
              |
              <a href="#" className="hover:underline">
                Contact
              </a>
            </nav>
          </footer>
        </main>
      </div>
    </>
  );
}

export default About;
