import { useState, useEffect, useCallback } from "react";

export interface MonitorInfo {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale_factor: number;
  is_primary: boolean;
}

export function useMonitorPosition() {
  const [monitors, setMonitors] = useState<MonitorInfo[]>([]);
  const [primaryMonitor, setPrimaryMonitor] = useState<MonitorInfo | null>(null);

  const detectMonitors = useCallback(async () => {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const result: MonitorInfo[] = await invoke("get_monitors");
      setMonitors(result);
      const primary = result.find((m) => m.is_primary) || result[0] || null;
      setPrimaryMonitor(primary);
      return result;
    } catch {
      const fallback: MonitorInfo = {
        id: "default",
        name: "Default",
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        scale_factor: 1.0,
        is_primary: true,
      };
      setMonitors([fallback]);
      setPrimaryMonitor(fallback);
      return [fallback];
    }
  }, []);

  const positionOnMonitor = useCallback(
    async (monitorId: string, islandWidth: number, islandHeight: number) => {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("position_island", {
          monitorId,
          islandWidth,
          islandHeight,
        });
      } catch {
        // fallback: center via CSS
      }
    },
    [],
  );

  useEffect(() => {
    detectMonitors();
  }, [detectMonitors]);

  return { monitors, primaryMonitor, detectMonitors, positionOnMonitor };
}
