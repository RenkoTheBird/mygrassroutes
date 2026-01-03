// components/AccordionItem.jsx
export default function AccordionItem({ title, isOpen, onClick, children }) {
  return (
    <div className="border-b border-gray-300">
      {/* Header */}
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center py-4 text-left font-semibold text-emerald-600 hover:text-emerald-700 transition"
      >
        <span>{title}</span>
        <span className="text-xl">{isOpen ? "−" : "+"}</span>
      </button>

      {/* Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pb-4 text-gray-700">{children}</div>
      </div>
    </div>
  );
}
