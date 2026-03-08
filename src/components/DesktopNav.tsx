import { Home, Grid3X3, ShoppingBag, User, Search } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { appLogo } from "@/lib/store";

interface DesktopNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "home", icon: Home, label: "Home" },
  { id: "categories", icon: Grid3X3, label: "Shop" },
  { id: "cart", icon: ShoppingBag, label: "Cart" },
  { id: "profile", icon: User, label: "Profile" },
];

const DesktopNav = ({ activeTab, onTabChange }: DesktopNavProps) => {
  const { totalItems } = useCart();

  return (
    <nav className="hidden md:flex sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between px-6 py-3">
        <button onClick={() => onTabChange("home")} className="flex items-center gap-2">
          <img src={appLogo} alt="Trjara" className="h-8 w-auto rounded-lg" />
          <span className="font-display text-xl font-bold tracking-tight">
            TRJARA<span className="text-primary">.</span>
          </span>
        </button>

        <div className="flex items-center gap-1">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors relative ${activeTab === id
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
            >
              <Icon size={18} strokeWidth={activeTab === id ? 2.5 : 1.5} />
              {label}
              {id === "cart" && totalItems > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default DesktopNav;
