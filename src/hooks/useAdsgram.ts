import { useCallback, useEffect, useRef } from "react";

interface ShowPromiseResult {
  done: boolean;
  description: string;
  state: "load" | "render" | "playing" | "destroy";
  error: boolean;
}

interface AdController {
  show: () => Promise<ShowPromiseResult>;
}

interface AdsgramSDK {
  init: (params: {
    blockId: string;
    debug?: boolean;
    debugBannerType?: "RewardedVideo" | "FullscreenMedia";
  }) => AdController;
}

declare global {
  interface Window {
    Adsgram?: AdsgramSDK;
  }
}

interface UseAdsgramParams {
  blockId: string;
  onReward?: () => void;
  onError?: (result: ShowPromiseResult) => void;
}

export function useAdsgram({
  blockId,
  onReward,
  onError,
}: UseAdsgramParams): () => Promise<void> {
  const controllerRef = useRef<AdController | undefined>(undefined);

  useEffect(() => {
    if (!window.Adsgram) {
      console.error("AdsGram script is not loaded.");
      return;
    }

    controllerRef.current = window.Adsgram.init({
      blockId,
      debug: true,
      debugBannerType: "FullscreenMedia",
    });

    console.log("AdsGram initialized with Block ID:", blockId);
  }, [blockId]);

  return useCallback(async () => {
    if (!controllerRef.current) {
      onError?.({
        error: true,
        done: false,
        state: "load",
        description: "AdsGram script not loaded",
      });

      return;
    }

    try {
      await controllerRef.current.show();

      console.log("AdsGram: ad completed");

      onReward?.();
    } catch (result) {
      console.error("AdsGram playback error:", result);

      onError?.(result as ShowPromiseResult);
    }
  }, [onError, onReward]);
}