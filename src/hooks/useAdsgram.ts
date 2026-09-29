import { useAdsgram as useAdsgramSDK } from "@adsgram/react";

export function useAdsgram(
  onReward?: () => void,
  onError?: (error: unknown) => void
) {
  const blockId = import.meta.env.VITE_ADSGRAM_BLOCK_ID;

  const showAd = useAdsgramSDK({
    blockId,
    debug: true,

    onReward: () => {
      console.log("AdsGram: reward received");
      onReward?.();
    },

    onError: (result) => {
      console.error("AdsGram error:", result);
      onError?.(result);
    },
  });

  return showAd;
}