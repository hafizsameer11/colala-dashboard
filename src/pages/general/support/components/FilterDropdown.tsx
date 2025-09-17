import { useEffect, useRef, useState } from "react";
import images from "../../../../constants/images";

type Option = string;

interface FilterDropdownProps {
  value: string; // current selected
  options: Option[]; // list of options
  placeholder?: string; // shown when value === placeholderValue
  onChange: (val: string) => void;
  className?: string; // optional extra classes
  menuMaxHeight?: number; // optional menu max height
}

export function FilterDropdown({
  value,
  options,
  placeholder = "Select",
  onChange,
  className = "",
  menuMaxHeight = 280,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="
          shrink-0
          flex items-center justify-between
          border border-[#989898] rounded-lg
          px-4 py-3.5 bg-white cursor-pointer
          whitespace-nowrap
          min-w-[80px] md:min-w-[80px]            
                                           
          "
      >
        <span className="block truncate max-w-[130px] text-left">
          {value === placeholder ? placeholder : value}
        </span>
        <img className="w-3 h-3 ml-4" src={images.dropdown} alt="" />
      </button>

      {open && (
        <div
          ref={menuRef}
          className="
            absolute z-50 mt-2
            min-w-full
            bg-white border border-gray-200 rounded-lg shadow-lg
            overflow-auto
          "
          style={{ maxHeight: menuMaxHeight }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`
                w-full text-left px-4 py-2 text-sm cursor-pointer
                hover:bg-gray-50
                ${opt === value ? "font-semibold" : ""}
              `}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
