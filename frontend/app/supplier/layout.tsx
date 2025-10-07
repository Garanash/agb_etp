export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
