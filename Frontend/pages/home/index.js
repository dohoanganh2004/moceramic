// Customers land here after logging in (see redux/actions/auth.js's post-login
// redirect) - it's the same storefront homepage as "/", just at a URL that's
// clearly "your" home once you're signed in, rather than the public landing page.
export { default, getServerSideProps } from "pages/index";
