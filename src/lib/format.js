export function formatCurrency(amount, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}
export function formatDate(
  date,
  locale = "en-US",
  options = { dateStyle: "medium" },
) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
export function truncateString(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}
export function getRandomColor() {
  const colors = [
    "#FF5722",
    "#03A9F4",
    "#4CAF50",
    "#9C27B0",
    "#F44336",
    "#E91E63",
    "#673AB7",
    "#00BCD4",
    "#CDDC39",
    "#FFC107",
    "#8BC34A",
    "#009688",
    "#795548",
    "#607D8B",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
export function getContrastColor(hexColor) {
  hexColor = hexColor.replace("#", "");
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
