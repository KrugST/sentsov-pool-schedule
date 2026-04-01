import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminProvider } from "@/hooks/use-admin";
import { Header } from "@/components/layout/header";
import { HomePage } from "@/pages/home-page";
import { AdminPage } from "@/pages/admin-page";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <div className="min-h-screen bg-[var(--background)]">
          <Header />
          <main className="mx-auto max-w-5xl px-4 py-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
        </div>
        <Toaster />
      </AdminProvider>
    </BrowserRouter>
  );
}
