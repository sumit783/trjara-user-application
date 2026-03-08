import { Home, Grid3X3, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "home", icon: Home, label: "Home" },
  { id: "categories", icon: Grid3X3, label: "Shop" },
  { id: "cart", icon: ShoppingBag, label: "Cart" },
  { id: "profile", icon: User, label: "Profile" },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const { totalItems } = useCart();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl bg-card/95 backdrop-blur-xl border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors relative ${activeTab === id ? "text-primary" : "text-muted-foreground"
              }`}
          >
            <div className="relative">
              <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 1.5} />
              {id === "cart" && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
