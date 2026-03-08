import { User, Heart, Package, Settings, ChevronRight, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ProfileView = () => {
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { icon: Package, label: "My Orders" },
    { icon: Heart, label: "Wishlist" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-2xl font-bold mb-6">Profile</h1>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
            <User size={28} className="text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">Guest User</h2>
            <p className="text-sm text-muted-foreground">Sign in for the best experience</p>
          </div>
        </div>

        <button className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl mb-6 active:scale-[0.98] transition-transform">
          Sign In
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-3 mb-2 active:scale-[0.99] transition-transform"
        >
          {theme === "light" ? <Sun size={20} className="text-primary" /> : <Moon size={20} className="text-primary" />}
          <span className="text-sm font-medium flex-1 text-left">
            {theme === "light" ? "Light Mode" : "Dark Mode"}
          </span>
          <div className={`w-12 h-7 rounded-full p-1 transition-colors ${theme === "dark" ? "bg-primary" : "bg-muted"}`}>
            <div className={`w-5 h-5 rounded-full bg-primary-foreground transition-transform ${theme === "dark" ? "translate-x-5" : "translate-x-0"}`} />
          </div>
        </button>

        <div className="space-y-2">
          {menuItems.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-3 active:scale-[0.99] transition-transform"
            >
              <Icon size={20} className="text-muted-foreground" />
              <span className="text-sm font-medium flex-1 text-left">{label}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
