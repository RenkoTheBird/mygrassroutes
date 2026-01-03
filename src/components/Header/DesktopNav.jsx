import { ChevronDown } from "lucide-react";
import NavLinkRenderer from "./NavLinkRenderer";

export default function DesktopNav({ navLinks, actions, activeDropdown, setActiveDropdown }) {
  return (
    <nav className="hidden md:flex items-center space-x-4">
      {navLinks.map((link, index) => {
        if (link.children && link.children.length > 0) {
          return (
            <div
              key={index}
              className="relative"
              onMouseEnter={() => setActiveDropdown(index)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 px-3 py-2 hover:bg-emerald-400/30 rounded">
                {link.label} <ChevronDown size={16} />
              </button>
              {activeDropdown === index && (
                <div className="absolute top-full left-0 bg-white text-gray-800 shadow-lg rounded mt-1 min-w-[200px] overflow-hidden">
                  {link.children.map((child, i) => (
                    <div key={i} className="hover:bg-gray-100">
                      <NavLinkRenderer link={child} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }
        return <div key={index}><NavLinkRenderer link={link} /></div>;
      })}
      {actions && <div className="ml-4 flex items-center gap-2">{actions}</div>}
    </nav>
  );
}
