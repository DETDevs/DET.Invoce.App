import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { type Settings } from "@/features/settings/types";

const SETTINGS_STORAGE_KEY = "app-settings";

const defaultSettings: Settings = {
  businessName: "Dulces Momentos",
  businessAddress: "Managua, Nicaragua",
  businessPhone: "versiesncesario",
  taxId: "versiesnecesario",
  initialCashBox: 500,
  mainCurrency: "NIO",
  dollarExchangeRate: 36.62,
  tableCount: 6,
};

const loadSettingsFromStorage = (): Settings => {
  try {
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      return { ...defaultSettings, ...JSON.parse(storedSettings) };
    }
  } catch (error) {
    console.error("Error loading settings from localStorage", error);
  }
  return defaultSettings;
};

export const useSettings = () => {
  const [originalSettings, setOriginalSettings] = useState<Settings>(
    loadSettingsFromStorage,
  );
  const [settings, setSettings] = useState<Settings>(loadSettingsFromStorage);
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const hasChanges =
      JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setIsDirty(hasChanges);
  }, [settings, originalSettings]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = () => {
    setIsLoading(true);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      setTimeout(() => {
        setIsLoading(false);
        setOriginalSettings(settings);
        toast.success("Configuración guardada correctamente");
      }, 500);
    } catch (error) {
      console.error("Error saving settings to localStorage", error);
      toast.error("No se pudo guardar la configuración.");
      setIsLoading(false);
    }
  };

  return {
    settings,
    isLoading,
    isDirty,
    updateSetting,
    handleSaveSettings,
  };
};
