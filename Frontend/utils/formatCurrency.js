const formatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export default function formatCurrency(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return formatter.format(0);
  return formatter.format(number);
}

export const formatVND = (value) => formatCurrency(value);
