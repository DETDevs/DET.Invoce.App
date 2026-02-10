import React from "react";
import { type Settings } from "../types";

interface Props {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export const CashBoxSettings = ({ settings, onUpdate }: Props) => {
  return (
    <div>
      <label
        htmlFor="initialCashBox"
        className="block text-sm font-medium text-gray-600 mb-1.5"
      >
        Monto de Apertura de Caja
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
          {settings.mainCurrency === "NIO" ? "C$" : "$"}
        </span>
        <input
          type="number"
          id="initialCashBox"
          name="initialCashBox"
          value={settings.initialCashBox}
          onChange={(e) =>
            onUpdate("initialCashBox", parseFloat(e.target.value) || 0)
          }
          className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8BC6E]/80 text-sm"
          step="10"
        />
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Este será el monto inicial con el que se abrirá la caja cada día.
      </p>
    </div>
  );
};
