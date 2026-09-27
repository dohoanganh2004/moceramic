// "Remember me" only controls where the *refresh token* lives - the thing
// that lets a session silently survive a browser restart. The short-lived
// access token and decoded user stay in localStorage unconditionally (many
// legacy admin pages read localStorage.getItem("user") directly), so nothing
// else changes when "remember me" is off. Unchecked, the refresh token goes
// into sessionStorage instead, which the browser clears when the tab/window
// closes - after that, the next silent-refresh attempt has nothing to use
// and the session ends, exactly what "don't remember me" should do.
export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
}

export function setRefreshToken(value, remember) {
  if (typeof window === "undefined") return;
  if (remember) {
    localStorage.setItem("refreshToken", value);
    sessionStorage.removeItem("refreshToken");
  } else {
    sessionStorage.setItem("refreshToken", value);
    localStorage.removeItem("refreshToken");
  }
}

// Re-persists a refresh token to whichever storage it currently lives in
// (used after a silent token refresh, where we don't otherwise know the
// original "remember me" choice).
export function rewriteRefreshToken(value) {
  if (typeof window === "undefined") return;
  const remembered = !!localStorage.getItem("refreshToken");
  setRefreshToken(value, remembered);
}

export function clearRefreshToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("refreshToken");
  sessionStorage.removeItem("refreshToken");
}
