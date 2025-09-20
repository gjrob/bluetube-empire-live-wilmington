// pages/index.tsx
export default function Home(){ return null; }
export async function getServerSideProps(){
  return { redirect: { destination: '/live', permanent: false } }; // or '/drone-fund'
}
