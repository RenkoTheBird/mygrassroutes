import { useState } from "react";
import { Menu, X } from "lucide-react";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";

export default function Header({ logo, navLinks = [], actions }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-emerald-600 text-white shadow z-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          {logo && <img src={logo} alt="Logo" className="h-10" />}
        </div>

        {/* Desktop Navigation */}
        <DesktopNav
          navLinks={navLinks}
          actions={actions}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
        />

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <MobileNav
          navLinks={navLinks}
          actions={actions}
          activeDropdown={activeDropdown}
          toggleDropdown={toggleDropdown}
          closeMenu={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
}
