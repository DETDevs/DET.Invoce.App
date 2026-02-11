import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  color?: "blue" | "green" | "amber" | "red" | "purple" | "brown";
}

export const KPICard = ({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  color = "blue",
}: KPICardProps) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    brown: "bg-[#F9F1D8] text-[#E8BC6E]",
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-[#2D2D2D]">{value}</h3>
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
      <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};
