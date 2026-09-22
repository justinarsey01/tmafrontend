
import {
  init,
  retrieveLaunchParams,
  retrieveRawInitData,
} from "@tma.js/sdk";

let initialized = false;

export function initializeTelegram() {
  try {
    if (!initialized) {
      init();
      initialized = true;
    }

    const launchParams =
      retrieveLaunchParams();

    console.log(
      "Telegram Mini App initialized"
    );

    console.log(
      "Telegram launch params:",
      launchParams
    );

    return launchParams;

  } catch (error) {

    console.error(
      "Telegram initialization failed:",
      error
    );

    return null;
  }
}


export function getTelegramInitData() {

  try {

    const initData =
      retrieveRawInitData();

    console.log(
      "Telegram initData available:",
      Boolean(initData)
    );

    return initData || null;

  } catch (error) {

    console.error(
      "Could not retrieve Telegram init data:",
      error
    );

    return null;
  }
}
