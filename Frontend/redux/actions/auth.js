import axios from "axios";
import config from "constants/config";
import jwt from "jsonwebtoken";
import { toast } from "react-toastify";
import Errors from "components/admin/FormItems/error/errors";
import Router from 'next/router';

export const AUTH_FAILURE = "AUTH_FAILURE";
export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGOUT_REQUEST = "LOGOUT_REQUEST";
export const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";
export const RESET_REQUEST = "RESET_REQUEST";
export const RESET_SUCCESS = "RESET_SUCCESS";
export const PASSWORD_RESET_EMAIL_REQUEST = "PASSWORD_RESET_EMAIL_REQUEST";
export const PASSWORD_RESET_EMAIL_SUCCESS = "PASSWORD_RESET_EMAIL_SUCCESS";
export const AUTH_INIT_SUCCESS = "AUTH_INIT_SUCCESS";
export const AUTH_INIT_ERROR = "AUTH_INIT_ERROR";
export const REGISTER_REQUEST = "REGISTER_REQUEST";
export const REGISTER_SUCCESS = "REGISTER_SUCCESS";

function decodeUser(token) {
  const data = jwt.decode(token);
  if (!data) return null;
  return {
    id: data.sub,
    email: data.email,
    fullName: data.fullName,
    role: data["role-name"],
  };
}

function extractErrorMessage(err, fallback) {
  const data = err.response && err.response.data;
  if (!data) return fallback;
  if (data.fieldErrors) {
    const first = Object.values(data.fieldErrors)[0];
    if (first) return first;
  }
  return data.message || fallback;
}

export function authError(payload) {
  return {
    type: AUTH_FAILURE,
    payload,
  };
}

export function doInit() {
  return async (dispatch) => {
    try {
      let currentUser = null;
      let token = typeof window !== 'undefined' && localStorage.getItem("token");
      if (token) {
        const data = jwt.decode(token);
        const now = Date.now() / 1000;
        if (data && data.exp > now) {
          currentUser = decodeUser(token);
        }
      }
      dispatch({
        type: AUTH_INIT_SUCCESS,
        payload: {
          currentUser,
        },
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: AUTH_INIT_ERROR,
        payload: error,
      });
    }
  };
}

export function logoutUser() {
  return async (dispatch) => {
    dispatch({
      type: LOGOUT_REQUEST,
    });
    const refreshToken = typeof window !== 'undefined' && localStorage.getItem("refreshToken");
    try {
      if (refreshToken) {
        await axios.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      // best-effort: still clear local session even if the server call fails
    }
    typeof window !== 'undefined' && localStorage.removeItem("token");
    typeof window !== 'undefined' && localStorage.removeItem("refreshToken");
    typeof window !== 'undefined' && localStorage.removeItem("user");
    axios.defaults.headers.common["Authorization"] = "";
    dispatch({
      type: LOGOUT_SUCCESS,
    });
    if (typeof window !== 'undefined') { window.location.href = "/login" }
  };
}

export function receiveToken(token, refreshToken) {
  return (dispatch) => {
    let user = decodeUser(token);

    typeof window !== 'undefined' && localStorage.setItem("token", token);
    typeof window !== 'undefined' && localStorage.setItem("refreshToken", refreshToken);
    typeof window !== 'undefined' && localStorage.setItem("user", JSON.stringify(user));
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    dispatch({
      type: LOGIN_SUCCESS,
    });
    // Note: admin/* pages use getServerSideProps + a localStorage-based auth check,
    // which always sees a logged-out user on the server-rendered pass (a pre-existing
    // template issue, unrelated to the backend). Land on the storefront home for now;
    // admin users can navigate into /admin from there once that's addressed separately.
    if (typeof window !== 'undefined') { window.location.href = "/" }
  };
}

export function loginUser(creds) {
  return (dispatch) => {
    dispatch({
      type: LOGIN_REQUEST,
    });
    if (creds.social) {
      dispatch(authError("Social login is not available on this backend"));
    } else if (creds.phoneNumber && creds.phoneNumber.length > 0 && creds.password.length > 0) {
      axios
        .post("/auth/login", { phoneNumber: creds.phoneNumber, password: creds.password })
        .then((res) => {
          const { token, refreshToken } = res.data;
          dispatch(receiveToken(token, refreshToken));
          dispatch(doInit());
        })
        .catch((err) => {
          const message = extractErrorMessage(err, "Đăng nhập thất bại");
          dispatch(authError(message));
          toast.error(message);
        });
    } else {
      dispatch(authError("Vui lòng nhập số điện thoại và mật khẩu"));
    }
  };
}

export function verifyEmail(token) {
  return (dispatch) => {
    console.log(token, 'TIOKEN')
    axios
      .put("/auth/verify-email", { token })
      .then((verified) => {
        if (verified) {
          toast.success("Your email was verified");
        }
      })
      .catch((err) => {
        toast.error(err.response.data);
      })
      .finally(() => {
         if (typeof window !== 'undefined') { window.location.href = "/login" }
      });
  };
}

export function resetPassword(token, password) {
  return (dispatch) => {
    dispatch({
      type: RESET_REQUEST,
    });
    axios
      .put("/auth/password-reset", { token, password })
      .then((res) => {
        dispatch({
          type: RESET_SUCCESS,
        });
        toast.success("Password has been updated");
         if (typeof window !== 'undefined') { window.location.href = "/login" }
      })
      .catch((err) => {
        dispatch(authError(err.response.data));
      });
  };
}

export function sendPasswordResetEmail(email) {
  return (dispatch) => {
    dispatch({
      type: PASSWORD_RESET_EMAIL_REQUEST,
    });
    axios
      .post("/auth/send-password-reset-email", { email })
      .then((res) => {
        dispatch({
          type: PASSWORD_RESET_EMAIL_SUCCESS,
        });
        toast.success("Email with resetting instructions has been sent");
         if (typeof window !== 'undefined') { window.location.href = "/login" }
      })
      .catch((err) => {
        dispatch(authError(err.response.data));
      });
  };
}

export function registerUser(creds) {
  return (dispatch) => {
    dispatch({
      type: REGISTER_REQUEST,
    });
    if (creds.email.length > 0 && creds.password.length > 0 && creds.fullName && creds.fullName.length > 0) {
      axios
        .post("/auth/register", {
          fullName: creds.fullName,
          email: creds.email,
          phoneNumber: creds.phoneNumber,
          password: creds.password,
          confirmPassword: creds.confirmPassword,
          accepted: creds.accepted,
        })
        .then((res) => {
          dispatch({
            type: REGISTER_SUCCESS,
          });
          toast.success("Đăng ký thành công, vui lòng đăng nhập");
          if (typeof window !== 'undefined') { window.location.href = "/login" }
        })
        .catch((err) => {
          const message = extractErrorMessage(err, "Đăng ký thất bại");
          dispatch(authError(message));
          toast.error(message);
        });
    } else {
      dispatch(authError("Vui lòng nhập đầy đủ thông tin bắt buộc"));
    }
  };
}
