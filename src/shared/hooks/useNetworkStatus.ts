import { useState, useEffect, useCallback } from 'react';

/**
 * Hook that tracks online/offline network status.
 * Provides `isOnline` boolean and fires callbacks on status changes.
 */
export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );
    const [wasOffline, setWasOffline] = useState(false);

    const handleOnline = useCallback(() => {
        setIsOnline(true);
        setWasOffline(true);
        // Auto-clear the "reconnected" state after 3 seconds
        setTimeout(() => setWasOffline(false), 3000);
    }, []);

    const handleOffline = useCallback(() => {
        setIsOnline(false);
    }, []);

    useEffect(() => {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [handleOnline, handleOffline]);

    return { isOnline, wasOffline };
};
