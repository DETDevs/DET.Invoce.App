import React from "react";
import { type Settings } from "../types";

interface Props {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export const CurrencySettings = ({ settings, onUpdate }: Props) => {
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
          Tasa de Cambio (1 USD a C$)
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
          Tasa de cambio oficial o de venta para conversiones.
        </p>
      </div>
    </div>
  );
};
