import { Workbox, messageSW } from "workbox-window";
let wb = null;
let registration = null;
export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    wb = new Workbox("/sw.js");
    wb.addEventListener("installed", (event) => {
      if (!event.isUpdate) {
        console.log("Service Worker installed for the first time!");
      } else {
        console.log("Service Worker updated.");
      }
    });
    wb.addEventListener("activated", (event) => {
      if (!event.isUpdate) {
        console.log("Service Worker activated for the first time!");
      } else {
        console.log("Service Worker activated after update.");
      }
    });
    try {
      registration = await wb.register();
      console.log("Service Worker registered successfully!");
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  } else {
    console.warn("Service workers are not supported in this browser.");
  }
}
export async function unregisterServiceWorker() {
  if (registration) {
    const success = await registration.unregister();
    if (success) {
      console.log("Service Worker unregistered successfully.");
    } else {
      console.warn("Service Worker unregistration failed.");
    }
    registration = null;
    wb = null;
  }
}
export function skipWaiting() {
  if (wb) {
    wb.messageSkipWaiting();
  }
}
export async function sendMessageToSW(message) {
  if (registration?.active) {
    await messageSW(registration.active, message);
  }
}
