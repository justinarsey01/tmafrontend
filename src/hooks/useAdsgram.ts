import { useAdsgram as useAdsgramSDK } from "@adsgram/react";

export function useAdsgram(
  onReward?: () => void,
  onError?: (error: unknown) => void
) {
  const blockId = String(
    import.meta.env.VITE_ADSGRAM_BLOCK_ID || "50872"
  );

  console.log("AdsGram Block ID:", blockId);
  console.log("Block ID type:", typeof blockId);

  const showAd = useAdsgramSDK({
    blockId,

    debug: true,

    onReward: () => {
      console.log("AdsGram reward received");
      onReward?.();
    },

    onError: (error) => {
      console.error("AdsGram error:", error);
      onError?.(error);
    },
  });

  return showAd;
}