// The stored "addressLine" is auto-built from the structured fields rather than typed by hand.
export function composeAddressLine({ ward, district, city, country }) {
  return [ward, district, city, country]
    .map((part) => (part || "").trim())
    .filter(Boolean)
    .join(", ");
}

// Addresses saved before addressLine was auto-generated hold only a street
// in addressLine, so append whichever parts it doesn't already contain.
export function formatAddress(addr) {
  const line = (addr.addressLine || "").trim();
  const missing = [addr.ward, addr.district, addr.city, addr.country].filter(
    (part) => part && !line.toLowerCase().includes(part.trim().toLowerCase())
  );
  return [line, ...missing].filter(Boolean).join(", ");
}
