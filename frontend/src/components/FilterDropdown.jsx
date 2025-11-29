// import { useState, useRef, useEffect } from "react";
// import { Filter, Check } from "lucide-react";
// import TASK_STATUS_CONFIG from "@/config/taskStatusConfig";

// export default function FilterDropdown({ onChange }) {
//   const [open, setOpen] = useState(false);
//   const [selected, setSelected] = useState([]);
//   const dropdownRef = useRef(null);

//   // Build list dynamically from config
//   const filterOptions = Object.keys(TASK_STATUS_CONFIG).map((key) => ({
//     key: key.toLowerCase(),           // ex: "Todo" → "todo"
//     rawStatus: key,                   // "Todo"
//     label: TASK_STATUS_CONFIG[key].label,
//     icon: TASK_STATUS_CONFIG[key].icon,
//     color: TASK_STATUS_CONFIG[key].color, // ex: "bg-green-500"
//   }));

//   const toggleSelect = (key) => {
//     let newSelected;

//     if (selected.includes(key)) {
//       newSelected = selected.filter((x) => x !== key);
//     } else {
//       newSelected = [...selected, key];
//     }

//     setSelected(newSelected);
//     onChange(newSelected);

//     setOpen(false); // AUTO CLOSE
//   };

//   // Close when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="relative inline-block z-50" ref={dropdownRef}>
//       {/* FILTER BUTTON */}
//       <button
//         onClick={() => setOpen(!open)}
//         className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow hover:bg-gray-50"
//       >
//         <Filter className="w-4 h-4" />
//         Filters
//       </button>

//       {open && (
//         <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border p-2 space-y-1 z-50">

//           {/* STATUS FILTER LIST */}
//           {filterOptions.map((opt) => {
//             const Icon = opt.icon;

//             return (
//               <button
//                 key={opt.key}
//                 className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-100"
//                 onClick={() => toggleSelect(opt.key)}
//               >
//                 <div className="flex items-center gap-3">
                  
//                   {/* Colored Circle */}
//                   <div className={`w-3 h-3 rounded-full ${opt.color}`}></div>

//                   {/* Icon + Label */}
//                   <span className="flex items-center gap-2">
//                     <Icon className="w-4 h-4 text-gray-700" />
//                     {opt.label}
//                   </span>
//                 </div>

//                 {/* Checkmark If Selected */}
//                 {selected.includes(opt.key) && (
//                   <Check className="w-4 h-4 text-green-600" />
//                 )}
//               </button>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Filter, Check } from "lucide-react";
import TASK_STATUS_CONFIG from "@/config/taskStatusConfig";

export default function FilterDropdown({ onChange }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Build list dynamically from config
  const filterOptions = Object.keys(TASK_STATUS_CONFIG).map((key) => ({
    key: key.toLowerCase(),
    rawStatus: key,
    label: TASK_STATUS_CONFIG[key].label,
    icon: TASK_STATUS_CONFIG[key].icon,
    color: TASK_STATUS_CONFIG[key].color,
  }));

  const toggleSelect = (key) => {
    let newSelected;
    if (selected.includes(key)) {
      newSelected = selected.filter((x) => x !== key);
    } else {
      newSelected = [...selected, key];
    }
    setSelected(newSelected);
    onChange(newSelected);
    setOpen(false);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate dropdown position relative to button
  const getDropdownStyle = () => {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      position: "absolute",
      top: rect.bottom + window.scrollY + 8,
      left: rect.right + window.scrollX - 256,
      zIndex: 10000,
    };
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow hover:bg-gray-50"
      >
        <Filter className="w-4 h-4" />
        Filters
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={getDropdownStyle()}
            className="w-64 bg-white rounded-xl shadow-lg border p-2 space-y-1"
          >
            {filterOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.key}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-100"
                  onClick={() => toggleSelect(opt.key)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${opt.color}`}></div>
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-700" />
                      {opt.label}
                    </span>
                  </div>
                  {selected.includes(opt.key) && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}