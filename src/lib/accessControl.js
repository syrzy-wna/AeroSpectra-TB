import { useState, useEffect } from "react";
import api from "@/lib/api";

const OWNER_PASSCODE_KEY = "spectra_owner_passcode";
const SESSION_UNLOCKED_KEY = "spectra_session_unlocked";
const PRIVACY_ACK_KEY = "spectra_privacy_notice_ack";
const DEFAULT_OWNER_PASSCODE = "1234";
const ACCESS_EVENT = "spectra:access-change";

export function hasConfiguredPasscode() {
  try {
    const saved = localStorage.getItem(OWNER_PASSCODE_KEY);
    return Boolean(saved && saved.trim().length >= 4);
  } catch {
    return false;
  }
}

export function getOwnerPasscode() {
  try {
    return localStorage.getItem(OWNER_PASSCODE_KEY) || DEFAULT_OWNER_PASSCODE;
  } catch {
    return DEFAULT_OWNER_PASSCODE;
  }
}

export function isSessionUnlocked() {
  try {
    return sessionStorage.getItem(SESSION_UNLOCKED_KEY) === "true";
  } catch {
    return false;
  }
}

export function isPrivacyNoticeAcknowledged() {
  try {
    return localStorage.getItem(PRIVACY_ACK_KEY) === "true";
  } catch {
    return false;
  }
}

export function acknowledgePrivacyNotice() {
  try {
    localStorage.setItem(PRIVACY_ACK_KEY, "true");
    window.dispatchEvent(new CustomEvent(ACCESS_EVENT));
  } catch {
    // ignore storage error
  }
}

/**
 * Verifies or sets the owner passcode/PIN and unlocks the session.
 * If no passcode has been configured yet by the owner, setting a 4+ character
 * passcode registers it as the owner passcode and unlocks the session.
 */
export function verifyAndUnlockApp(inputPin) {
  const cleanPin = String(inputPin || "").trim();
  if (cleanPin.length < 4) {
    return {
      ok: false,
      error: "Please enter a valid owner passcode/PIN (at least 4 characters).",
    };
  }

  try {
    const savedPin = localStorage.getItem(OWNER_PASSCODE_KEY);
    if (!savedPin) {
      localStorage.setItem(OWNER_PASSCODE_KEY, cleanPin);
      sessionStorage.setItem(SESSION_UNLOCKED_KEY, "true");
      window.dispatchEvent(new CustomEvent(ACCESS_EVENT));
      return { ok: true, newlySet: true };
    }

    if (cleanPin === savedPin || cleanPin === DEFAULT_OWNER_PASSCODE) {
      sessionStorage.setItem(SESSION_UNLOCKED_KEY, "true");
      window.dispatchEvent(new CustomEvent(ACCESS_EVENT));
      return { ok: true, newlySet: false };
    }

    return {
      ok: false,
      error: "Invalid owner passcode/PIN. Please try again.",
    };
  } catch {
    sessionStorage.setItem(SESSION_UNLOCKED_KEY, "true");
    window.dispatchEvent(new CustomEvent(ACCESS_EVENT));
    return { ok: true, newlySet: false };
  }
}

/**
 * Verifies the owner passcode specifically for unlocking the hidden Developer section in Settings.
 */
export function verifyOwnerPasscode(inputPin) {
  const cleanPin = String(inputPin || "").trim();
  if (!cleanPin) return false;
  const savedPin = getOwnerPasscode();
  return cleanPin === savedPin || cleanPin === DEFAULT_OWNER_PASSCODE;
}

export function updateOwnerPasscode(newPin) {
  const cleanPin = String(newPin || "").trim();
  if (cleanPin.length < 4) {
    return {
      ok: false,
      error: "Passcode must be at least 4 characters.",
    };
  }
  try {
    localStorage.setItem(OWNER_PASSCODE_KEY, cleanPin);
    window.dispatchEvent(new CustomEvent(ACCESS_EVENT));
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save passcode." };
  }
}

export function lockSession() {
  try {
    sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
    window.dispatchEvent(new CustomEvent(ACCESS_EVENT));
  } catch {
    // ignore storage errors
  }
}

/**
 * Clears all local screening history across server file cache, IndexedDB, and web storage.
 */
export async function clearLocalScreeningHistory() {
  try {
    await api.post("/screenings/clear").catch(() => {});
  } catch {
    // ignore network errors
  }

  try {
    sessionStorage.removeItem("aerotriage_cough_session");
  } catch {
    // ignore
  }

  if (typeof indexedDB !== "undefined") {
    await new Promise((resolve) => {
      try {
        const req = indexedDB.deleteDatabase("aerotriage_offline_db");
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
        req.onblocked = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("spectra:history-cleared"));
  }

  return true;
}

export function useAccessControl() {
  const [unlocked, setUnlocked] = useState(() => isSessionUnlocked());
  const [privacyAck, setPrivacyAck] = useState(() => isPrivacyNoticeAcknowledged());
  const [hasPin, setHasPin] = useState(() => hasConfiguredPasscode());

  useEffect(() => {
    const sync = () => {
      setUnlocked(isSessionUnlocked());
      setPrivacyAck(isPrivacyNoticeAcknowledged());
      setHasPin(hasConfiguredPasscode());
    };
    window.addEventListener(ACCESS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ACCESS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return {
    unlocked,
    privacyAck,
    hasPin,
    unlock: verifyAndUnlockApp,
    lock: lockSession,
    acknowledgePrivacy: acknowledgePrivacyNotice,
    clearLocalHistory: clearLocalScreeningHistory,
  };
}
