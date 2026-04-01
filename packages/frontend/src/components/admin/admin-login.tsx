import { useState } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export function AdminLogin() {
  const { login, loading } = useAdmin();
  const [pin, setPin] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length < 4) return;
    try {
      await login(pin);
      toast.success("Logged in as admin");
    } catch {
      toast.error("Invalid PIN");
      setPin("");
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Admin Access</CardTitle>
          <CardDescription>Enter your PIN to manage the pool schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
            <InputOTP
              maxLength={6}
              value={pin}
              onChange={setPin}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <Button type="submit" disabled={loading || pin.length < 4} className="w-full">
              {loading ? "Verifying..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
