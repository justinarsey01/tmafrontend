import { useCallback, useEffect, useRef } from "react";

interface ShowPromiseResult {
  done: boolean;
  description: string;
  state: "load" | "render" | "playing" | "destroy";
  error: boolean;
}

interface AdsgramController {
  show: () => Promise<ShowPromiseResult>;
}

interface AdsgramWindow {
  Adsgram?: {
    init: (params: {
      blockId: string;
      debug?: boolean;
      debugBannerType?: "RewardedVideo" | "FullscreenMedia";
    }) => AdsgramController;
  };
}

export function useAdsgram(
  onReward?: () => void,
  onError?: (error: ShowPromiseResult | Error) => void
) {
  const controllerRef = useRef<AdsgramController | null>(null);

  const blockId = import.meta.env.VITE_ADSGRAM_BLOCK_ID;

  useEffect(() => {
    const adsgram = (window as unknown as AdsgramWindow).Adsgram;

    if (!adsgram) {
      console.error("AdsGram SDK is not loaded.");
      return;
    }

    if (!blockId) {
      console.error("AdsGram Block ID is missing.");
      return;
    }

    controllerRef.current = adsgram.init({
      blockId,
      debug: true,
      debugBannerType: "FullscreenMedia",
    });

    console.log("AdsGram initialized:", blockId);
  }, [blockId]);

  const showAd = useCallback(async () => {
    if (!controllerRef.current) {
      const error = new Error(
        "AdsGram is not initialized. Make sure the AdsGram script is loaded."
      );

      console.error(error);
      onError?.(error);
      return;
    }

    try {
      console.log("Opening AdsGram ad...");

      const result = await controllerRef.current.show();

      console.log("AdsGram result:", result);

      if (result.done && !result.error) {
        console.log("AdsGram reward completed.");

        onReward?.();
      }
    } catch (error) {
      console.error("AdsGram error:", error);

      onError?.(
        error instanceof Error
          ? error
          : new Error("AdsGram failed to show the ad.")
      );
    }
  }, [onReward, onError]);

  return showAd;
}