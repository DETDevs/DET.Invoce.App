import type { Settings } from "@/features/settings/types";

interface Props {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export const TableSettings = ({ settings, onUpdate }: Props) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Número de Mesas
        </label>
        <input
          type="number"
          min={1}
          max={50}
          value={settings.tableCount}
          onChange={(e) =>
            onUpdate(
              "tableCount",
              Math.max(1, Math.min(50, Number(e.target.value) || 1)),
            )
          }
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm font-medium text-[#2D2D2D]"
        />
        <p className="text-xs text-gray-400 mt-1">
          Define cuántas mesas tiene el negocio (1-50).
        </p>
      </div>
    </div>
  );
};
