import React from "react";
import { createStore, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import ReduxThunk from "redux-thunk";
import axios from "axios";
import createRootReducer from "redux/reducers";
import config from "constants/config";
import { doInit } from "redux/actions/auth";
import Header from "components/e-commerce/Header";
import Sidebar from "components/e-commerce/Sidebar";
import Footer from "components/e-commerce/Footer";
import AdminLayout from 'components/admin/Layout'
import "styles/theme.scss";
import { useRouter } from "next/router";
import { Container } from "reactstrap";
import BreadcrumbHistory from "components/admin/BreadcrumbHistory";

axios.defaults.baseURL = config.baseURLApi;
axios.defaults.headers.common["Content-Type"] = "application/json";
const token = typeof window !== "undefined" && localStorage.getItem("token");

if (token) {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
}

// Access tokens expire quickly (15 min by default) - transparently refresh them
// once via /auth/refresh and retry the original request instead of forcing re-login.
let isRefreshing = false;
let pendingRequests = [];

function resolvePending(error, newToken) {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(newToken);
  });
  pendingRequests = [];
}

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config: originalRequest, response } = error;
    const isAuthEndpoint =
      originalRequest &&
      (originalRequest.url === "/auth/refresh" || originalRequest.url === "/auth/login");

    if (!response || response.status !== 401 || isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = typeof window !== "undefined" && localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers["Authorization"] = "Bearer " + newToken;
        return axios(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshClient = axios.create({ baseURL: config.baseURLApi });
    return refreshClient
      .post("/auth/refresh", { refreshToken })
      .then((res) => {
        const { token: newToken, refreshToken: newRefreshToken } = res.data;
        localStorage.setItem("token", newToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        axios.defaults.headers.common["Authorization"] = "Bearer " + newToken;
        resolvePending(null, newToken);
        originalRequest.headers["Authorization"] = "Bearer " + newToken;
        return axios(originalRequest);
      })
      .catch((refreshError) => {
        resolvePending(refreshError, null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      })
      .finally(() => {
        isRefreshing = false;
      });
  }
);

export const store = createStore(
  createRootReducer,
  compose(applyMiddleware(ReduxThunk))
);

store.dispatch(doInit());

function MyApp({ Component, pageProps, sidebarStatic }) {
  const router = useRouter();
  React.useEffect(() => {
    document.querySelector("body").scrollTo(0, 0);
  });
  return (
    <Provider store={store}>
      {router.pathname.includes("admin") ? (
          <AdminLayout>
              <Component {...pageProps} />
          </AdminLayout>
      ) : router.pathname.includes("login") || router.pathname.includes("register")? (
        <Component {...pageProps} />
      ) : router.pathname.includes("search") ? (
          <>
            <Header/>
            <Component {...pageProps} />
          </>
      ) : (
        <>
          <Sidebar />
          <Header />
          {router.pathname === "/" ? null : (
            <>
              <Container>
                <BreadcrumbHistory url={router.pathname}/>
              </Container>
            </>
          )}
          <Component {...pageProps} />
          <Footer />
        </>
      )}
    </Provider>
  );
}

export default MyApp;
