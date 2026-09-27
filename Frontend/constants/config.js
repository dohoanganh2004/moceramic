// The API origin is runtime-configurable so a production build isn't hard-wired
// to any one host (e.g. in docker-compose, set NEXT_PUBLIC_API_URL to the
// backend's address). Both fall back to localhost:8080 for plain local dev.
//
// Server-rendered pages call the API too (getServerSideProps), and in
// docker-compose the Next.js server reaches the backend over the internal
// network (e.g. "http://backend:8080") while the browser needs the published
// host address (e.g. "http://localhost:8080") - so API calls use BACKEND_INTERNAL_URL
// on the server, falling back to the public URL. Asset URLs (<img src>, og:image)
// always use the public URL, even when built during SSR, since that markup is
// sent straight to the browser.
const publicOrigin = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const apiOrigin =
  typeof window === "undefined"
    ? process.env.BACKEND_INTERNAL_URL || publicOrigin
    : publicOrigin;
const baseURLApi = `${apiOrigin}/api`;
const assetBaseUrl = publicOrigin;

export default {
  baseURLApi,
  assetBaseUrl,
  app: {
    colors: {
      dark: "#002B49",
      light: "#FFFFFF",
      sea: "#004472",
      sky: "#E9EBEF",
      wave: "#D1E7F6",
      rain: "#CCDDE9",
      middle: "#D7DFE6",
      black: "#13191D",
      salat: "#21AE8C",
    },
  },
};
