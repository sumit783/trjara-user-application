import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import { Store } from "@/lib/store";

interface StoreCardProps {
  store: Store;
}

const StoreCard = ({ store }: StoreCardProps) => (
  <Link
    to={`/store/${store.id}`}
    className="flex flex-col items-center gap-2 min-w-[80px] active:scale-95 transition-transform"
  >
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-product overflow-hidden"
      style={{ backgroundColor: store.color + "15" }}
    >
      {typeof store.icon === "string" ? (
        <img src={store.icon} alt={store.name} className="w-full h-full object-cover" />
      ) : (
        store.icon
      )}
    </div>
    <div className="flex items-center gap-0.5">
      <span className="text-xs font-medium truncate max-w-[70px]">{store.name}</span>
      {store.verified && <BadgeCheck size={10} className="text-primary shrink-0" />}
    </div>
  </Link>
);

export default StoreCard;
