import { WifiOff, Wifi } from "lucide-react";
import { useNetworkStatus } from "@/shared/hooks/useNetworkStatus";

/**
 * Slim banner that appears at the top of the page when the device goes offline.
 * Shows a "reconnected" confirmation for 3 seconds when connectivity returns.
 */
export const NetworkStatusBar = () => {
  const { isOnline, wasOffline } = useNetworkStatus();

  // Fully online, wasn't recently offline — render nothing
  if (isOnline && !wasOffline) return null;

  return (
    <div
      className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-300 ${
        isOnline ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
      }`}
    >
      {isOnline ? (
        <>
          <Wifi size={16} />
          Conexión restablecida
        </>
      ) : (
        <>
          <WifiOff size={16} />
          Sin conexión a internet
        </>
      )}
    </div>
  );
};
