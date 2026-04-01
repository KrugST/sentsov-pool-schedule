import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();

  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-[var(--foreground)] no-underline">
          Pool Schedule
        </Link>
        <nav className="flex gap-1">
          <Link
            to="/"
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium no-underline transition-colors",
              location.pathname === "/"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
            )}
          >
            Calendar
          </Link>
          <Link
            to="/admin"
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium no-underline transition-colors",
              location.pathname === "/admin"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
            )}
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
