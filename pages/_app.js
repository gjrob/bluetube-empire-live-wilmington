// pages/_app.js
import '../styles/globals.css';
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
