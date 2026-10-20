import { useState, useEffect, useCallback } from "react";
import { getSectionConfigApi } from "@/services/config.service";
import {
  type HomeHeroConfig,
  DEFAULT_HOME_HERO_CONFIG,
} from "@/types/homeHero.types";

export const HOME_HERO_CONFIG_EVENT = "dimisi:home-hero-updated";

/**
 * Hook to retrieve and dynamically synchronize Home Page Hero Section configuration
 * from MongoDB via Express backend API (`/api/v1/config/home-hero`).
 */
export function useHomeHeroConfig() {
  const [config, setConfig] = useState<HomeHeroConfig>(DEFAULT_HOME_HERO_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    try {
      const liveData = await getSectionConfigApi<Partial<HomeHeroConfig>>("home-hero");
      if (liveData && typeof liveData === "object" && Object.keys(liveData).length > 0) {
        setConfig((prev) => ({
          ...prev,
          ...liveData,
          orbitCards: {
            ...prev.orbitCards,
            ...(liveData.orbitCards || {}),
          },
          services:
            Array.isArray(liveData.services) && liveData.services.length > 0
              ? liveData.services
              : prev.services,
          metrics:
            Array.isArray(liveData.metrics) && liveData.metrics.length > 0
              ? liveData.metrics
              : prev.metrics,
          rotatingWords:
            Array.isArray(liveData.rotatingWords) && liveData.rotatingWords.length > 0
              ? liveData.rotatingWords
              : prev.rotatingWords,
        }));
      }
    } catch (err) {
      console.warn("[useHomeHeroConfig] Fallback to default constants:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchConfig();

    const handleUpdate = () => {
      void fetchConfig();
    };

    window.addEventListener(HOME_HERO_CONFIG_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(HOME_HERO_CONFIG_EVENT, handleUpdate);
    };
  }, [fetchConfig]);

  return { config, isLoading, refreshConfig: fetchConfig };
}
