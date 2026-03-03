import { type ReactNode } from "react";

interface Props {
  title: string;
  description: string;
  children: ReactNode;
  icon: ReactNode;
}

export const SettingsCard = ({ title, description, icon, children }: Props) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start gap-4">
          <div className="bg-[#E8BC6E]/10 text-[#E8BC6E] rounded-lg p-2">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#2D2D2D]">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-6 bg-gray-50/50">{children}</div>
    </div>
  );
};
