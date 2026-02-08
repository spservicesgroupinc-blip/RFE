
import { useEffect, useRef } from 'react';
import { useCalculator, DEFAULT_STATE } from '../context/CalculatorContext';
import { syncUp, syncDown } from '../services/api';
import { authClient } from '../lib/auth-client';

export const useSync = () => {
  const { state, dispatch } = useCalculator();
  const { session, appData, ui } = state;
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedStateRef = useRef<string>("");
  const neonSession = authClient.useSession();

  // 1. SYNC NEON AUTH SESSION TO LOCAL STATE
  useEffect(() => {
    // When Neon Auth session changes, update our local session state
    if (neonSession.data?.session && neonSession.data?.user) {
      // Session exists, but we need to fetch user and company data from backend
      // This will be handled by the initialization effect below
      dispatch({ type: 'SET_LOADING', payload: false });
    } else if (!neonSession.isPending) {
      // No session and not loading - clear local session
      dispatch({ type: 'SET_SESSION', payload: null });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [neonSession.data, neonSession.isPending, dispatch]);

  // 2. CLOUD-FIRST INITIALIZATION
  useEffect(() => {
    if (!neonSession.data?.session) return;

    const initializeApp = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });

      try {
        // Attempt Fetch from Cloud (Source of Truth)
        const cloudData = await syncDown();

        if (cloudData) {
          // Deep merge cloud data over default state
          const mergedState = {
            ...DEFAULT_STATE,
            ...cloudData,
            // Ensure deeply nested objects are merged correctly if partial
            companyProfile: { ...DEFAULT_STATE.companyProfile, ...(cloudData.companyProfile || {}) },
            warehouse: { ...DEFAULT_STATE.warehouse, ...(cloudData.warehouse || {}) },
            costs: { ...DEFAULT_STATE.costs, ...(cloudData.costs || {}) },
            yields: { ...DEFAULT_STATE.yields, ...(cloudData.yields || {}) },
            expenses: { ...DEFAULT_STATE.expenses, ...(cloudData.expenses || {}) },
            // Merge lifetime usage
            lifetimeUsage: { ...DEFAULT_STATE.lifetimeUsage, ...(cloudData.lifetimeUsage || {}) }
          };

          dispatch({ type: 'LOAD_DATA', payload: mergedState });
          dispatch({ type: 'SET_INITIALIZED', payload: true });
          lastSyncedStateRef.current = JSON.stringify(mergedState);
          dispatch({ type: 'SET_SYNC_STATUS', payload: 'success' });

          // Clear successful sync status after delay
          setTimeout(() => {
            dispatch({ type: 'SET_SYNC_STATUS', payload: 'idle' });
          }, 3000);

          // Check if PIN is missing and warn
          if (!mergedState.companyProfile.crewAccessPin) {
            console.warn("Crew PIN missing from cloud data");
            dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: 'Warning: Crew PIN not configured.' } });
          }

        } else {
          throw new Error("Empty response from cloud");
        }
      } catch (e) {
        console.error("Cloud sync failed:", e);

        // Fallback: If cloud fails (offline), try Local Storage
        const localSaved = localStorage.getItem(`foamProState_${neonSession.data?.user?.email}`);

        if (localSaved) {
          const localState = JSON.parse(localSaved);
          dispatch({ type: 'LOAD_DATA', payload: localState });
          dispatch({ type: 'SET_INITIALIZED', payload: true });
          dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' }); // Warning state
          dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: 'Offline Mode: Using local backup.' } });
        } else {
          // Critical Error: No Cloud and No Local Backup.
          dispatch({ type: 'LOAD_DATA', payload: DEFAULT_STATE });
          dispatch({ type: 'SET_INITIALIZED', payload: true });
          dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
          dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: 'Sync Failed. Check Internet Connection.' } });
        }
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeApp();
  }, [neonSession.data?.session, dispatch]);

  // 3. AUTO-SYNC (Write to Cloud)
  useEffect(() => {
    if (ui.isLoading || !ui.isInitialized || !neonSession.data?.session) return;
    if (session?.role === 'crew') return; // Crew doesn't auto-sync UP generally

    const currentStateStr = JSON.stringify(appData);

    // Always backup to local storage
    const userEmail = neonSession.data?.user?.email;
    if (userEmail) {
      localStorage.setItem(`foamProState_${userEmail}`, currentStateStr);
    }

    // If state hasn't changed from what we last saw from/sent to cloud, do nothing
    if (currentStateStr === lastSyncedStateRef.current) return;

    // Debounce the Cloud Sync
    dispatch({ type: 'SET_SYNC_STATUS', payload: 'pending' });
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

    syncTimerRef.current = setTimeout(async () => {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });

      const success = await syncUp(appData);

      if (success) {
        lastSyncedStateRef.current = currentStateStr;
        dispatch({ type: 'SET_SYNC_STATUS', payload: 'success' });
        setTimeout(() => dispatch({ type: 'SET_SYNC_STATUS', payload: 'idle' }), 3000);
      } else {
        dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
      }
    }, 3000);

    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
  }, [appData, ui.isLoading, ui.isInitialized, neonSession.data?.session, session?.role, dispatch, neonSession.data?.user?.email]);

  // 4. MANUAL FORCE SYNC (Push)
  const handleManualSync = async () => {
    if (!neonSession.data?.session) return;
    dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });

    const success = await syncUp(appData);

    if (success) {
      lastSyncedStateRef.current = JSON.stringify(appData);
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'success' });
      dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'success', message: 'Cloud Sync Complete' } });
      setTimeout(() => dispatch({ type: 'SET_SYNC_STATUS', payload: 'idle' }), 3000);
    } else {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
      dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: 'Sync Failed. Check Internet.' } });
    }
  };

  // 5. FORCE REFRESH (Pull) - New for Crew Dashboard
  const forceRefresh = async () => {
    if (!neonSession.data?.session) return;
    dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
    try {
      const cloudData = await syncDown();
      if (cloudData) {
        const mergedState = { ...state.appData, ...cloudData };
        dispatch({ type: 'LOAD_DATA', payload: mergedState });
        lastSyncedStateRef.current = JSON.stringify(mergedState);
        dispatch({ type: 'SET_SYNC_STATUS', payload: 'success' });
        setTimeout(() => dispatch({ type: 'SET_SYNC_STATUS', payload: 'idle' }), 3000);
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
      dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: 'Refresh Failed.' } });
    }
  };

  return { handleManualSync, forceRefresh };
};
