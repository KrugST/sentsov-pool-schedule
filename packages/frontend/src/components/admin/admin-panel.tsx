import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SlotManager } from "./slot-manager";
import { BookingManager } from "./booking-manager";
import { LogOut } from "lucide-react";

export function AdminPanel() {
  const { logout } = useAdmin();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Admin Panel
        </h1>
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="mr-1.5 h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="slots">
        <TabsList>
          <TabsTrigger value="slots">Manage Slots</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>
        <TabsContent value="slots" className="mt-4">
          <SlotManager />
        </TabsContent>
        <TabsContent value="bookings" className="mt-4">
          <BookingManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
