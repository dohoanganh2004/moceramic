const COMBINING_MARKS_START = 0x0300;
const COMBINING_MARKS_END = 0x036f;
const COMBINING_MARKS_REGEX = new RegExp(
  "[" + String.fromCharCode(COMBINING_MARKS_START) + "-" + String.fromCharCode(COMBINING_MARKS_END) + "]",
  "g"
);

export default function slugify(text) {
  return (text || "")
    .toString()
    .normalize("NFD")
    .replace(COMBINING_MARKS_REGEX, "") // strip accents (Vietnamese, etc.)
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
