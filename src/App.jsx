import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AccordionItem from "./components/AccordionItem.jsx";
import Header from "./components/Header/Header";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
//import Dashboard from "./Dashboard";
import { AuthProvider } from "./pages/AuthProvider";
import ProtectedRoute from "./pages/ProtectedRoute";

function App() {
  // Array of open accordion indexes
  const [openIndexes, setOpenIndexes] = useState([]);

  const toggleAccordion = (index) => {
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index) // close if already open
        : [...prev, index] // open without closing others
    );
  };

  return (
    <AuthProvider>
      <Router>
        <>
          {/* Hero Section */}
          <div className="bg-gray-50">
            <Header
              logo="/assets/headerlogo.png"
              navLinks={[
                { label: "Home", href: "/" },
                {
                  label: "Services",
                  children: [
                    { label: "Web Development", href: "#web" },
                    { label: "App Development", href: "#app" },
                  ],
                },
                { label: "About", href: "/about" },
                { label: "Contact", href: "#contact" },
              ]}
              actions={
                <>
                  {/* FIX: buttons replaced with <Link> for routing */}
                  <Link
                    to="/login"
                    className="hidden md:inline-block bg-white text-emerald-700 border border-emerald-700 px-3 py-1 rounded hover:bg-emerald-50 transition"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup"
                    className="hidden md:inline-block bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 transition"
                  >
                    Signup
                  </Link>
                </>
              }
            />
            <main className="pt-20">
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      {/* --- Home Page Sections --- */}
                      {/* Top Section */}
                      <header className="container mx-auto py-12">
                        <div
                          className="flex flex-wrap items-center p-8 rounded-xl shadow-lg relative overflow-hidden"
                          style={{
                            backgroundImage: "url('/assets/leaves-bg.jpg')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          <div className="absolute inset-0 bg-emerald-700/70"></div>

                          <div className="relative flex-1 min-w-[300px] text-white z-10">
                            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                              Finally, a way to get involved that actually works.
                            </h1>
                            <p className="mt-4 max-w-lg">
                              Politics isn’t broken — access to it is. We’re here to fix that.
                            </p>
                            <button className="mt-6 bg-white text-emerald-700 font-medium px-5 py-2 rounded shadow hover:bg-emerald-50 transition">
                              View The Tree →
                            </button>
                          </div>

                          <div className="relative flex-1 min-w-[300px] mt-6 md:mt-0 z-10">
                            <img
                              src="../assets/rotunda.jpeg"
                              alt="George Washington watching over the U.S. Capitol Rotunda"
                              className="w-full rounded-xl shadow-lg"
                            />
                          </div>
                        </div>
                      </header>

                  {/* Problem / Agitation */}
                  <section className="container mx-auto py-12 bg-emerald-50">
                    <h2 className="text-center text-3xl font-bold text-emerald-700">
                      You're told to “get involved.” But how?
                    </h2>
                    <p className="mt-4 max-w-3xl mx-auto text-center text-gray-700 leading-relaxed">
                      You want to make a difference — but politics feels distant, confusing,
                      and rigged for insiders. The system is hard to navigate. And most
                      sites just explain — they don’t empower.
                    </p>
                  </section>

                  {/* Solutions */}
                  <section className="container mx-auto py-12 bg-emerald-100 text-center">
                    <h2 className="text-3xl font-bold text-emerald-800">
                      mygrassroutes turns learning into real action.
                    </h2>
                    <ul className="mt-6 space-y-3 text-left inline-block text-gray-800">
                      <li>✅ Interactive Tree: learn by doing, not memorizing</li>
                      <li>✅ Local-first: discover exactly where you can make change</li>
                      <li>✅ Real results: unlock actions that matter — now</li>
                      <li>✅ Designed for first-timers, built for changemakers</li>
                    </ul>
                    <div>
                      <button className="mt-6 bg-emerald-700 text-white px-6 py-2 rounded shadow hover:bg-emerald-800 transition">
                        Get Started Now →
                      </button>
                    </div>
                  </section>

                  {/* Social Proof */}
                  <section className="container mx-auto py-12 bg-emerald-50">
                    <h2 className="text-center text-3xl font-bold text-emerald-700">
                      Over 10,000 people are already creating change
                    </h2>
                    <div className="flex flex-wrap gap-6 mt-6 justify-center">
                      <blockquote className="bg-white shadow-md p-6 rounded-lg max-w-sm text-gray-700 italic">
                        “I went from confused to connected in 30 minutes.” — Sam, MI
                      </blockquote>
                      <blockquote className="bg-white shadow-md p-6 rounded-lg max-w-sm text-gray-700 italic">
                        “No more guesswork. I’m organizing my first event.” — Lex, CA
                      </blockquote>
                    </div>
                  </section>

                  {/* Differentiation */}
                  <section className="container mx-auto py-12 bg-emerald-100">
                    <h2 className="text-center text-3xl font-bold text-emerald-800">
                      We don’t just teach. We activate.
                    </h2>
                    <table className="w-full mt-8 text-center border-collapse text-gray-700">
                      <thead>
                        <tr className="bg-emerald-200">
                          <th className="py-2 text-brown-700">Old Civics</th>
                          <th className="py-2 text-emerald-800">mygrassroutes</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">Memorize the three branches</td>
                          <td className="py-2">Join a campaign in your zip code</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Read a textbook</td>
                          <td className="py-2">Get live civic action prompts</td>
                        </tr>
                        <tr>
                          <td className="py-2">Watch from the sidelines</td>
                          <td className="py-2">Lead from where you are</td>
                        </tr>
                      </tbody>
                    </table>
                  </section>

                  {/* FAQ Section */}
                  <section className="container mx-auto py-12 bg-emerald-50">
                    <h2 className="text-emerald-700 text-3xl font-bold">Got questions?</h2>

                    <AccordionItem
                      title="What if I don’t know anything about politics?"
                      isOpen={openIndexes.includes(0)}
                      onClick={() => toggleAccordion(0)}
                    >
                      <p>
                        No problem. The Tree starts at zero and guides you one click at a
                        time.
                      </p>
                    </AccordionItem>

                    <AccordionItem
                      title="Is this just for students?"
                      isOpen={openIndexes.includes(1)}
                      onClick={() => toggleAccordion(1)}
                    >
                      <p>
                        Nope. Anyone can use mygrassroutes — from new voters to seasoned
                        activists.
                      </p>
                    </AccordionItem>

                    <AccordionItem
                      title="How is this different from school?"
                      isOpen={openIndexes.includes(2)}
                      onClick={() => toggleAccordion(2)}
                    >
                      <p>
                        It's hands-on, fast-paced, and built to get you moving — not just
                        informed.
                      </p>
                    </AccordionItem>

                    <AccordionItem
                      title="Can I actually get involved from home?"
                      isOpen={openIndexes.includes(3)}
                      onClick={() => toggleAccordion(3)}
                    >
                      <p>
                        Yes. Many actions — organizing, contacting reps, joining events —
                        can start right from your screen.
                      </p>
                    </AccordionItem>
                  </section>

                  {/* Call to Action */}
                  <section className="container mx-auto py-12 text-center bg-emerald-700 text-white rounded-lg mt-8 shadow-lg">
                    <h2 className="text-3xl font-bold">
                      Real change starts right here.
                    </h2>
                    <p className="mt-4 max-w-xl mx-auto">
                      Stop waiting for someone else to fix it. Let’s do it together.
                    </p>
                    <button className="mt-6 bg-white text-emerald-700 px-6 py-2 rounded shadow hover:bg-emerald-50 transition">
                      View The Tree →
                    </button>
                  </section>

                  {/* Footer */}
                  <footer className="bg-gray-900 text-white py-6 text-center mt-8">
                    <p>
                      <strong>mygrassroutes</strong> – Learn. Act. Lead.
                    </p>
                    <nav className="mt-2 space-x-3 text-sm">
                      <a href="#" className="hover:underline">FAQ</a> |
                      <a href="#" className="hover:underline">Privacy</a> |
                      <a href="#" className="hover:underline">Contact</a>
                    </nav>
                  </footer>
                </>
              } />
              <Route path="/about" element={<About />} />

                {/* NEW: Login route */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} /> {/* ✅ Added signup route */}
                {/* NEW: Protected Dashboard route */}
                {/* <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                /> */}
              </Routes>
            </main>
          </div>
        </>
      </Router>
    </AuthProvider>
  );
}

export default App;