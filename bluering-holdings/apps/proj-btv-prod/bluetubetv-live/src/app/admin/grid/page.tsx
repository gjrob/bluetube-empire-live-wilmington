import AdminGrid10 from "@/components/admin/AdminGrid10";

export const dynamic = "force-dynamic";

export default function AdminGridPage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <AdminGrid10 />
      </div>
    </main>
  );
}
