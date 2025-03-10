import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Users,
  UserCircle,
  ShoppingCart,
  Home,
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ onCollapseChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    onCollapseChange?.(collapsed);
  }, [collapsed, onCollapseChange]);

  // Helper function to check if a path is active
  const isPathActive = (path: string) => {
    // For exact matches (dashboard)
    if (path === "/" && location.pathname === "/") return true;
    // For section matches (customers, employees, etc.)
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const links = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/customers", icon: Users, label: "Customers" },
    { to: "/employees", icon: UserCircle, label: "Employees" },
    { to: "/products", icon: Package, label: "Products" },
    { to: "/orders", icon: ShoppingCart, label: "Orders" },
  ];

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen",
        "bg-background border-r border-border",
        "transition-all duration-200 ease-in-out",
        collapsed ? "w-16" : "w-64" // Decreased width
      )}
    >
      <div className="flex flex-col h-full">
        <header className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <span className="text-3xl font-semibold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Next-Gen
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "h-8 w-8 p-0", // Decreased button size
              "text-muted-foreground hover:text-foreground",
              "hover:bg-secondary",
              "transition-colors"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </header>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1.5 px-2">
            {links.map(({ to, icon: Icon, label }) => {
              const isActive = isPathActive(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={cn(
                      "flex items-center gap-x-3 px-3 py-2.5 rounded-md", // Adjusted padding and gap
                      "text-sm font-medium transition-colors", // Decreased font size
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground",
                      "hover:bg-secondary hover:text-foreground",
                      collapsed && "justify-center"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 flex-shrink-0", // Decreased icon size
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    {!collapsed && <span>{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <footer className="p-2 border-t border-border mt-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className={cn(
              "w-full gap-x-3 px-3 py-2", // Decreased padding and gap
              "text-sm font-medium", // Decreased font size
              "text-muted-foreground",
              "hover:bg-secondary hover:text-foreground",
              "transition-colors",
              "rounded-md", // Smaller border radius
              collapsed ? "justify-center" : "justify-start"
            )}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </footer>
      </div>
    </aside>
  );
}
