import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import restaurantTableApi from "@/api/restaurant-table/RestaurantTableAPI";
import type { Settings } from "@/features/settings/types";

interface Props {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export const TableSettings = ({ settings, onUpdate }: Props) => {
  const [originalCount, setOriginalCount] = useState(settings.tableCount);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restaurantTableApi
      .get()
      .then((tables: any[]) => {
        const count = tables?.length ?? settings.tableCount;
        setOriginalCount(count);
        onUpdate("tableCount", count);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const isDirty = settings.tableCount !== originalCount;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await restaurantTableApi.saveTableTotal(settings.tableCount);
      setOriginalCount(settings.tableCount);
      const stored = JSON.parse(localStorage.getItem("app-settings") || "{}");
      localStorage.setItem(
        "app-settings",
        JSON.stringify({ ...stored, tableCount: settings.tableCount }),
      );
      toast.success("Mesas actualizadas correctamente");
    } catch {
      toast.error("No se pudo guardar el número de mesas");
    } finally {
      setIsSaving(false);
    }
  };

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
          disabled={isLoading}
          onChange={(e) =>
            onUpdate(
              "tableCount",
              Math.max(1, Math.min(50, Number(e.target.value) || 1)),
            )
          }
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm font-medium text-[#2D2D2D] disabled:opacity-50"
        />
        <p className="text-xs text-gray-400 mt-1">
          Define cuántas mesas tiene el negocio (1-50).
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={!isDirty || isSaving}
        className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#E8BC6E] text-white text-sm font-bold shadow-md hover:bg-[#dca34b] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Guardando...
          </>
        ) : (
          <>
            <Save size={16} /> Guardar Mesas
          </>
        )}
      </button>
    </div>
  );
};
