import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";

interface DateRangeProps {
  dateRange: string;
  setDateRange: (range: string) => void;
  onCustomRange?: (start: Date, end: Date) => void;
}

const PRESETS = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Esta Semana" },
  { value: "month", label: "Este Mes" },
  { value: "year", label: "Este Año" },
  { value: "custom", label: "Personalizado" },
];

const getLabel = (value: string) =>
  PRESETS.find((p) => p.value === value)?.label ?? value;

export const DateRangePicker = ({
  dateRange,
  setDateRange,
  onCustomRange,
}: DateRangeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(dateRange === "custom");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePresetClick = (value: string) => {
    if (value === "custom") {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      setDateRange(value);
      setIsOpen(false);
    }
  };

  const handleApplyCustom = () => {
    if (!startDate || !endDate) return;
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T23:59:59");
    if (start > end) return;
    setDateRange("custom");
    onCustomRange?.(start, end);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-3 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8BC6E]"
      >
        <Calendar size={16} className="text-gray-400" />
        <span className="text-[#2D2D2D]">{getLabel(dateRange)}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[260px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === preset.value && preset.value !== "custom"
                    ? "bg-[#593D31] text-white"
                    : "text-[#2D2D2D] hover:bg-[#F3EFE0]"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {showCustom && (
            <div className="border-t border-gray-100 p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                  />
                </div>
              </div>
              <button
                onClick={handleApplyCustom}
                disabled={!startDate || !endDate}
                className="w-full py-2 bg-[#E8BC6E] hover:bg-[#dca34b] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                Aplicar rango
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
