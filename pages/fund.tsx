import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  // change this to your real tip link when ready (Stripe/PayPal/etc.)
  const dest = process.env.NEXT_PUBLIC_FUND_URL || "https://buy.stripe.com/test_123456";
  return { redirect: { destination: dest, permanent: false } };
};

export default function Fund() { return null; }
