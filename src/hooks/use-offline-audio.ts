import { useEffect, useSyncExternalStore } from "react";
import { getState, loadOfflineState, subscribe, type OfflineState } from "@/lib/offline-audio-store";

const serverState: OfflineState = {};
export function useOfflineAudio(): OfflineState {
  useEffect(() => {
    void loadOfflineState();
  }, []);
  return useSyncExternalStore(subscribe, getState, () => serverState);
}
