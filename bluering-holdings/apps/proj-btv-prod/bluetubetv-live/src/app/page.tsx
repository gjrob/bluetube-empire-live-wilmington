export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-semibold mb-4">BlueTubeTV</h1>
        <a
          href="/admin"
          className="inline-block rounded-xl px-5 py-3 bg-white text-black font-medium"
        >
          Go to Admin
        </a>
        <p className="mt-3 text-sm text-neutral-400">
          (You’ll need admin access to view Accounting & Analytics.)
        </p>
      </div>
    </main>
  );
}
