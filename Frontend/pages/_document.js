import Document, { Html, Head, Main, NextScript } from "next/document";

// Sets data-theme before first paint so a saved dark theme doesn't flash light
// while the bundle loads (styles/_dark.scss keys off this attribute).
const themeInitScript = `
try {
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }
} catch (e) {}
`;

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
