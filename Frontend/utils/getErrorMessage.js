const DEFAULT_ERROR_MESSAGE = "Đã có lỗi xảy ra, vui lòng thử lại";

export default function getErrorMessage(error, fallback = DEFAULT_ERROR_MESSAGE) {
  const data = error && error.response && error.response.data;

  if (data) {
    if (data.fieldErrors) {
      const first = Object.values(data.fieldErrors)[0];
      if (first) return first;
    }
    if (typeof data.message === "string" && data.message) return data.message;
    if (typeof data === "string" && data) return data;
  }

  if (error && error.message) return error.message;

  return fallback;
}
