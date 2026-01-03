import { Link, useLocation } from "react-router-dom";

export default function NavLinkRenderer({ link, onClick }) {
  const location = useLocation();
  const isInternal =
    typeof link.href === "string" &&
    !link.href.startsWith("http") &&
    !link.href.startsWith("#");

  if (isInternal) {
    return (
      <Link
        to={link.href}
        className={`px-3 py-2 rounded hover:bg-emerald-400/30 block ${
          location.pathname === link.href ? "font-bold text-emerald-500" : ""
        }`}
        onClick={onClick}
      >
        {link.label}
      </Link>
    );
  }

  return (
    <a
      href={link.href}
      className="px-3 py-2 rounded hover:bg-emerald-400/30 block"
      onClick={onClick}
    >
      {link.label}
    </a>
  );
}
