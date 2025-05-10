
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "./Navbar";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && isMobile) {
        setSidebarOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [sidebarOpen, isMobile]);

  // Close sidebar when route changes or on component unmount
  useEffect(() => {
    return () => {
      if (isMobile) {
        setSidebarOpen(false);
      }
    };
  }, [isMobile]);

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar for larger screens */}
      <aside className={cn(
        "fixed inset-y-0 z-50 flex w-72 flex-col bg-blue-600 text-white shadow-sm transition-transform h-screen lg:h-auto lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center border-b border-blue-700 px-4">
          <h2 className="text-xl font-bold text-white">FlowFinance</h2>
        </div>
        <div className="flex-1 overflow-auto flex flex-col">
          <Navbar closeSidebar={() => setSidebarOpen(false)} />
        </div>
        <div className="mt-auto p-4 lg:hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(false);
            }}
            className="flex items-center text-white/70 hover:text-white"
          >
            <X className="mr-2 h-4 w-4" />
            Close Sidebar
          </button>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col w-full">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-card px-4 lg:hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(true);
            }}
            className="mr-3 text-muted-foreground hover:text-foreground lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-bold">FlowFinance</h2>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-3 md:p-6 w-full">
          {children}
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
