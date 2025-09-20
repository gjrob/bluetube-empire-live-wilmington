export default function Login() { return null; }
export async function getServerSideProps() {
  return { redirect: { destination: '/live', permanent: false } };
}
