// pages/_app.js
import '../styles/globals.css'; // keeps Tailwind alive for existing files
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
