import { Calendar } from "lucide-react";

interface DateRangeProps {
  dateRange: string;
  setDateRange: (range: string) => void;
}

export const DateRangePicker = ({
  dateRange,
  setDateRange,
}: DateRangeProps) => {
  return (
    <div className="relative">
      <select
        value={dateRange}
        onChange={(e) => setDateRange(e.target.value)}
        className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] appearance-none cursor-pointer"
      >
        <option value="today">Hoy</option>
        <option value="week">Esta Semana</option>
        <option value="month">Este Mes</option>
        <option value="year">Este Año</option>
      </select>
      <Calendar
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        size={16}
      />
    </div>
  );
};
