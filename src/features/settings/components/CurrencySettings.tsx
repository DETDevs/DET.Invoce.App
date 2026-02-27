import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { type Settings } from "@/features/settings/types";
import settingsApi from "@/api/settings/SettingsAPI";

interface Props {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export const CurrencySettings = ({ settings, onUpdate }: Props) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Siempre guardamos NIO con la tasa porque USD es la base (rate = 1)
      // y NIO es la moneda local cuya tasa relativa al USD se actualiza
      await settingsApi.saveCurrent({
        currencyCode: "NIO",
        rate: settings.dollarExchangeRate,
      });
      localStorage.setItem("app-settings", JSON.stringify(settings));
      toast.success("Configuración de moneda guardada");
    } catch (error: any) {
      console.error("Error al guardar configuración:", error);
      const msg = error?.message || "No se pudo guardar en el servidor";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="mainCurrency"
          className="block text-sm font-medium text-gray-600 mb-1.5"
        >
          Moneda Principal
        </label>
        <select
          id="mainCurrency"
          name="mainCurrency"
          value={settings.mainCurrency}
          onChange={(e) =>
            onUpdate("mainCurrency", e.target.value as "NIO" | "USD")
          }
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E]/80 text-sm"
        >
          <option value="NIO">Córdoba Nicaragüense (C$)</option>
          <option value="USD">Dólar Americano ($)</option>
        </select>
        <p className="text-xs text-gray-400 mt-2">
          Esta será la moneda por defecto para mostrar precios y registrar
          transacciones.
        </p>
      </div>

      <div>
        <label
          htmlFor="dollarExchangeRate"
          className="block text-sm font-medium text-gray-600 mb-1.5"
        >
          Tasa de Cambio (1 USD = ? C$)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            C$
          </span>
          <input
            type="number"
            id="dollarExchangeRate"
            name="dollarExchangeRate"
            value={settings.dollarExchangeRate}
            onChange={(e) =>
              onUpdate("dollarExchangeRate", parseFloat(e.target.value) || 0)
            }
            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E]/80 text-sm"
            step="0.01"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Cuántos córdobas equivale 1 dólar americano.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#E8BC6E] text-white text-sm font-bold shadow-md hover:bg-[#dca34b] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Guardando...
          </>
        ) : (
          <>
            <Save size={16} /> Guardar Cambios
          </>
        )}
      </button>
    </div>
  );
};
