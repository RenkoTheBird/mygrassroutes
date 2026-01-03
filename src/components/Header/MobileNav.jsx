import { ChevronDown } from "lucide-react";
import NavLinkRenderer from "./NavLinkRenderer";

export default function MobileNav({ navLinks, actions, activeDropdown, toggleDropdown, closeMenu }) {
  return (
    <div className="md:hidden bg-emerald-600 text-white px-4 py-4 space-y-2">
      {navLinks.map((link, index) => {
        if (link.children && link.children.length > 0) {
          return (
            <div key={index}>
              <button
                className="flex items-center justify-between w-full px-3 py-2 hover:bg-emerald-500 rounded"
                onClick={() => toggleDropdown(index)}
              >
                {link.label} <ChevronDown size={16} />
              </button>
              {activeDropdown === index && (
                <div className="pl-6 space-y-1">
                  {link.children.map((child, i) => (
                    <NavLinkRenderer key={i} link={child} onClick={closeMenu} />
                  ))}
                </div>
              )}
            </div>
          );
        }
        return <NavLinkRenderer key={index} link={link} onClick={closeMenu} />;
      })}
      {actions && <div className="pt-2">{actions}</div>}
    </div>
  );
}
