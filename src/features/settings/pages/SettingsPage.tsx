import { Building, Coins, Landmark, Save } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useSettings } from "@/features/settings/hooks/useSettings";
import { SettingsCard } from "@/features/settings/components/SettingsCard";
import { BusinessInfoSettings } from "@/features/settings/components/BusinessInfoSettings";
import { CurrencySettings } from "@/features/settings/components/CurrencySettings";
import { CashBoxSettings } from "@/features/settings/components/CashBoxSettings";

export const SettingsPage = () => {
  const { settings, isLoading, isDirty, updateSetting, handleSaveSettings } =
    useSettings();

  return (
    <div className="h-full bg-[#FDFBF7] overflow-y-auto">
      <div className="px-4 md:px-8 py-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl md:text-2xl font-bold text-[#2D2D2D]">
          Configuración del Sistema
        </h1>
        <button
          onClick={handleSaveSettings}
          disabled={isLoading || !isDirty}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#E8BC6E] text-white text-sm font-bold shadow-md hover:bg-[#dca34b] transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-wait"
        >
          <Save size={18} />
          {isLoading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      <main className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <SettingsCard
              title="Información del Negocio"
              description="Datos que aparecerán en facturas y reportes."
              icon={<Building size={24} />}
            >
              <BusinessInfoSettings
                settings={settings}
                onUpdate={updateSetting}
              />
            </SettingsCard>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <SettingsCard
              title="Moneda y Finanzas"
              description="Configura la moneda principal y valores por defecto."
              icon={<Landmark size={24} />}
            >
              <CurrencySettings settings={settings} onUpdate={updateSetting} />
            </SettingsCard>

            <SettingsCard
              title="Caja"
              description="Configuración para la apertura y cierre de caja."
              icon={<Coins size={24} />}
            >
              <CashBoxSettings settings={settings} onUpdate={updateSetting} />
            </SettingsCard>
          </div>
        </div>
      </main>
      <Toaster position="top-center" />
    </div>
  );
};
