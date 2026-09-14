import { toast } from "react-toastify";
import getErrorMessage from "utils/getErrorMessage";

function selectErrorCode(error) {
  if (error && error.response && error.response.status) {
    return error.response.status;
  }

  return 500;
}

export default class Errors {
  static handle(error) {
    if (process.env.NODE_ENV !== "test") {
      console.error(getErrorMessage(error));
      console.error(error);
    }

    toast.error(getErrorMessage(error));
  }

  static errorCode(error) {
    return selectErrorCode(error);
  }

  static selectMessage(error) {
    return getErrorMessage(error);
  }

  static showMessage(error) {
    toast.error(getErrorMessage(error));
  }
}
