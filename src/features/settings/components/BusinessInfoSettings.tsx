import React from "react";
import { type Settings } from "../types";

interface Props {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const InputField = ({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: keyof Settings;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-600 mb-1.5"
    >
      {label}
    </label>
    <input
      type="text"
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E]/80 text-sm"
    />
  </div>
);

export const BusinessInfoSettings = ({ settings, onUpdate }: Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof Settings; value: string };
    onUpdate(name, value);
  };

  return (
    <div className="space-y-4">
      <InputField
        label="Nombre del Negocio"
        name="businessName"
        value={settings.businessName}
        onChange={handleChange}
      />
      <InputField
        label="Dirección"
        name="businessAddress"
        value={settings.businessAddress}
        onChange={handleChange}
      />
      <InputField
        label="Teléfono"
        name="businessPhone"
        value={settings.businessPhone}
        onChange={handleChange}
      />
      <InputField
        label="Número RUC / Cédula"
        name="taxId"
        value={settings.taxId}
        onChange={handleChange}
      />
    </div>
  );
};
