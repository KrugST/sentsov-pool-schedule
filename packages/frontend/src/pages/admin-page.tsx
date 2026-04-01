import { useAdmin } from "@/hooks/use-admin";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminPanel } from "@/components/admin/admin-panel";

export function AdminPage() {
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
    return <AdminLogin />;
  }

  return <AdminPanel />;
}
