import { useState } from "react";
import { Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  color?: "blue" | "green" | "amber" | "red" | "purple" | "brown";
  tooltip?: string;
}

export const KPICard = ({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  color = "blue",
  tooltip,
}: KPICardProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    brown: "bg-[#F9F1D8] text-[#E8BC6E]",
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-2 relative">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          {tooltip && (
            <div
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Info
                size={14}
                className="text-gray-300 hover:text-gray-500 cursor-help transition-colors"
              />
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg shadow-lg pointer-events-none">
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                    <div className="w-2 h-2 bg-gray-800 rotate-45" />
                  </div>
                  {tooltip}
                </div>
              )}
            </div>
          )}
        </div>
        <h3 className="text-xl lg:text-2xl font-bold text-[#2D2D2D] truncate">
          {value}
        </h3>
        {subValue && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full mt-2 inline-block ${
              trend === "up"
                ? "text-green-600 bg-green-50"
                : trend === "down"
                  ? "text-red-600 bg-red-50"
                  : "text-gray-600 bg-gray-50"
            }`}
          >
            {subValue}
          </span>
        )}
      </div>
      <div className={`p-3 rounded-xl shrink-0 ${colorClasses[color]}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};
