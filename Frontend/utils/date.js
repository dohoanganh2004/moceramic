// yyyy-mm-dd in the browser's local time - for <input type="date"> `min`
// attributes and for validating a picked date isn't in the past before it's
// ever sent to the server.
export function todayStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
