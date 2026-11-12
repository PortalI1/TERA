
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function SistemaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#F4F7F5]">
      <Sidebar />

      <main className="min-h-screen pl-64">
        <Header />

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
