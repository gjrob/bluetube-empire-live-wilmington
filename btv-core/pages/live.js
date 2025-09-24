import Head from "next/head";
import dynamic from "next/dynamic";
const MultiCamPlayer = dynamic(() => import("../components/MultiCamPlayer"), { ssr: false });

export default function LivePage() {
  return (
    <>
      <Head><title>BlueTubeTV • Live</title></Head>
      <MultiCamPlayer manifestUrl={process.env.NEXT_PUBLIC_LAYOUT_MANIFEST} />
    </>
  );
}
